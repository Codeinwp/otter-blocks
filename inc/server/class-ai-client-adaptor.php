<?php
/**
 * Adaptor for the WordPress 7.0 AI Client.
 *
 * Translates OpenAI chat-completions-style prompt payloads into WP AI Client
 * prompt builder calls and reshapes results into Otter's AI result contract.
 *
 * See docs/adr/0001-otter-ai-result-contract.md.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use ThemeIsle\GutenbergBlocks\Plugins\Options_Settings;

/**
 * Class AI_Client_Adaptor
 */
class AI_Client_Adaptor {

	/**
	 * Effective backend value for the WP AI Client path.
	 *
	 * @var string
	 */
	const BACKEND_WP = 'wp';

	/**
	 * Effective backend value for Otter's OpenAI API-key path.
	 *
	 * @var string
	 */
	const BACKEND_OTTER_OPENAI = 'legacy';

	/**
	 * Default HTTP timeout (seconds) for a single AI provider request.
	 *
	 * @var int
	 */
	const DEFAULT_REQUEST_TIMEOUT = 300;

	/**
	 * Cached availability result for the current request.
	 *
	 * @var bool|null
	 */
	private static $available_cache = null;

	/**
	 * Check if the WP AI Client is available and has a usable provider.
	 *
	 * @return bool
	 */
	public static function is_available() {
		if ( null !== self::$available_cache ) {
			return self::$available_cache;
		}

		$available = false;

		if (
			function_exists( 'wp_ai_client_prompt' ) &&
			function_exists( 'wp_supports_ai' ) &&
			wp_supports_ai()
		) {
			try {
				// False when no provider is configured; performs no API call.
				$available = (bool) wp_ai_client_prompt()->is_supported_for_text_generation();
			} catch ( \Exception $e ) {
				$available = false;
			}
		}

		/**
		 * Filters whether the WP AI Client is considered available for Otter AI features.
		 *
		 * The filtered value is cached for the rest of the request.
		 *
		 * @param bool $available Whether the WP AI Client is available and has a usable provider.
		 */
		self::$available_cache = (bool) apply_filters( 'otter_ai_client_available', $available );

		return self::$available_cache;
	}

	/**
	 * Resolve the effective AI backend from runtime availability.
	 *
	 * The WP AI Client when usable, otherwise the legacy Otter OpenAI key path.
	 *
	 * @return string One of the BACKEND_* constants.
	 */
	public static function resolve_backend() {
		return AI_Backend_Resolver::resolve_backend_id();
	}

	/**
	 * HTTP timeout in seconds for Otter AI generation requests.
	 *
	 * @return int
	 */
	public static function get_request_timeout_seconds() {
		/**
		 * Filter the HTTP timeout (in seconds) for AI generation requests.
		 *
		 * Slow provider models (OpenRouter, reasoning endpoints) and Otter's
		 * multi-step block pipeline can exceed two minutes per call.
		 *
		 * @param int $timeout Timeout in seconds.
		 */
		$timeout = (int) apply_filters( 'otter_ai_request_timeout', self::DEFAULT_REQUEST_TIMEOUT );

		return max( 0, $timeout );
	}

	/**
	 * Run an OpenAI chat-completions payload through the WP AI Client.
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload (already stripped of `otter_*` keys).
	 * @return array<string, mixed>|\WP_Error An Otter AI response array or WordPress REST error.
	 */
	public function generate( $payload ) {
		if ( ! self::is_available() ) {
			return $this->error_response( 'no_ai_provider', __( 'No AI provider is configured. Add an API key under Settings → Connectors in your WordPress dashboard.', 'otter-blocks' ), 400 );
		}

		try {
			$builder = $this->make_builder();

			if ( null === $builder ) {
				return $this->error_response( 'no_ai_provider', __( 'No AI provider is configured. Add an API key under Settings → Connectors in your WordPress dashboard.', 'otter-blocks' ), 400 );
			}

			$builder = $this->apply_request_timeout( $builder );
			$builder = $this->apply_wp_client_preferences( $builder );

			$messages = isset( $payload['messages'] ) && is_array( $payload['messages'] ) ? $payload['messages'] : array();

			$system_parts = array();
			$turns        = array();

			foreach ( $messages as $message ) {
				if ( ! is_array( $message ) ) {
					continue;
				}

				$role    = isset( $message['role'] ) ? $message['role'] : 'user';
				$content = isset( $message['content'] ) ? $message['content'] : '';

				// OpenAI-style content-parts arrays have no WP AI Client equivalent;
				// reject them instead of casting an array to the literal "Array".
				if ( ! is_scalar( $content ) ) {
					return $this->error_response( 'invalid_payload', __( 'AI message content must be plain text.', 'otter-blocks' ), 400 );
				}

				$content = (string) $content;

				if ( 'system' === $role ) {
					$system_parts[] = $content;
				} else {
					$turns[] = array(
						'role'    => 'assistant' === $role ? 'model' : 'user',
						'content' => $content,
					);
				}
			}

			if ( ! empty( $system_parts ) ) {
				$builder = $builder->using_system_instruction( implode( "\n\n", $system_parts ) );
			}

			// The final turn becomes the prompt text; everything before it is
			// history, in order. Promoting an earlier user turn would silently
			// reorder the conversation, so a payload that does not end with a
			// user turn is rejected instead.
			$last_turn = end( $turns );

			if ( false === $last_turn || 'user' !== $last_turn['role'] ) {
				return $this->error_response( 'invalid_payload', __( 'The AI prompt must end with a user message.', 'otter-blocks' ), 400 );
			}

			$prompt_text = $last_turn['content'];
			$history     = array();

			foreach ( array_slice( $turns, 0, count( $turns ) - 1 ) as $turn ) {
				$part      = new \WordPress\AiClient\Messages\DTO\MessagePart( $turn['content'] );
				$history[] = 'model' === $turn['role']
					? new \WordPress\AiClient\Messages\DTO\ModelMessage( array( $part ) )
					: new \WordPress\AiClient\Messages\DTO\UserMessage( array( $part ) );
			}

			if ( ! empty( $history ) ) {
				// The wordpress-stubs @method tag under-qualifies the Message type (generator quirk).
				$builder = $builder->with_history( ...$history ); /* @phpstan-ignore argument.type */
			}

			$builder = $builder->with_text( $prompt_text );

			// The `model` pin is intentionally dropped: the WP AI Client picks
			// a suitable model from any configured provider.
			if ( isset( $payload['temperature'] ) ) {
				$builder = $builder->using_temperature( (float) $payload['temperature'] );
			}

			if ( isset( $payload['max_tokens'] ) ) {
				$builder = $builder->using_max_tokens( (int) $payload['max_tokens'] );
			}

			if ( isset( $payload['top_p'] ) ) {
				$builder = $builder->using_top_p( (float) $payload['top_p'] );
			}

			if ( isset( $payload['presence_penalty'] ) ) {
				$builder = $builder->using_presence_penalty( (float) $payload['presence_penalty'] );
			}

			if ( isset( $payload['frequency_penalty'] ) ) {
				$builder = $builder->using_frequency_penalty( (float) $payload['frequency_penalty'] );
			}

			if ( ! empty( $payload['stop'] ) ) {
				$builder = $builder->using_stop_sequences( ...array_map( 'strval', (array) $payload['stop'] ) );
			}

			// OpenAI function calling is only used by Otter to force JSON output;
			// translate it to the AI Client's structured JSON response.
			$forced_function = $this->get_forced_function( $payload );

			// The block-generation pipeline asks for JSON via response_format; without
			// this the model can wrap its JSON in prose and break the client's parse.
			$wants_json = isset( $payload['response_format']['type'] ) && 'json_object' === $payload['response_format']['type'];

			if ( null !== $forced_function ) {
				$schema = isset( $forced_function['parameters'] ) && is_array( $forced_function['parameters'] ) ? $forced_function['parameters'] : null;

				if ( is_array( $schema ) ) {
					$schema = $this->normalize_strict_json_schema( $schema );
				}

				$builder = $builder->as_json_response( $schema );
			} elseif ( $wants_json ) {
				$builder = $builder->as_json_response();
			}

			$result = $builder->generate_text_result();

			if ( is_wp_error( $result ) ) {
				return $this->error_response( (string) $result->get_error_code(), $result->get_error_message(), 502 );
			}

			/**
			 * The generation result, typed locally because the wordpress-stubs
			 * `@method` tag resolves `GenerativeAiResult` in the global namespace
			 * instead of WordPress\AiClient\Results\DTO (generator quirk).
			 *
			 * @var \WordPress\AiClient\Results\DTO\GenerativeAiResult $result
			 */

			// Throws a RuntimeException when the result has no text content.
			$text = $result->toText();

			$usage = $result->getTokenUsage();

			return AI_Response::success(
				$text,
				$usage->getTotalTokens(),
				( null !== $forced_function || $wants_json ) ? 'json' : 'text'
			);
		} catch ( \Exception $e ) {
			if ( $e instanceof \RuntimeException ) {
				return $this->error_response( 'empty_response', $e->getMessage(), 502 );
			}

			// The exception message can be a raw HTTP error body (e.g. an nginx 502
			// HTML page). Classify it into a clean, retryable error instead.
			list( $code, $message, $status ) = $this->classify_provider_exception( $e );

			return $this->error_response( $code, $message, $status );
		}
	}

	/**
	 * Classify a provider exception into a clean [code, message, status] triple,
	 * never leaking a raw HTTP error body. Gateway/timeout failures use transient
	 * statuses so the client auto-retries.
	 *
	 * @param \Exception $e The caught exception.
	 * @return array{0:string,1:string,2:int} The [code, message, status] triple.
	 */
	private function classify_provider_exception( $e ) {
		$raw = (string) $e->getMessage();

		// Bad gateway — provider or its proxy was briefly unavailable.
		if ( false !== stripos( $raw, '<html' ) || false !== stripos( $raw, 'bad gateway' ) || false !== stripos( $raw, '502' ) ) {
			return array( 'bad_gateway', __( 'The AI provider was temporarily unavailable (bad gateway). Please try again.', 'otter-blocks' ), 502 );
		}

		// A timeout — the model took longer than the request budget allowed.
		if ( preg_match( '/tim(?:e|ed)\s?out|timeout|cURL error 28|gateway time|504/i', $raw ) ) {
			return array( 'provider_timeout', __( 'The AI request took too long and timed out. Try again, or narrow the selection so there is less to generate.', 'otter-blocks' ), 504 );
		}

		// Else: keep the provider's wording, but strip markup and cap the length.
		$clean = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( $raw ) ) );

		if ( '' === $clean ) {
			$clean = __( 'The AI provider returned an unexpected error. Please try again.', 'otter-blocks' );
		} elseif ( strlen( $clean ) > 300 ) {
			$clean = substr( $clean, 0, 297 ) . '…';
		}

		return array( 'wp_ai_client_error', $clean, 502 );
	}

	/**
	 * Get the function declaration used to force JSON output, if any.
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload.
	 * @return array<string, mixed>|null The matched function declaration or null.
	 */
	private function get_forced_function( $payload ) {
		if ( empty( $payload['functions'] ) || ! is_array( $payload['functions'] ) || empty( $payload['function_call'] ) ) {
			return null;
		}

		$function_call = $payload['function_call'];

		if ( is_array( $function_call ) && ! empty( $function_call['name'] ) ) {
			foreach ( $payload['functions'] as $function ) {
				if ( isset( $function['name'] ) && $function['name'] === $function_call['name'] ) {
					return $function;
				}
			}
		}

		return null;
	}

	/**
	 * Normalize a JSON schema for OpenAI strict json_schema output.
	 *
	 * @param mixed $schema The schema to normalize.
	 * @return mixed The normalized schema.
	 */
	private function normalize_strict_json_schema( $schema ) {
		if ( ! is_array( $schema ) ) {
			return $schema;
		}

		foreach ( $this->get_unsupported_json_schema_keywords() as $keyword ) {
			unset( $schema[ $keyword ] );
		}

		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			$required = isset( $schema['required'] ) && is_array( $schema['required'] ) ? array_values( array_filter( $schema['required'], 'is_string' ) ) : array();

			foreach ( $schema['properties'] as $key => $property ) {
				if ( is_array( $property ) ) {
					$property = $this->normalize_strict_json_schema( $property );

					if ( ! in_array( $key, $required, true ) ) {
						$property = $this->make_json_schema_nullable( $property );
					}

					$schema['properties'][ $key ] = $property;
				}
			}
		}

		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) ) {
			$schema['items'] = $this->normalize_strict_json_schema( $schema['items'] );
		}

		if ( isset( $schema['anyOf'] ) && is_array( $schema['anyOf'] ) ) {
			foreach ( $schema['anyOf'] as $index => $sub_schema ) {
				if ( is_array( $sub_schema ) ) {
					$schema['anyOf'][ $index ] = $this->normalize_strict_json_schema( $sub_schema );
				}
			}
		}

		if ( isset( $schema['$defs'] ) && is_array( $schema['$defs'] ) ) {
			foreach ( $schema['$defs'] as $key => $definition ) {
				if ( is_array( $definition ) ) {
					$schema['$defs'][ $key ] = $this->normalize_strict_json_schema( $definition );
				}
			}
		}

		if ( $this->is_object_json_schema( $schema ) ) {
			$schema['additionalProperties'] = false;
		}

		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			$schema['required'] = array_keys( $schema['properties'] );
		}

		return $schema;
	}

	/**
	 * Make a JSON schema accept null while preserving its existing shape.
	 *
	 * @param array<string, mixed> $schema The schema to make nullable.
	 * @return array<string, mixed> The nullable schema.
	 */
	private function make_json_schema_nullable( $schema ) {
		if ( isset( $schema['type'] ) ) {
			$types = is_array( $schema['type'] ) ? $schema['type'] : array( $schema['type'] );

			if ( ! in_array( 'null', $types, true ) ) {
				$types[] = 'null';
			}

			$schema['type'] = $types;
			return $schema;
		}

		if ( isset( $schema['anyOf'] ) && is_array( $schema['anyOf'] ) ) {
			foreach ( $schema['anyOf'] as $sub_schema ) {
				if ( is_array( $sub_schema ) && isset( $sub_schema['type'] ) && 'null' === $sub_schema['type'] ) {
					return $schema;
				}
			}

			$schema['anyOf'][] = array( 'type' => 'null' );
			return $schema;
		}

		return array(
			'anyOf' => array(
				$schema,
				array( 'type' => 'null' ),
			),
		);
	}

	/**
	 * Check whether a JSON schema describes an object.
	 *
	 * @param array<string, mixed> $schema The schema to check.
	 * @return bool Whether the schema describes an object.
	 */
	private function is_object_json_schema( $schema ) {
		if ( ! isset( $schema['type'] ) ) {
			return false;
		}

		$type = (array) $schema['type'];

		return in_array( 'object', $type, true );
	}

	/**
	 * JSON Schema keywords that OpenAI strict json_schema mode rejects.
	 *
	 * @return list<string>
	 */
	private function get_unsupported_json_schema_keywords() {
		return array(
			'default',
			'uniqueItems',
			'minItems',
			'maxItems',
			'unevaluatedItems',
			'contains',
			'minContains',
			'maxContains',
			'minLength',
			'maxLength',
			'pattern',
			'format',
			'minimum',
			'maximum',
			'multipleOf',
			'patternProperties',
			'unevaluatedProperties',
			'propertyNames',
			'minProperties',
			'maxProperties',
			'oneOf',
			'allOf',
			'not',
			'dependentRequired',
			'dependentSchemas',
			'if',
			'then',
			'else',
		);
	}

	/**
	 * Build an AI generation error response.
	 *
	 * @param string $code    The error code.
	 * @param string $message The error message.
	 * @param int    $status  The HTTP status code.
	 * @return \WP_Error
	 */
	private function error_response( $code, $message, $status = 500 ) {
		return AI_Response::error( $code, $message, 'wp_ai_client', $status );
	}

	/**
	 * Create a WP AI Client prompt builder. Seam for unit tests.
	 *
	 * @return \WP_AI_Client_Prompt_Builder|null
	 */
	protected function make_builder() {
		return function_exists( 'wp_ai_client_prompt' ) ? wp_ai_client_prompt() : null;
	}

	/**
	 * Apply Otter's HTTP timeout to the WP AI Client builder.
	 *
	 * @param \WP_AI_Client_Prompt_Builder $builder The prompt builder.
	 * @return \WP_AI_Client_Prompt_Builder
	 */
	protected function apply_request_timeout( $builder ) {
		$timeout = self::get_request_timeout_seconds();

		if ( 0 === $timeout || ! class_exists( '\WordPress\AiClient\Providers\Http\DTO\RequestOptions' ) ) {
			return $builder;
		}

		$options = \WordPress\AiClient\Providers\Http\DTO\RequestOptions::fromArray(
			array(
				\WordPress\AiClient\Providers\Http\DTO\RequestOptions::KEY_TIMEOUT => (float) $timeout,
			)
		);

		// The wordpress-stubs @method tag under-qualifies the RequestOptions type (generator quirk).
		return $builder->using_request_options( $options ); /* @phpstan-ignore argument.type */
	}

	/**
	 * Apply Otter's saved WordPress AI Client provider/model preferences.
	 *
	 * @param \WP_AI_Client_Prompt_Builder $builder The prompt builder.
	 * @return \WP_AI_Client_Prompt_Builder
	 */
	protected function apply_wp_client_preferences( $builder ) {
		$config   = Options_Settings::get_ai_wp_client_config();
		$provider = $config['provider'];
		$model    = $config['model'];

		if ( '' !== $provider && '' !== $model ) {
			$provider_model = $this->get_wp_client_provider_model( $provider, $model );

			if ( null !== $provider_model ) {
				return $builder->using_model( $provider_model );
			}
		}

		if ( '' !== $provider ) {
			$builder = $builder->using_provider( $provider );
		}

		if ( '' !== $model ) {
			if ( '' !== $provider ) {
				$builder = $builder->using_model_preference( array( $provider, $model ) );
			} else {
				$builder = $builder->using_model_preference( $model );
			}
		}

		return $builder;
	}

	/**
	 * Resolve a configured provider/model pair to a model instance.
	 *
	 * @param string $provider Provider ID.
	 * @param string $model    Model ID.
	 * @return object|null Model instance or null when unavailable.
	 */
	protected function get_wp_client_provider_model( $provider, $model ) {
		if ( ! class_exists( '\WordPress\AiClient\AiClient' ) ) {
			return null;
		}

		try {
			return \WordPress\AiClient\AiClient::defaultRegistry()->getProviderModel( $provider, $model );
		} catch ( \Throwable $e ) {
			return null;
		}
	}
}
