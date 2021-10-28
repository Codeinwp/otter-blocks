<?php
/**
 * Response Data Handling.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

class Form_Data_Response {

	protected $response = array();

	function __construct( ) {
		$this->response['success'] = false;
		$this->response['reasons'] = array();
	}

	public function set_error( $err_msg, $provider = null ) {
		$this->response['error'] = $err_msg;
		if( isset($provider) ) {
			$this->response['provider'] = $provider;
		}
	}

	public function add_reason( $reason ) {
		array_push( $this->response['reasons'], $reason );
	}

	public function set_reasons( $reasons ) {
		$this->response['reasons'] = $reasons;
	}

	public function is_success() {
		return $this->response['success'];
	}

	public function build_response() {
		// TODO: We can to addiditon operation when returning the response
		return rest_ensure_response( $this->response );
	}

	public function mark_as_succes() {
		$this->response['success'] = true;
	}

	public function copy( $other ) {
		$response['success'] = $other->is_success();
		$this->set_reasons( $other->get_reasons());
		$this->set_error($other->set_error());
	}

	public function get_error() {
		return $this->response['error'];
	}

	public function get_reasons() {
		return $this->response['reasons'];
	}
}
