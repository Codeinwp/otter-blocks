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
		$this->response['success'] = false;
		$this->response['reasons'] = array();
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
}
