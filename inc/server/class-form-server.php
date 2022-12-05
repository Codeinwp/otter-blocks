<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use Exception;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Email;
use ThemeIsle\GutenbergBlocks\Integration\Form_Providers;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Integration\Mailchimp_Integration;
use ThemeIsle\GutenbergBlocks\Integration\Sendinblue_Integration;
use WP_Error;
use WP_HTTP_Response;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Class Form_Server
 *
 * @since 2.0.0
 */
class Form_Server {

	/**
	 * The main instance var.
	 *
	 * @var Form_Server
	 * @since 2.0.0
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Form_Server
	 * @since 2.0.0
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Form_Server
	 * @since 2.0.0
	 */
	public $version = 'v1';


	/**
	 * Initialize the class
	 *
	 * @since 2.0.0
	 */
	public function init() {
		/**
		 * Register the REST API endpoints.
		 */
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );

		/**
		 * Register email providers that can be used to send emails or subscribe to a service.
		 */
		$default_provider = array(
			'frontend' => array(
				'submit' => array( $this, 'send_default_email' ),
			),
			'editor'   => array(
				'listId'    => array( $this, 'get_integration_data' ),
				'testEmail' => array( $this, 'send_test_email' ),
			),
		);

		// Register 3rd party email providers.
		$sendinblue_provider = array(
			'frontend' => array(
				'submit' => array( $this, 'subscribe_to_service' ),
			),
			'editor'   => array(
				'listId'    => array( $this, 'get_integration_data' ),
				'testEmail' => array( $this, 'test_subscription_service' ),
			),
		);
		$mailchimp_provider  = array(
			'frontend' => array(
				'submit' => array( $this, 'subscribe_to_service' ),
			),
			'editor'   => array(
				'listId'    => array( $this, 'get_integration_data' ),
				'testEmail' => array( $this, 'test_subscription_service' ),
			),
		);

		do_action(
			'otter_register_form_providers',
			array(
				'default'    => $default_provider,
				'sendinblue' => $sendinblue_provider,
				'mailchimp'  => $mailchimp_provider,
			)
		);

		add_action( 'otter_form_before_submit', array( $this, 'before_submit' ) );
		add_action( 'otter_form_after_submit', array( $this, 'after_submit' ) );
		add_filter( 'otter_form_email_build_body', array( $this, 'build_email_content' ) );
		add_filter( 'otter_form_email_build_body_error', array( $this, 'build_email_error_content' ), 1, 2 );
	}

	/**
	 * Register REST API route
	 *
	 * @since 2.0.0
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;
		register_rest_route(
			$namespace,
			'/form/frontend',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'frontend' ),
					'permission_callback' => function ( $request ) {
						$nonces = $request->get_header_as_array( 'X-WP-Nonce' );
						if ( isset( $nonces ) ) {
							foreach ( $nonces as $nonce ) {
								if ( wp_verify_nonce( $nonce, 'wp_rest' ) ) {
									return __return_true();
								}
							}
						}
						return __return_false();
					},
				),
			)
		);
		register_rest_route(
			$namespace,
			'/form/editor',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'editor' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Get information from the provider services.
	 *
	 * @param WP_REST_Request $request The API request.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public function editor( $request ) {
		$data = new Form_Data_Request( json_decode( $request->get_body(), true ) );
		$res  = new Form_Data_Response();

		$form_options = Form_Settings_Data::get_form_setting_from_wordpress_options( $data->get_payload_field( 'formOption' ) );
		$data->set_form_options( $form_options );

		// Select the handler functions based on the provider.
		$provider = $form_options->get_provider();
		if ( $data->payload_has_field( 'provider' ) ) {
			$provider = $data->get_payload_field( 'provider' );
		}
		$provider_handlers = Form_Providers::$instance->get_provider_handlers( $provider, 'editor' );

		if ( $provider_handlers && Form_Providers::provider_has_handler( $provider_handlers, $data->get( 'handler' ) ) ) {
			// Send the data to the provider.
			return $provider_handlers[ $data->get( 'handler' ) ]( $data );
		} else {
			$res->set_error( __( 'The email service provider was not registered!', 'otter-blocks' ) );
		}

		return $res->build_response();
	}


	/**
	 * Handle the request from the form block
	 *
	 * @param WP_REST_Request $request Form request.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public function frontend( $request ) {
		$res       = new Form_Data_Response();
		$form_data = new Form_Data_Request( json_decode( $request->get_body(), true ) );

		try {

			// Check is the request is OK.
			$reasons = $this->check_form_conditions( $form_data );

			if ( 0 < count( $reasons ) ) {
				$res->set_error( __( 'Invalid request!', 'otter-blocks' ) );
				$res->set_reasons( $reasons );
				return $res->build_response();
			}

			// Verify the reCaptcha token.
			if ( $form_data->payload_has_field( 'token' ) ) {
				$result = $this->check_form_captcha( $form_data );
				if ( ! $result['success'] ) {
					$res->set_error( __( 'The reCaptcha was invalid!', 'otter-blocks' ) );
					return $res->build_response();
				}
			}


			$form_options = Form_Settings_Data::get_form_setting_from_wordpress_options( $form_data->get_payload_field( 'formOption' ) );
			$form_data->set_form_options( $form_options );

			do_action( 'otter_form_before_submit', $form_data );
			// Select the submit function based on the provider.
			$provider_handlers = apply_filters( 'otter_select_form_provider', $form_data );

			if ( $provider_handlers && Form_Providers::provider_has_handler( $provider_handlers, $form_data->get( 'handler' ) ) ) {

				// Send the data to the provider handler.
				$provider_response = $provider_handlers[ $form_data->get( 'handler' ) ]( $form_data );

				do_action( 'otter_form_after_submit', $form_data );

				return $provider_response;
			} else {
				$res->set_error( __( 'The email service provider was not registered!', 'otter-blocks' ) );
			}

			do_action( 'otter_form_after_submit', $form_data );
		} catch ( Exception $e ) {
			$res->set_error( $e->getMessage() );
			$this->send_error_email( $e->getMessage(), $form_data );
		}

		return $res->build_response();
	}


	/**
	 * Send Email using SMTP.
	 *
	 * @param Form_Data_Request $form_data Data from request body.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public function send_default_email( $form_data ) {
		$res = new Form_Data_Response();

		try {
			$form_options  = $form_data->get_form_options();
			$email_subject = isset( $form_options ) && $form_options->has_email_subject() ? $form_options->get_email_subject() : ( __( 'A new form submission on ', 'otter-blocks' ) . get_bloginfo( 'name' ) );

			$email_message = Form_Email::instance()->build_email( $form_data );
			$email_body    = apply_filters( 'otter_form_email_build_body', $email_message );

			// Sent the form date to the admin site as a default behaviour.
			$to = sanitize_email( get_site_option( 'admin_email' ) );

			// Check if we need to send it to another user email.
			if ( $form_data->payload_has_field( 'formOption' ) ) {
				$option_name = $form_data->get_payload_field( 'formOption' );
				$form_emails = get_option( 'themeisle_blocks_form_emails' );

				foreach ( $form_emails as $form ) {
					if ( isset( $form['form'] ) && $form['form'] === $option_name && isset( $form['email'] ) && '' !== $form['email'] ) {
						$to = sanitize_email( $form['email'] );
					}
				}
			}

			$headers = array( 'Content-Type: text/html', 'From: ' . ( $form_options->has_from_name() ? sanitize_text_field( $form_options->get_from_name() ) : get_bloginfo( 'name', 'display' ) ) . ' <' . $to . '>' );

			if ( ! empty( $form_options->get_cc() ) ) {
				$arr = explode( ',', $form_options->get_cc() );

				foreach ( $arr as $cc ) {
					$headers[] = 'Cc: ' . trim( $cc );
				}
			}

			if ( ! empty( $form_options->get_bcc() ) ) {
				$arr = explode( ',', $form_options->get_bcc() );

				foreach ( $arr as $cc ) {
					$headers[] = 'Bcc: ' . trim( $cc );
				}
			}

			// phpcs:ignore
			$res->set_success( wp_mail( $to, $email_subject, $email_body, $headers ) );
			if ( ! $res->is_success() ) {
				$res->set_error( __( 'Email could not be send.', 'otter-blocks' ) );
			}
		} catch ( Exception  $e ) {
			$res->set_error( $e->getMessage() );
			$this->send_error_email( $e->getMessage(), $form_data );
		} finally {
			$form_options = $form_data->get_form_options();
			$res->add_values( $form_options->get_submit_data() );
			return $res->build_response();
		}
	}

	/**
	 * Make additional changes before using the main handler function for submitting.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @since 2.0.3
	 */
	public function before_submit( $form_data ) {

		// If there is no consent, change the service to send only an email.
		if (
			'submit-subscribe' === $form_data->get_form_options()->get_action() &&
			(
				! $form_data->payload_has_field( 'consent' ) ||
				! $form_data->get_payload_field( 'consent' )
			)
		) {
			$form_data->change_provider( 'default' );
		}
	}

	/**
	 * Process the extra actions after calling the main handler function for submitting.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @return void
	 * @since 2.0.3
	 */
	public function after_submit( $form_data ) {

		// Send also an email to the form editor/owner with the data alongside the subscription.
		if (
			'submit-subscribe' === $form_data->get_form_options()->get_action() &&
			$form_data->get_form_options()->has_provider() &&
			'default' !== $form_data->get_form_options()->get_provider()
		) {
			$this->send_default_email( $form_data );
		}
	}

	/**
	 * Send an email about error, like: the integration api key is no longer valid.
	 *
	 * @param string            $error The error message.
	 * @param Form_Data_Request $form_data The form request data.
	 * @return void
	 * @since 2.0.3
	 */
	public static function send_error_email( $error, $form_data ) {
		$email_subject = ( __( 'An error with the Form blocks has occurred on  ', 'otter-blocks' ) . get_bloginfo( 'name' ) );
		$email_message = Form_Email::instance()->build_error_email( $error, $form_data );
		$email_body    = apply_filters( 'otter_form_email_build_body_error', $error, $email_message );
		// Sent the form date to the admin site as a default behaviour.
		$to      = sanitize_email( get_site_option( 'admin_email' ) );
		$headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . esc_url( get_site_url() ) );
        // phpcs:ignore
        wp_mail( $to, $email_subject, $email_body, $headers );
	}

	/**
	 * Send a test email.
	 *
	 * @param Form_Data_Request $form_data The test request.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public static function send_test_email( $form_data ) {
		$res = new Form_Data_Response();
		try {
			$email_subject = ( __( 'Test email for Otter Form from ', 'otter-blocks' ) . get_bloginfo( 'name', 'display' ) );
			$email_body    = Form_Email::instance()->build_test_email( $form_data );
			// Sent the form date to the admin site as a default behaviour.
			$to = sanitize_email( get_site_option( 'admin_email' ) );
			if ( $form_data->payload_has_field( 'to' ) && '' !== $form_data->get_payload_field( 'to' ) ) {
				$to = $form_data->get_payload_field( 'to' );
			}
			$headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . get_bloginfo( 'name', 'display' ) . '<' . $to . '>' );
			// phpcs:ignore
			$res->set_success( wp_mail( $to, $email_subject, $email_body, $headers ) );
		} catch ( Exception  $e ) {
			$res->set_error( $e->getMessage() );
		} finally {
			return $res->build_response();
		}
	}



	/**
	 * Get data from the given provider
	 *
	 * @param Form_Data_Request $form_data Search request.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public function get_integration_data( $form_data ) {
		$res = new Form_Data_Response();

		try {
			$service = null;
			switch ( $form_data->get_payload_field( 'provider' ) ) {
				case 'mailchimp':
					$service = new Mailchimp_Integration();
					break;
				case 'sendinblue':
					$service = new Sendinblue_Integration();
					break;
				default:
					$res->set_error( __( 'Invalid request! Provider is missing.', 'otter-blocks' ) );
			}

			if ( isset( $service ) ) {
				$valid_api_key = $service::validate_api_key( $form_data->get_payload_field( 'apiKey' ) );
				if ( $valid_api_key['valid'] ) {
					$service->set_api_key( $form_data->get_payload_field( 'apiKey' ) );
					$res->set_response( $service->get_information_from_provider( $form_data ) );
				} else {
					$res->set_error( $valid_api_key['reason'] );
				}
			}
		} catch ( Exception $e ) {
			$res->set_error( $e->getMessage() );
		} finally {
			return $res->build_response();
		}
	}

	/**
	 * Test the subscription service.
	 *
	 * @param Form_Data_Request $form_data The test request.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public function test_subscription_service( $form_data ) {
		$res          = new Form_Data_Response();
		$form_options = Form_Settings_Data::get_form_setting_from_wordpress_options( $form_data->get_payload_field( 'formOption' ) );

		try {
			$service = null;
			switch ( $form_options->get_provider() ) {
				case 'mailchimp':
					$service = new Mailchimp_Integration();
					break;
				case 'sendinblue':
					$service = new Sendinblue_Integration();
					break;
				default:
					$res->set_error( __( 'Invalid request! Provider is missing.', 'otter-blocks' ) );
			}

			if ( isset( $service ) ) {
				$valid_api_key = $service::validate_api_key( $form_options->get_api_key() );
				if ( $valid_api_key['valid'] ) {
					if ( $form_options->has_list_id() ) {
						$service->set_api_key( $form_options->get_api_key() )->set_list_id( $form_options->get_list_id() );
						$res = $service->test_subscription();
					} else {
						$res->set_error( __( 'Contact list ID is missing!', 'otter-blocks' ) );
					}
				} else {
					$res->set_error( $valid_api_key['reason'] );
				}
			}
		} catch ( Exception $e ) {
			$res->set_error( $e->getMessage() );
		} finally {
			return $res->build_response();
		}
	}

	/**
	 * Subscribe the user to a service.
	 *
	 * @param Form_Data_Request $form_data The form data.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public function subscribe_to_service( $form_data ) {
		$res = new Form_Data_Response();

		try {

			// Get the first email from form.
			$email = $this->get_email_from_form_input( $form_data );

			if ( '' === $email ) {
				self::send_error_email( __( 'Marketing Integration is active, but there is no Email field in the form. Please check your Form block settings in the page.', 'otter-blocks' ), $form_data );
				$res->mark_as_success();
				return $res->build_response();
			}

			if (
				'submit-subscribe' === $form_data->get_form_options()->get_action() &&
				$form_data->payload_has_field( 'consent' ) &&
				! $form_data->get_payload_field( 'consent' )
			) {
				$res->mark_as_success();
				return $res->build_response();
			}

			// Get the api credentials from the Form block.
			$wp_options_form = $form_data->get_form_options();

			$issues = $wp_options_form->check_data();

			if (
				count( $issues ) == 0
			) {
				$service = null;
				switch ( $wp_options_form->get_provider() ) {
					case 'mailchimp':
						$service = ( new Mailchimp_Integration() )->extract_data_from_integration( $wp_options_form );
						break;
					case 'sendinblue':
						$service = ( new Sendinblue_Integration() )->extract_data_from_integration( $wp_options_form );
						break;
				}

				$valid_api_key = $service::validate_api_key( $wp_options_form->get_api_key() );

				if ( $valid_api_key['valid'] ) {
					$res->copy( $service->subscribe( $email ) );

					// Add additional data like: redirect link when the request is successful.
					$res->add_values( $wp_options_form->get_submit_data() );
				} else {
					$res->set_error( $valid_api_key['reason'] );
				}
			} else {
				$res->set_reasons( $issues );
			}
		} catch ( Exception $e ) {
			$res->set_error( __( 'Server error!', 'otter-blocks' ) );
			$this->send_error_email( $e->getMessage(), $form_data );
		} finally {
			// Handle the case when the credential are no longer valid.
			if ( $res->is_credential_error() ) {
				self::send_error_email( 'error', $form_data );
			}
			return $res->build_response();
		}
	}

	/**
	 * Check for required data.
	 *
	 * @param Form_Data_Request $data Data from the request.
	 *
	 * @return boolean
	 * @since 2.0.0
	 */
	public function has_required_data( $data ) {
		$main_fields_set = $data->are_fields_set(
			array(
				'handler',
				'payload',
			)
		);

		$required_payload_fields = $data->are_payload_fields_set(
			array(
				'nonceValue',
				'postUrl',
				'formId',
				'formOption',
			)
		);

		$is_nonce_valid = wp_verify_nonce( $data->get_payload_field( 'nonceValue' ), 'form-verification' );

		return $main_fields_set && $required_payload_fields && $is_nonce_valid;
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param Form_Data_Request $form_data Data from the request.
	 *
	 * @return array
	 * @since 2.0.0
	 */
	public function check_form_conditions( $form_data ) {

		$reasons = array();
		try {
			if ( ! $this->has_required_data( $form_data ) ) {
				$reasons += array( __( 'Essential data is missing!', 'otter-blocks' ) );
				return $reasons;
			}

			$form_options = $form_data->get_form_options();

			if (
				$form_options->form_has_captcha() &&
				(
					! $form_data->payload_has_field( 'token' ) ||
					'' === $form_data->get_payload_field( 'token' )
				)
			) {
				$reasons += array(
					__( 'Token is missing!', 'otter-blocks' ),
				);
			}
		} catch ( Exception $e ) {
			$reasons[] = $e->getMessage();
		} finally {
			return $reasons;
		}
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param Form_Data_Request $form_data Data from the request.
	 *
	 * @return array
	 * @since 2.0.0
	 */
	public function check_form_captcha( $form_data ) {
		$secret = get_option( 'themeisle_google_captcha_api_secret_key' );
		$resp   = wp_remote_post(
			'https://www.google.com/recaptcha/api/siteverify',
			array(
				'body'    => 'secret=' . $secret . '&response=' . $form_data->get_payload_field( 'token' ),
				'headers' => [
					'Content-Type' => 'application/x-www-form-urlencoded',
				],
			)
		);
		return json_decode( $resp['body'], true );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Form_Server
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Filter for the content of the email.
	 *
	 * @param string $content The content.
	 * @return string
	 * @since 2.0.3
	 */
	public function build_email_content( $content ) {
		return $content;
	}

	/**
	 * Filter for the content of the email for errors.
	 *
	 * @param string $error The error message.
	 * @param string $content The content.
	 * @return string
	 * @sincee 2.0.3
	 */
	public function build_email_error_content( $error, $content ) {
		return $content;
	}

	/**
	 * Get the first email from the input's form.
	 *
	 * @param Form_Data_Request $data The form data.
	 * @return mixed|string
	 * @since 2.0.3
	 */
	private function get_email_from_form_input( Form_Data_Request $data ) {
		$inputs = $data->get_payload_field( 'formInputsData' );
		if ( is_array( $inputs ) ) {
			foreach ( $data->get_payload_field( 'formInputsData' ) as $input_field ) {
				if ( 'email' == $input_field['type'] ) {
					return $input_field['value'];
				}
			}
		}
		return '';
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @return void
	 * @since 2.0.0
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @return void
	 * @since 2.0.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
