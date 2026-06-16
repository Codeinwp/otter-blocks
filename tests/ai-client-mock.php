<?php
/**
 * Test doubles for the WordPress 7.0 AI Client.
 *
 * Defines minimal stand-ins for the php-ai-client DTO classes (when the test
 * environment runs WordPress < 7.0) plus a spy prompt builder and a fake
 * result, used to unit-test AI_Client_Adaptor without a real provider.
 *
 * @package gutenberg-blocks
 */

namespace WordPress\AiClient\Messages\DTO {

	if ( ! class_exists( MessagePart::class ) ) {
		/**
		 * Minimal MessagePart stand-in.
		 */
		class MessagePart {
			/**
			 * The content of the message part.
			 *
			 * @var mixed
			 */
			public $content;

			/**
			 * Constructor.
			 *
			 * @param mixed $content The content.
			 */
			public function __construct( $content ) {
				$this->content = $content;
			}
		}
	}

	if ( ! class_exists( Message::class ) ) {
		/**
		 * Minimal Message stand-in.
		 */
		class Message {
			/**
			 * The message parts.
			 *
			 * @var MessagePart[]
			 */
			public $parts;

			/**
			 * Constructor.
			 *
			 * @param MessagePart[] $parts The message parts.
			 */
			public function __construct( array $parts ) {
				$this->parts = $parts;
			}
		}
	}

	if ( ! class_exists( UserMessage::class ) ) {
		/**
		 * Minimal UserMessage stand-in.
		 */
		class UserMessage extends Message {}
	}

	if ( ! class_exists( ModelMessage::class ) ) {
		/**
		 * Minimal ModelMessage stand-in.
		 */
		class ModelMessage extends Message {}
	}
}

namespace ThemeIsle\GutenbergBlocks\Tests {

	/**
	 * Spy prompt builder that records every fluent call.
	 */
	class Spy_AI_Builder {
		/**
		 * Recorded calls as [ method, args ] pairs.
		 *
		 * @var array
		 */
		public $calls = array();

		/**
		 * The value returned by generate_text_result().
		 *
		 * @var mixed
		 */
		public $result;

		/**
		 * The value returned by is_supported_for_text_generation().
		 *
		 * @var bool
		 */
		public $supported = true;

		/**
		 * Record a call and return a fluent/spied response.
		 *
		 * @param string $name The method name.
		 * @param array  $args The arguments.
		 * @return mixed
		 */
		public function __call( $name, $args ) {
			$this->calls[] = array( $name, $args );

			if ( 'generate_text_result' === $name ) {
				return $this->result;
			}

			if ( 'is_supported_for_text_generation' === $name ) {
				return $this->supported;
			}

			return $this;
		}

		/**
		 * Get the recorded arguments of the first call to a method.
		 *
		 * @param string $name The method name.
		 * @return array|null The arguments or null when never called.
		 */
		public function get_call_args( $name ) {
			foreach ( $this->calls as $call ) {
				if ( $call[0] === $name ) {
					return $call[1];
				}
			}

			return null;
		}

		/**
		 * Whether a method was called.
		 *
		 * @param string $name The method name.
		 * @return bool
		 */
		public function was_called( $name ) {
			return null !== $this->get_call_args( $name );
		}
	}

	/**
	 * Fake token usage matching the duck-typed surface used by the adaptor.
	 */
	class Fake_Token_Usage {
		/**
		 * Get prompt tokens.
		 *
		 * @return int
		 */
		public function getPromptTokens() {
			return 11;
		}

		/**
		 * Get completion tokens.
		 *
		 * @return int
		 */
		public function getCompletionTokens() {
			return 22;
		}

		/**
		 * Get total tokens.
		 *
		 * @return int
		 */
		public function getTotalTokens() {
			return 33;
		}
	}

	/**
	 * Fake generative AI result matching the duck-typed surface used by the adaptor.
	 */
	class Fake_AI_Result {
		/**
		 * The text returned by toText().
		 *
		 * @var string
		 */
		public $text;

		/**
		 * Whether toText() should throw (no text content).
		 *
		 * @var bool
		 */
		public $throw_on_text = false;

		/**
		 * Constructor.
		 *
		 * @param string $text The text content.
		 */
		public function __construct( $text = 'Generated text.' ) {
			$this->text = $text;
		}

		/**
		 * Get the result ID.
		 *
		 * @return string
		 */
		public function getId() {
			return 'fake-result-id';
		}

		/**
		 * Get the text content.
		 *
		 * @throws \RuntimeException When the result has no text content.
		 * @return string
		 */
		public function toText() {
			if ( $this->throw_on_text ) {
				throw new \RuntimeException( 'No text content available in the result.' );
			}

			return $this->text;
		}

		/**
		 * Get the token usage.
		 *
		 * @return Fake_Token_Usage
		 */
		public function getTokenUsage() {
			return new Fake_Token_Usage();
		}
	}

	/**
	 * Adaptor subclass exposing the builder seam.
	 */
	class Testable_AI_Client_Adaptor extends \ThemeIsle\GutenbergBlocks\Server\AI_Client_Adaptor {
		/**
		 * The builder to use.
		 *
		 * @var Spy_AI_Builder
		 */
		public $builder;

		/**
		 * Constructor.
		 *
		 * @param Spy_AI_Builder|null $builder The spy builder.
		 */
		public function __construct( $builder = null ) {
			$this->builder = null !== $builder ? $builder : new Spy_AI_Builder();
		}

		/**
		 * Return the spy builder instead of wp_ai_client_prompt().
		 *
		 * @return Spy_AI_Builder
		 */
		protected function make_builder() {
			return $this->builder;
		}
	}

	/**
	 * Fake AI backend for resolver tests.
	 */
	class Fake_AI_Backend implements \ThemeIsle\GutenbergBlocks\Server\AI_Backend {
		/**
		 * Whether this backend is available.
		 *
		 * @var bool
		 */
		private $available;

		/**
		 * The response returned by generate().
		 *
		 * @var array<string, mixed>
		 */
		private $response;

		/**
		 * Constructor.
		 *
		 * @param bool                 $available Whether this backend is available.
		 * @param array<string, mixed> $response  The response returned by generate().
		 */
		public function __construct( $available = true, $response = array() ) {
			$this->available = $available;
			$this->response  = $response;
		}

		/**
		 * Whether this backend can currently serve generation requests.
		 *
		 * @return bool
		 */
		public function is_available() {
			return $this->available;
		}

		/**
		 * Generate a fake response.
		 *
		 * @param array<string, mixed> $payload The OpenAI-format payload.
		 * @return array<string, mixed>
		 */
		public function generate( array $payload ) {
			return $this->response;
		}
	}

	/**
	 * Reset the adaptor's request-level availability cache.
	 */
	function reset_ai_adaptor_cache() {
		$property = new \ReflectionProperty( \ThemeIsle\GutenbergBlocks\Server\AI_Client_Adaptor::class, 'available_cache' );
		$property->setAccessible( true );
		$property->setValue( null, null );
		\ThemeIsle\GutenbergBlocks\Server\AI_Backend_Resolver::reset_cache();
	}
}
