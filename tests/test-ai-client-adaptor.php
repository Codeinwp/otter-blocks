<?php
/**
 * Class Test_AI_Client_Adaptor
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Server\AI_Client_Adaptor;
use ThemeIsle\GutenbergBlocks\Server\Prompt_Server;
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
	 * OpenAI function calling translates to a JSON response with the matched
	 * schema, and the output is reshaped into function_call.arguments.
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

		$message = $response['choices'][0]['message'];
		$this->assertNull( $message['content'] );
		$this->assertSame( 'create_form', $message['function_call']['name'] );
		$this->assertSame( '{"fields":[]}', $message['function_call']['arguments'] );
	}

	/**
	 * Successful generation is reshaped into the OpenAI chat-completions format.
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

		$this->assertSame( 'chat.completion', $response['object'] );
		$this->assertSame( 'fake-result-id', $response['id'] );
		$this->assertSame( 'Generated text.', $response['choices'][0]['message']['content'] );
		$this->assertSame( 'assistant', $response['choices'][0]['message']['role'] );
		$this->assertSame( 11, $response['usage']['prompt_tokens'] );
		$this->assertSame( 22, $response['usage']['completion_tokens'] );
		$this->assertSame( 33, $response['usage']['total_tokens'] );
	}

	/**
	 * WP_Error results map to the OpenAI error shape.
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

		$this->assertSame( 'prompt_client_error', $response['error']['code'] );
		$this->assertSame( 'Invalid API key.', $response['error']['message'] );
		$this->assertSame( 'wp_ai_client', $response['error']['type'] );
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

		$this->assertSame( 'empty_response', $response['error']['code'] );
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

		$this->assertSame( 'no_ai_provider', $response['error']['code'] );
	}

	/**
	 * The backend resolution ladder.
	 */
	public function test_resolve_backend_ladder() {
		// 'openai-key' always forces the legacy path.
		update_option( 'themeisle_otter_ai_backend', 'openai-key' );
		$this->force_availability( true );
		$this->assertSame( AI_Client_Adaptor::BACKEND_LEGACY, AI_Client_Adaptor::resolve_backend() );

		// 'auto' prefers the WP path when available.
		update_option( 'themeisle_otter_ai_backend', 'auto' );
		$this->force_availability( true );
		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );

		$this->force_availability( false );
		$this->assertSame( AI_Client_Adaptor::BACKEND_LEGACY, AI_Client_Adaptor::resolve_backend() );

		// Forced 'wp-ai-client' uses the WP path when available.
		update_option( 'themeisle_otter_ai_backend', 'wp-ai-client' );
		$this->force_availability( true );
		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );
		$this->assertFalse( AI_Client_Adaptor::is_fallback_active() );

		// Forced but unavailable with an Otter key falls back to legacy.
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );
		$this->force_availability( false );
		$this->assertSame( AI_Client_Adaptor::BACKEND_LEGACY, AI_Client_Adaptor::resolve_backend() );
		$this->assertTrue( AI_Client_Adaptor::is_fallback_active() );

		// Forced but unavailable without any key stays on the WP path (fails loudly).
		delete_option( 'themeisle_open_ai_api_key' );
		$this->force_availability( false );
		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );
		$this->assertFalse( AI_Client_Adaptor::is_fallback_active() );
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
					return new WP_Error( 'unexpected_request', 'The legacy path should not be used.' );
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

		$data = $response->get_data();

		// In environments without the WP 7.0 AI Client the adaptor degrades to
		// an actionable error; with it, a real reshaped response. Either way the
		// response is in OpenAI shape and came from the WP path.
		$this->assertTrue( isset( $data['choices'] ) || 'wp_ai_client' === $data['error']['type'] );

		// Usage is recorded on the WP path too.
		$usage = get_option( 'themeisle_otter_ai_usage' );
		$this->assertSame( 'otter_action_test', $usage['usage_count'][0]['key'] );
		$this->assertSame( 1, $usage['usage_count'][0]['value'] );
	}

	/**
	 * forward_prompt() keeps using the legacy direct-OpenAI path when resolved to legacy.
	 */
	public function test_forward_prompt_uses_legacy_backend() {
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
											'content' => 'Legacy response.',
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

		$this->assertSame( 'Legacy response.', $data['choices'][0]['message']['content'] );

		// Usage is recorded on the legacy path too.
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
