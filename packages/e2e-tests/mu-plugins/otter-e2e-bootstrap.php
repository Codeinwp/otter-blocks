<?php
/**
 * Plugin Name: Otter E2E Bootstrap
 * Description: Test-only MU-plugin that exposes REST endpoints for Playwright fixtures to bootstrap complex state (Pro license stub, option overrides). Mounted by wp-env in the `tests` env via .wp-env.override.json.
 * Author: ThemeIsle (E2E)
 *
 * Precedence note: if a real `license.json` is present at the plugin root, `development.php`
 * will overwrite the stub option on `init` via the real themeisle_sdk_license_process_otter chain.
 * That is expected behavior — the stub is only meaningful on machines without a real license.
 *
 * @package otter-blocks
 */

namespace ThemeIsle\OtterE2E;

// Defence-in-depth: refuse to register routes in production, even if the file is mismounted.
if ( defined( 'WP_ENVIRONMENT_TYPE' ) && 'production' === constant( 'WP_ENVIRONMENT_TYPE' ) ) {
	return;
}

const REST_NAMESPACE = 'otter-e2e/v1';

const PRO_LICENSE_OPTION = 'otter_pro_license_data';

/**
 * Keys the /options endpoint may set. Extend this list when a test needs to flip a new option.
 *
 * @var string[]
 */
const OPTION_WHITELIST = array(
	'themeisle_open_ai_api_key',
	'themeisle_blocks_settings_prompt_actions',
	'themeisle_blocks_settings_ai_toolbar_actions',
	'themeisle_blocks_ai_toolbar_actions_migrated',
	'themeisle_blocks_settings_block_ai_toolbar_module',
	'otter_iphub_api_key',
	'themeisle_blocks_settings_onboarding',
);

/**
 * Transient that inc/server/class-prompt-server.php reads first; if it's set we never hit themeisle.com.
 */
const PROMPTS_TRANSIENT = 'otter_prompts';

/**
 * OpenAI chat completions endpoint used by inc/server/class-prompt-server.php.
 */
const OPENAI_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Prefix shared by bin/e2e-tests.sh and Playwright fixtures for the fake OpenAI key.
 * Real keys are never stubbed; dashboard tests can still assert validation errors for keys like "test".
 */
const OPENAI_STUB_KEY_PREFIX = 'sk_XXXXXXXXX';

/**
 * Minimal prompt seeds matching the PromptData shape consumed by src/blocks/components/prompt/index.tsx.
 * Covers the three promptIDs used by the content-generator block: form, textTransformation, patternsPicker.
 *
 * @return array<int, array<string, mixed>>
 */
function stub_prompts() {
	return array(
		array(
			'otter_name'          => 'textTransformation',
			'model'               => 'gpt-3.5-turbo',
			'messages'            => array(
				array( 'role' => 'system', 'content' => 'You are a content writer.' ),
				array( 'role' => 'user', 'content' => '{ACTION}: {INSERT_TASK}' ),
			),
			'otter_action_prompt' => 'Transform the following content',
		),
		array(
			'otter_name' => 'form',
			'model'      => 'gpt-3.5-turbo',
			'messages'   => array(
				array( 'role' => 'system', 'content' => 'You generate web form schemas.' ),
				array( 'role' => 'user', 'content' => '{INSERT_TASK}' ),
			),
		),
		array(
			'otter_name'      => 'patternsPicker',
			'model'           => 'gpt-3.5-turbo',
			'messages'        => array(
				array( 'role' => 'system', 'content' => 'You suggest block patterns.' ),
				array( 'role' => 'user', 'content' => '{INSERT_TASK}' ),
			),
			'otter_pro_addon' => array(),
		),
	);
}

/**
 * Build the stub license object. Shape matches what plugins/otter-pro/inc/plugins/class-license.php reads:
 *  - has_active_license() checks ->license not in invalid statuses.
 *  - get_license_type() reads ->price_id (2 → business tier).
 *  - get_license_expiration_date() parses ->expires.
 *
 * @return \stdClass
 */
function stub_license_data() {
	return (object) array(
		'license'  => 'valid',
		'expires'  => '2099-12-31 23:59:59',
		'price_id' => 2,
		'key'      => 'e2e-stub',
	);
}

/**
 * Standard permission callback: limit to admins. The mu-plugin is only mounted in the tests env,
 * so this is a second line of defence rather than the primary gate.
 *
 * @return bool
 */
function require_admin() {
	return current_user_can( 'manage_options' );
}

/**
 * wp-env has no MTA; real wp_mail() returns false and form submissions surface code 106 in E2E.
 *
 * @param null|bool $short_circuit Value from a previous filter.
 * @return bool|null
 */
function stub_wp_mail_for_e2e( $short_circuit ) {
	if ( null !== $short_circuit ) {
		return $short_circuit;
	}

	return true;
}

/**
 * Whether the stored OpenAI key is the E2E stub (not a real secret).
 *
 * @param string $api_key OpenAI API key option value.
 * @return bool
 */
function is_e2e_openai_stub_key( $api_key ) {
	return is_string( $api_key ) && 0 === strpos( $api_key, OPENAI_STUB_KEY_PREFIX );
}

/**
 * HTML content returned for content-generator block E2E tests.
 *
 * @return string
 */
function stub_openai_space_nation_content() {
	return '<h1><strong>Discover the Next Frontier: Space Nation on the Rise</strong></h1>'
		. '<p>Are you ready to embark on a journey to a new world beyond our wildest dreams? Look no further than the rapidly emerging Space Nation that is captivating the imaginations of millions. From groundbreaking technologies to bold explorations, this cosmic civilization is redefining what it means to reach for the stars.</p>'
		. '<h2><em>Unveiling the Wonders of Space Nation</em></h2>'
		. '<p>Peer into the future and witness the awe-inspiring advancements taking place in this celestial realm. With each innovation, Space Nation pushes the boundaries of possibility, offering a glimpse into a future where the impossible becomes reality.</p>'
		. '<h2><em>Join the Movement</em></h2>'
		. '<p>Don\'t miss your chance to be part of history in the making. Whether you are an aspiring pioneer or a curious observer, there is a place for you in the unfolding saga of Space Nation. Embrace the spirit of exploration and venture into a realm where the skies are no longer the limit.</p>'
		. '<h3><strong>Why Space Nation?</strong></h3>'
		. '<ul><li>Experience groundbreaking technologies shaping the future</li><li>Witness bold explorations into the unknown</li><li>Join a community of visionaries and trailblazers</li></ul>'
		. '<h3><strong>Take Action Today</strong></h3>'
		. '<p>Ready to embark on an adventure that transcends the confines of Earth? Step into the world of Space Nation and dare to dream beyond the stars.</p>';
}

/**
 * Pick stub completion content based on the outbound OpenAI request body.
 *
 * @param string $request_body JSON-encoded chat completion request.
 * @return string
 */
function stub_openai_completion_content( $request_body ) {
	$payload = json_decode( $request_body, true );

	if ( is_array( $payload ) && isset( $payload['messages'] ) && is_array( $payload['messages'] ) ) {
		foreach ( $payload['messages'] as $message ) {
			if ( ! is_array( $message ) || empty( $message['content'] ) ) {
				continue;
			}

			if ( false !== stripos( $message['content'], 'space nation' ) ) {
				return stub_openai_space_nation_content();
			}
		}
	}

	return '<p>Rewritten content for testing.</p>';
}

/**
 * Build a wp_remote_* response array for a stubbed OpenAI completion.
 *
 * @param string $content Assistant message content.
 * @return array<string, mixed>
 */
function stub_openai_http_response( $content ) {
	return array(
		'headers'  => array(),
		'body'     => wp_json_encode(
			array(
				'id'                 => 'chatcmpl-e2e-stub',
				'object'             => 'chat.completion',
				'created'            => 1721829943,
				'model'              => 'gpt-3.5-turbo-0125',
				'choices'            => array(
					array(
						'index'         => 0,
						'message'       => array(
							'role'    => 'assistant',
							'content' => $content,
						),
						'logprobs'      => null,
						'finish_reason' => 'stop',
					),
				),
				'usage'              => array(
					'prompt_tokens'     => 20,
					'completion_tokens' => 10,
					'total_tokens'      => 30,
				),
				'system_fingerprint' => null,
			)
		),
		'response' => array(
			'code'    => 200,
			'message' => 'OK',
		),
		'cookies'  => array(),
		'filename' => null,
	);
}

/**
 * Short-circuit OpenAI HTTP calls when the E2E stub API key is configured.
 *
 * @param false|array|WP_Error $preempt     A preemptive return value.
 * @param array                $parsed_args Request arguments.
 * @param string               $url         Request URL.
 * @return false|array|WP_Error
 */
function stub_openai_http_for_e2e( $preempt, $parsed_args, $url ) {
	if ( false !== $preempt || OPENAI_COMPLETIONS_URL !== $url ) {
		return $preempt;
	}

	$api_key = get_option( 'themeisle_open_ai_api_key' );

	if ( ! is_e2e_openai_stub_key( $api_key ) ) {
		return $preempt;
	}

	$request_body = isset( $parsed_args['body'] ) ? $parsed_args['body'] : '';
	$content      = stub_openai_completion_content( $request_body );

	return stub_openai_http_response( $content );
}

add_filter( 'pre_wp_mail', __NAMESPACE__ . '\\stub_wp_mail_for_e2e' );
add_filter( 'pre_http_request', __NAMESPACE__ . '\\stub_openai_http_for_e2e', 10, 3 );

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			REST_NAMESPACE,
			'/pro/activate',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					update_option( PRO_LICENSE_OPTION, stub_license_data() );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/pro/deactivate',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					delete_option( PRO_LICENSE_OPTION );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/options',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$body = $request->get_json_params();
					if ( ! is_array( $body ) || empty( $body ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_body',
							'Body must be a non-empty JSON object.',
							array( 'status' => 400 )
						);
					}

					$rejected = array();
					$applied  = array();
					foreach ( $body as $key => $value ) {
						if ( ! in_array( $key, OPTION_WHITELIST, true ) ) {
							$rejected[] = $key;
							continue;
						}
						update_option( $key, $value );
						$applied[] = $key;
					}

					if ( ! empty( $rejected ) ) {
						return new \WP_Error(
							'otter_e2e_option_not_whitelisted',
							'Some option keys are not in the whitelist.',
							array(
								'status'   => 400,
								'rejected' => $rejected,
								'allowed'  => OPTION_WHITELIST,
							)
						);
					}

					return rest_ensure_response(
						array(
							'ok'      => true,
							'applied' => $applied,
						)
					);
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/prompts/seed',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					set_transient( PROMPTS_TRANSIENT, stub_prompts(), WEEK_IN_SECONDS );
					// Clear any throttle/timeout cooldown set by a previous failed fetch.
					delete_transient( 'otter_prompts_timeout' );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/reset',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					delete_option( PRO_LICENSE_OPTION );
					foreach ( OPTION_WHITELIST as $key ) {
						delete_option( $key );
					}
					delete_option( 'themeisle_blocks_settings_ai_toolbar_actions' );
					delete_option( 'themeisle_blocks_ai_toolbar_actions_migrated' );
					delete_transient( PROMPTS_TRANSIENT );
					delete_transient( 'otter_prompts_timeout' );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);
	}
);
