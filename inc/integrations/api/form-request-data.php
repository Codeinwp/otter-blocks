<?php
/**
 * Request Data Handling.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

class Form_Data_Request {

	protected $data = array();

	function __construct( $request_data ) {
		$this->data = $this->sanitize_request_data($request_data);
	}

	public function get( $field_name ) {
		return $this->is_set($field_name) ? $this->data[$field_name] : null;
	}

	public function is_set( $field_name ) {
		return isset($data[$field_name]);
	}

	public function are_fields_set( $fields_name ) {
		return 0 < count(
			array_filter(
				array_map(
					function( $field_name ) {
						return $this->is_set($field_name);
					},
					$fields_name
				),
				function( $is_set ) {
					return $is_set;
				}
			)
		);
	}

	public function field_has( $field_name, $values ) {
		return in_array( $this->get( $field_name ), $values, true );
	}

	/**
	 * Sanitize the request data.
	 *
	 * @param array $data The data from the request.
	 * @return array Sanitized field data.
	 */
	public static function sanitize_request_data( $data ) {
		if ( isset( $data['postUrl'] ) ) {
			$data['postUrl'] = sanitize_text_field( $data['postUrl'] );
		}
		if ( isset( $data['nonceValue'] ) ) {
			$data['nonceValue'] = sanitize_text_field( $data['nonceValue'] );
		}
		if ( isset( $data['formId'] ) ) {
			$data['formId'] = sanitize_text_field( $data['formId'] );
		}
		if ( isset( $data['formOption'] ) ) {
			$data['formOption'] = sanitize_text_field( $data['formOption'] );
		}
		if ( isset( $data['apiKey'] ) ) {
			$data['apiKey'] = sanitize_text_field( $data['apiKey'] );
		}
		if ( isset( $data['provider'] ) ) {
			$data['provider'] = sanitize_text_field( $data['provider'] );
		}
		if ( isset( $data['emailSubject'] ) ) {
			$data['emailSubject'] = sanitize_text_field( $data['emailSubject'] );
		}
		if ( isset( $data['action'] ) ) {
			$data['action'] = sanitize_text_field( $data['action'] );
		}
		if ( isset( $data['token'] ) ) {
			$data['token'] = sanitize_text_field( $data['token'] );
		}
		if ( isset( $data['data'] ) ) {
			$data['data'] = array_map(
				function( $input ) {
					$input['label'] = sanitize_text_field('label');
					$input['input'] = sanitize_text_field('input');
					return $input;
				},
				$data['data']
			);
		}
		return $data;
	}
}
