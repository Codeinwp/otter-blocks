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
	 * @var Patterns|null Class object.
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
	public function register_patterns() {
		$block_pattern_categories = array(
			'otter-blocks'   => array( 'label' => __( 'Otter Blocks', 'otter-blocks' ) ),
			'business-pack'  => array( 'label' => __( 'Business Pack (Pages)', 'otter-blocks' ) ),
			'call-to-action' => array( 'label' => __( 'Call to Action', 'otter-blocks' ) ),
			'creator-pack'   => array( 'label' => __( 'Creator Pack (Pages)', 'otter-blocks' ) ),
			'fitness-pack'   => array( 'label' => __( 'Fitness Pack (Pages)', 'otter-blocks' ) ),
			'features'       => array( 'label' => __( 'Features', 'otter-blocks' ) ),
			'forms'          => array( 'label' => __( 'Forms', 'otter-blocks' ) ),
			'team'           => array( 'label' => __( 'Team', 'otter-blocks' ) ),
			'pages'          => array( 'label' => __( 'Pages', 'otter-blocks' ) ),
			'pricing'        => array( 'label' => __( 'Pricing', 'otter-blocks' ) ),
			'recipes-pack'   => array( 'label' => __( 'Recipes Pack (Pages)', 'otter-blocks' ) ),
			'testimonials'   => array( 'label' => __( 'Testimonials', 'otter-blocks' ) ),
		);

		$block_pattern_categories = apply_filters( 'otter_blocks_block_pattern_categories', $block_pattern_categories );
	
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
				'slug'    => 'call-to-action-1',
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
			array(
				'slug'    => 'call-to-action-2',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'call-to-action-3',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'call-to-action-4',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'call-to-action-5',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'call-to-action-6',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'call-to-action-7',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'hero-1',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'hero-2',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'form-1',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'form-2',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'form-3',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'form-4',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'pricing',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'team-1',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'team-2',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'testimonials-1',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'testimonials-2',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'testimonials-3',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'features-1',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'features-2',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'features-3',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'features-4',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'features-5',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'industrial-homepage',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'industrial-about',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'industrial-services',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'industrial-service',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'business-homepage',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'business-about',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'business-services',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'business-service',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'business-contact',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'fitness-homepage',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'fitness-about',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'fitness-groups',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'fitness-group',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'fitness-contact',
				'minimum' => 5.8,
			),
		);

		foreach ( $block_patterns as $block_pattern ) {
			if ( ! version_compare( get_bloginfo( 'version' ), strval( $block_pattern['minimum'] ), '>=' ) ) {
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
