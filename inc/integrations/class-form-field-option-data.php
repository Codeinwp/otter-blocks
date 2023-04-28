<?php
/**
 * Request Data Handling.
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Class Form_Field_Option_Data
 *
 * @package ThemeIsle\GutenbergBlocks\Integration
 * @since 2.2.3
 */
class Form_Field_Option_Data {

	/**
	 * The name of the field option.
	 *
	 * @var string
	 */
	protected $field_option_name = '';

	/**
	 * The type of the field option.
	 *
	 * @var string
	 */
	protected $field_option_type = '';

	/**
	 * The options of the field option.
	 *
	 * @var array
	 */
	protected $options = array();

	/**
	 * Form_Field_Option_Data constructor.
	 *
	 * @param string $field_option_name The name of the field option.
	 * @param string $field_option_type The type of the field option.
	 * @param array  $options The options of the field option.
	 */
	public function __construct( $field_option_name = '', $field_option_type = '', $options = array() ) {
		$this->field_option_name = $field_option_name;
		$this->field_option_type = $field_option_type;
		$this->options           = $options;
	}

	/**
	 * Get the name of the field option.
	 *
	 * @return string
	 */
	public function get_name() {
		return $this->field_option_name;
	}

	/**
	 * Get the type of the field option.
	 *
	 * @return string
	 */
	public function get_type() {
		return $this->field_option_type;
	}

	/**
	 * Get the options of the field option.
	 *
	 * @return array
	 */
	public function get_options() {
		return $this->options;
	}

	/**
	 * Get the option of the field option.
	 *
	 * @param string $option_name The name of the option.
	 * @return mixed|null
	 */
	public function get_option( $option_name ) {

		if ( ! $this->has_option( $option_name ) ) {
			return null;
		}

		return $this->options[ $option_name ];
	}

	/**
	 * Set the option of the field option.
	 *
	 * @param string $option_name The name of the option.
	 * @param mixed  $option_value The value of the option.
	 */
	public function set_option( $option_name, $option_value ) {
		$this->options[ $option_name ] = $option_value;
	}

	/**
	 * Set the options of the field option.
	 *
	 * @param array $options The options of the field option.
	 */
	public function set_options( $options ) {
		$this->options = $options;
	}

	/**
	 * Set the type of the field option.
	 *
	 * @param string $field_option_type The type of the field option.
	 */
	public function set_type( $field_option_type ) {
		$this->field_option_type = $field_option_type;
	}

	/**
	 * Set the name of the field option.
	 *
	 * @param string $field_option_name The name of the field option.
	 */
	public function set_name( $field_option_name ) {
		$this->field_option_name = $field_option_name;
	}

	/**
	 * Check if the field option has the option.
	 *
	 * @param string $option_name The name of the option.
	 * @return bool
	 */
	public function has_option( $option_name ) {
		return isset( $this->options[ $option_name ] );
	}

	/**
	 * Check if the field option has options.
	 *
	 * @return bool
	 */
	public function has_options() {
		return ! empty( $this->options );
	}

	/**
	 * Check if the field option has type.
	 *
	 * @return bool
	 */
	public function has_type() {
		return ! empty( $this->field_option_type );
	}

	/**
	 * Check if the field option has name.
	 *
	 * @return bool
	 */
	public function has_name() {
		return ! empty( $this->field_option_name );
	}
}
