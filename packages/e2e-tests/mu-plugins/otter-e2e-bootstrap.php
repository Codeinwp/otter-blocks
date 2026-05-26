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
	'otter_iphub_api_key',
	'themeisle_blocks_settings_onboarding',
);

/**
 * Transient that inc/server/class-prompt-server.php reads first; if it's set we never hit themeisle.com.
 */
const PROMPTS_TRANSIENT = 'otter_prompts';

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
					delete_transient( PROMPTS_TRANSIENT );
					delete_transient( 'otter_prompts_timeout' );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);
	}
);
