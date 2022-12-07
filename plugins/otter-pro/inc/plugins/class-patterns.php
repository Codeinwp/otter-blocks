<?php
/**
 * Block Patterns.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Class Patterns
 */
class Patterns {
	/**
	 * Singleton.
	 *
	 * @var Patterns Class object.
	 */
	protected static $instance = null;

	/**
	 * Method to define hooks needed.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init() {
		if ( License::has_active_license() ) {
			add_action( 'init', array( $this, 'register_patterns' ) );
		}
	}

	/**
	 * Register Patterns
	 *
	 * @access  public
	 */
	public static function register_patterns() {
		$block_patterns = array(
			array(
				'slug'    => 'columns-with-numbered-features',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'two-rows-with-text-and-images',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'text-with-gallery',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'two-columns-of-text-and-wide-images',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'call-to-action-with-a-light-box',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'three-pricing-columns-with-shadow',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'four-columns-with-numbers-and-text-over-dark-background',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'pricing-with-a-single-plan',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'product-review-over-dark-background',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'contact-form-with-text-and-image-on-two-columns',
				'minimum' => 5.8,
			),
		);

		foreach ( $block_patterns as $block_pattern ) {
			if ( ! version_compare( get_bloginfo( 'version' ), $block_pattern['minimum'], '>=' ) ) {
				continue;
			}

			$pattern_file = OTTER_PRO_PATH . '/inc/patterns/' . $block_pattern['slug'] . '.php';
	
			register_block_pattern(
				'otter-pro/' . $block_pattern['slug'],
				require $pattern_file
			);
		}
	}

	/**
	 * Singleton method.
	 *
	 * @static
	 *
	 * @return  Patterns
	 * @since   2.0.3
	 * @access  public
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
	 * @access  public
	 * @return  void
	 * @since   2.0.3
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access  public
	 * @return  void
	 * @since   2.0.3
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}
}
