<?php
/**
 * Request Data Handling.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Class Form_Data_Request
 */
class Form_Data_Request {

	/**
	 * Request Data.
	 *
	 * @var array
	 */
	protected $data = array();

	/**
	 * Constructor.
	 *
	 * @access  public
	 * @param array $request_data Request Data.
	 */
	public function __construct( $request_data ) {
		$this->data = $this->sanitize_request_data( $request_data );
	}

	/**
	 * Get the value of the field.
	 *
	 * @param string $field_name The name of the field.
	 * @return mixed
	 */
	public function get( $field_name ) {
		return $this->is_set( $field_name ) ? $this->data[ $field_name ] : null;
	}

	/**
	 * Check if the value of the field is set.
	 *
	 * @param string $field_name The name of the field.
	 * @return boolean
	 */
	public function is_set( $field_name ) {
		// TODO: we can do a more refined verification like checking for empty strings or arrays.
		return isset( $this->data[ $field_name ] );
	}

	/**
	 * Check if the given fields are set.
	 *
	 * @param array $fields_name The name of the fields.
	 * @return boolean
	 */
	public function are_fields_set( $fields_name ) {
		return 0 < count(
			array_filter(
				array_map(
					function( $field_name ) {
						return $this->is_set( $field_name );
					},
					$fields_name
				),
				function( $is_set ) {
					return $is_set;
				}
			)
		);
	}

	/**
	 * Check if the field has one of the given values.
	 *
	 * @param string $field_name The name of the field.
	 * @param array  $values The desired values of the field.
	 * @return boolean
	 */
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
					$input['label'] = sanitize_text_field( 'label' );
					$input['input'] = sanitize_text_field( 'input' );
					return $input;
				},
				$data['data']
			);
		}
		return $data;
	}
}
