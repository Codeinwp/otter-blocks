<?php
/**
 * Class Test_Prompt_Server
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Server\Otter_OpenAI_Backend;
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
	 * @var callable|null
	 */
	private $http_mock = null;

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
		remove_all_filters( 'query' );
		remove_all_filters( 'otter_ai_backend' );
		remove_all_filters( 'otter_ai_generate_rate_limit' );
		remove_all_filters( 'otter_ai_generate_max_tokens' );
		remove_all_filters( 'otter_ai_generate_allowed_models' );
		remove_all_filters( 'otter_ai_generate_max_payload_bytes' );
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
		if ( null !== $this->http_mock ) {
			remove_filter( 'pre_http_request', $this->http_mock );
		}
		add_filter(
			'otter_ai_backend',
			function () {
				return 'legacy';
			}
		);
		$this->http_mock = function ( $pre, $args, $url ) use ( &$sent ) {
			if ( false !== $pre ) {
				return $pre;
			}
			if ( false === strpos( $url, 'api.openai.com' ) ) {
				return new WP_Error( 'http_request_blocked', 'Unexpected request.' );
			}
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
		};
		add_filter( 'pre_http_request', $this->http_mock, 10, 3 );

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
	}

	/**
	 * A rate limit of 0 disables the per-user limit.
	 */
	public function test_forward_prompt_rate_limit_zero_disables_limit() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		add_filter( 'otter_ai_generate_rate_limit', '__return_zero' );

		$body = array( 'messages' => array( array( 'role' => 'user', 'content' => 'Hi' ) ) ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound

		for ( $i = 0; $i < 3; $i++ ) {
			$this->assertSame( 200, $this->generate( $body )->get_status() );
		}

		$this->assertSame( 0, $this->count_quota_rows() );
	}

	/**
	 * A counter from an earlier window does not block new requests and is removed.
	 */
	public function test_forward_prompt_rate_limit_resets_in_new_window() {
		$user_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );

		$prefix = 'otter_ai_quota_' . md5( 'user_' . $user_id ) . '_';
		$window = (int) floor( time() / 600 );
		add_option( $prefix . ( $window - 1 ), 120, '', false );

		// Counters of other buckets: the earlier window is removed too, the current one is kept.
		$other = 'otter_ai_quota_' . md5( 'form_other' ) . '_';
		add_option( $other . ( $window - 1 ), 3, '', false );
		add_option( $other . $window, 2, '', false );

		$body = array( 'messages' => array( array( 'role' => 'user', 'content' => 'Hi' ) ) ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound

		$this->assertSame( 200, $this->generate( $body )->get_status() );
		$this->assertSame( 2, $this->count_quota_rows() );
		$this->assertSame( '1', $this->get_quota_value( $prefix . $window ) );
		$this->assertSame( '2', $this->get_quota_value( $other . $window ) );
	}

	/**
	 * A request that runs while another one is reserving its slot cannot pass the limit too.
	 */
	public function test_forward_prompt_rate_limit_holds_for_overlapping_requests() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		add_filter(
			'otter_ai_generate_rate_limit',
			function () {
				return 1;
			}
		);

		$body = array( 'messages' => array( array( 'role' => 'user', 'content' => 'Hi' ) ) ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound

		// Run a second request just before the first one writes its counter.
		$inner = null;
		add_filter(
			'query',
			function ( $query ) use ( &$inner, $body ) {
				if ( null === $inner && 0 === strpos( $query, 'UPDATE' ) && false !== strpos( $query, 'otter_ai_quota_' ) ) {
					$inner = false;
					$inner = $this->generate( $body );
				}
				return $query;
			}
		);

		$calls = 0;
		add_filter(
			'pre_http_request',
			function ( $pre ) use ( &$calls ) {
				++$calls;
				return $pre;
			},
			5
		);

		$outer = $this->generate( $body );

		$statuses = array(
			is_wp_error( $outer ) ? $outer->get_error_data()['status'] : $outer->get_status(),
			is_wp_error( $inner ) ? $inner->get_error_data()['status'] : $inner->get_status(),
		);
		sort( $statuses );

		$this->assertSame( array( 200, 429 ), $statuses );
		$this->assertSame( 1, $calls );
	}

	/**
	 * Invalid output token values fall back to the cap or the minimum.
	 */
	public function test_forward_prompt_normalizes_invalid_max_tokens() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$messages = array( array( 'role' => 'user', 'content' => 'Hi' ) ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound

		$this->generate( array( 'messages' => $messages, 'max_tokens' => 'abc' ), $sent ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
		$this->assertSame( 16384, $sent['max_completion_tokens'] );

		$this->generate( array( 'messages' => $messages, 'max_tokens' => 0 ), $sent ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
		$this->assertSame( 1, $sent['max_completion_tokens'] );

		$this->generate( array( 'messages' => $messages, 'max_tokens' => -5 ), $sent ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
		$this->assertSame( 1, $sent['max_completion_tokens'] );
	}

	/**
	 * Requests above the payload size cap are rejected before the provider call and the rate limit.
	 */
	public function test_forward_prompt_rejects_oversized_payload() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		add_filter(
			'otter_ai_generate_max_payload_bytes',
			function () {
				return 1000;
			}
		);

		$sent     = null;
		$response = $this->generate(
			array( 'messages' => array( array( 'role' => 'user', 'content' => str_repeat( 'a', 2000 ) ) ) ), // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
			$sent
		);

		$this->assertWPError( $response );
		$this->assertSame( 'otter_ai_payload_too_large', $response->get_error_code() );
		$this->assertSame( 413, $response->get_error_data()['status'] );
		$this->assertNull( $sent );
		$this->assertSame( 0, $this->count_quota_rows() );

		// The default cap accepts a normal request and rejects a very large one.
		remove_all_filters( 'otter_ai_generate_max_payload_bytes' );
		$this->assertSame( 200, $this->generate( array( 'messages' => array( array( 'role' => 'user', 'content' => str_repeat( 'a', 2000 ) ) ) ) )->get_status() ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
		$this->assertWPError( $this->generate( array( 'functions' => array( array( 'name' => str_repeat( 'a', 300 * KB_IN_BYTES ) ) ) ) ) ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound

		// A cap of 0 disables the size check.
		add_filter( 'otter_ai_generate_max_payload_bytes', '__return_zero' );
		$this->assertSame( 200, $this->generate( array( 'functions' => array( array( 'name' => str_repeat( 'a', 300 * KB_IN_BYTES ) ) ) ) )->get_status() ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
	}

	/**
	 * When the template cache is empty, the templates are fetched again before a model is replaced.
	 */
	public function test_forward_prompt_refreshes_templates_for_model_check() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		add_filter(
			'pre_http_request',
			function ( $pre, $args, $url ) {
				if ( false === strpos( $url, 'otter-prompts' ) ) {
					return $pre;
				}
				return array(
					'headers'  => array(),
					'body'     => wp_json_encode(
						array(
							array(
								'otter_name' => 'form',
								'model'      => 'template-model',
							),
						)
					),
					'response' => array(
						'code'    => 200,
						'message' => 'OK',
					),
					'cookies'  => array(),
				);
			},
			5,
			3
		);

		$this->generate(
			array(
				'model'    => 'template-model',
				'messages' => array( array( 'role' => 'user', 'content' => 'Hi' ) ), // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
			),
			$sent
		);

		$this->assertSame( 'template-model', $sent['model'] );
		$this->assertIsArray( get_transient( $this->prompt_server->transient_prompts ) );
	}

	/**
	 * The templates are fetched again only for a non-default model, and a failed fetch is not repeated.
	 */
	public function test_forward_prompt_template_refresh_is_throttled() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		$fetches = 0;
		add_filter(
			'pre_http_request',
			function ( $pre, $args, $url ) use ( &$fetches ) {
				if ( false === strpos( $url, 'otter-prompts' ) ) {
					return $pre;
				}
				++$fetches;
				return new WP_Error( 'http_request_failed', 'Unavailable' );
			},
			5,
			3
		);

		$messages = array( array( 'role' => 'user', 'content' => 'Hi' ) ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound

		$this->generate( array( 'messages' => $messages ) );
		$this->generate(
			array(
				'model'    => Otter_OpenAI_Backend::DEFAULT_MODEL,
				'messages' => $messages,
			)
		);
		$this->assertSame( 0, $fetches );

		$this->generate(
			array(
				'model'    => 'other-model',
				'messages' => $messages,
			)
		);
		$this->generate(
			array(
				'model'    => 'other-model',
				'messages' => $messages,
			),
			$sent
		);

		$this->assertSame( 1, $fetches );
		$this->assertSame( 'gpt-5.6-terra', $sent['model'] );
	}

	/**
	 * Count the stored request quota counters.
	 *
	 * @return int
	 */
	private function count_quota_rows() {
		global $wpdb;
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE 'otter\\_ai\\_quota\\_%'" );
	}

	/**
	 * Read a stored request quota counter.
	 *
	 * @param string $option The counter option name.
	 * @return string|null
	 */
	private function get_quota_value( $option ) {
		global $wpdb;
		return $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $option ) );
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
