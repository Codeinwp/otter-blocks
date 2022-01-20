<?php
/**
 * Class for Export/Import logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Registration.
 */
class Registration {

	/**
	 * The main instance var.
	 *
	 * @var Registration
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( version_compare( floatval( get_bloginfo( 'version' ) ), '5.8', '>=' ) ) {
			add_filter( 'block_categories_all', array( $this, 'block_categories' ) );
		} else {
			add_filter( 'block_categories', array( $this, 'block_categories' ) );
		}

		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Register our custom block category.
	 *
	 * @param array $categories All categories.
	 *
	 * @return mixed
	 * @since   2.0.0
	 * @access public
	 * @link   https://wordpress.org/gutenberg/handbook/extensibility/extending-blocks/#managing-block-categories
	 */
	public function block_categories( $categories ) {
		return array_merge(
			$categories,
			array(
				array(
					'slug'  => 'themeisle-blocks',
					'title' => __( 'Otter', 'otter-blocks' ),
				),
				array(
					'slug'  => 'themeisle-woocommerce-blocks',
					'title' => __( 'WooCommerce Builder by Otter', 'otter-blocks' ),
				),
			)
		);
	}


	/**
	 * Register scripts for blocks.
	 *
	 * @since   2.0.0
	 * @access public
	 */
	public function enqueue_scripts() {
		// Handle Front:
		// Google Map
		// Leaflet Map - Also L is undefined error.
		// Section CSS file causing debugging errors.
		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/lottie.asset.php';

		wp_register_script(
			'lottie-player',
			OTTER_BLOCKS_URL . 'assets/lottie/lottie-player.min.js',
			[],
			$asset_file['version'],
			true
		);

		wp_script_add_data( 'lottie-player', 'async', true );

		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/slider.asset.php';

		wp_register_script(
			'glidejs',
			OTTER_BLOCKS_URL . 'assets/glide/glide.min.js',
			[],
			$asset_file['version'],
			true
		);

		wp_script_add_data( 'glidejs', 'async', true );

		wp_register_style(
			'glidejs-core',
			OTTER_BLOCKS_URL . 'assets/glide/glide.core.min.css',
			[],
			$asset_file['version']
		);

		wp_register_style(
			'glidejs-theme',
			OTTER_BLOCKS_URL . 'assets/glide/glide.theme.min.css',
			[],
			$asset_file['version']
		);

		if ( ! is_admin() ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/circle-counter.asset.php';

			wp_register_script(
				'otter-circle-counter',
				OTTER_BLOCKS_URL . 'build/blocks/circle-counter.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-circle-counter', 'defer', true );

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/countdown.asset.php';

			wp_register_script(
				'otter-countdown',
				OTTER_BLOCKS_URL . 'build/blocks/countdown.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-countdown', 'defer', true );

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/form.asset.php';

			wp_register_script(
				'otter-form',
				OTTER_BLOCKS_URL . 'build/blocks/form.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-form', 'defer', true );

			wp_localize_script(
				'otter-form',
				'themeisleGutenbergForm',
				array(
					'reRecaptchaSitekey' => get_option( 'themeisle_google_captcha_api_site_key' ),
				)
			);

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/lottie.asset.php';

			wp_register_script(
				'lottie-interactivity',
				OTTER_BLOCKS_URL . 'assets/lottie/lottie-interactivity.min.js',
				array( 'lottie-player' ),
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'lottie-interactivity', 'async', true );

			wp_register_script(
				'otter-lottie',
				OTTER_BLOCKS_URL . 'build/blocks/lottie.js',
				array_merge(
					$asset_file['dependencies'],
					array( 'lottie-player', 'lottie-interactivity' )
				),
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-lottie', 'defer', true );

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/slider.asset.php';

			wp_register_script(
				'otter-slider',
				OTTER_BLOCKS_URL . 'build/blocks/slider.js',
				array_merge(
					$asset_file['dependencies'],
					array( 'glidejs' )
				),
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-slider', 'async', true );

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/tabs.asset.php';

			wp_register_script(
				'otter-tabs',
				OTTER_BLOCKS_URL . 'build/blocks/tabs.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-tabs', 'defer', true );

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/popup.asset.php';

			wp_register_script(
				'otter-popup',
				OTTER_BLOCKS_URL . 'build/blocks/popup.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-popup', 'defer', true );

			wp_localize_script(
				'otter-popup',
				'themeisleGutenberg',
				array(
					'isPreview' => is_preview(),
				)
			);

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/progress-bar.asset.php';
	
			wp_register_script(
				'otter-progress-bar',
				OTTER_BLOCKS_URL . 'build/blocks/progress-bar.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-progress-bar', 'defer', true );
		}
	}

	/**
	 * Blocks Registration.
	 *
	 * @since   2.0.0
	 * @access  public
	 */
	public function register_blocks() {
		$dynamic_blocks = array(
			'about-author'              => '\ThemeIsle\GutenbergBlocks\Render\About_Author_Block',
			'add-to-cart-button'        => '\ThemeIsle\GutenbergBlocks\Render\Add_To_Cart_Button_Block',
			'form-nonce'                => '\ThemeIsle\GutenbergBlocks\Render\Form_Nonce_Block',
			'google-map'                => '\ThemeIsle\GutenbergBlocks\Render\Google_Map_Block',
			'leaflet-map'               => '\ThemeIsle\GutenbergBlocks\Render\Leaflet_Map_Block',
			'plugin-card'               => '\ThemeIsle\GutenbergBlocks\Render\Plugin_Card_Block',
			'posts-grid'                => '\ThemeIsle\GutenbergBlocks\Render\Posts_Grid_Block',
			'review'                    => '\ThemeIsle\GutenbergBlocks\Render\Review_Block',
			'review-comparison'         => '\ThemeIsle\GutenbergBlocks\Render\Review_Comparison_Block',
			'sharing-icons'             => '\ThemeIsle\GutenbergBlocks\Render\Sharing_Icons_Block',
			'woo-comparison'            => '\ThemeIsle\GutenbergBlocks\Render\Woo_Comparison_Block',
			'product-add-to-cart'       => '\ThemeIsle\GutenbergBlocks\Render\Product_Add_To_Cart_Block',
			'product-images'            => '\ThemeIsle\GutenbergBlocks\Render\Product_Images_Block',
			'product-meta'              => '\ThemeIsle\GutenbergBlocks\Render\Product_Meta_Block',
			'product-price'             => '\ThemeIsle\GutenbergBlocks\Render\Product_Price_Block',
			'product-rating'            => '\ThemeIsle\GutenbergBlocks\Render\Product_Rating_Block',
			'product-related-products'  => '\ThemeIsle\GutenbergBlocks\Render\Product_Related_Products_Block',
			'product-short-description' => '\ThemeIsle\GutenbergBlocks\Render\Product_Short_Description_Block',
			'product-stock'             => '\ThemeIsle\GutenbergBlocks\Render\Product_Stock_Block',
			'product-tabs'              => '\ThemeIsle\GutenbergBlocks\Render\Product_Tabs_Block',
			'product-title'             => '\ThemeIsle\GutenbergBlocks\Render\Product_Title_Block',
			'product-upsells'           => '\ThemeIsle\GutenbergBlocks\Render\Product_Upsells_Block',
		);

		$dependencies = array(
			'slider' => array( 'glidejs-core', 'glidejs-theme' ),
		);

		$blocks = array(
			'about-author',
			'accordion',
			'accordion-item',
			'add-to-cart-button',
			'advanced-column',
			'advanced-columns',
			'advanced-heading',
			'business-hours',
			'business-hours-item',
			'button',
			'button-group',
			'circle-counter',
			'countdown',
			'flip',
			'font-awesome-icons',
			'form',
			'form-input',
			'form-nonce',
			'form-textarea',
			'google-map',
			'icon-list',
			'icon-list-item',
			'leaflet-map',
			'lottie',
			'plugin-card',
			'popup',
			'posts-grid',
			'pricing',
			'product-add-to-cart',
			'product-images',
			'product-meta',
			'product-price',
			'product-rating',
			'product-related-products',
			'product-short-description',
			'product-stock',
			'product-tabs',
			'product-title',
			'product-upsells',
			'progress-bar',
			'review',
			'review-comparison',
			'service',
			'sharing-icons',
			'slider',
			'tabs',
			'tabs-item',
			'testimonials',
			'woo-comparison',
		);

		foreach ( $blocks as $block ) {
			$block_path    = OTTER_BLOCKS_PATH . '/build/blocks/' . $block;
			$metadata_file = trailingslashit( $block_path ) . 'block.json';
			$style         = trailingslashit( $block_path ) . 'style.css';
			$editor_style  = trailingslashit( $block_path ) . 'editor.css';

			if ( ! file_exists( $metadata_file ) ) {
				continue;
			}

			$metadata = [];

			if ( function_exists( 'wpcom_vip_file_get_contents' ) ) {
				$metadata = json_decode( wpcom_vip_file_get_contents( $metadata_file ), true );
			} else {
				$metadata = json_decode( file_get_contents( $metadata_file ), true ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
			}

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/blocks.asset.php';

			$deps = [];

			if ( isset( $dependencies[ $block ] ) ) {
				$deps = $dependencies[ $block ];
			}

			if ( file_exists( $editor_style ) && ! empty( $metadata['editorStyle'] ) ) {
				wp_register_style( 
					$metadata['editorStyle'],
					OTTER_BLOCKS_URL . 'build/blocks/' . $block . '/editor.css',
					$deps,
					$asset_file['version']
				);
			}

			if ( ! is_admin() && file_exists( $style ) && ! empty( $metadata['style'] ) ) {
				wp_register_style( 
					$metadata['style'],
					OTTER_BLOCKS_URL . 'build/blocks/' . $block . '/style.css',
					$deps,
					$asset_file['version']
				);
			}

			if ( ! is_array( $metadata ) || empty( $metadata['name'] ) ) {
				continue;
			}

			if ( isset( $dynamic_blocks[ $block ] ) ) {
				$classname = $dynamic_blocks[ $block ];
				$renderer  = new $classname();
		
				if ( method_exists( $renderer, 'render' ) ) {
					register_block_type_from_metadata(
						$metadata_file,
						array(
							'render_callback' => array( $renderer, 'render' ),
						) 
					);

					continue;
				}
			}

			register_block_type_from_metadata( $metadata_file );
		}
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Blocks_Export_Import
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
	 * @since 1.0.0
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
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
