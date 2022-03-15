<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Email;
use ThemeIsle\GutenbergBlocks\Integration\Integration_Data;
use ThemeIsle\GutenbergBlocks\Integration\Mailchimp_Integration;
use ThemeIsle\GutenbergBlocks\Integration\Sendinblue_Integration;

/**
 * Class Plugin_Card_Server
 */
class Form_Server {

	/**
	 * The main instance var.
	 *
	 * @var Form_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Form_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Form_Server
	 */
	public $version = 'v1';


	/**
	 * Initialize the class
	 */
	public function init() {
		add_action('rest_api_init', array( $this, 'register_routes' ) );
		add_filter('otter_form_validation', array( $this, 'check_form_conditions' ));
		add_filter('otter_form_captcha_validation', array( $this, 'check_form_captcha' ));
		add_filter('otter_form_options', array( $this, 'get_form_option_settings' ));

		do_action( 'otter_register_form_provider', array( 'default' =>  array( $this, 'send_default_email') ) );
		do_action( 'otter_register_form_provider', array( 'sendinblue' => array( $this, 'subscribe_to_sendinblue' ) ));
		do_action( 'otter_register_form_provider', array( 'mailchimp' =>  array( $this, 'subscribe_to_mailchimp' ) ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;
		register_rest_route(
			$namespace,
			'/forms',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'submit_form' ),
					'permission_callback' => function () {
						return __return_true();
					},
				),
			)
		);
		register_rest_route(
			$namespace,
			'/integration',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'get_integration_data' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}


	/**
	 * Handle the request from the form block
	 *
	 * @param mixed $request Form request.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	public function submit_form( $request ) {

		$data = new Form_Data_Request( json_decode( $request->get_body(), true ) );
		$res  = new Form_Data_Response();

		$reasons = apply_filters('otter_form_validation', $data);

		if ( 0 < count( $reasons ) ) {
			$res->set_error( __( 'Invalid request!', 'otter-blocks' ) );
			$res->set_reasons( $reasons );
			return $res->build_response();
		}

		if ( $data->is_set( 'token' ) ) {

			$result = apply_filters( 'otter_form_captcha_validation', $data );
			if ( false == $result['success'] ) {
				$res->set_error( __( 'The reCaptha was invalid!', 'otter-blocks' ) );
				return $res->build_response();
			}
		}


		$integration = Integration_Data::get_integration_data_from_form_settings( $data->get( 'formOption' ) );

		$provider_action = apply_filters('otter_select_form_provider', $integration);
		$provider_response = $provider_action($data);

		if( $data->field_has( 'action', array( 'subscribe', 'submit-subscribe' )) && 'submit-subscribe' === $data->get( 'action' ) ) {

			return $this->send_default_email($data);
		}

		return $provider_response;
	}


	/**
	 * Send Email using SMTP
	 *
	 * @param \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request  $data Data from request body.
	 * @return mixed|\WP_REST_Response
	 */
	private function send_default_email($data ) {
		$res = new Form_Data_Response();
		$email_subject = $data->is_set( 'emailSubject' ) ? $data->get( 'emailSubject' ) : ( __( 'A new form submission on ', 'otter-blocks' ) . get_bloginfo( 'name' ) );

		$email_body    = Form_Email::instance()->build_email($data);

		// Sent the form date to the admin site as a default behaviour.
		$to = sanitize_email( get_site_option( 'admin_email' ) );

		// Check if we need to send it to another user email.
		if ( $data->is_set( 'formOption' ) ) {
			$option_name = $data->is_set( 'formOption' );
			$form_emails = get_option( 'themeisle_blocks_form_emails' );

			foreach ( $form_emails as $form ) {
				if ( $form['form'] === $option_name && isset( $form['email'] )) {
					$to = sanitize_email( $form['email'] );
				}
			}
		}

		$headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . esc_url( get_site_url() ) );

		try {
			// phpcs:ignore
			wp_mail( $to, $email_subject, $email_body, $headers );
			$res->mark_as_succes();
		} catch ( \Exception $e ) {
			$res->set_error( $e->getMessage() );
		} finally {
			return $res->build_response();
		}
	}


	/**
	 * Get data about the given provider
	 *
	 * @param \WP_REST_Request $request Search request.
	 * @return mixed|\WP_REST_Response
	 */
	public function get_integration_data( $request ) {
		$res = new Form_Data_Response();

		$data = new Form_Data_Request( json_decode( $request->get_body(), true ) );

		try {
			$service = null;
			switch ( $data->get( 'provider' ) ) {
				case 'mailchimp':
					$service = new Mailchimp_Integration();
					break;
				case 'sendinblue':
					$service = new Sendinblue_Integration();
					break;
				default:
					$res->set_error( __( 'Invalid request! Provider is missing.', 'otter-blocks' ) );
			}

			if( isset($service) ) {
				$valid_api_key = $service::validate_api_key( $data->get( 'apiKey' ) );
				if ( $valid_api_key['valid'] ) {
					$service->set_api_key( $data->get('apiKey') );
					$res->set_response( $service->get_provider_data( $data ) );
				} else {
					$res->set_error( $valid_api_key['reason'] );
				}
			}
		} catch (\Exception $e) {
			$res->set_error($e->getMessage());
		} finally {
			return $res->build_response();
		}
	}

	/**
	 * Add a new subscriber to Sendinblue
	 *
	 * @param \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request  $data Data from request body.
	 * @return mixed|\WP_REST_Response
	 */
	public function subscribe_to_sendinblue( $data ) {

		$res = new Form_Data_Response();
		// Get the first email from form.
		$email = '';
		foreach ( $data->get( 'data' ) as $input_field ) {
			if ( 'email' == $input_field['type'] ) {
				$email = $input_field['value'];
				break;
			}
		}

		if ( '' === $email ) {
			$res->set_error( 'No email provided!' );
			return $res->build_response();
		}

        try {
            // Get the api credentials from the Form block.
            $integration =  Integration_Data::get_integration_data_from_form_settings( $data->get( 'formOption' ) );

            $issues = $integration->check_data();

            if (
                count($issues) == 0
            ) {
                $service = null;
                switch ($integration->get_provider()) {
                    case 'mailchimp':
                        $service = (new Mailchimp_Integration())->extract_data_from_integration($integration);
                        break;
                    case 'sendinblue':
                        $service = (new Sendinblue_Integration())->extract_data_from_integration($integration);
                        break;
                }

                $valid_api_key = $service::validate_api_key( $integration->get_api_key() );

                if ( $valid_api_key['valid'] ) {
                    $res->copy( $service->subscribe( $email ) );
                } else {
                    $res->set_error( $valid_api_key['reason'] );
                }
            } else {
                $res->set_reasons($issues);
            }
        } catch (\Exception $e) {
            $res->set_error( __('Server error!') );
        } finally {
            return $res->build_response();
        }
	}

	/**
	 * Check for requiered data.
	 *
	 * @access private
	 * @param \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request $data Data from the request.
	 *
	 * @return boolean
	 */
	private function has_requiered_data( $data ) {
		return $data->are_fields_set(
			array(
				'nonceValue',
				'postUrl',
				'formId',
				'formOptions',
			)
		) && wp_verify_nonce( $data->get( 'nonceValue' ), 'form-verification' );
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request $data Data from the request.
	 *
	 * @return array
	 */
	public function check_form_conditions( $data ) {

		$reasons           = array();
		if ( ! $this->has_requiered_data( $data ) ) {
			$reasons += array( __( 'Essential data is missing!', 'otter-blocks' ) );
			return $reasons;
		}

		$integration       = $this->get_form_option_settings( $data->get( 'formOption' ) );
		$has_captcha       = false;
		$has_credentials   = false;

		if ( isset( $integration['hasCaptcha'] ) ) {
			$has_captcha = $integration['hasCaptcha'];
		}

		if ( $has_captcha && ( ! $data->is_set( 'token' ) || '' === $data['token'] ) ) {
			$reasons += array(
				__( 'Token is missing!', 'otter-blocks' ),
			);
		}

		if ( isset( $integration['apiKey'] ) && '' !== $integration['apiKey'] &&
			isset( $integration['listId'] ) && '' !== $integration['listId']
		) {
			$has_credentials = true;
		}

		if ( ! $has_credentials && $integration['provider'] ) {
			$reasons += array(
				__( 'Provider settings are missing!', 'otter-blocks' ),
			);
		}
		return $reasons;
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request $data Data from the request.
	 *
	 * @return array
	 */
	public function check_form_captcha( $data ) {
		$secret = get_option( 'themeisle_google_captcha_api_secret_key' );
		$resp   = wp_remote_post(
			'https://www.google.com/recaptcha/api/siteverify',
			array(
				'body'    => 'secret=' . $secret . '&response=' . $data->get( 'token' ),
				'headers' => [
					'Content-Type' => 'application/x-www-form-urlencoded',
				],
			)
		);
		return json_decode( $resp['body'], true );
	}

	/**
	 * Get form settings from options.
	 *
	 * @param string $form_option The name of the option.
	 * @return array Form settings
	 */
	private function get_form_option_settings( $form_option ) {
		$option_name = sanitize_text_field( $form_option );
		$form_emails = get_option( 'themeisle_blocks_form_emails' );

		foreach ( $form_emails as $form ) {
			if ( $form['form'] === $option_name ) {
				if ( isset( $form['integration'] ) ) {
					return $form['integration'];
				}
			}
		}
		return array();
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Plugin_Card_Server
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
	 * @since 1.0.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
