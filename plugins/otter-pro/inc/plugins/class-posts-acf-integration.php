<?php
/**
 * Posts Block ACF Integration.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Class Posts_ACF_Integration
 */
class Posts_ACF_Integration {

	/**
	 * The main instance var.
	 *
	 * @var Posts_ACF_Integration
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( License::has_active_license() ) {
			add_filter( 'otter_blocks_posts_fields', array( $this, 'render_acf_fields' ), 10, 4 );
		}
	}

	/**
	 * Render ACT Fields
	 * 
	 * @param string $data HTML structure of the block.
	 * @param array  $attributes Block Attributes.
	 * @param bool   $id Post ID.
	 * @param string $element Element slug.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function render_acf_fields( $data, $attributes, $id, $element ) {
		if ( 'custom_' !== substr( $element, 0, 7 ) || ! isset( $attributes['customMetas'] ) ) {
			return $data;
		}

		$custom_meta_field = null;

		foreach ( $attributes['customMetas'] as $meta_field ) {
			if ( $meta_field['id'] === $element ) {
				$custom_meta_field = $meta_field;
				break;
			}
		}

		if ( ( ! isset( $custom_meta_field['display'] ) || true === $custom_meta_field['display'] ) && isset( $custom_meta_field['field'] ) && function_exists( 'get_field_object' ) ) {
			$field = get_field_object( $custom_meta_field['field'], $id );
			if ( isset( $field ) ) {
				$data .= '<div class="o-posts-custom-field">';
				if ( isset( $field['prepend'] ) ) {
					$data .= esc_html( $field['prepend'] );
				}

				if ( isset( $field['value'] ) ) {
					$data .= esc_html( $field['value'] );
				} elseif ( isset( $field['default_value'] ) ) {
					$data .= esc_html( $field['default_value'] );
				}

				if ( isset( $field['append'] ) ) {
					$data .= esc_html( $field['append'] );
				}
				$data .= '</div>';
			}
		}

		return $data;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.1
	 * @access public
	 * @return Posts_ACF_Integration
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 2.0.1
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 2.0.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
