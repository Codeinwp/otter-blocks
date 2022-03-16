<?php
/**
 * Response Data Handling.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Class Form_Data_Response
 */
class Form_Data_Response {

	/**
	 * Response Data.
	 *
	 * @var array
	 */
	protected array $response = array();

	/**
	 * Constructor.
	 *
	 * @access public
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
	 */
	public function add_reason( $reason ) {
		$this->response['reasons'][] = $reason;
		return $this;
	}

	/**
	 * Set error reason.
	 *
	 * @param string[] $reasons Error reason.
	 */
	public function set_reasons( $reasons ) {
		$this->response['reasons'] = $reasons;
		return $this;
	}

	/**
	 * Check if success.
	 *
	 * @return string
	 */
	public function is_success() {
		return $this->response['success'];
	}

	/**
	 * Build form response.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	public function build_response() {
		// TODO: We can to addiditon operation when returning the response.
		return rest_ensure_response( $this->response );
	}


	/**
	 * Mark response as success.
	 */
	public function mark_as_success() {
		$this->response['success'] = true;
		return $this;
	}

	/**
	 * Copy response.
	 *
	 * @param object $other Response data.
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
	 */
	public function get_error() {
		return $this->response['error'];
	}

	/**
	 * Get errror reasons.
	 *
	 * @return string
	 */
	public function get_reasons() {
		return $this->response['reasons'];
	}

	public function set_response( $response ) {
		$this->response = $response;
		return $this;
	}
}
