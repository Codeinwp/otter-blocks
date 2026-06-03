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
		remove_all_filters( 'pre_http_request' );
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
