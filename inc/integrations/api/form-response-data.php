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

	const SUCCESS_EMAIL_SEND      = '0';
	const SUCCESS_USER_SUBSCRIBED = '1';

	const ERROR_RUNTIME_ERROR                     = '10';
	const ERROR_FILE_UPLOAD                       = '11';
	const ERROR_FILE_UPLOAD_TYPE                  = '12';
	const ERROR_FILE_UPLOAD_TYPE_WP               = '13';
	const ERROR_FILE_UPLOAD_MAX_FILES_NUMBER      = '14';
	const ERROR_FILE_UPLOAD_MAX_SIZE              = '15';
	const ERROR_MISSING_FILE_FIELD_OPTION         = '16';
	const ERROR_AUTORESPONDER_MISSING_EMAIL_FIELD = '17';
	const ERROR_AUTORESPONDER_COULD_NOT_SEND      = '18';
	const ERROR_MALFORMED_REQUEST                 = '19';

	// Request validation errors.
	const ERROR_MISSING_DATA          = '101';
	const ERROR_MISSING_CAPTCHA       = '102';
	const ERROR_MISSING_NONCE         = '103';
	const ERROR_MISSING_EMAIL         = '104';
	const ERROR_FORM_ID_INVALID       = '105';
	const ERROR_EMAIL_NOT_SEND        = '106';
	const ERROR_MISSING_PROVIDER      = '107';
	const ERROR_MISSING_API_KEY       = '108';
	const ERROR_MISSING_MAIL_LIST_ID  = '109';
	const ERROR_BOT_DETECTED          = '110';
	const ERROR_FILES_METADATA_FORMAT = '111';
	const ERROR_FILE_MISSING_BINARY   = '112';
	const ERROR_MISSING_DUMP_DATA     = '113';



	// Errors from external services.
	const ERROR_PROVIDER_NOT_REGISTERED            = '201';
	const ERROR_PROVIDER_SUBSCRIBE_ERROR           = '202';
	const ERROR_PROVIDER_INVALID_KEY               = '203';
	const ERROR_INVALID_CAPTCHA_TOKEN              = '204';
	const ERROR_PROVIDER_INVALID_API_KEY_FORMAT    = '205';
	const ERROR_PROVIDER_CLIENT_ALREADY_REGISTERED = '206';
	const ERROR_PROVIDER_INVALID_EMAIL             = '207';
	const ERROR_PROVIDER_DUPLICATED_EMAIL          = '208';
	const ERROR_PROVIDER_CREDENTIAL_ERROR          = '209';
	const ERROR_WEBHOOK_COULD_NOT_TRIGGER          = '210';
	const ERROR_RUNTIME_STRIPE_SESSION_VALIDATION  = '300';
	const ERROR_STRIPE_CHECKOUT_SESSION_CREATION   = '301';
	const ERROR_STRIPE_CHECKOUT_SESSION_NOT_FOUND  = '302';
	const ERROR_STRIPE_PAYMENT_UNPAID              = '303';
	const ERROR_STRIPE_METADATA_RECORD_NOT_FOUND   = '304';


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
	 * The REST response.
	 *
	 * @var WP_REST_Response|WP_Error|WP_HTTP_Response|null
	 */
	public $rest_response = null;

	/**
	 * Constructor.
	 *
	 * @access public
	 * @since 2.0.0
	 */
	public function __construct() {
		$this->response['success']       = false;
		$this->response['reasons']       = array();
		$this->response['code']          = self::SUCCESS_EMAIL_SEND;
		$this->response['displayError']  = 'Error. Please try again.';
		$this->response['submitMessage'] = 'Success';
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
	 * Set success message.
	 *
	 * @param string $message The message.
	 * @since 2.4
	 */
	public function set_success_message( $message ) {
		$this->response['submitMessage'] = $message;
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
		if ( isset( $this->rest_response ) ) {
			$this->rest_response->set_data( $this->response );
			return $this->rest_response;
		}

		$this->process_error_code();

		return rest_ensure_response( $this->response );
	}

	/**
	 * Create the REST response.
	 *
	 * @return void
	 */
	public function make_internal_response() {
		$this->rest_response = $this->build_response();
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
	 * Add new field to the response.
	 *
	 * @param string $key The key.
	 * @param mixed  $value The value.
	 * @return $this
	 */
	public function add_response_field( $key, $value ) {
		$this->response[ $key ] = $value;
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
		if ( ! $this->has_error() ) {
			return;
		}
		$this->add_reason( self::get_error_code_message( $this->response['code'] ) );
	}

	/**
	 * Get the error message based on the error code.
	 *
	 * @param string $error_code The error code.
	 * @return string
	 * @since 2.2.3
	 */
	public static function get_error_code_message( $error_code ) {
		$error_messages = array(
			self::ERROR_MISSING_DATA                       => __( 'Essential data is missing: invalid Form id or protection.', 'otter-blocks' ),
			self::ERROR_MISSING_CAPTCHA                    => __( 'Captcha token is missing.', 'otter-blocks' ),
			self::ERROR_MISSING_EMAIL                      => __( 'Missing email field in form.', 'otter-blocks' ),
			self::ERROR_MISSING_NONCE                      => __( 'Missing CSRF protection in form.', 'otter-blocks' ),
			self::ERROR_MISSING_FILE_FIELD_OPTION          => __( 'The File Field is not registered. Please check the field in Editor.', 'otter-blocks' ),
			self::ERROR_FORM_ID_INVALID                    => __( 'Form ID is invalid.', 'otter-blocks' ),
			self::ERROR_EMAIL_NOT_SEND                     => __( 'Email could not be send. Might be an error with the service.', 'otter-blocks' ),
			self::ERROR_PROVIDER_INVALID_KEY               => __( 'Invalid service authentication credentials.', 'otter-blocks' ),
			self::ERROR_PROVIDER_NOT_REGISTERED            => __( 'The 3rd-party service is not registered.', 'otter-blocks' ),
			self::ERROR_PROVIDER_SUBSCRIBE_ERROR           => __( 'Error received from service when subscribing the user.', 'otter-blocks' ),
			self::ERROR_MISSING_PROVIDER                   => __( 'Provider settings are missing.', 'otter-blocks' ),
			self::ERROR_MISSING_API_KEY                    => __( 'API Key is missing from settings.', 'otter-blocks' ),
			self::ERROR_MISSING_MAIL_LIST_ID               => __( 'API Key is missing.', 'otter-blocks' ),
			self::ERROR_INVALID_CAPTCHA_TOKEN              => __( 'The reCaptcha token is invalid.', 'otter-blocks' ),
			self::ERROR_PROVIDER_INVALID_API_KEY_FORMAT    => __( 'The API key format is invalid.', 'otter-blocks' ),
			self::ERROR_PROVIDER_CLIENT_ALREADY_REGISTERED => __( 'The user with this email was already registered.', 'otter-blocks' ),
			self::ERROR_PROVIDER_INVALID_EMAIL             => __( 'The email address is invalid.', 'otter-blocks' ),
			self::ERROR_PROVIDER_DUPLICATED_EMAIL          => __( 'The email was already registered.', 'otter-blocks' ),
			self::ERROR_BOT_DETECTED                       => __( 'Failed to validate the data. Please wait 5 seconds and try again.', 'otter-blocks' ),
			self::ERROR_FILES_METADATA_FORMAT              => __( 'The files metadata is invalid.', 'otter-blocks' ),
			self::ERROR_FILE_UPLOAD                        => __( 'The files could not be uploaded.', 'otter-blocks' ),
			self::ERROR_PROVIDER_CREDENTIAL_ERROR          => __( 'The Otter From Block service credentials are invalid.', 'otter-blocks' ),
			self::ERROR_FILE_UPLOAD_TYPE_WP                => __( 'The file type is not allowed by host provider.', 'otter-blocks' ),
			self::ERROR_FILE_UPLOAD_TYPE                   => __( 'The file type is not allowed.', 'otter-blocks' ),
			self::ERROR_FILE_UPLOAD_MAX_FILES_NUMBER       => __( 'The number of files is too big.', 'otter-blocks' ),
			self::ERROR_FILE_UPLOAD_MAX_SIZE               => __( 'The file size exceed the limit.', 'otter-blocks' ),
			self::ERROR_AUTORESPONDER_MISSING_EMAIL_FIELD  => __( 'The email field is missing from the Form Block with Autoresponder activated.', 'otter-blocks' ),
			self::ERROR_AUTORESPONDER_COULD_NOT_SEND       => __( 'The email from Autoresponder could not be sent.', 'otter-blocks' ),
			self::ERROR_FILE_MISSING_BINARY                => __( 'The file data is missing.', 'otter-blocks' ),
			self::ERROR_MALFORMED_REQUEST                  => __( 'The request is malformed.', 'otter-blocks' ),
			self::ERROR_WEBHOOK_COULD_NOT_TRIGGER          => __( 'The webhook could not be triggered.', 'otter-blocks' ),
			self::ERROR_MISSING_DUMP_DATA                  => __( 'The form dump data is missing.', 'otter-blocks' ),
			self::ERROR_STRIPE_CHECKOUT_SESSION_CREATION   => __( 'The Stripe Checkout session could not be created.', 'otter-blocks' ),
			self::ERROR_STRIPE_CHECKOUT_SESSION_NOT_FOUND  => __( 'The Stripe Checkout session was not found.', 'otter-blocks' ),
			self::ERROR_STRIPE_PAYMENT_UNPAID              => __( 'The payment was not completed.', 'otter-blocks' ),
			self::ERROR_STRIPE_METADATA_RECORD_NOT_FOUND   => __( 'The metadata submission record was not found.', 'otter-blocks' ),
			self::ERROR_RUNTIME_STRIPE_SESSION_VALIDATION  => __( 'The payment has been processed. You will be contacted by the support team.', 'otter-blocks' ),
		);
		
		// Give more details to the admin.
		if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
			$error_messages[ self::ERROR_EMAIL_NOT_SEND ]      .= ' ' . __( 'The function `wp_mail` is not working properly. Please check the email provider settings.', 'otter-blocks' );
			$error_messages[ self::ERROR_FILE_UPLOAD_TYPE_WP ] .= ' ' . __( 'The `wp_check_filetype` function could not validate the file type. Please check the server settings.', 'otter-blocks' );
		}

		if ( ! isset( $error_messages[ $error_code ] ) ) {
			return __( 'Unknown error.', 'otter-blocks' );
		}

		return $error_messages[ $error_code ];
	}
}
