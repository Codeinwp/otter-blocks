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
			array(
				'slug'    => 'hero-area-with-button',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'content-with-progress-bars',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'text-with-image-columns',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'large-quote',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'image-and-text-over-dark-background',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'contact-details-and-form',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'call-to-action',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'testimonial-columns',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'testimonial-with-inline-image',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'centered-testimonial-with-star-icons',
				'minimum' => 5.9,
			),
			array(
				'slug'    => 'cover-boxes-with-title-and-button',
				'minimum' => 5.9,
			),
			array(
				'slug'    => 'columns-with-image-features',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'team-members',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'columns-with-icon-features',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'columns-with-flip-boxes',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'icons-and-text',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'gallery',
				'minimum' => 5.9,
			),
			array(
				'slug'    => 'border-icon-features',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'border-pricing-table',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'countdown',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'service-boxes-on-dark-background',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'content-with-features',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'author-box',
				'minimum' => 5.8,
			),
		);
	
		/**
		 * Filters,
		 *), the theme block patterns.
		 *
		 * @since Twenty Twenty-Two 1.0
		 *
		 * @param array $block_patterns List of block patterns by name.
		 */
		$block_patterns = apply_filters( 'otter_blocks_block_patterns', $block_patterns );
	
		foreach ( $block_patterns as $block_pattern ) {
			if ( ! version_compare( get_bloginfo( 'version' ), $block_pattern['minimum'], '>=' ) ) {
				continue;
			}

			$pattern_file = OTTER_BLOCKS_PATH . '/inc/patterns/' . $block_pattern['slug'] . '.php';
	
			register_block_pattern(
				'otter-blocks/' . $block_pattern['slug'],
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
