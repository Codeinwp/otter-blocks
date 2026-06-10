<?php
/**
 * Class Test_AI_Client_Adaptor
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Server\AI_Client_Adaptor;
use ThemeIsle\GutenbergBlocks\Server\AI_Backend_Resolver;
use ThemeIsle\GutenbergBlocks\Server\AI_Response;
use ThemeIsle\GutenbergBlocks\Server\Otter_OpenAI_Backend;
use ThemeIsle\GutenbergBlocks\Server\Prompt_Server;
use ThemeIsle\GutenbergBlocks\Tests\Fake_AI_Backend;
use ThemeIsle\GutenbergBlocks\Tests\Fake_AI_Result;
use ThemeIsle\GutenbergBlocks\Tests\Spy_AI_Builder;
use ThemeIsle\GutenbergBlocks\Tests\Testable_AI_Client_Adaptor;
use function ThemeIsle\GutenbergBlocks\Tests\reset_ai_adaptor_cache;

require_once __DIR__ . '/ai-client-mock.php';

/**
 * WP AI Client adaptor tests.
 */
class Test_AI_Client_Adaptor extends WP_UnitTestCase {

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();
		reset_ai_adaptor_cache();
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		remove_all_filters( 'otter_ai_client_available' );
		remove_all_filters( 'otter_ai_backend' );
		remove_all_filters( 'otter_ai_backends' );
		remove_all_filters( 'otter_ai_otter_openai_payload' );
		remove_all_filters( 'otter_ai_otter_openai_request_args' );
		remove_all_filters( 'otter_ai_otter_openai_response' );
		remove_all_filters( 'pre_http_request' );
		delete_option( 'themeisle_otter_ai_backend' );
		delete_option( 'themeisle_open_ai_api_key' );
		delete_option( 'themeisle_otter_ai_usage' );
		reset_ai_adaptor_cache();
		parent::tear_down();
	}

	/**
	 * Force the availability check to a fixed value.
	 *
	 * @param bool $available The availability.
	 */
	private function force_availability( $available ) {
		remove_all_filters( 'otter_ai_client_available' );
		add_filter( 'otter_ai_client_available', $available ? '__return_true' : '__return_false' );
		reset_ai_adaptor_cache();
	}

	/**
	 * Create an adaptor with a spy builder returning the given result.
	 *
	 * @param mixed $result The generate_text_result() return value.
	 * @return Testable_AI_Client_Adaptor
	 */
	private function make_adaptor( $result = null ) {
		$this->force_availability( true );

		$builder         = new Spy_AI_Builder();
		$builder->result = null !== $result ? $result : new Fake_AI_Result();

		return new Testable_AI_Client_Adaptor( $builder );
	}

	/**
	 * System messages are concatenated into the system instruction; the rest
	 * map to history (assistant → model) with the last user turn as the prompt.
	 */
	public function test_generate_translates_messages() {
		$adaptor = $this->make_adaptor();

		$adaptor->generate(
			array(
				'messages' => array(
					array(
						'role'    => 'system',
						'content' => 'S1',
					),
					array(
						'role'    => 'system',
						'content' => 'S2',
					),
					array(
						'role'    => 'user',
						'content' => 'U1',
					),
					array(
						'role'    => 'assistant',
						'content' => 'A1',
					),
					array(
						'role'    => 'user',
						'content' => 'U2',
					),
				),
			)
		);

		$builder = $adaptor->builder;

		$this->assertSame( array( "S1\n\nS2" ), $builder->get_call_args( 'using_system_instruction' ) );

		$history = $builder->get_call_args( 'with_history' );
		$this->assertCount( 2, $history );
		$this->assertInstanceOf( \WordPress\AiClient\Messages\DTO\UserMessage::class, $history[0] );
		$this->assertInstanceOf( \WordPress\AiClient\Messages\DTO\ModelMessage::class, $history[1] );

		$this->assertSame( array( 'U2' ), $builder->get_call_args( 'with_text' ) );
	}

	/**
	 * Payloads that do not end with a user turn are rejected instead of
	 * silently reordering the conversation.
	 */
	public function test_generate_rejects_payload_not_ending_with_user_turn() {
		$adaptor = $this->make_adaptor();

		$response = $adaptor->generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'U1',
					),
					array(
						'role'    => 'assistant',
						'content' => 'A1',
					),
				),
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'invalid_payload', $response->get_error_code() );
		$this->assertSame( 400, $response->get_error_data()['status'] );

		// Payloads with no conversation turns at all are rejected too.
		$response = $adaptor->generate( array( 'messages' => array() ) );

		$this->assertWPError( $response );
		$this->assertSame( 'invalid_payload', $response->get_error_code() );
	}

	/**
	 * Generation parameters are mapped and the model pin is dropped.
	 */
	public function test_generate_maps_parameters_and_drops_model() {
		$adaptor = $this->make_adaptor();

		$adaptor->generate(
			array(
				'model'       => 'gpt-3.5-turbo',
				'temperature' => 0.7,
				'max_tokens'  => 100,
				'top_p'       => 0.5,
				'stop'        => 'END',
				'messages'    => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$builder = $adaptor->builder;

		$this->assertSame( array( 0.7 ), $builder->get_call_args( 'using_temperature' ) );
		$this->assertSame( array( 100 ), $builder->get_call_args( 'using_max_tokens' ) );
		$this->assertSame( array( 0.5 ), $builder->get_call_args( 'using_top_p' ) );
		$this->assertSame( array( 'END' ), $builder->get_call_args( 'using_stop_sequences' ) );
		$this->assertFalse( $builder->was_called( 'using_model' ) );
		$this->assertFalse( $builder->was_called( 'using_model_preference' ) );
	}

	/**
	 * OpenAI function calling translates to a JSON response with the matched schema.
	 */
	public function test_generate_translates_forced_json() {
		$schema  = array(
			'type'       => 'object',
			'properties' => array(
				'fields' => array( 'type' => 'array' ),
			),
		);
		$adaptor = $this->make_adaptor( new Fake_AI_Result( '{"fields":[]}' ) );

		$response = $adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Make a form',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'other_function',
						'parameters' => array( 'type' => 'object' ),
					),
					array(
						'name'       => 'create_form',
						'parameters' => $schema,
					),
				),
				'function_call' => array( 'name' => 'create_form' ),
			)
		);

		$this->assertSame( array( $schema ), $adaptor->builder->get_call_args( 'as_json_response' ) );

		$this->assertSame( '{"fields":[]}', $response['content'] );
		$this->assertSame( 33, $response['usedTokens'] );
		$this->assertSame( 'json', $response['format'] );
	}

	/**
	 * Optional OpenAI function calling should not force structured JSON output.
	 */
	public function test_generate_does_not_force_json_for_optional_function_calls() {
		$adaptor = $this->make_adaptor( new Fake_AI_Result( 'Plain text response.' ) );

		$response = $adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Write normal content',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'create_form',
						'parameters' => array( 'type' => 'object' ),
					),
				),
				'function_call' => 'auto',
			)
		);

		$this->assertFalse( $adaptor->builder->was_called( 'as_json_response' ) );
		$this->assertSame( 'Plain text response.', $response['content'] );
		$this->assertSame( 'text', $response['format'] );
	}

	/**
	 * An unmatched explicit function call should not force the first function.
	 */
	public function test_generate_does_not_force_json_for_unmatched_function_call() {
		$adaptor = $this->make_adaptor( new Fake_AI_Result( 'Plain text response.' ) );

		$response = $adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Write normal content',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'create_form',
						'parameters' => array( 'type' => 'object' ),
					),
				),
				'function_call' => array( 'name' => 'missing_function' ),
			)
		);

		$this->assertFalse( $adaptor->builder->was_called( 'as_json_response' ) );
		$this->assertSame( 'Plain text response.', $response['content'] );
		$this->assertSame( 'text', $response['format'] );
	}

	/**
	 * Successful generation is reshaped into the Otter AI response format.
	 */
	public function test_generate_reshapes_success_response() {
		$adaptor = $this->make_adaptor( new Fake_AI_Result( 'Generated text.' ) );

		$response = $adaptor->generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$this->assertSame( 'Generated text.', $response['content'] );
		$this->assertSame( 33, $response['usedTokens'] );
		$this->assertSame( 'text', $response['format'] );
	}

	/**
	 * WP_Error results remain WordPress REST errors.
	 */
	public function test_generate_reshapes_wp_error() {
		$adaptor = $this->make_adaptor( new WP_Error( 'prompt_client_error', 'Invalid API key.' ) );

		$response = $adaptor->generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'prompt_client_error', $response->get_error_code() );
		$this->assertSame( 'Invalid API key.', $response->get_error_message() );
		$this->assertSame( 502, $response->get_error_data()['status'] );
		$this->assertSame( 'wp_ai_client', $response->get_error_data()['type'] );
	}

	/**
	 * Results without text content map to an empty_response error.
	 */
	public function test_generate_handles_empty_response() {
		$result                = new Fake_AI_Result();
		$result->throw_on_text = true;
		$adaptor               = $this->make_adaptor( $result );

		$response = $adaptor->generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'empty_response', $response->get_error_code() );
		$this->assertSame( 502, $response->get_error_data()['status'] );
		$this->assertSame( 'wp_ai_client', $response->get_error_data()['type'] );
	}

	/**
	 * Generation without an available provider returns an actionable error.
	 */
	public function test_generate_errors_when_unavailable() {
		$this->force_availability( false );

		$adaptor  = new Testable_AI_Client_Adaptor();
		$response = $adaptor->generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'no_ai_provider', $response->get_error_code() );
		$this->assertSame( 400, $response->get_error_data()['status'] );
		$this->assertSame( 'wp_ai_client', $response->get_error_data()['type'] );
	}

	/**
	 * The backend resolution ladder.
	 */
	public function test_resolve_backend_ladder() {
		// 'openai-key' always forces the Otter OpenAI path.
		update_option( 'themeisle_otter_ai_backend', 'openai-key' );
		$this->force_availability( true );
		$this->assertSame( AI_Client_Adaptor::BACKEND_OTTER_OPENAI, AI_Client_Adaptor::resolve_backend() );

		// 'auto' prefers the WP path when available.
		update_option( 'themeisle_otter_ai_backend', 'auto' );
		$this->force_availability( true );
		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );

		$this->force_availability( false );
		$this->assertSame( AI_Client_Adaptor::BACKEND_OTTER_OPENAI, AI_Client_Adaptor::resolve_backend() );

		// Forced 'wp-ai-client' uses the WP path when available.
		update_option( 'themeisle_otter_ai_backend', 'wp-ai-client' );
		$this->force_availability( true );
		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );
		$this->assertFalse( AI_Client_Adaptor::is_fallback_active() );

		// Forced but unavailable with an Otter key falls back to Otter OpenAI.
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );
		$this->force_availability( false );
		$this->assertSame( AI_Client_Adaptor::BACKEND_OTTER_OPENAI, AI_Client_Adaptor::resolve_backend() );
		$this->assertTrue( AI_Client_Adaptor::is_fallback_active() );

		// Forced but unavailable without any key stays on the WP path (fails loudly).
		delete_option( 'themeisle_open_ai_api_key' );
		$this->force_availability( false );
		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );
		$this->assertFalse( AI_Client_Adaptor::is_fallback_active() );
	}

	/**
	 * Fallback reporting follows the filtered resolved backend.
	 */
	public function test_fallback_active_is_derived_from_resolved_backend() {
		update_option( 'themeisle_otter_ai_backend', 'wp-ai-client' );
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );
		$this->force_availability( false );

		add_filter(
			'otter_ai_backend',
			function () {
				return AI_Client_Adaptor::BACKEND_WP;
			}
		);

		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );
		$this->assertFalse( AI_Client_Adaptor::is_fallback_active() );
	}

	/**
	 * Invalid backend registry filters fall back to the default backends.
	 */
	public function test_backend_registry_ignores_invalid_filter_results() {
		add_filter(
			'otter_ai_backends',
			function () {
				return array(
					'invalid' => new stdClass(),
				);
			}
		);

		$backends = AI_Backend_Resolver::get_backends();

		$this->assertArrayHasKey( AI_Client_Adaptor::BACKEND_WP, $backends );
		$this->assertArrayHasKey( AI_Client_Adaptor::BACKEND_OTTER_OPENAI, $backends );
	}

	/**
	 * A registered backend can be selected through the resolved backend filter.
	 */
	public function test_custom_backend_can_be_registered_and_selected() {
		$custom = new Fake_AI_Backend(
			true,
			AI_Response::success( 'Custom response.', 0, 'text' )
		);

		add_filter(
			'otter_ai_backends',
			function ( $backends ) use ( $custom ) {
				$backends['custom'] = $custom;
				return $backends;
			}
		);

		add_filter(
			'otter_ai_backend',
			function () {
				return 'custom';
			}
		);

		$backend = AI_Backend_Resolver::resolve();

		$this->assertSame( $custom, $backend );
		$this->assertSame( 'Custom response.', $backend->generate( array() )['content'] );
	}

	/**
	 * AI responses use the shared Otter AI envelope.
	 */
	public function test_ai_response_shape() {
		$success = AI_Response::success( 'Generated content.', 7, 'text' );

		$this->assertSame( 'Generated content.', $success['content'] );
		$this->assertSame( 7, $success['usedTokens'] );
		$this->assertSame( 'text', $success['format'] );

		$error = AI_Response::error( 'test_error', 'Something failed.', 'test_backend', 418 );

		$this->assertWPError( $error );
		$this->assertSame( 'test_error', $error->get_error_code() );
		$this->assertSame( 'Something failed.', $error->get_error_message() );
		$this->assertSame( 418, $error->get_error_data()['status'] );
		$this->assertNull( $error->get_error_data()['param'] );
		$this->assertSame( 'test_backend', $error->get_error_data()['type'] );
	}

	/**
	 * Otter OpenAI payload and request filters run before the HTTP request.
	 */
	public function test_otter_openai_filters_payload_and_request_args() {
		update_option( 'themeisle_otter_ai_backend', 'openai-key' );
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );

		add_filter(
			'otter_ai_otter_openai_payload',
			function ( $payload ) {
				$payload['model'] = 'gpt-test-model';
				return $payload;
			}
		);

		add_filter(
			'otter_ai_otter_openai_request_args',
			function ( $args, $payload ) use ( &$filter_saw_authorization ) {
				$filter_saw_authorization = isset( $args['headers']['Authorization'] );
				$args['timeout']                         = 123;
				$args['headers']['Authorization']        = 'Bearer sk-override';
				$args['headers']['X-Otter-Test-Model'] = $payload['model'];
				$args['sslverify']                       = false;
				return $args;
			},
			10,
			2
		);

		$captured_args = array();
		$filter_saw_authorization = true;

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( &$captured_args ) {
				if ( Otter_OpenAI_Backend::BASE_URL === $url ) {
					$captured_args = $args;
					return array(
						'headers'  => array(),
						'body'     => wp_json_encode(
							array(
								'choices' => array(
									array(
										'message' => array(
											'role'    => 'assistant',
											'content' => 'Filtered response.',
										),
									),
								),
							)
						),
						'response' => array(
							'code'    => 200,
							'message' => 'OK',
						),
					);
				}

				return $preempt;
			},
			10,
			3
		);

		$response = $this->dispatch_generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$sent_body = json_decode( $captured_args['body'], true );

		$this->assertSame( 'gpt-test-model', $sent_body['model'] );
		$this->assertTrue( $filter_saw_authorization );
		$this->assertSame( 123, $captured_args['timeout'] );
		$this->assertSame( 'Bearer sk-override', $captured_args['headers']['Authorization'] );
		$this->assertSame( 'gpt-test-model', $captured_args['headers']['X-Otter-Test-Model'] );

		// Transport-level args beyond the defaults pass through to wp_remote_post().
		$this->assertFalse( $captured_args['sslverify'] );
		$this->assertSame( 'Filtered response.', $response->get_data()['content'] );
	}

	/**
	 * Otter OpenAI response filters can post-process the decoded response body.
	 */
	public function test_otter_openai_filters_response() {
		update_option( 'themeisle_otter_ai_backend', 'openai-key' );
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );

		add_filter(
			'otter_ai_otter_openai_response',
			function ( $body ) {
				$body['choices'][0]['message']['content'] = 'Post processed response.';
				return $body;
			}
		);

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) {
				if ( Otter_OpenAI_Backend::BASE_URL === $url ) {
					return array(
						'headers'  => array(),
						'body'     => wp_json_encode(
							array(
								'choices' => array(
									array(
										'message' => array(
											'role'    => 'assistant',
											'content' => 'Original response.',
										),
									),
								),
							)
						),
						'response' => array(
							'code'    => 200,
							'message' => 'OK',
						),
					);
				}

				return $preempt;
			},
			10,
			3
		);

		$response = $this->dispatch_generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$this->assertSame( 'Post processed response.', $response->get_data()['content'] );
	}

	/**
	 * forward_prompt() routes to the WP AI Client path and skips the OpenAI request.
	 */
	public function test_forward_prompt_uses_wp_backend() {
		update_option( 'themeisle_otter_ai_backend', 'wp-ai-client' );
		$this->force_availability( true );

		$openai_called = false;
		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( &$openai_called ) {
				if ( false !== strpos( $url, 'api.openai.com' ) ) {
					$openai_called = true;
					return new WP_Error( 'unexpected_request', 'The Otter OpenAI path should not be used.' );
				}
				return $preempt;
			},
			10,
			3
		);

		$response = $this->dispatch_generate(
			array(
				'otter_used_action'  => 'otter_action_test',
				'otter_user_content' => 'Test content',
				'messages'           => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$this->assertFalse( $openai_called );

		// In environments without the WP 7.0 AI Client the adaptor degrades to
		// an actionable WP_Error; with it, a successful Otter AI response.
		if ( is_wp_error( $response ) ) {
			$this->assertSame( 'wp_ai_client', $response->get_error_data()['type'] );

			// Failed generations are not recorded.
			$this->assertFalse( get_option( 'themeisle_otter_ai_usage' ) );
		} else {
			$this->assertArrayHasKey( 'content', $response->get_data() );

			// Usage is recorded on the WP path too.
			$usage = get_option( 'themeisle_otter_ai_usage' );
			$this->assertSame( 'otter_action_test', $usage['usage_count'][0]['key'] );
			$this->assertSame( 1, $usage['usage_count'][0]['value'] );
		}
	}

	/**
	 * forward_prompt() keeps using the Otter OpenAI path when resolved to it.
	 */
	public function test_forward_prompt_uses_otter_openai_backend() {
		update_option( 'themeisle_otter_ai_backend', 'openai-key' );
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );
		$this->force_availability( true );

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) {
				if ( false !== strpos( $url, 'api.openai.com' ) ) {
					return array(
						'headers'  => array(),
						'body'     => wp_json_encode(
							array(
								'choices' => array(
									array(
										'message' => array(
											'role'    => 'assistant',
											'content' => 'Otter OpenAI response.',
										),
									),
								),
							)
						),
						'response' => array(
							'code'    => 200,
							'message' => 'OK',
						),
					);
				}
				return $preempt;
			},
			10,
			3
		);

		$response = $this->dispatch_generate(
			array(
				'otter_used_action'  => 'otter_action_test',
				'otter_user_content' => 'Test content',
				'messages'           => array(
					array(
						'role'    => 'user',
						'content' => 'Hello',
					),
				),
			)
		);

		$data = $response->get_data();

		$this->assertSame( 'Otter OpenAI response.', $data['content'] );

		// Usage is recorded on the Otter OpenAI path too.
		$usage = get_option( 'themeisle_otter_ai_usage' );
		$this->assertSame( 'otter_action_test', $usage['usage_count'][0]['key'] );
	}

	/**
	 * Call forward_prompt() with a JSON body.
	 *
	 * @param array $body The request body.
	 * @return WP_REST_Response|WP_Error
	 */
	private function dispatch_generate( $body ) {
		$server = new Prompt_Server();

		$request = new WP_REST_Request( 'POST', '/otter/v1/openai/generate' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( $body ) );

		return $server->forward_prompt( $request );
	}
}
