<?php
/**
 * Block Patterns.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

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
		add_action( 'init', array( $this, 'register_patterns' ) );
	}

	/**
	 * Register Patterns
	 *
	 * @access  public
	 */
	public static function register_patterns() {
		$block_pattern_categories = array(
			'otter-blocks' => array( 'label' => __( 'Otter Blocks', 'otter-blocks' ) ),
			'cta'          => array( 'label' => __( 'Call to Action', 'otter-blocks' ) ),
			'team'         => array( 'label' => __( 'Team', 'otter-blocks' ) ),
			'pricing'      => array( 'label' => __( 'Pricing', 'otter-blocks' ) ),
			'testimonials' => array( 'label' => __( 'Testimonials', 'otter-blocks' ) ),
		);
	
		foreach ( $block_pattern_categories as $name => $properties ) {
			if ( ! \WP_Block_Pattern_Categories_Registry::get_instance()->is_registered( $name ) ) {
				register_block_pattern_category( $name, $properties );
			}
		}

		$block_patterns = array(
			'hero-area-with-button',
			'content-with-progress-bars',
			'text-with-image-columns',
			'large-quote',
			'image-and-text-over-dark-background',
			'contact-details-and-form',
			'call-to-action',
			'testimonial-columns',
			'testimonial-with-inline-image',
			'centered-testimonial-with-star-icons',
			'cover-boxes-with-title-and-button',
			'columns-with-image-features',
			'team-members',
			'columns-with-icon-features',
			'columns-with-flip-boxes',
			'icons-and-text',
			'gallery',
			'border-icon-features',
			'border-pricing-table',
			'countdown',
			'service-boxes-on-dark-background',
			'content-with-features',
			'author-box',
		);
	
		/**
		 * Filters the theme block patterns.
		 *
		 * @since Twenty Twenty-Two 1.0
		 *
		 * @param array $block_patterns List of block patterns by name.
		 */
		$block_patterns = apply_filters( 'otter_blocks_block_patterns', $block_patterns );
	
		foreach ( $block_patterns as $block_pattern ) {
			$pattern_file = OTTER_BLOCKS_PATH . '/inc/patterns/' . $block_pattern . '.php';
	
			register_block_pattern(
				'otter-blocks/' . $block_pattern,
				require $pattern_file
			);
		}
	}

	/**
	 * Singleton method.
	 *
	 * @static
	 *
	 * @return  GutenbergBlocks
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
