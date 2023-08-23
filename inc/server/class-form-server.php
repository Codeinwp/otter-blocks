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
use ThemeIsle\GutenbergBlocks\Integration\Form_Field_Option_Data;
use ThemeIsle\GutenbergBlocks\Integration\Form_Providers;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Integration\Form_Utils;
use ThemeIsle\GutenbergBlocks\Integration\Mailchimp_Integration;
use ThemeIsle\GutenbergBlocks\Integration\Sendinblue_Integration;
use ThemeIsle\GutenbergBlocks\Pro;
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
	 * @var Form_Server|null
	 * @since 2.0.0
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var string
	 * @since 2.0.0
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var string
	 * @since 2.0.0
	 */
	public $version = 'v1';

	/**
	 * Anti Spam timeout
	 */
	const ANTI_SPAM_TIMEOUT = 5000; // 5 seconds

	/**
	 * Autoresponder Email Error Expiration Time
	 */
	const AUTO_RESPONDER_ERROR_EXPIRATION_TIME = WEEK_IN_SECONDS;

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

		/**
		 * Register utility filters for form data validation.
		 */
		add_filter( 'otter_form_validate_form', array( $this, 'check_form_conditions' ) );
		add_filter( 'otter_form_validate_form', array( $this, 'check_form_files' ) );

		/**
		 * Register utility filters for bot detection (e.g.: captcha, honeypot methods).
		 */
		add_filter( 'otter_form_anti_spam_validation', array( $this, 'anti_spam_validation' ) );
		add_filter( 'otter_form_anti_spam_validation', array( $this, 'check_form_captcha' ) );

		/**
		 * Register utility filters for form data preparation (e.g.: uploading files, database queries).
		 */
		add_filter( 'otter_form_data_preparation', array( $this, 'change_provider_based_on_consent' ) );

		/**
		 * Register utility filters for email content building.
		 */
		add_filter( 'otter_form_email_build_body', array( $this, 'build_email_content' ) );
		add_filter( 'otter_form_email_build_body_error', array( $this, 'build_email_error_content' ), 1 );

		/**
		 * Register utility actions that triggers after the main submit action. Actions that clean the data, generated files or auxiliary actions.
		 */
		add_action( 'otter_form_after_submit', array( $this, 'after_submit' ) );
		add_action( 'otter_form_after_submit', array( $this, 'send_error_email_to_admin' ), 999 );
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
	 * @throws \Exception Error.
	 * @since 2.0.3
	 */
	public function frontend( $request ) {
		$res       = new Form_Data_Response();
		$form_data = new Form_Data_Request( $request );

		try {

			// Validate the form data.
			$form_data = apply_filters( 'otter_form_data_validation', $form_data );

			$form_options = Form_Settings_Data::get_form_setting_from_wordpress_options( $form_data->get_payload_field( 'formOption' ) );
			$form_data->set_form_options( $form_options );
			$form_data = $this->pull_fields_options_for_form( $form_data );

			// Check bot validation.
			$form_data = apply_filters( 'otter_form_anti_spam_validation', $form_data );

			// Prepare the form data.
			$form_data = apply_filters( 'otter_form_data_preparation', $form_data );

			// Check if $form_data has function get_error_code. Otherwise, it will throw an error.
			if ( ! ( $form_data instanceof Form_Data_Request ) ) {
				$res->set_code( Form_Data_Response::ERROR_RUNTIME_ERROR );
				$res->add_reason( __( 'The form data class is not valid after performing provider actions! Some hook is corrupting the data.', 'otter-blocks' ) );
			}

			if ( $res->has_error() || $form_data->has_error() ) {
				$res->set_code( $form_data->get_error_code() );
			} else {

				if ( ! empty( $form_options->get_redirect_link() ) ) {
					$res->add_response_field( 'redirectLink', $form_options->get_redirect_link() );
				}

				// Select the submit function based on the provider.
				$provider_handlers = apply_filters( 'otter_select_form_provider', $form_data );

				if ( $provider_handlers && Form_Providers::provider_has_handler( $provider_handlers, $form_data->get( 'handler' ) ) ) {

					// Send the data to the provider handler.
					$form_data = $provider_handlers[ $form_data->get( 'handler' ) ]( $form_data );
				} else {
					$res->set_code( Form_Data_Response::ERROR_PROVIDER_NOT_REGISTERED );
				}

				do_action( 'otter_form_after_submit', $form_data );

				if ( ! ( $form_data instanceof Form_Data_Request ) ) {
					$res->set_code( Form_Data_Response::ERROR_RUNTIME_ERROR )
						->add_reason( __( 'The form data class is not valid after performing provider actions! Some hook is corrupting the data.', 'otter-blocks' ) );
				}

				if ( $form_data->has_error() ) {
					$res->set_code( $form_data->get_error_code() )
						->set_display_error( $form_options->get_error_message() );
				} else {
					$res->set_code( Form_Data_Response::SUCCESS_EMAIL_SEND )
						->set_success_message( $form_options->get_submit_message() )
						->mark_as_success();
				}
			}
		} catch ( Exception $e ) {
			$res->set_code( Form_Data_Response::ERROR_RUNTIME_ERROR )
				->add_reason( $e->getMessage() );
			$form_data->set_error( Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
			$this->send_error_email( $form_data );
		} finally {
			return $res->build_response();
		}
	}

	/**
	 * Send Email using SMTP.
	 *
	 * @param Form_Data_Request|null $form_data Data from request body.
	 * @return Form_Data_Request|null
	 * @since 2.0.3
	 */
	public function send_default_email( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if ( $form_data->has_error() ) {
			return $form_data;
		}

		try {
			$form_options = $form_data->get_form_options();

			$can_send_email = substr( $form_options->get_submissions_save_location(), -strlen( 'email' ) ) === 'email';

			if ( Pro::is_pro_active() && ! $can_send_email ) {
				return $form_data;
			}

			$email_subject = $form_options->has_email_subject() ? $form_options->get_email_subject() : ( __( 'A new form submission on ', 'otter-blocks' ) . get_bloginfo( 'name' ) );

			$email_message = Form_Email::instance()->build_email( $form_data );
			$email_body    = apply_filters( 'otter_form_email_build_body', $email_message );

			// Sent the form date to the admin site as a default behavior.
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

				if ( empty( $to ) ) {
					$to = sanitize_email( get_site_option( 'admin_email' ) );
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

			$attachments = array();
			if ( $form_data->has_uploaded_files() && ! $form_data->can_keep_uploaded_files() ) {
				foreach ( $form_data->get_uploaded_files_path() as $file ) {
					if ( empty( $file['file_location_slug'] ) ) {
						$attachments[] = $file['file_path'];
					}
				}
			}

			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail
			$email_was_send = wp_mail( $to, $email_subject, $email_body, $headers, $attachments );
			if ( ! $email_was_send ) {
				$is_warning = Pro::is_pro_active() && strstr( $form_options->get_submissions_save_location(), 'database' );

				if ( $is_warning ) {
					$form_data->add_warning( Form_Data_Response::ERROR_EMAIL_NOT_SEND );
				} else {
					$form_data->set_error( Form_Data_Response::ERROR_EMAIL_NOT_SEND );
				}
			}
		} catch ( Exception  $e ) {
			$form_data->set_error( Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
			$this->send_error_email( $form_data );
		}

		return $form_data;
	}

	/**
	 * Email the admin when an important error occurs.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @since 2.2.3
	 */
	public function send_error_email_to_admin( $form_data ) {
		if ( ! $form_data instanceof Form_Data_Request || $form_data->has_error() || $form_data->has_warning() ) {

			if ( ! $form_data instanceof Form_Data_Request ) {
				$form_data = new Form_Data_Request();
				$form_data->set_error( Form_Data_Response::ERROR_RUNTIME_ERROR, __( 'Some hook is corrupting the Form processing pipeline.', 'otter-blocks' ) );
			}

			$send_email = false;

			switch ( $form_data->get_error_code() ) {
				case Form_Data_Response::ERROR_PROVIDER_CREDENTIAL_ERROR:
				case Form_Data_Response::ERROR_MISSING_EMAIL:
				case Form_Data_Response::ERROR_RUNTIME_ERROR:
					$send_email = true;
					break;
			}

			if (
				! $send_email &&
				$form_data->has_warning() &&
				$form_data->has_warning_codes(
					array(
						Form_Data_Response::ERROR_AUTORESPONDER_COULD_NOT_SEND,
						Form_Data_Response::ERROR_AUTORESPONDER_MISSING_EMAIL_FIELD,
					)
				)
			) {
				$key = $form_data->get_form_option_id() . '_autoresponder_error';

				if ( false === get_transient( $key ) ) {
					$send_email = true;
					set_transient( $key, true, self::AUTO_RESPONDER_ERROR_EXPIRATION_TIME );
				}
			}

			if ( $send_email ) {
				$this->send_error_email( $form_data );
			}
		}
	}

	/**
	 * Make additional changes before using the main handler function for submitting.
	 *
	 * @param Form_Data_Request|null $form_data The form request data.
	 * @return Form_Data_Request|null
	 * @since 2.0.3
	 */
	public function change_provider_based_on_consent( $form_data ) {
		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if ( $form_data->has_error() ) {
			return $form_data;
		}

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

		return $form_data;
	}

	/**
	 * Process the extra actions after calling the main handler function for submitting.
	 *
	 * @param Form_Data_Request|null $form_data The form request data.
	 * @return void
	 * @since 2.0.3
	 */
	public function after_submit( $form_data ) {
		if ( ! isset( $form_data ) ) {
			return;
		}

		if ( $form_data->has_error() ) {
			return;
		}

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
	 * Check if the form was not completed by a bot.
	 *
	 * @param Form_Data_Request|null $form_data The form request data.
	 * @return Form_Data_Request|null
	 * @since 2.2.3
	 */
	public function anti_spam_validation( $form_data ) {
		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if ( $form_data->has_error() ) {
			return $form_data;
		}

		if (
			$form_data->payload_has_field( 'antiSpamTime' ) &&
			is_numeric( $form_data->get_payload_field( 'antiSpamTime' ) ) &&
			$form_data->payload_has_field( 'antiSpamHoneyPot' )
		) {
			if (
				$form_data->get_payload_field( 'antiSpamTime' ) >= self::ANTI_SPAM_TIMEOUT &&
				'' === $form_data->get_payload_field( 'antiSpamHoneyPot' )
			) {
				return $form_data;
			}
		}

		$form_data->set_error( Form_Data_Response::ERROR_BOT_DETECTED );
		return $form_data;
	}

	/**
	 * Send an email about error, like: the integration api key is no longer valid.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @return void
	 * @since 2.0.3
	 */
	public static function send_error_email( $form_data ) {
		$email_subject = ( __( 'An error with the Form blocks has occurred on  ', 'otter-blocks' ) . get_bloginfo( 'name' ) );
		$email_message = Form_Email::instance()->build_error_email( $form_data );
		$email_body    = apply_filters( 'otter_form_email_build_body_error', $email_message );
		// Sent the form date to the admin site as a default behaviour.
		$to      = sanitize_email( get_site_option( 'admin_email' ) );
		$headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . esc_url( get_site_url() ) );
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail
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
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail
			$res->set_success( wp_mail( $to, $email_subject, $email_body, $headers ) );
		} catch ( Exception  $e ) {
			$res->set_code( Form_Data_Response::ERROR_RUNTIME_ERROR );
			$res->add_reason( $e->getMessage() );
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
					$res->set_code( $valid_api_key['code'] );
				}
			}
		} catch ( Exception $e ) {
			$res->set_code( Form_Data_Response::ERROR_RUNTIME_ERROR );
			$res->add_reason( $e->getMessage() );
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
					$res->set_code( Form_Data_Response::ERROR_PROVIDER_NOT_REGISTERED );
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
					$res->set_code( $valid_api_key['code'] );
				}
			}
		} catch ( Exception $e ) {
			$res->set_code( Form_Data_Response::ERROR_RUNTIME_ERROR );
			$res->add_reason( $e->getMessage() );
		} finally {
			return $res->build_response();
		}
	}

	/**
	 * Subscribe the user to a service.
	 *
	 * @param Form_Data_Request|null $form_data The form data.
	 * @return Form_Data_Request|null
	 * @since 2.0.3
	 */
	public function subscribe_to_service( $form_data ) {
		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if ( $form_data->has_error() ) {
			return $form_data;
		}

		// Get the first email from form.
		$email = $form_data->get_email_from_form_input();

		if ( '' === $email ) {
			$form_data->set_error( Form_Data_Response::ERROR_MISSING_EMAIL, __( 'Marketing Integration is active, but there is no Email field in the form. Please check your Form block settings in the page.', 'otter-blocks' ) );
			return $form_data;
		}

		if (
			'submit-subscribe' === $form_data->get_form_options()->get_action() &&
			$form_data->payload_has_field( 'consent' ) &&
			! $form_data->get_payload_field( 'consent' )
		) {
			return $form_data;
		}

		try {
			// Get the api credentials from the Form block.
			$wp_options_form = $form_data->get_form_options();

			$error_code = $wp_options_form->check_data();

			if (
				'' === $error_code
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
					$form_data = $service->subscribe( $form_data );
				} else {
					$form_data->set_error( $valid_api_key['code'] );
				}
			} else {
				$form_data->set_error( $error_code );
			}
		} catch ( Exception $e ) {
			$form_data->set_error( Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
			$this->send_error_email( $form_data );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Check for required data.
	 *
	 * @param Form_Data_Request $form_data Data from the request.
	 *
	 * @return boolean
	 * @since 2.0.0
	 */
	public function has_required_data( $form_data ) {

		$main_fields_set = $form_data->are_fields_set(
			array(
				'handler',
				'payload',
			)
		);

		$required_payload_fields = $form_data->are_payload_fields_set(
			array(
				'nonceValue',
				'postUrl',
				'formId',
				'formOption',
			)
		);

		$is_nonce_valid = wp_verify_nonce( $form_data->get_payload_field( 'nonceValue' ), 'form-verification' );

		return $main_fields_set && $required_payload_fields && $is_nonce_valid;
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param Form_Data_Request|null $form_data Data from the request.
	 *
	 * @return Form_Data_Request|null
	 * @since 2.0.0
	 */
	public function check_form_conditions( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if ( $form_data->has_error() ) {
			return $form_data;
		}

		if ( ! $this->has_required_data( $form_data ) ) {
			$form_data->set_error( Form_Data_Response::ERROR_MISSING_DATA );
			return $form_data;
		}

		return $form_data;
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param Form_Data_Request|null $form_data Data from the request.
	 *
	 * @return Form_Data_Request|null
	 * @since 2.0.0
	 */
	public function check_form_captcha( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if ( $form_data->has_error() ) {
			return $form_data;
		}

		$form_options = $form_data->get_form_options();

		if (
			$form_options->form_has_captcha() &&
			(
				! $form_data->payload_has_field( 'token' ) ||
				'' === $form_data->get_payload_field( 'token' )
			)
		) {
			$form_data->set_error( Form_Data_Response::ERROR_MISSING_CAPTCHA );
		}

		if ( $form_data->payload_has_field( 'token' ) ) {
			$secret = get_option( 'themeisle_google_captcha_api_secret_key' );
			$resp   = wp_remote_post(
				apply_filters( 'otter_blocks_recaptcha_verify_url', 'https://www.google.com/recaptcha/api/siteverify' ),
				array(
					'body'    => 'secret=' . $secret . '&response=' . $form_data->get_payload_field( 'token' ),
					'headers' => [
						'Content-Type' => 'application/x-www-form-urlencoded',
					],
				)
			);

			$result = json_decode( $resp['body'], true );

			if ( ! $result['success'] ) {
				$form_data->set_error( Form_Data_Response::ERROR_INVALID_CAPTCHA_TOKEN );
			}
		}

		return $form_data;
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
	 * @param string $content The content.
	 * @return string
	 * @sincee 2.0.3
	 */
	public function build_email_error_content( $content ) {
		return $content;
	}

	/**
	 * Get the first email from the input's form.
	 *
	 * @param Form_Data_Request $data The form data.
	 *
	 * @return mixed|string
	 * @since 2.0.3
	 */
	public function get_email_from_form_input( Form_Data_Request $data ) {
		$inputs = $data->get_payload_field( 'formInputsData' );
		if ( is_array( $inputs ) ) {
			foreach ( $data->get_payload_field( 'formInputsData' ) as $input_field ) {
				if ( isset( $input_field['type'] ) && 'email' == $input_field['type'] ) {
					return $input_field['value'];
				}
			}
		}
		return '';
	}

	/**
	 * Validate the input fields with files.
	 *
	 * @param Form_Data_Request|null $form_data The form data.
	 * @return Form_Data_Request|null
	 * @since 2.2.3
	 */
	public function check_form_files( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if ( $form_data->has_error() ) {
			return $form_data;
		}

		$inputs = $form_data->get_form_inputs();

		foreach ( $inputs as $input ) {
			if ( Form_Utils::is_file_field( $input ) && ! Form_Utils::is_file_field_valid( $input ) ) {
				$form_data->set_error( Form_Data_Response::ERROR_FILES_METADATA_FORMAT );
				return $form_data;
			}
		}

		return $form_data;
	}

	/**
	 * Get the Field Options for the given Form.
	 *
	 * @param Form_Data_Request $form_data The form data.
	 * @since 2.2.3
	 */
	public function pull_fields_options_for_form( $form_data ) {
		if ( ! ( $form_data instanceof Form_Data_Request ) || $form_data->has_error() ) {
			return $form_data;
		}

		$global_fields_options = get_option( 'themeisle_blocks_form_fields_option' );

		if ( empty( $global_fields_options ) ) {
			return $form_data;
		}

		foreach ( $form_data->get_form_inputs() as $input ) {
			if ( isset( $input['metadata']['fieldOptionName'] ) ) {
				$field_name = $input['metadata']['fieldOptionName'];
				foreach ( $global_fields_options as $field ) {
					if ( isset( $field['fieldOptionName'] ) && $field['fieldOptionName'] === $field_name ) {
						$new_field = new Form_Field_Option_Data( $field_name, $field['fieldOptionType'], $field['options'] );
						$form_data->add_field_option( $new_field );
						break;
					}
				}
			}
		}

		return $form_data;
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
