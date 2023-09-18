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
class Form_Field_WP_Option_Data {

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
	 * The stripe data of the field option.
	 *
	 * @var array
	 */
	protected $stripe_product_info = array();

	/**
	 * Form_Field_Option_Data constructor.
	 *
	 * @param string $field_option_name The name of the field option.
	 * @param string $field_option_type The type of the field option.
	 */
	public function __construct( $field_option_name = '', $field_option_type = '' ) {
		$this->field_option_name = $field_option_name;
		$this->field_option_type = $field_option_type;
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
	 * Get the stripe data of the field option.
	 *
	 * @return array The stripe data of the field option:
	 *      [
	 *          'product' => (string) The ID of the product,
	 *          'price' => (string) The price ID of the product,
	 *          'quantity' => (int) The quantity of the product to order
	 *      ]
	 */
	public function get_stripe_product_info() {
		return $this->stripe_product_info;
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
	 * Set the stripe product data of the field option.
	 *
	 * @param array $stripe_product_info The stripe product data of the field option.
	 * @return void
	 */
	public function set_stripe_product_info( $stripe_product_info ) {
		if ( ! is_array( $stripe_product_info ) ) {
			return;
		}

		if ( ! isset( $stripe_product_info['product'] ) || ! isset( $stripe_product_info['price'] ) ) {
			return;
		}

		$this->stripe_product_info = $stripe_product_info;
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

	/**
	 * Check if the field option has stripe product data.
	 *
	 * @return bool
	 */
	public function has_stripe_product_info() {
		return ! empty( $this->stripe_product_info );
	}
}
