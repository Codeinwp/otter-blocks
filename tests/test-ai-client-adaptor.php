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
		remove_all_filters( 'otter_ai_otter_openai_model' );
		remove_all_filters( 'otter_ai_otter_openai_request_args' );
		remove_all_filters( 'otter_ai_otter_openai_response' );
		remove_all_filters( 'pre_http_request' );
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
	 * OpenAI-style content-parts arrays are rejected instead of being cast
	 * to the literal string "Array".
	 */
	public function test_generate_rejects_non_string_message_content() {
		$adaptor = $this->make_adaptor();

		$response = $adaptor->generate(
			array(
				'messages' => array(
					array(
						'role'    => 'user',
						'content' => array(
							array(
								'type' => 'text',
								'text' => 'Hello',
							),
						),
					),
				),
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'invalid_payload', $response->get_error_code() );
		$this->assertSame( 400, $response->get_error_data()['status'] );
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

		$expected_schema = array(
			'type'                 => 'object',
			'properties'           => array(
				'fields' => array( 'type' => array( 'array', 'null' ) ),
			),
			'additionalProperties' => false,
			'required'             => array( 'fields' ),
		);

		$this->assertSame( array( $expected_schema ), $adaptor->builder->get_call_args( 'as_json_response' ) );

		$this->assertSame( '{"fields":[]}', $response['content'] );
		$this->assertSame( 33, $response['usedTokens'] );
		$this->assertSame( 'json', $response['format'] );
	}

	/**
	 * Nested object schemas gain additionalProperties: false for strict json_schema.
	 */
	public function test_generate_normalizes_nested_json_schema() {
		$schema = array(
			'type'       => 'object',
			'properties' => array(
				'fields' => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'label' => array( 'type' => 'string' ),
						),
					),
				),
			),
		);
		$adaptor  = $this->make_adaptor( new Fake_AI_Result( '{"fields":[]}' ) );
		$expected = array(
			'type'                 => 'object',
			'properties'           => array(
				'fields' => array(
					'type'  => array( 'array', 'null' ),
					'items' => array(
						'type'                 => 'object',
						'properties'           => array(
							'label' => array( 'type' => array( 'string', 'null' ) ),
						),
						'additionalProperties' => false,
						'required'             => array( 'label' ),
					),
				),
			),
			'additionalProperties' => false,
			'required'             => array( 'fields' ),
		);

		$adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Make a form',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'create_form',
						'parameters' => $schema,
					),
				),
				'function_call' => array( 'name' => 'create_form' ),
			)
		);

		$this->assertSame( array( $expected ), $adaptor->builder->get_call_args( 'as_json_response' ) );
	}

	/**
	 * Unsupported JSON Schema keywords are stripped for strict json_schema.
	 */
	public function test_generate_strips_unsupported_json_schema_keywords() {
		$schema = array(
			'type'       => 'object',
			'properties' => array(
				'fields' => array(
					'type'              => 'array',
					'uniqueItems'       => true,
					'minItems'          => 1,
					'dependentRequired' => array( 'label' => array( 'type' ) ),
					'items'             => array(
						'type'       => 'object',
						'not'        => array(
							'required' => array( 'legacy' ),
						),
						'properties' => array(
							'label' => array(
								'type'    => 'string',
								'default' => 'Field',
							),
						),
					),
				),
			),
		);
		$adaptor = $this->make_adaptor( new Fake_AI_Result( '{"fields":[]}' ) );

		$adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Make a form',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'create_form',
						'parameters' => $schema,
					),
				),
				'function_call' => array( 'name' => 'create_form' ),
			)
		);

		$normalized = $adaptor->builder->get_call_args( 'as_json_response' )[0];
		$fields     = $normalized['properties']['fields'];

		$this->assertArrayNotHasKey( 'uniqueItems', $fields );
		$this->assertArrayNotHasKey( 'minItems', $fields );
		$this->assertArrayNotHasKey( 'dependentRequired', $fields );
		$this->assertArrayNotHasKey( 'not', $fields['items'] );
		$this->assertArrayNotHasKey( 'default', $fields['items']['properties']['label'] );
	}

	/**
	 * Partial required lists from prompt templates are expanded for strict json_schema.
	 */
	public function test_generate_expands_partial_required_lists() {
		$schema = array(
			'type'       => 'object',
			'properties' => array(
				'fields' => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'label'       => array( 'type' => 'string' ),
							'type'        => array( 'type' => 'string' ),
							'placeholder' => array( 'type' => 'string' ),
						),
						'required'   => array( 'label', 'type' ),
					),
				),
			),
		);
		$adaptor = $this->make_adaptor( new Fake_AI_Result( '{"fields":[]}' ) );

		$adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Make a form',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'create_form',
						'parameters' => $schema,
					),
				),
				'function_call' => array( 'name' => 'create_form' ),
			)
		);

		$normalized = $adaptor->builder->get_call_args( 'as_json_response' )[0];

		$this->assertSame(
			array( 'label', 'type', 'placeholder' ),
			$normalized['properties']['fields']['items']['required']
		);
		$this->assertSame(
			array( 'string', 'null' ),
			$normalized['properties']['fields']['items']['properties']['placeholder']['type']
		);
	}

	/**
	 * Supported strict json_schema references are preserved and normalized.
	 */
	public function test_generate_preserves_schema_references_and_definitions() {
		$schema = array(
			'type'       => 'object',
			'properties' => array(
				'steps' => array(
					'type'  => 'array',
					'items' => array( '$ref' => '#/$defs/step' ),
				),
			),
			'required'   => array( 'steps' ),
			'$defs'      => array(
				'step' => array(
					'type'       => 'object',
					'properties' => array(
						'explanation' => array( 'type' => 'string' ),
					),
					'required'   => array( 'explanation' ),
				),
			),
		);
		$adaptor = $this->make_adaptor( new Fake_AI_Result( '{"steps":[]}' ) );

		$adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Make steps',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'create_steps',
						'parameters' => $schema,
					),
				),
				'function_call' => array( 'name' => 'create_steps' ),
			)
		);

		$normalized = $adaptor->builder->get_call_args( 'as_json_response' )[0];

		$this->assertSame( '#/$defs/step', $normalized['properties']['steps']['items']['$ref'] );
		$this->assertArrayHasKey( '$defs', $normalized );
		$this->assertSame( array( 'explanation' ), $normalized['$defs']['step']['required'] );
		$this->assertFalse( $normalized['$defs']['step']['additionalProperties'] );
	}

	/**
	 * Schema-valued additionalProperties is rejected by strict json_schema.
	 */
	public function test_generate_forces_additional_properties_false_for_objects() {
		$schema = array(
			'type'                 => 'object',
			'properties'           => array(
				'metadata' => array(
					'type'                 => 'object',
					'additionalProperties' => array( 'type' => 'string' ),
				),
			),
			'required'             => array( 'metadata' ),
			'additionalProperties' => array( 'type' => 'string' ),
		);
		$adaptor = $this->make_adaptor( new Fake_AI_Result( '{"metadata":{}}' ) );

		$adaptor->generate(
			array(
				'messages'      => array(
					array(
						'role'    => 'user',
						'content' => 'Make metadata',
					),
				),
				'functions'     => array(
					array(
						'name'       => 'create_metadata',
						'parameters' => $schema,
					),
				),
				'function_call' => array( 'name' => 'create_metadata' ),
			)
		);

		$normalized = $adaptor->builder->get_call_args( 'as_json_response' )[0];

		$this->assertFalse( $normalized['additionalProperties'] );
		$this->assertFalse( $normalized['properties']['metadata']['additionalProperties'] );
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
	 * Backend resolution is automatic: the WP path when available, the Otter
	 * OpenAI path otherwise.
	 */
	public function test_resolve_backend_prefers_wp_when_available() {
		$this->force_availability( true );
		$this->assertSame( AI_Client_Adaptor::BACKEND_WP, AI_Client_Adaptor::resolve_backend() );

		$this->force_availability( false );
		$this->assertSame( AI_Client_Adaptor::BACKEND_OTTER_OPENAI, AI_Client_Adaptor::resolve_backend() );
	}

	/**
	 * The resolved backend can be overridden through the filter.
	 */
	public function test_resolved_backend_can_be_overridden_by_filter() {
		$this->force_availability( true );

		add_filter(
			'otter_ai_backend',
			function () {
				return AI_Client_Adaptor::BACKEND_OTTER_OPENAI;
			}
		);

		$this->assertSame( AI_Client_Adaptor::BACKEND_OTTER_OPENAI, AI_Client_Adaptor::resolve_backend() );
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
		$this->force_availability( false );
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
		$this->force_availability( false );
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
	 * The model pinned by the fetched prompt templates can be overridden by
	 * filter; empty overrides keep the template model.
	 */
	public function test_otter_openai_filters_model() {
		$this->force_availability( false );
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );

		$captured_args = array();

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
											'content' => 'Model override response.',
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

		$template_model = null;
		add_filter(
			'otter_ai_otter_openai_model',
			function ( $model ) use ( &$template_model ) {
				$template_model = $model;
				return 'gpt-4o';
			}
		);

		$payload = array(
			'model'    => 'gpt-3.5-turbo',
			'messages' => array(
				array(
					'role'    => 'user',
					'content' => 'Hello',
				),
			),
		);

		$this->dispatch_generate( $payload );

		$sent_body = json_decode( $captured_args['body'], true );

		$this->assertSame( 'gpt-3.5-turbo', $template_model );
		$this->assertSame( 'gpt-4o', $sent_body['model'] );

		// An empty override keeps the template model.
		remove_all_filters( 'otter_ai_otter_openai_model' );
		add_filter( 'otter_ai_otter_openai_model', '__return_empty_string' );

		$this->dispatch_generate( $payload );

		$sent_body = json_decode( $captured_args['body'], true );

		$this->assertSame( 'gpt-3.5-turbo', $sent_body['model'] );
	}

	/**
	 * Without an API key the Otter OpenAI backend fails with an actionable
	 * error instead of sending a request with an empty bearer token.
	 */
	public function test_otter_openai_errors_without_api_key() {
		$http_called = false;

		add_filter(
			'pre_http_request',
			function ( $preempt ) use ( &$http_called ) {
				$http_called = true;
				return $preempt;
			}
		);

		$backend  = new Otter_OpenAI_Backend();
		$response = $backend->generate(
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
		$this->assertSame( 'no_api_key', $response->get_error_code() );
		$this->assertSame( 400, $response->get_error_data()['status'] );
		$this->assertSame( 'openai', $response->get_error_data()['type'] );
		$this->assertFalse( $http_called );
	}

	/**
	 * Empty OpenAI completions surface as an error instead of a successful
	 * generation with no content.
	 */
	public function test_otter_openai_errors_on_empty_content() {
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) {
				if ( Otter_OpenAI_Backend::BASE_URL === $url ) {
					return array(
						'headers'  => array(),
						'body'     => wp_json_encode( array( 'choices' => array() ) ),
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

		$backend  = new Otter_OpenAI_Backend();
		$response = $backend->generate(
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
		$this->assertSame( 'openai', $response->get_error_data()['type'] );
	}

	/**
	 * forward_prompt() rejects backend results that break the success envelope.
	 */
	public function test_forward_prompt_rejects_malformed_backend_result() {
		add_filter(
			'otter_ai_backends',
			function ( $backends ) {
				$backends['custom'] = new Fake_AI_Backend( true, array( 'unexpected' => 'shape' ) );
				return $backends;
			}
		);

		add_filter(
			'otter_ai_backend',
			function () {
				return 'custom';
			}
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

		$this->assertWPError( $response );
		$this->assertSame( 'invalid_backend_response', $response->get_error_code() );
		$this->assertSame( 502, $response->get_error_data()['status'] );

		// Malformed generations are not recorded as usage.
		$this->assertEmpty( get_option( 'themeisle_otter_ai_usage' ) );
	}

	/**
	 * forward_prompt() routes to the WP AI Client path and skips the OpenAI request.
	 */
	public function test_forward_prompt_uses_wp_backend() {
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
			$this->assertEmpty( get_option( 'themeisle_otter_ai_usage' ) );
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
		update_option( 'themeisle_open_ai_api_key', 'sk-test' );
		$this->force_availability( false );

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
