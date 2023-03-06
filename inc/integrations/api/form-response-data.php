<?php
/**
 * Response Data Handling.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

use WP_Error;
use WP_HTTP_Response;
use WP_REST_Response;

/**
 * Class Form_Data_Response
 *
 * @since 2.0.0
 */
class Form_Data_Response {

	// TODO: Integrate the new error code system.
	const SUCCESS_EMAIL_SEND      = '0';
	const SUCCESS_USER_SUBSCRIBED = '1';

	const ERROR_RUNTIME_ERROR = '10';

	// Request validation errors.
	const ERROR_MISSING_DATA         = '101';
	const ERROR_MISSING_CAPTCHA      = '102';
	const ERROR_MISSING_NONCE        = '103';
	const ERROR_MISSING_EMAIL        = '104';
	const ERROR_FORM_ID_INVALID      = '105';
	const ERROR_EMAIL_NOT_SEND       = '106';
	const ERROR_MISSING_PROVIDER     = '107';
	const ERROR_MISSING_API_KEY      = '108';
	const ERROR_MISSING_MAIL_LIST_ID = '109';
	const ERROR_BOT_DETECTED         = '110';

	// Errors from external services.
	const ERROR_PROVIDER_NOT_REGISTERED            = '201';
	const ERROR_PROVIDER_SUBSCRIBE_ERROR           = '202';
	const ERROR_PROVIDER_INVALID_KEY               = '203';
	const ERROR_INVALID_CAPTCHA_TOKEN              = '204';
	const ERROR_PROVIDER_INVALID_API_KEY_FORMAT    = '205';
	const ERROR_PROVIDER_CLIENT_ALREADY_REGISTERED = '206';
	const ERROR_PROVIDER_INVALID_EMAIL             = '207';
	const ERROR_PROVIDER_DUPLICATED_EMAIL          = '208';


	/**
	 * Response Data.
	 *
	 * @since 2.0.0
	 *
	 * @var array
	 */
	protected $response = array();

	/**
	 * Mark if the error is related to api key issues.
	 *
	 * @var boolean
	 * @since 2.0.3
	 */
	protected $is_credential_error = false;

	/**
	 * Constructor.
	 *
	 * @access public
	 * @since 2.0.0
	 */
	public function __construct() {
		$this->response['success']      = false;
		$this->response['reasons']      = array();
		$this->response['code']         = self::SUCCESS_EMAIL_SEND;
		$this->response['displayError'] = 'Error. Please try again.';
	}

	/**
	 * Set error message.
	 *
	 * @param string $err_msg Error message.
	 * @param string $provider Service provider.
	 * @since 2.0.0
	 */
	public function set_error( $err_msg, $provider = null ) {
		$this->response['error'] = $err_msg;
		if ( isset( $provider ) ) {
			$this->response['provider'] = $provider;
		}
		return $this;
	}

	/**
	 * Set error code.
	 *
	 * @param string $code Error code.
	 * @since 2.1.7
	 */
	public function set_code( $code ) {
		$this->response['code'] = $code;
		return $this;
	}

	/**
	 * Set error that the user is going to see.
	 *
	 * @param string $err_msg Error code.
	 * @since 2.1.7
	 */
	public function set_display_error( $err_msg ) {
		$this->response['displayError'] = $err_msg;
		return $this;
	}

	/**
	 * Add error reason.
	 *
	 * @param string $reason Error reason.
	 * @since 2.0.0
	 */
	public function add_reason( $reason ) {
		$this->response['reasons'][] = $reason;
		return $this;
	}

	/**
	 * Set error reason.
	 *
	 * @param string[] $reasons Error reason.
	 * @since 2.0.0
	 */
	public function set_reasons( $reasons ) {
		$this->response['reasons'] = $reasons;
		return $this;
	}

	/**
	 * Check if success.
	 *
	 * @return string
	 * @since 2.0.0
	 */
	public function is_success() {
		return $this->response['success'];
	}

	/**
	 * Build form response.
	 *
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 * @since 2.0.3
	 */
	public function build_response() {
		// TODO: We can to addition operation when returning the response.
		$this->process_error_code();

		return rest_ensure_response( $this->response );
	}


	/**
	 * Mark response as success.
	 *
	 * @return $this
	 * @since 2.0.0
	 */
	public function mark_as_success() {
		$this->response['success'] = true;
		return $this;
	}

	/**
	 * Set the success.
	 *
	 * @param boolean $value The value.
	 * @return $this
	 * @since 2.0.0
	 */
	public function set_success( $value ) {
		$this->response['success'] = $value;
		return $this;
	}

	/**
	 * Copy response.
	 *
	 * @param object $other Response data.
	 * @return $this
	 * @since 2.0.0
	 */
	public function copy( $other ) {
		$this->response['success'] = $other->is_success();
		$this->set_reasons( $other->get_reasons() );
		$this->set_error( $other->get_error() );
		return $this;
	}

	/**
	 * Get error message.
	 *
	 * @return string
	 * @since 2.0.0
	 */
	public function get_error() {
		return $this->response['error'];
	}

	/**
	 * Get error reasons.
	 *
	 * @return string
	 * @since 2.0.0
	 */
	public function get_reasons() {
		return $this->response['reasons'];
	}

	/**
	 * Set the response.
	 *
	 * @param array $response The response.
	 * @return $this
	 * @since 2.0.0
	 */
	public function set_response( $response ) {
		$this->response = $response;
		return $this;
	}

	/**
	 * Add new data to the response.
	 *
	 * @param array $values The new data.
	 * @return $this
	 * @since 2.0.0
	 */
	public function add_values( $values ) {
		$this->response = array_merge( $this->response, $values );
		return $this;
	}

	/**
	 * Check if the response has an error.
	 *
	 * @return bool
	 * @since 2.0.0
	 */
	public function has_error() {
		return isset( $this->response['error'] );
	}

	/**
	 * Check if the error is caused by invalid credentials.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function is_credential_error() {
		return $this->is_credential_error;
	}

	/**
	 * Mark that the error is caused by invalid credentials.
	 *
	 * @param bool $is_credential_error Is credential error.
	 * @return $this
	 * @since 2.0.3
	 */
	public function set_is_credential_error( $is_credential_error ) {
		$this->is_credential_error = $is_credential_error;
		return $this;
	}

	/**
	 * Add the error messages based on the code error.
	 *
	 * @return void
	 * @since 2.1.7
	 */
	public function process_error_code() {
		switch ( $this->response['code'] ) {
			case self::ERROR_MISSING_DATA:
				$this->add_reason( __( 'Essential data is missing: invalid Form id or protection.', 'otter-blocks' ) );
				break;

			case self::ERROR_MISSING_CAPTCHA:
				$this->add_reason( __( 'Captcha token is missing.', 'otter-blocks' ) );
				break;

			case self::ERROR_MISSING_EMAIL:
				$this->add_reason( __( 'Missing email field in form.', 'otter-blocks' ) );
				break;

			case self::ERROR_MISSING_NONCE:
				$this->add_reason( __( 'Missing CSRF protection in form.', 'otter-blocks' ) );
				break;

			case self::ERROR_FORM_ID_INVALID:
				$this->add_reason( __( 'Form ID is invalid.', 'otter-blocks' ) );
				break;

			case self::ERROR_EMAIL_NOT_SEND:
				$this->add_reason( __( 'Email could not be send. Might be an error with the service.', 'otter-blocks' ) );
				break;

			case self::ERROR_PROVIDER_INVALID_KEY:
				$this->add_reason( __( 'Invalid service authentication credentials.', 'otter-blocks' ) );
				break;

			case self::ERROR_PROVIDER_NOT_REGISTERED:
				$this->add_reason( __( 'The 3rd-party service is not registered.', 'otter-blocks' ) );
				break;

			case self::ERROR_PROVIDER_SUBSCRIBE_ERROR:
				$this->add_reason( __( 'Error received from service when subscribing the user.', 'otter-blocks' ) );
				break;

			case self::ERROR_MISSING_PROVIDER:
				$this->add_reason( __( 'Provider settings are missing.', 'otter-blocks' ) );
				break;

			case self::ERROR_MISSING_API_KEY:
				$this->add_reason( __( 'API Key is missing from settings.', 'otter-blocks' ) );
				break;

			case self::ERROR_MISSING_MAIL_LIST_ID:
				$this->add_reason( __( 'API Key is missing.', 'otter-blocks' ) );
				break;

			case self::ERROR_INVALID_CAPTCHA_TOKEN:
				$this->add_reason( __( 'The reCaptcha token is invalid.', 'otter-blocks' ) );
				break;

			case self::ERROR_PROVIDER_INVALID_API_KEY_FORMAT:
				$this->add_reason( __( 'The API key format is invalid.', 'otter-blocks' ) );
				break;

			case self::ERROR_PROVIDER_CLIENT_ALREADY_REGISTERED:
				$this->add_reason( __( 'The email was already registered.', 'otter-blocks' ) );
				break;

			case self::ERROR_PROVIDER_INVALID_EMAIL:
				$this->add_reason( __( 'The email address is invalid.', 'otter-blocks' ) );
				break;

			case self::ERROR_PROVIDER_DUPLICATED_EMAIL:
				$this->add_reason( __( 'The email was already registered.', 'otter-blocks' ) );
				break;
			case self::ERROR_BOT_DETECTED:
				$this->add_reason( __( 'Failed to validate the data. Please wait 5 seconds and try again.', 'otter-blocks' ) );
				break;  
		}
	}
}
