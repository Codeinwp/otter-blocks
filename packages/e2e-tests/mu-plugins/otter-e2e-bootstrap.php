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
 * Mail scenario state: 'ok' (default, pretend-send) or 'fail' (every wp_mail fails).
 */
const MAIL_MODE_OPTION = 'otter_e2e_mail_mode';

/**
 * Every wp_mail attempt is appended here as array{to, subject} so specs can assert
 * which emails (owner notification, admin alert) were attempted and in what order.
 */
const MAIL_LOG_OPTION = 'otter_e2e_mail_log';

/**
 * Captcha provider scenario: 'down' (transport error), 'invalid' (token rejected),
 * 'valid' (token accepted). Unset → requests pass through.
 */
const CAPTCHA_MODE_OPTION = 'otter_e2e_captcha_mode';

/**
 * Form record post type, mirrored from \ThemeIsle\GutenbergBlocks\Plugins\Form_Submissions.
 */
const FORM_RECORD_TYPE = 'otter_form_record';

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
 * Every attempt is logged to MAIL_LOG_OPTION, and the 'fail' mail mode makes wp_mail()
 * fail so specs can exercise the save-before-deliver retention pipeline.
 *
 * @param null|bool            $short_circuit Value from a previous filter.
 * @param array<string, mixed> $atts The wp_mail() arguments.
 * @return bool|null
 */
function stub_wp_mail_for_e2e( $short_circuit, $atts = array() ) {
	$log   = get_option( MAIL_LOG_OPTION, array() );
	$log   = is_array( $log ) ? $log : array();
	$log[] = array(
		'to'      => isset( $atts['to'] ) ? $atts['to'] : '',
		'subject' => isset( $atts['subject'] ) ? $atts['subject'] : '',
	);
	update_option( MAIL_LOG_OPTION, $log, false );

	if ( null !== $short_circuit ) {
		return $short_circuit;
	}

	return 'fail' !== get_option( MAIL_MODE_OPTION, 'ok' );
}

add_filter( 'pre_wp_mail', __NAMESPACE__ . '\\stub_wp_mail_for_e2e', 10, 2 );

/**
 * Mock the reCAPTCHA verification endpoint per the captcha scenario mode, so specs can
 * exercise the provider-failure (infrastructure failure) and invalid-token paths without
 * reaching Google.
 *
 * @param false|array<string, mixed>|\WP_Error $preempt Whether to short-circuit the request.
 * @param array<string, mixed>                 $args Request args.
 * @param string                               $url Request URL.
 * @return false|array<string, mixed>|\WP_Error
 */
function mock_captcha_provider( $preempt, $args, $url ) {
	if ( false === strpos( $url, 'recaptcha/api/siteverify' ) ) {
		return $preempt;
	}

	$mode = get_option( CAPTCHA_MODE_OPTION, '' );

	if ( 'down' === $mode ) {
		return new \WP_Error( 'http_request_failed', 'E2E: captcha provider unreachable.' );
	}

	if ( 'invalid' === $mode || 'valid' === $mode ) {
		return array(
			'response' => array(
				'code'    => 200,
				'message' => 'OK',
			),
			'headers'  => array(),
			'body'     => wp_json_encode( array( 'success' => 'valid' === $mode ) ),
		);
	}

	return $preempt;
}

add_filter( 'pre_http_request', __NAMESPACE__ . '\\mock_captcha_provider', 10, 3 );

/**
 * List the stored form Submission Records with their Delivery Status meta.
 *
 * @return array<int, array<string, mixed>>
 */
function get_form_records() {
	$posts = get_posts(
		array(
			'post_type'   => FORM_RECORD_TYPE,
			'post_status' => array( 'draft', 'unread', 'read', 'trash' ),
			'numberposts' => -1,
			'orderby'     => 'ID',
			'order'       => 'ASC',
		)
	);

	return array_map(
		function ( $post ) {
			$meta = get_post_meta( $post->ID, 'otter_form_record_meta', true );

			return array(
				'id'              => $post->ID,
				'title'           => $post->post_title,
				'status'          => $post->post_status,
				'form'            => isset( $meta['form']['value'] ) ? $meta['form']['value'] : null,
				'inputs'          => isset( $meta['inputs'] ) ? array_values(
					array_map(
						function ( $input ) {
							return array(
								'label' => isset( $input['label'] ) ? $input['label'] : '',
								'value' => isset( $input['value'] ) ? $input['value'] : '',
							);
						},
						$meta['inputs']
					)
				) : array(),
				'delivery_status' => get_post_meta( $post->ID, 'otter_form_record_delivery_status', true ),
				'delivery_errors' => get_post_meta( $post->ID, 'otter_form_record_delivery_errors', true ),
			);
		},
		$posts
	);
}

/**
 * Delete all stored form Submission Records and the alert-throttle transients tied to them.
 *
 * @return int Number of deleted records.
 */
function cleanup_form_records() {
	$posts = get_posts(
		array(
			'post_type'   => FORM_RECORD_TYPE,
			// 'any' skips statuses flagged exclude_from_search (e.g. draft), so list them.
			'post_status' => array( 'draft', 'unread', 'read', 'trash', 'publish' ),
			'numberposts' => -1,
			'fields'      => 'ids',
		)
	);

	foreach ( $posts as $post_id ) {
		wp_delete_post( $post_id, true );
	}

	return count( $posts );
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
			'/mail',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$mode = $request->get_param( 'mode' );

					if ( ! in_array( $mode, array( 'ok', 'fail' ), true ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_mail_mode',
							'Mail mode must be "ok" or "fail".',
							array( 'status' => 400 )
						);
					}

					update_option( MAIL_MODE_OPTION, $mode, false );
					update_option( MAIL_LOG_OPTION, array(), false );

					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/mail/log',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( get_option( MAIL_LOG_OPTION, array() ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/captcha',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$mode = $request->get_param( 'mode' );

					if ( ! in_array( $mode, array( 'down', 'invalid', 'valid', 'off' ), true ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_captcha_mode',
							'Captcha mode must be "down", "invalid", "valid" or "off".',
							array( 'status' => 400 )
						);
					}

					if ( 'off' === $mode ) {
						delete_option( CAPTCHA_MODE_OPTION );
					} else {
						update_option( CAPTCHA_MODE_OPTION, $mode, false );
					}

					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/options',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$body = $request->get_json_params();

					if ( ! is_array( $body ) || empty( $body['form'] ) || ! is_string( $body['form'] ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_form_option',
							'Body must be a JSON object with a "form" key.',
							array( 'status' => 400 )
						);
					}

					$options = get_option( 'themeisle_blocks_form_emails', array() );
					$options = is_array( $options ) ? $options : array();
					$index   = null;

					foreach ( $options as $i => $entry ) {
						if ( isset( $entry['form'] ) && $entry['form'] === $body['form'] ) {
							$index = $i;
							break;
						}
					}

					$entry = null !== $index ? $options[ $index ] : array();

					// Merge the payload; a null value removes the key (used to simulate legacy entries).
					foreach ( $body as $key => $value ) {
						if ( null === $value ) {
							unset( $entry[ $key ] );
						} else {
							$entry[ $key ] = $value;
						}
					}

					if ( null !== $index ) {
						$options[ $index ] = $entry;
					} else {
						$options[] = $entry;
					}

					update_option( 'themeisle_blocks_form_emails', $options );

					return rest_ensure_response(
						array(
							'ok'    => true,
							'entry' => $entry,
						)
					);
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/nonce',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( array( 'nonce' => wp_create_nonce( 'form-verification' ) ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/records',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( get_form_records() );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/records/cleanup',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( array( 'deleted' => cleanup_form_records() ) );
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
					delete_option( MAIL_MODE_OPTION );
					delete_option( MAIL_LOG_OPTION );
					delete_option( CAPTCHA_MODE_OPTION );
					cleanup_form_records();
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);
	}
);
