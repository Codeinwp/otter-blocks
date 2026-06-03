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
	 * Resolve the effective AI backend from the user setting and runtime availability.
	 *
	 * Ladder: 'openai-key' forces the Otter OpenAI path; 'auto' prefers the WP AI Client
	 * when usable; 'wp-ai-client' forces the WP path but falls back to the legacy
	 * path when unusable and an Otter key exists (see is_fallback_active()).
	 *
	 * @return string One of the BACKEND_* constants.
	 */
	public static function resolve_backend() {
		return AI_Backend_Resolver::resolve_backend_id();
	}

	/**
	 * Whether the forced WP AI Client backend fell back to the Otter OpenAI path.
	 *
	 * @return bool
	 */
	public static function is_fallback_active() {
		return AI_Backend_Resolver::is_fallback_active();
	}

	/**
	 * Get the status of the configured WP AI providers.
	 *
	 * @return array{hasAIProvider: bool, source: string, providerId: string|null}
	 */
	public static function provider_status() {
		$status = array(
			'hasAIProvider' => false,
			'source'        => 'none',
			'providerId'    => null,
		);

		if ( ! function_exists( 'wp_get_connectors' ) ) {
			return $status;
		}

		$status['hasAIProvider'] = self::is_available();

		foreach ( wp_get_connectors() as $id => $connector ) {
			if ( 'ai_provider' !== $connector['type'] ) {
				continue;
			}

			$auth = $connector['authentication'];

			if ( 'api_key' !== $auth['method'] ) {
				continue;
			}

			$source = 'none';

			if ( ! empty( $auth['env_var_name'] ) && getenv( $auth['env_var_name'] ) ) {
				$source = 'env';
			} elseif ( ! empty( $auth['constant_name'] ) && defined( $auth['constant_name'] ) && constant( $auth['constant_name'] ) ) {
				$source = 'constant';
			} elseif ( ! empty( $auth['setting_name'] ) && get_option( $auth['setting_name'] ) ) {
				$source = 'database';
			}

			if ( 'none' !== $source ) {
				$status['source']     = $source;
				$status['providerId'] = (string) $id;
				break;
			}
		}

		return $status;
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

			$messages = isset( $payload['messages'] ) && is_array( $payload['messages'] ) ? $payload['messages'] : array();

			// Split messages: system → instruction, the rest → conversation turns.
			$system_parts = array();
			$turns        = array();

			foreach ( $messages as $message ) {
				$role    = isset( $message['role'] ) ? $message['role'] : 'user';
				$content = isset( $message['content'] ) ? (string) $message['content'] : '';

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

			// The last user turn becomes the prompt text; everything before it is history.
			$last_user_index = null;
			foreach ( $turns as $index => $turn ) {
				if ( 'user' === $turn['role'] ) {
					$last_user_index = $index;
				}
			}

			$prompt_text = '';
			$history     = array();

			foreach ( $turns as $index => $turn ) {
				if ( $index === $last_user_index ) {
					$prompt_text = $turn['content'];
					continue;
				}

				$part      = new \WordPress\AiClient\Messages\DTO\MessagePart( $turn['content'] );
				$history[] = 'model' === $turn['role']
					? new \WordPress\AiClient\Messages\DTO\ModelMessage( array( $part ) )
					: new \WordPress\AiClient\Messages\DTO\UserMessage( array( $part ) );
			}

			if ( ! empty( $history ) ) {
				// The wordpress-stubs @method tag resolves `Message` in the global namespace instead of WordPress\AiClient\Messages\DTO.
				// phpcs:disable Squiz.Commenting.InlineComment.InvalidEndChar
				// @phpstan-ignore argument.type (generator quirk)
				$builder = $builder->with_history( ...$history );
				// phpcs:enable Squiz.Commenting.InlineComment.InvalidEndChar
			}

			$builder = $builder->with_text( $prompt_text );

			// Generation parameters. The `model` pin is intentionally dropped: the
			// WP AI Client picks a suitable model from any configured provider.
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

			if ( null !== $forced_function ) {
				$schema  = isset( $forced_function['parameters'] ) && is_array( $forced_function['parameters'] ) ? $forced_function['parameters'] : null;
				$builder = $builder->as_json_response( $schema );
			}

			$result = $builder->generate_text_result();

			if ( is_wp_error( $result ) ) {
				return $this->error_response( (string) $result->get_error_code(), $result->get_error_message(), 502 );
			}

			// The wordpress-stubs @method tag resolves `GenerativeAiResult` in the
			// global namespace instead of WordPress\AiClient\Results\DTO (generator quirk).
			/**
			 * The generation result.
			 *
			 * @var \WordPress\AiClient\Results\DTO\GenerativeAiResult $result
			 */

			// Throws a RuntimeException when the result has no text content.
			$text = $result->toText();

			$usage = $result->getTokenUsage();

			return AI_Response::success(
				$text,
				$usage->getTotalTokens(),
				null !== $forced_function ? 'json' : 'text'
			);
		} catch ( \Exception $e ) {
			$code = $e instanceof \RuntimeException ? 'empty_response' : 'wp_ai_client_error';
			return $this->error_response( $code, $e->getMessage(), 502 );
		}
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
}
