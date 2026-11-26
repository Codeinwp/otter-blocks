<?php
/**
 * Class Test_Prompt_Server
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Server\Prompt_Server;

/**
 * Prompt server tests.
 */
class Test_Prompt_Server extends WP_UnitTestCase {
	/**
	 * @var Prompt_Server
	 */
	private $prompt_server;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();
		$this->prompt_server = new Prompt_Server();
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		delete_transient( $this->prompt_server->transient_prompts );
		delete_transient( $this->prompt_server->timeout_transient );
		delete_option( 'themeisle_open_ai_api_key' );
		delete_transient( 'otter_ai_rate_' . get_current_user_id() );
		remove_all_filters( 'pre_http_request' );
		remove_all_filters( 'otter_ai_backend' );
		remove_all_filters( 'otter_ai_generate_rate_limit' );
		remove_all_filters( 'otter_ai_generate_max_tokens' );
		remove_all_filters( 'otter_ai_generate_allowed_models' );
		parent::tear_down();
	}

	/**
	 * Invalid save-key bodies return a REST error instead of falling through.
	 */
	public function test_save_api_key_rejects_invalid_body() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/openai/key' );
		$request->set_body( '{' );

		$response = $this->prompt_server->save_api_key( $request );

		$this->assertWPError( $response );
		$this->assertSame( 'rest_invalid_json', $response->get_error_code() );
		$this->assertSame( 400, $response->get_error_data()['status'] );
	}

	/**
	 * OpenAI validation errors return a WordPress REST error with the provider status.
	 */
	public function test_save_api_key_returns_provider_error_status() {
		add_filter(
			'pre_http_request',
			function () {
				return array(
					'headers'  => array(),
					'body'     => wp_json_encode(
						array(
							'error' => array(
								'code'    => 'invalid_api_key',
								'message' => 'Incorrect API key provided.',
							),
						)
					),
					'response' => array(
						'code'    => 401,
						'message' => 'Unauthorized',
					),
					'cookies'  => array(),
				);
			}
		);

		$request = new WP_REST_Request( 'POST', '/otter/v1/openai/key' );
		$request->set_body( wp_json_encode( array( 'api_key' => 'sk-invalid' ) ) );

		$response = $this->prompt_server->save_api_key( $request );

		$this->assertWPError( $response );
		$this->assertSame( 'invalid_api_key', $response->get_error_code() );
		$this->assertSame( 'Incorrect API key provided.', $response->get_error_message() );
		$this->assertSame( 401, $response->get_error_data()['status'] );
		$this->assertFalse( get_option( 'themeisle_open_ai_api_key', false ) );
	}

	/**
	 * Invalid generate bodies return a REST error instead of reaching a backend.
	 */
	public function test_forward_prompt_rejects_invalid_body() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/openai/generate' );
		$request->set_body( '{' );

		$response = $this->prompt_server->forward_prompt( $request );

		$this->assertWPError( $response );
		$this->assertSame( 'rest_invalid_json', $response->get_error_code() );
		$this->assertSame( 400, $response->get_error_data()['status'] );
	}

	/**
	 * Send a generate request through the legacy OpenAI backend and capture the provider payload.
	 *
	 * @param array $body   The request body.
	 * @param array $sent   Receives the decoded payload sent to the provider.
	 * @return \WP_REST_Response|\WP_Error
	 */
	private function generate( $body, &$sent = null ) {
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );
		remove_all_filters( 'pre_http_request' );
		add_filter(
			'otter_ai_backend',
			function () {
				return 'legacy';
			}
		);
		add_filter(
			'pre_http_request',
			function ( $pre, $args ) use ( &$sent ) {
				$sent = json_decode( $args['body'], true );
				return array(
					'headers'  => array(),
					'body'     => wp_json_encode(
						array(
							'choices' => array( array( 'message' => array( 'content' => 'Hello' ) ) ),
							'usage'   => array( 'total_tokens' => 5 ),
						)
					),
					'response' => array(
						'code'    => 200,
						'message' => 'OK',
					),
					'cookies'  => array(),
				);
			},
			10,
			2
		);

		$request = new WP_REST_Request( 'POST', '/otter/v1/openai/generate' );
		$request->set_body( wp_json_encode( $body ) );

		return $this->prompt_server->forward_prompt( $request );
	}

	/**
	 * A request shaped like the editor's prompt templates is forwarded unchanged.
	 */
	public function test_forward_prompt_keeps_editor_request_fields() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$body = array(
			'otter_used_action'  => 'form',
			'otter_user_content' => 'Contact form',
			'model'              => 'gpt-5.6-terra',
			'reasoning_effort'   => 'low',
			'temperature'        => 1.3,
			'messages'           => array(
				array(
					'role'    => 'user',
					'content' => 'Contact form',
				),
			),
			'functions'          => array(
				array(
					'name'       => 'build_form',
					'parameters' => array( 'type' => 'object' ),
				),
			),
			'function_call'      => array( 'name' => 'build_form' ),
			'response_format'    => array( 'type' => 'json_object' ),
		);

		$response = $this->generate( $body, $sent );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 'Hello', $response->get_data()['content'] );
		$this->assertSame( 'gpt-5.6-terra', $sent['model'] );
		$this->assertSame( 'low', $sent['reasoning_effort'] );
		$this->assertSame( 1.3, $sent['temperature'] );
		$this->assertSame( $body['messages'], $sent['messages'] );
		$this->assertSame( $body['functions'], $sent['functions'] );
		$this->assertSame( $body['function_call'], $sent['function_call'] );
		$this->assertSame( $body['response_format'], $sent['response_format'] );
		$this->assertArrayNotHasKey( 'otter_used_action', $sent );
	}

	/**
	 * Keys outside the supported request fields are not forwarded.
	 */
	public function test_forward_prompt_drops_unsupported_fields() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$this->generate(
			array(
				'messages'              => array(
					array(
						'role'    => 'user',
						'content' => 'Hi',
					),
				),
				'n'                     => 8,
				'tools'                 => array( array( 'type' => 'function' ) ),
				'logprobs'              => true,
				'stream'                => true,
				'max_completion_tokens' => 100000,
			),
			$sent
		);

		$this->assertSame( array( 'max_completion_tokens', 'messages', 'model' ), $this->sorted_keys( $sent ) );
	}

	/**
	 * A model outside the allowed list falls back to the default model.
	 */
	public function test_forward_prompt_replaces_unknown_model() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$this->generate(
			array(
				'model'    => 'some-other-model',
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => 'Hi',
					),
				),
			),
			$sent
		);

		$this->assertSame( 'gpt-5.6-terra', $sent['model'] );
	}

	/**
	 * Models from the cached prompt templates and the allowed-models filter are accepted.
	 */
	public function test_forward_prompt_accepts_template_and_filtered_models() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		set_transient(
			$this->prompt_server->transient_prompts,
			array(
				array(
					'otter_name' => 'form',
					'model'      => 'template-model',
				),
			),
			MINUTE_IN_SECONDS
		);
		add_filter(
			'otter_ai_generate_allowed_models',
			function ( $models ) {
				$models[] = 'filtered-model';
				return $models;
			}
		);

		$messages = array(
			array(
				'role'    => 'user',
				'content' => 'Hi',
			),
		);

		$this->generate(
			array(
				'model'    => 'template-model',
				'messages' => $messages,
			),
			$sent
		);
		$this->assertSame( 'template-model', $sent['model'] );

		$this->generate(
			array(
				'model'    => 'filtered-model',
				'messages' => $messages,
			),
			$sent
		);
		$this->assertSame( 'filtered-model', $sent['model'] );
	}

	/**
	 * The output token limit is clamped to the filterable cap and set when missing.
	 */
	public function test_forward_prompt_clamps_max_tokens() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$messages = array(
			array(
				'role'    => 'user',
				'content' => 'Hi',
			),
		);

		$this->generate(
			array(
				'messages'   => $messages,
				'max_tokens' => 8192,
			),
			$sent
		);
		$this->assertSame( 8192, $sent['max_completion_tokens'] );

		$this->generate(
			array(
				'messages'   => $messages,
				'max_tokens' => 1000000,
			),
			$sent
		);
		$this->assertSame( 16384, $sent['max_completion_tokens'] );

		$this->generate( array( 'messages' => $messages ), $sent );
		$this->assertSame( 16384, $sent['max_completion_tokens'] );

		add_filter(
			'otter_ai_generate_max_tokens',
			function () {
				return 500;
			}
		);
		$this->generate(
			array(
				'messages'   => $messages,
				'max_tokens' => 8192,
			),
			$sent
		);
		$this->assertSame( 500, $sent['max_completion_tokens'] );
	}

	/**
	 * Requests above the per-user limit are rejected with a 429 error.
	 */
	public function test_forward_prompt_rate_limits_per_user() {
		$user_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );
		add_filter(
			'otter_ai_generate_rate_limit',
			function () {
				return 2;
			}
		);

		$body = array(
			'messages' => array(
				array(
					'role'    => 'user',
					'content' => 'Hi',
				),
			),
		);

		$this->assertSame( 200, $this->generate( $body )->get_status() );
		$this->assertSame( 200, $this->generate( $body )->get_status() );

		$sent     = null;
		$response = $this->generate( $body, $sent );

		$this->assertWPError( $response );
		$this->assertSame( 'otter_ai_rate_limited', $response->get_error_code() );
		$this->assertSame( 429, $response->get_error_data()['status'] );
		$this->assertNull( $sent );

		// The limit is per user.
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		$this->assertSame( 200, $this->generate( $body )->get_status() );
		delete_transient( 'otter_ai_rate_' . $user_id );
	}

	/**
	 * Sorted array keys.
	 *
	 * @param array $data The array.
	 * @return array
	 */
	private function sorted_keys( $data ) {
		$keys = array_keys( $data );
		sort( $keys );
		return $keys;
	}

	/**
	 * Ensure structure validation catches invalid payloads.
	 */
	public function test_check_prompt_structure_rejects_invalid_values() {
		$this->assertFalse( $this->prompt_server->check_prompt_structure( null ) );
		$this->assertFalse( $this->prompt_server->check_prompt_structure( 'invalid' ) );
		$this->assertFalse( $this->prompt_server->check_prompt_structure( array() ) );
	}

	/**
	 * Ensure structure validation accepts non-empty arrays.
	 */
	public function test_check_prompt_structure_accepts_non_empty_array() {
		$this->assertTrue(
			$this->prompt_server->check_prompt_structure(
				array(
					array(
						'otter_name' => 'fix-grammar',
						'prompt'     => 'Fix grammar',
					),
				)
			)
		);
	}

	/**
	 * Ensure get_prompts returns cached prompts when transient exists.
	 */
	public function test_get_prompts_returns_cached_prompts() {
		$cached_prompts = array(
			array(
				'otter_name' => 'fix-grammar',
				'prompt'     => 'Fix grammar',
			),
		);
		set_transient( $this->prompt_server->transient_prompts, $cached_prompts, MINUTE_IN_SECONDS );

		$request  = new WP_REST_Request( 'GET', '/otter/v1/openai/prompt' );
		$response = $this->prompt_server->get_prompts( $request );
		$data     = $response->get_data();

		$this->assertSame( '0', $data['code'] );
		$this->assertSame( '', $data['error'] );
		$this->assertSame( $cached_prompts, $data['prompts'] );
	}

	/**
	 * Ensure filtering by unknown prompt name yields fallback error.
	 */
	public function test_get_prompts_returns_error_when_named_prompt_is_missing() {
		$cached_prompts = array(
			array(
				'otter_name' => 'fix-grammar',
				'prompt'     => 'Fix grammar',
			),
		);
		set_transient( $this->prompt_server->transient_prompts, $cached_prompts, MINUTE_IN_SECONDS );

		$request = new WP_REST_Request( 'GET', '/otter/v1/openai/prompt' );
		$request->set_param( 'name', 'missing-prompt' );

		$response = $this->prompt_server->get_prompts( $request );
		$data     = $response->get_data();

		$this->assertSame( '1', $data['code'] );
		$this->assertNotEmpty( $data['error'] );
		$this->assertSame( $cached_prompts, $data['prompts'] );
	}

	/**
	 * Ensure filtering by existing prompt returns only one prompt.
	 */
	public function test_get_prompts_returns_single_prompt_when_name_exists() {
		$cached_prompts = array(
			array(
				'otter_name' => 'fix-grammar',
				'prompt'     => 'Fix grammar',
			),
			array(
				'otter_name' => 'make-shorter',
				'prompt'     => 'Make shorter',
			),
		);
		set_transient( $this->prompt_server->transient_prompts, $cached_prompts, MINUTE_IN_SECONDS );

		$request = new WP_REST_Request( 'GET', '/otter/v1/openai/prompt' );
		$request->set_param( 'name', 'make-shorter' );

		$response = $this->prompt_server->get_prompts( $request );
		$data     = $response->get_data();

		$this->assertSame( '0', $data['code'] );
		$this->assertCount( 1, $data['prompts'] );
		$this->assertSame( 'make-shorter', $data['prompts'][0]['otter_name'] );
	}

	/**
	 * Ensure prompt retrieval returns timeout response when timeout transient is active.
	 */
	public function test_retrieve_prompts_from_server_returns_timeout_when_transient_is_set() {
		set_transient( $this->prompt_server->timeout_transient, '1', MINUTE_IN_SECONDS );

		$response = $this->prompt_server->retrieve_prompts_from_server();

		$this->assertSame( '3', $response['code'] );
		$this->assertNotEmpty( $response['error'] );
		$this->assertArrayHasKey( 'response', $response );
	}
}
