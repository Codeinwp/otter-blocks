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
	 * Endpoint serving the Pro pattern previews.
	 *
	 * @var string
	 */
	const UPSELLS_ENDPOINT = 'https://api.themeisle.com/templates-cloud/otter-patterns-preview';

	/**
	 * Transient holding the fetched upsell preview manifest.
	 *
	 * @var string
	 */
	const UPSELLS_CACHE_KEY = 'otter_blocks_pro_patterns_preview_v1';

	/**
	 * Method to define hooks needed.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_patterns' ) );

		if ( is_admin() ) {
			add_action( 'init', array( $this, 'maybe_sync_upsell_patterns' ) );
		}
	}

	/**
	 * Register Patterns
	 *
	 * @access  public
	 */
	public function register_patterns() {
		$block_pattern_categories = array(
			'otter-blocks'      => array( 'label' => __( 'Otter Blocks', 'otter-blocks' ) ),

			// Layout & Structure.
			'header'            => array( 'label' => __( 'Hero', 'otter-blocks' ) ),

			// Content.
			'features'          => array( 'label' => __( 'Features', 'otter-blocks' ) ),
			'gallery'           => array( 'label' => __( 'Gallery', 'otter-blocks' ) ),
			'team'              => array( 'label' => __( 'Team', 'otter-blocks' ) ),
			'text'              => array( 'label' => __( 'Text', 'otter-blocks' ) ),
			'blog'              => array( 'label' => __( 'Blog / News', 'otter-blocks' ) ),
			'faq'               => array( 'label' => __( 'FAQ', 'otter-blocks' ) ),
			'timeline'          => array( 'label' => __( 'Timeline', 'otter-blocks' ) ),
			'portfolio'         => array( 'label' => __( 'Portfolio & Case Studies', 'otter-blocks' ) ),

			// Conversion.
			'call-to-action'    => array( 'label' => __( 'Call to Action', 'otter-blocks' ) ),
			'forms'             => array( 'label' => __( 'Forms', 'otter-blocks' ) ),
			'pricing'           => array( 'label' => __( 'Pricing', 'otter-blocks' ) ),
			'contact'           => array( 'label' => __( 'Contact', 'otter-blocks' ) ),
			'newsletter'        => array( 'label' => __( 'Newsletter', 'otter-blocks' ) ),
			'waitlist'          => array( 'label' => __( 'Waitlist / Coming Soon', 'otter-blocks' ) ),

			// Social Proof.
			'testimonials'      => array( 'label' => __( 'Testimonials', 'otter-blocks' ) ),
			'stats'             => array( 'label' => __( 'Stats', 'otter-blocks' ) ),

			// Media.
			'video'             => array( 'label' => __( 'Video', 'otter-blocks' ) ),
			'icons'             => array( 'label' => __( 'Icons & Illustrations', 'otter-blocks' ) ),

			// Page collections.
			'pages'             => array( 'label' => __( 'Pages', 'otter-blocks' ) ),
			'architecture-pack' => array( 'label' => __( 'Architecture Pack (Pages)', 'otter-blocks' ) ),
			'brewery-pack'      => array( 'label' => __( 'Brewery Pack (Pages)', 'otter-blocks' ) ),
			'business-pack'     => array( 'label' => __( 'Business Pack (Pages)', 'otter-blocks' ) ),
			'cafe-pack'         => array( 'label' => __( 'Cafe Pack (Pages)', 'otter-blocks' ) ),
			'climbing-pack'     => array( 'label' => __( 'Climbing Gym Pack (Pages)', 'otter-blocks' ) ),
			'dining-pack'       => array( 'label' => __( 'Fine Dining Pack (Pages)', 'otter-blocks' ) ),
			'fashion-pack'      => array( 'label' => __( 'Fashion Pack (Pages)', 'otter-blocks' ) ),
			'festival-pack'     => array( 'label' => __( 'Festival Pack (Pages)', 'otter-blocks' ) ),
			'fitness-pack'      => array( 'label' => __( 'Fitness Pack (Pages)', 'otter-blocks' ) ),
			'outdoor-pack'      => array( 'label' => __( 'Outdoor Pack (Pages)', 'otter-blocks' ) ),
			'photography-pack'  => array( 'label' => __( 'Photography Pack (Pages)', 'otter-blocks' ) ),
			'tattoo-pack'       => array( 'label' => __( 'Tattoo Studio Pack (Pages)', 'otter-blocks' ) ),
			'travel-pack'       => array( 'label' => __( 'Travel Pack (Pages)', 'otter-blocks' ) ),
			'vinyl-pack'        => array( 'label' => __( 'Record Shop Pack (Pages)', 'otter-blocks' ) ),
			'wellness-pack'     => array( 'label' => __( 'Wellness Pack (Pages)', 'otter-blocks' ) ),
		);

		$block_pattern_categories = apply_filters( 'otter_blocks_block_pattern_categories', $block_pattern_categories );

		foreach ( $block_pattern_categories as $name => $properties ) {
			if ( ! \WP_Block_Pattern_Categories_Registry::get_instance()->is_registered( $name ) ) {
				register_block_pattern_category( $name, $properties );
			}
		}

		// Patterns are ordered so that visually-similar styles sit next to each other.
		// When the library lists everything under "All", these clumps keep matching
		// looks together: the Atomic Wind set, the general sections, then each
		// cross-cutting style family (Gradient Bold / Neon Spotlight / Mesh /
		// Poster / Glass / Editorial), and finally the page packs.
		$block_patterns = array(
			// Atomic Wind (aw-*) blocks.
			array(
				'slug'    => 'aw-cta-banner',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-testimonial-cards',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-pricing-tiers',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-hero-split',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-stats-banner',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-bento-features',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-feature-split',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-feature-cards',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-team-grid',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-faq-cards',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-glow-cta',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-hero-centered',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-quote-spotlight',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-gallery-grid',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-blog-cards',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-timeline-steps',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-portfolio-grid',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-case-study-metrics',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-review-stars',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-icon-grid',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'aw-video-feature',
				'minimum' => 5.8,
			),
			// General sections (default styling).
			array(
				'slug'    => 'bold-image-hero',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'countdown-launch',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'contact-form-split',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'form-gradient-split',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'form-glow-card',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'pricing-columns',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'pricing-compare-simple',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'dark-cta-band',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'stats-row',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'newsletter-signup',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'newsletter-inline-bar',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'team-cards',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'content-checklist',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'maps-location',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'gallery-overlay-grid',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'gallery-feature-split',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'blog-featured-list',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'faq-two-column',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'faq-boxed-list',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'timeline-horizontal',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'portfolio-overlay-grid',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'video-hero-play',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'icon-feature-trio',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'icon-grid-bordered',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'waitlist-coming-soon',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'contact-info-cards',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'team-spotlight-lead',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'text-two-column-prose',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'text-lead-statement',
				'minimum' => 5.8,
			),
			// Page collections (full-page packs).
			array(
				'slug'    => 'cafe-homepage',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'cafe-menu',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'cafe-about',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'cafe-contact',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'travel-homepage',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'travel-tours',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'travel-about',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'travel-contact',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'wellness-homepage',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'wellness-classes',
				'minimum' => 5.8,
			),
			array(
				'slug'    => 'wellness-contact',
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
	 * Pro pattern upsell entries for the Design Library.
	 *
	 * @return array<int, array<string, mixed>> List of pattern entries.
	 */
	public static function get_upsell_patterns() {
		if ( Pro::is_pro_active() ) {
			return array();
		}

		$manifest = get_transient( self::UPSELLS_CACHE_KEY );

		if ( ! is_array( $manifest ) ) {
			return array();
		}

		return array_values(
			array_filter(
				array_map(
					function ( $pattern ) {
						if ( empty( $pattern['slug'] ) ) {
							return null;
						}

						$pattern['name']  = 'otter-blocks/' . $pattern['slug'];
						$pattern['isPro'] = true;

						return $pattern;
					},
					array_filter( $manifest, 'is_array' )
				)
			)
		);
	}

	/**
	 * Fetch the upsell preview manifest from the store if it isn't cached yet.
	 *
	 * Only reaches out when the cache is cold, so the editor doesn't make a
	 * blocking request on every load.
	 *
	 * @access public
	 * @return void
	 */
	public function maybe_sync_upsell_patterns() {
		if ( ! boolval( get_option( 'themeisle_blocks_settings_patterns_library', true ) ) ) {
			return;
		}

		if ( Pro::is_pro_active() ) {
			return;
		}

		if ( false !== get_transient( self::UPSELLS_CACHE_KEY ) ) {
			return;
		}

		$this->sync_upsell_patterns();
	}

	/**
	 * Fetch the upsell preview manifest from the store and cache it.
	 *
	 * @access public
	 * @return void
	 */
	public function sync_upsell_patterns() {
		$url = add_query_arg(
			array(
				'site_url'   => get_site_url(),
				'license_id' => apply_filters( 'product_otter_license_key', 'free' ),
				'cache'      => gmdate( 'u' ),
			),
			defined( 'OTTER_BLOCK_PATTERN_PREVIEWS_URL' ) ? OTTER_BLOCK_PATTERN_PREVIEWS_URL : self::UPSELLS_ENDPOINT
		);

		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			$response = vip_safe_wp_remote_get( esc_url_raw( $url ) );
		} else {
			$response = wp_remote_get( esc_url_raw( $url ) ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
		}

		$response = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! is_array( $response ) || isset( $response['message'] ) || 0 === count( $response ) ) {
			return;
		}

		set_transient( self::UPSELLS_CACHE_KEY, $response, WEEK_IN_SECONDS );
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
