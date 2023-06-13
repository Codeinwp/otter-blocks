<?php
/**
 * Request Data Handling.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

use ArrayAccess;

/**
 * Class Form_Data_Request
 *
 * @since 2.0.0
 */
class Form_Data_Request {

	/**
	 * Request Data.
	 *
	 * @var array
	 * @since 2.0.0
	 */
	protected $request_data = array();

	/**
	 * Integration Data.
	 *
	 * @var Form_Settings_Data
	 * @since 2.0.0
	 */
	protected $form_options = null;

	/**
	 * Request.
	 *
	 * @var \WP_REST_Request
	 * @since 2.3
	 */
	protected $request = null;

	/**
	 * Form fields options.
	 *
	 * @var array
	 * @since 2.2.3
	 */
	protected $form_fields_options = array();

	/**
	 * Var indicate the use of another provider.
	 *
	 * @var bool|string
	 * @since 2.0.3
	 */
	protected $changed_provider = false;

	/**
	 * Attachments from form.
	 *
	 * @var array
	 * @since 2.2.3
	 */
	protected $uploaded_files_path = array();

	/**
	 * Keep uploaded files.
	 *
	 * @var bool
	 * @since 2.2.3
	 */
	protected $keep_uploaded_files = false;

	/**
	 * Files loaded to media library.
	 *
	 * @var array
	 * @since 2.2.3
	 */
	protected $files_loaded_to_media_library = array();

	/**
	 * Error code.
	 *
	 * @var string
	 * @since 2.2.3
	 */
	protected $error_code = null;

	/**
	 * Error details.
	 *
	 * @var string
	 * @since 2.2.3
	 */
	protected $error_details = null;

	/**
	 * A list of warning codes.
	 *
	 * @var array $warning_codes Warning codes.
	 * @since 2.2.5
	 */
	protected $warning_codes = array();

	/**
	 * Constructor.
	 *
	 * @access  public
	 * @param \WP_REST_Request|mixed $request Request Data.
	 * @since 2.0.3
	 */
	public function __construct( $request = null ) {

		if ( ! is_a( $request, 'WP_REST_Request' ) ) {
			return;
		}

		$this->request = $request;
		$form_data     = $request->get_param( 'form_data' );

		$form_data = json_decode( $form_data, true );

		$this->request_data = $this->sanitize_request_data( $form_data );
		$this->form_options = new Form_Settings_Data( array() );
	}

	/**
	 * Set the form options.
	 *
	 * @param Form_Settings_Data $form_options The form option.
	 * @return void
	 * @since 2.0.3
	 */
	public function set_form_options( $form_options ) {
		$this->form_options = $form_options;
	}

	/**
	 * Get the value of the field from the request.
	 *
	 * @param string $field_name The name of the field.
	 * @return mixed
	 * @since 2.0.3
	 */
	public function get( $field_name ) {
		return $this->is_set( $field_name ) ? $this->request_data[ $field_name ] : null;
	}

	/**
	 * Get the field value.
	 *
	 * @param string $field_name The name of the field.
	 * @return mixed|null
	 * @since 2.0.3
	 */
	public function get_payload_field( $field_name ) {
		return $this->payload_has_field( $field_name ) ? $this->request_data['payload'][ $field_name ] : null;
	}

	/**
	 * Check if the payload has the field.
	 *
	 * @param string $field_name The name of the field.
	 * @return bool
	 * @since 2.0.3
	 */
	public function payload_has_field( $field_name ) {
		return $this->has_payload() && isset( $this->request_data['payload'][ $field_name ] );
	}

	/**
	 * Check if the payload is set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_payload() {
		return isset( $this->request_data['payload'] );
	}

	/**
	 * Change the provider.
	 *
	 * @param string $provider The new provider.
	 * @return void
	 * @since 2.0.3
	 */
	public function change_provider( $provider ) {
		$this->changed_provider = $provider;
	}

	/**
	 * Check if the value of the field is set.
	 *
	 * @param string $field_name The name of the field.
	 * @return boolean
	 * @since 2.0.0
	 */
	public function is_set( $field_name ) {
		// TODO: we can do a more refined verification like checking for empty strings or arrays.
		return isset( $this->request_data[ $field_name ] );
	}

	/**
	 * Check if the given fields are set.
	 *
	 * @param array $fields_name The name of the fields.
	 * @return boolean
	 * @since 2.0.0
	 */
	public function are_fields_set( $fields_name ) {
		foreach ( $fields_name as $field_name ) {
			if ( ! isset( $this->request_data[ $field_name ] ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Check if the given fields are set.
	 *
	 * @param array $fields_name The name of the fields.
	 * @return boolean
	 * @since 2.0.3
	 */
	public function are_payload_fields_set( $fields_name ) {
		foreach ( $fields_name as $field_name ) {
			if ( ! isset( $this->request_data['payload'][ $field_name ] ) || '' === $this->request_data['payload'][ $field_name ] ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Check if the payload has the given fields.
	 *
	 * @param array $fields_name The name of the fields.
	 * @return bool
	 * @since 2.0.3
	 */
	public function payload_has_fields( $fields_name ) {
		foreach ( $fields_name as $field_name ) {
			if ( ! $this->payload_has_field( $field_name ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Check if the field has one of the given values.
	 *
	 * @param string $field_name The name of the field.
	 * @param array  $values The desired values of the field.
	 * @return boolean
	 * @since 2.0.0
	 */
	public function field_has( $field_name, $values ) {
		return in_array( $this->get( $field_name ), $values, true );
	}

	/**
	 * Check if a field has the given values.
	 *
	 * @param string $field_name The field name.
	 * @param array  $values The values.
	 * @return bool
	 * @since 2.0.3
	 */
	public function payload_field_has( $field_name, $values ) {
		return in_array( $this->get_payload_field( $field_name ), $values, true );
	}

	/**
	 * Sanitize the request data.
	 *
	 * @param array $data The data from the request.
	 * @return array Sanitized field data.
	 * @since 2.0.0
	 */
	public static function sanitize_request_data( $data ) {
		return self::sanitize_array_map_deep( $data );
	}

	/**
	 * Sanitize the given array.
	 *
	 * @param array|string $array The array with the values.
	 * @return array|string
	 * @since 2.0.3
	 */
	public static function sanitize_array_map_deep( $array ) {
		$new = array();
		if ( is_array( $array ) ) {
			foreach ( $array as $key => $val ) {
				if ( is_array( $val ) ) {
					$new[ $key ] = self::sanitize_array_map_deep( $val );
				} else {
					$new[ $key ] = sanitize_text_field( $val );
				}
			}
		} else {
			$new = sanitize_text_field( $array );
		}
		return $new;
	}

	/**
	 * Get the form input data.
	 *
	 * @return mixed Form input data.
	 * @since 2.0.0
	 */
	public function get_form_inputs() {
		return $this->get_payload_field( 'formInputsData' );
	}

	/**
	 * Get the form options.
	 *
	 * @return Form_Settings_Data|null
	 * @since 2.0.0
	 */
	public function get_form_options() {
		return $this->form_options;
	}

	/**
	 * Check if we have loaded attachments.
	 *
	 * @return bool
	 */
	public function has_uploaded_files() {
		return count( $this->uploaded_files_path ) > 0;
	}

	/**
	 * Get the attachments.
	 *
	 * @return array
	 */
	public function get_uploaded_files_path() {
		return $this->uploaded_files_path;
	}

	/**
	 * Set the attachments.
	 *
	 * @param array $uploaded_files_path The attachments.
	 * @return void
	 */
	public function set_uploaded_files_path( $uploaded_files_path ) {
		if ( is_array( $uploaded_files_path ) ) {
			$this->uploaded_files_path = $uploaded_files_path;
		}
	}

	/**
	 * Check if we should keep the uploaded files.
	 *
	 * @return bool
	 * @since 2.2.3
	 */
	public function can_keep_uploaded_files() {
		return $this->keep_uploaded_files;
	}

	/**
	 * Set if we should keep the uploaded files.
	 *
	 * @param bool $keep_uploaded_files True if we should keep the uploaded files.
	 * @return void
	 * @since 2.2.3
	 */
	public function set_keep_uploaded_files( $keep_uploaded_files ) {
		$this->keep_uploaded_files = $keep_uploaded_files;
	}

	/**
	 * Check if we have loaded files to media library.
	 *
	 * @return bool
	 * @since 2.2.3
	 */
	public function has_files_loaded_to_media_library() {
		return count( $this->files_loaded_to_media_library ) > 0;
	}

	/**
	 * Get the files loaded to media library.
	 *
	 * @return array
	 * @since 2.2.3
	 */
	public function get_files_loaded_to_media_library() {
		return $this->files_loaded_to_media_library;
	}

	/**
	 * Set the files loaded to media library.
	 *
	 * @param array $files_loaded_to_media_library The files loaded to media library.
	 * @return void
	 * @since 2.2.3
	 */
	public function set_files_loaded_to_media_library( $files_loaded_to_media_library ) {
		$this->files_loaded_to_media_library = $files_loaded_to_media_library;
	}

	/**
	 * Check if we have an error.
	 *
	 * @return bool
	 * @since 2.2.3
	 */
	public function has_error() {
		return ! empty( $this->error_code );
	}

	/**
	 * Get the error code.
	 *
	 * @return string
	 * @since 2.2.3
	 */
	public function get_error_code() {
		return $this->error_code;
	}

	/**
	 * Get the error details.
	 *
	 * @return string
	 * @since 2.2.3
	 */
	public function get_error_details() {
		return $this->error_details;
	}

	/**
	 * Set the error.
	 *
	 * @param string $error_code The error code.
	 * @param string $error_details The error details.
	 * @return void
	 * @since 2.2.3
	 */
	public function set_error( $error_code, $error_details = null ) {
		$this->error_code    = $error_code;
		$this->error_details = $error_details;
	}

	/**
	 * Get the first email from the input's form.
	 *
	 * @return mixed|string
	 * @since 2.2.3
	 */
	public function get_email_from_form_input() {
		$inputs = $this->get_form_inputs();
		if ( is_array( $inputs ) ) {
			foreach ( $inputs as $input_field ) {
				if ( 'email' == $input_field['type'] ) {
					return $input_field['value'];
				}
			}
		}
		return '';
	}

	/**
	 * Add a field option.
	 *
	 * @param Form_Field_Option_Data $field_option The field option.
	 * @return void
	 */
	public function add_field_option( $field_option ) {
		if ( $field_option instanceof Form_Field_Option_Data ) {
			if ( empty( $this->form_fields_options ) ) {
				$this->form_fields_options = array();
			}

			$this->form_fields_options[ $field_option->get_name() ] = $field_option;
		}
	}

	/**
	 * Remove a field option.
	 *
	 * @param string $field_option_name The field option name.
	 * @return void
	 */
	public function remove_field_option( $field_option_name ) {
		if ( isset( $this->form_fields_options[ $field_option_name ] ) ) {
			unset( $this->form_fields_options[ $field_option_name ] );
		}
	}

	/**
	 * Get the field options.
	 *
	 * @return array
	 */
	public function get_field_options() {
		return $this->form_fields_options;
	}

	/**
	 * Get the field option.
	 *
	 * @param string $field_option_name The field option name.
	 * @return Form_Field_Option_Data|null
	 */
	public function get_field_option( $field_option_name ) {
		if ( isset( $this->form_fields_options[ $field_option_name ] ) ) {
			return $this->form_fields_options[ $field_option_name ];
		}
		return null;
	}

	/**
	 * Check if we have a field option.
	 *
	 * @param string $field_option_name The field option name.
	 * @return bool
	 */
	public function has_field_option( $field_option_name ) {
		return isset( $this->form_fields_options[ $field_option_name ] );
	}

	/**
	 * Add a warning code.
	 *
	 * @param string $code The code.
	 * @param string $details The details.
	 * @return void
	 */
	public function add_warning( $code, $details = null ) {
		$this->warning_codes[] = array(
			'code'    => $code,
			'details' => $details,
		);
	}

	/**
	 * Get the warning codes.
	 *
	 * @return array
	 */
	public function get_warning_codes() {
		return $this->warning_codes;
	}

	/**
	 * Check if we have warning codes.
	 *
	 * @return bool
	 */
	public function has_warning() {
		return count( $this->warning_codes ) > 0;
	}

	/**
	 * Check if we have ONE of the given warning codes.
	 *
	 * @param array $codes The codes.
	 * @return bool
	 */
	public function has_warning_codes( $codes ) {
		foreach ( $this->warning_codes as $warning_code ) {
			if ( in_array( $warning_code['code'], $codes ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Get the form option id.
	 *
	 * @return mixed|string|null
	 */
	public function get_form_option_id() {
		return $this->get_payload_field( 'formOption' );
	}

	/**
	 * The API Request.
	 *
	 * @return \WP_REST_Request|null
	 */
	public function get_request() {
		return $this->request;
	}
}
