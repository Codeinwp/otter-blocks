<?php
/**
 * Class for Export/Import logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

use ThemeIsle\GutenbergBlocks\Main, ThemeIsle\GutenbergBlocks\Pro;

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
	 * Flag to list all the blocks.
	 *
	 * @var array
	 */
	public static $blocks = array();

	/**
	 * Flag to list all the blocks dependencies.
	 *
	 * @var array
	 */
	public static $block_dependencies = array();

	/**
	 * Flag to mark that the scripts which have loaded.
	 *
	 * @var array
	 */
	public static $scripts_loaded = array(
		'circle-counter' => false,
		'countdown'      => false,
		'form'           => false,
		'google-map'     => false,
		'leaflet-map'    => false,
		'lottie'         => false,
		'slider'         => false,
		'sticky'         => false,
		'tabs'           => false,
		'popup'          => false,
		'progress-bar'   => false,
		'accordion'      => false,
	);

	/**
	 * Flag to mark that the styles which have loaded.
	 *
	 * @var array
	 */
	public static $styles_loaded = array();

	/**
	 * Flag to mark that the  FA has been loaded.
	 *
	 * @var bool $is_fa_loaded Is FA loaded?
	 */
	public static $is_fa_loaded = false;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_filter( 'block_categories_all', array( $this, 'block_categories' ), 11, 2 );
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'init', array( $this, 'init_amp_blocks' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_assets' ), 1 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) ); // Don't change the priority or else Blocks CSS will stop working.
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
		add_filter( 'render_block', array( $this, 'load_sticky' ), 900, 2 );
		add_filter( 'render_block', array( $this, 'subscribe_fa' ), 10, 2 );

		add_action(
			'wp_footer',
			static function () {
				if ( Registration::$is_fa_loaded ) {
					wp_enqueue_style( 'font-awesome-5' );
					wp_enqueue_style( 'font-awesome-4-shims' );
				}
			}
		);
	}

	/**
	 * Register our custom block category.
	 *
	 * @param array                   $categories All categories.
	 * @param WP_Block_Editor_Context $block_editor_context The current block editor context.
	 *
	 * @return mixed
	 * @since   2.0.0
	 * @access public
	 * @link   https://wordpress.org/gutenberg/handbook/extensibility/extending-blocks/#managing-block-categories
	 */
	public function block_categories( $categories, $block_editor_context ) {
		return array_merge(
			array(
				array(
					'slug'  => 'themeisle-blocks',
					'title' => __( 'Otter', 'otter-blocks' ),
				),
				array(
					'slug'  => 'themeisle-woocommerce-blocks',
					'title' => __( 'WooCommerce Builder by Otter', 'otter-blocks' ),
				),
			),
			$categories
		);
	}

	/**
	 * Get block metadata from file.
	 *
	 * @param string $metadata_file Metadata file link.
	 *
	 * @return mixed
	 * @since   2.0.0
	 * @access public
	 */
	public function get_metadata( $metadata_file ) {
		if ( ! file_exists( $metadata_file ) ) {
			return false;
		}

		$metadata = array();

		if ( function_exists( 'wpcom_vip_file_get_contents' ) ) {
			$metadata = json_decode( wpcom_vip_file_get_contents( $metadata_file ), true );
		} else {
			$metadata = json_decode( file_get_contents( $metadata_file ), true ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		}

		if ( ! is_array( $metadata ) || empty( $metadata['name'] ) ) {
			return false;
		}

		return $metadata;
	}

	/**
	 * Register scripts for blocks.
	 *
	 * @since   2.0.0
	 * @access public
	 */
	public function enqueue_assets() {
		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/blocks.asset.php';
		wp_register_style( 'font-awesome-5', OTTER_BLOCKS_URL . 'assets/fontawesome/css/all.min.css', [], $asset_file['version'] );
		wp_register_style( 'font-awesome-4-shims', OTTER_BLOCKS_URL . 'assets/fontawesome/css/v4-shims.min.css', [], $asset_file['version'] );

		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/leaflet-map.asset.php';
		wp_register_script( 'leaflet', OTTER_BLOCKS_URL . 'assets/leaflet/leaflet.js', [], $asset_file['version'], true );
		wp_script_add_data( 'leaflet', 'async', true );
		wp_register_script( 'leaflet-gesture-handling', OTTER_BLOCKS_URL . 'build/blocks/leaflet-gesture-handling.js', array( 'leaflet' ), $asset_file['version'], true );
		wp_script_add_data( 'leaflet-gesture-handling', 'defer', true );

		wp_register_style( 'leaflet', OTTER_BLOCKS_URL . 'assets/leaflet/leaflet.css', [], $asset_file['version'] );
		wp_style_add_data( 'leaflet', 'path', OTTER_BLOCKS_PATH . '/assets/leaflet/leaflet.css' );
		wp_register_style( 'leaflet-gesture-handling', OTTER_BLOCKS_URL . 'assets/leaflet/leaflet-gesture-handling.min.css', [], $asset_file['version'] );
		wp_style_add_data( 'leaflet-gesture-handling', 'path', OTTER_BLOCKS_PATH . '/assets/leaflet/leaflet-gesture-handling.min.css' );

		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/lottie.asset.php';
		wp_register_script( 'lottie-player', OTTER_BLOCKS_URL . 'assets/lottie/lottie-player.min.js', [], $asset_file['version'], true );
		wp_script_add_data( 'lottie-player', 'async', true );

		wp_register_script( 'dotlottie-player', OTTER_BLOCKS_URL . 'assets/lottie/dotlottie-player.min.js', [], $asset_file['version'], true );
		wp_script_add_data( 'dotlottie-player', 'async', true );

		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/slider.asset.php';
		wp_register_script( 'glidejs', OTTER_BLOCKS_URL . 'assets/glide/glide.min.js', [], $asset_file['version'], true );
		wp_script_add_data( 'glidejs', 'async', true );

		wp_register_style( 'glidejs-core', OTTER_BLOCKS_URL . 'assets/glide/glide.core.min.css', [], $asset_file['version'] );
		wp_style_add_data( 'glidejs-core', 'path', OTTER_BLOCKS_PATH . '/assets/glide/glide.core.min.css' );
		wp_register_style( 'glidejs-theme', OTTER_BLOCKS_URL . 'assets/glide/glide.theme.min.css', [], $asset_file['version'] );
		wp_style_add_data( 'glidejs-theme', 'path', OTTER_BLOCKS_PATH . '/assets/glide/glide.theme.min.css' );
	}

	/**
	 * Load Gutenberg blocks.
	 *
	 * @since   2.0.0
	 * @access  public
	 */
	public function enqueue_block_editor_assets() {
		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/blocks.asset.php';

		$current_screen = get_current_screen();

		if ( 'widgets' === $current_screen->base ) {
			if ( in_array( 'wp-edit-post', $asset_file['dependencies'] ) ) {
				unset( $asset_file['dependencies'][ array_search( 'wp-editor', $asset_file['dependencies'] ) ] );
				unset( $asset_file['dependencies'][ array_search( 'wp-edit-post', $asset_file['dependencies'] ) ] );
			}

			if ( class_exists( 'WooCommerce' ) ) {
				array_push( $asset_file['dependencies'], 'wc-blocks-data-store', 'wc-price-format' );
			}
		}

		wp_register_script( 'otter-vendor', OTTER_BLOCKS_URL . 'build/blocks/vendor.js', array( 'react', 'react-dom' ), $asset_file['version'], true );

		wp_enqueue_script(
			'otter-blocks',
			OTTER_BLOCKS_URL . 'build/blocks/blocks.js',
			array_merge(
				$asset_file['dependencies'],
				array( 'otter-vendor', 'glidejs', 'lottie-player', 'dotlottie-player' )
			),
			$asset_file['version'],
			true
		);

		wp_set_script_translations( 'otter-blocks', 'otter-blocks' );

		if ( defined( 'THEMEISLE_GUTENBERG_GOOGLE_MAPS_API' ) ) {
			$api = THEMEISLE_GUTENBERG_GOOGLE_MAPS_API;
		} else {
			$api = false;
		}

		global $wp_roles;

		wp_localize_script(
			'otter-blocks',
			'themeisleGutenberg',
			array(
				'hasNeve'                 => defined( 'NEVE_VERSION' ),
				'isCompatible'            => Main::is_compatible(),
				'hasPro'                  => Pro::is_pro_installed(),
				'isProActive'             => Pro::is_pro_active(),
				'upgradeLink'             => tsdk_utmify( Pro::get_url(), 'editor', Pro::get_reference() ),
				'should_show_upsell'      => Pro::should_show_upsell(),
				'assetsPath'              => OTTER_BLOCKS_URL . 'assets',
				'updatePath'              => admin_url( 'update-core.php' ),
				'optionsPath'             => admin_url( 'options-general.php?page=otter' ),
				'mapsAPI'                 => $api,
				'globalDefaults'          => json_decode( get_option( 'themeisle_blocks_settings_global_defaults', '{}' ) ),
				'themeDefaults'           => Main::get_global_defaults(),
				'imageSizes'              => function_exists( 'is_wpcom_vip' ) ? array( 'thumbnail', 'medium', 'medium_large', 'large' ) : get_intermediate_image_sizes(), // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.get_intermediate_image_sizes_get_intermediate_image_sizes
				'isWPVIP'                 => function_exists( 'is_wpcom_vip' ),
				'canTrack'                => 'yes' === get_option( 'otter_blocks_logger_flag', false ) ? true : false,
				'userRoles'               => $wp_roles->roles,
				'isBlockEditor'           => 'post' === $current_screen->base,
				'postTypes'               => get_post_types( [ 'public' => true ] ),
				'rootUrl'                 => get_site_url(),
				'restRoot'                => get_rest_url( null, 'otter/v1' ),
				'isPrettyPermalinks'      => boolval( get_option( 'permalink_structure' ) ),
				'showOnboarding'          => $this->show_onboarding(),
				'ratingScale'             => get_option( 'themeisle_blocks_settings_review_scale', false ),
				'hasModule'               => array(
					'blockConditions' => get_option( 'themeisle_blocks_settings_block_conditions', true ),
				),
				'isLegacyPre59'           => version_compare( get_bloginfo( 'version' ), '5.8.22', '<=' ),
				'isAncestorTypeAvailable' => version_compare( get_bloginfo( 'version' ), '5.9.22', '>=' ),
				'version'                 => OTTER_BLOCKS_VERSION,
				'showBFDeal'              => Pro::bf_deal(),
			)
		);

		wp_enqueue_style( 'otter-editor', OTTER_BLOCKS_URL . 'build/blocks/editor.css', array( 'wp-edit-blocks', 'font-awesome-5', 'font-awesome-4-shims' ), $asset_file['version'] );
	}

	/**
	 * Whether to show onboarding or not.
	 *
	 * @since   2.0.13
	 * @access  public
	 */
	public function show_onboarding() {
		$onboarding_option    = get_option( 'themeisle_blocks_settings_onboarding', true );
		$installed_thru_sdk   = get_option( 'themeisle_sdk_promotions_otter_installed', false );
		$otter_blocks_install = get_option( 'otter_blocks_install' );

		if ( defined( 'ENABLE_OTTER_PRO_DEV' ) ) {
			return false;
		}

		if ( ! $onboarding_option ) {
			return false;
		}

		if ( $installed_thru_sdk && $otter_blocks_install > strtotime( '-2 days' ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Load frontend assets for our blocks.
	 *
	 * @since   2.0.0
	 * @access  public
	 */
	public function enqueue_block_assets() {
		global $wp_query, $wp_registered_sidebars;

		if ( is_admin() ) {
			return;
		}

		if ( is_singular() ) {
			$this->enqueue_dependencies();
		} else {
			if ( ! is_null( $wp_query->posts ) && 0 < count( $wp_query->posts ) ) {
				$posts = wp_list_pluck( $wp_query->posts, 'ID' );

				foreach ( $posts as $post ) {
					$this->enqueue_dependencies( $post );
				}
			}
		}

		add_filter(
			'the_content',
			function ( $content ) {
				$this->enqueue_dependencies();

				return $content;
			}
		);

		$has_widgets = false;

		foreach ( $wp_registered_sidebars as $key => $sidebar ) {
			if ( is_active_sidebar( $key ) ) {
				$has_widgets = true;
				break;
			}
		}

		if ( $has_widgets ) {
			$this->enqueue_dependencies( 'widgets' );
		}

		if ( function_exists( 'get_block_templates' ) && function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() && current_theme_supports( 'block-templates' ) ) {
			$this->enqueue_dependencies( 'block-templates' );
		}
	}

	/**
	 * Handler which checks the blocks used and enqueue the assets which needs.
	 *
	 * @since   2.0.0
	 * @param null $post Current post.
	 * @access  public
	 */
	public function enqueue_dependencies( $post = null ) {
		$content = '';

		if ( 'widgets' === $post ) {
			$widgets = get_option( 'widget_block', array() );

			foreach ( $widgets as $widget ) {
				if ( is_array( $widget ) && isset( $widget['content'] ) ) {
					$content .= $widget['content'];
				}
			}

			$post = $content;
		} elseif ( 'block-templates' === $post ) {
			global $_wp_current_template_content;

			$slugs           = array();
			$template_blocks = parse_blocks( $_wp_current_template_content );

			foreach ( $template_blocks as $template_block ) {
				if ( 'core/template-part' === $template_block['blockName'] ) {
					$slugs[] = $template_block['attrs']['slug'];
				}
			}

			$templates_parts = get_block_templates( array( 'slugs__in' => $slugs ), 'wp_template_part' );

			foreach ( $templates_parts as $templates_part ) {
				if ( isset( $templates_part->content ) && in_array( $templates_part->slug, $slugs ) ) {
					$content .= $templates_part->content;
				}
			}

			$content .= $_wp_current_template_content;
			$post     = $content;
		} else {
			$content = get_the_content( null, false, $post );
		}

		$this->enqueue_block_styles( $post );

		if ( has_block( 'core/block', $post ) ) {
			$blocks = parse_blocks( $content );
			$blocks = array_filter(
				$blocks,
				function( $block ) {
					return 'core/block' === $block['blockName'] && isset( $block['attrs']['ref'] );
				}
			);

			foreach ( $blocks as $block ) {
				$this->enqueue_dependencies( $block['attrs']['ref'] );
			}
		}

		if ( ( function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) || is_admin() ) {
			return;
		}

		if ( ! self::$scripts_loaded['circle-counter'] && has_block( 'themeisle-blocks/circle-counter', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/circle-counter.asset.php';
			wp_register_script( 'otter-circle-counter', OTTER_BLOCKS_URL . 'build/blocks/circle-counter.js', $asset_file['dependencies'], $asset_file['version'], true );
			wp_script_add_data( 'otter-circle-counter', 'defer', true );
		}

		if ( ! self::$scripts_loaded['countdown'] && has_block( 'themeisle-blocks/countdown', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/countdown.asset.php';
			wp_register_script( 'otter-countdown', OTTER_BLOCKS_URL . 'build/blocks/countdown.js', $asset_file['dependencies'], $asset_file['version'], true );
			wp_script_add_data( 'otter-countdown', 'defer', true );

			$offset    = (float) get_option( 'gmt_offset' );
			$hours     = (int) $offset;
			$minutes   = ( $offset - $hours );
			$sign      = ( $offset < 0 ) ? '-' : '+';
			$abs_hour  = abs( $hours );
			$abs_mins  = abs( $minutes * 60 );
			$tz_offset = sprintf( '%s%02d:%02d', $sign, $abs_hour, $abs_mins );

			wp_localize_script(
				'otter-countdown',
				'themeisleGutenbergCountdown',
				array(
					'i18n'     => array(
						'second'  => __( 'Second', 'otter-blocks' ),
						'seconds' => __( 'Seconds', 'otter-blocks' ),
						'minute'  => __( 'Minute', 'otter-blocks' ),
						'minutes' => __( 'Minutes', 'otter-blocks' ),
						'hour'    => __( 'Hour', 'otter-blocks' ),
						'hours'   => __( 'Hours', 'otter-blocks' ),
						'day'     => __( 'Day', 'otter-blocks' ),
						'days'    => __( 'Days', 'otter-blocks' ),
					),
					'timezone' => $tz_offset,
				)
			);

			add_action(
				'wp_head',
				function() {
					echo '
						<style type="text/css" data-source="otter-blocks">
							[class*="o-countdown-trigger-on-end-"] {
								transition: opacity 1s ease;
							}

							[class*="o-countdown-trigger-on-end-"].o-cntdn-bhv-show, [class*="o-countdown-trigger-on-end-"].o-cntdn-bhv-hide:not(.o-cntdn-ready), [class*="o-countdown-trigger-on-end-"].o-cntdn-bhv-hide.o-cntdn-hide, [data-intv-start]:not(.o-cntdn-ready) {
								height: 0px !important;
								max-height: 0px !important;
								min-height: 0px !important;
								visibility: hidden;
								box-sizing: border-box;
								margin: 0px !important;
								padding: 0px !important;
								opacity: 0;
							}

							.wp-block-themeisle-blocks-countdown:not(.o-cntdn-ready) {
								visibility: hidden;
							}

							[class*="o-countdown-trigger-on-end-"].o-cntdn-bhv-show {
								opacity: 0;
							}
						</style>
				';
				}
			);
		}

		if ( ! self::$scripts_loaded['form'] && has_block( 'themeisle-blocks/form', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/form.asset.php';
			wp_register_script( 'otter-form', OTTER_BLOCKS_URL . 'build/blocks/form.js', $asset_file['dependencies'], $asset_file['version'], true );
			wp_script_add_data( 'otter-form', 'defer', true );

			wp_localize_script(
				'otter-form',
				'themeisleGutenbergForm',
				array(
					'reRecaptchaSitekey' => get_option( 'themeisle_google_captcha_api_site_key' ),
					'root'               => esc_url_raw( rest_url() ),
					'nonce'              => wp_create_nonce( 'wp_rest' ),
					'messages'           => array(
						'submission'         => __( 'Form submission from', 'otter-blocks' ),
						'captcha-not-loaded' => __( 'Captcha is not loaded. Please check your browser plugins to allow the Google reCaptcha.', 'otter-blocks' ),
						'check-captcha'      => __( 'Please check the captcha.', 'otter-blocks' ),
						'invalid-email'      => __( 'The email address is invalid!', 'otter-blocks' ),
						'already-registered' => __( 'The email was already registered!', 'otter-blocks' ),
						'try-again'          => __( 'Error. Something is wrong with the server! Try again later.', 'otter-blocks' ),
						'privacy'            => __( 'I have read and agreed the privacy statement.', 'otter-blocks' ),
					),
				)
			);
		}

		if ( ! self::$scripts_loaded['google-map'] && has_block( 'themeisle-blocks/google-map', $post ) ) {
			$apikey = get_option( 'themeisle_google_map_block_api_key' );

			// Don't output anything if there is no API key.
			if ( null !== $apikey && ! empty( $apikey ) ) {
				$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/maps.asset.php';
				wp_register_script( 'otter-google-map', OTTER_BLOCKS_URL . 'build/blocks/maps.js', $asset_file['dependencies'], $asset_file['version'], true );
				wp_script_add_data( 'otter-google-map', 'defer', true );
				wp_register_script( 'google-maps', 'https://maps.googleapis.com/maps/api/js?key=' . esc_attr( $apikey ) . '&libraries=places&callback=initMapScript', array( 'otter-google-map' ), '', true ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.NoExplicitVersion
				wp_script_add_data( 'google-maps', 'defer', true );
			}
		}

		if ( ! self::$scripts_loaded['leaflet-map'] && has_block( 'themeisle-blocks/leaflet-map', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/leaflet-map.asset.php';

			wp_register_script(
				'otter-leaflet',
				OTTER_BLOCKS_URL . 'build/blocks/leaflet-map.js',
				array_merge(
					$asset_file['dependencies'],
					array( 'leaflet', 'leaflet-gesture-handling' )
				),
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-leaflet', 'defer', true );
		}

		if ( ! self::$scripts_loaded['lottie'] && has_block( 'themeisle-blocks/lottie', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/lottie.asset.php';
			wp_register_script( 'lottie-interactivity', OTTER_BLOCKS_URL . 'assets/lottie/lottie-interactivity.min.js', array( 'lottie-player', 'dotlottie-player' ), $asset_file['version'], true );
			wp_script_add_data( 'lottie-interactivity', 'async', true );

			wp_register_script(
				'otter-lottie',
				OTTER_BLOCKS_URL . 'build/blocks/lottie.js',
				array_merge(
					$asset_file['dependencies'],
					array( 'lottie-player', 'dotlottie-player', 'lottie-interactivity' )
				),
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-lottie', 'defer', true );
		}

		if ( ! self::$scripts_loaded['slider'] && has_block( 'themeisle-blocks/slider', $post ) ) {
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
		}

		if ( ! self::$scripts_loaded['tabs'] && has_block( 'themeisle-blocks/tabs', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/tabs.asset.php';
			wp_register_script( 'otter-tabs', OTTER_BLOCKS_URL . 'build/blocks/tabs.js', $asset_file['dependencies'], $asset_file['version'], true );
			wp_script_add_data( 'otter-tabs', 'defer', true );
		}

		if ( ! self::$scripts_loaded['popup'] && has_block( 'themeisle-blocks/popup', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/popup.asset.php';
			wp_register_script( 'otter-popup', OTTER_BLOCKS_URL . 'build/blocks/popup.js', $asset_file['dependencies'], $asset_file['version'], true );
			wp_script_add_data( 'otter-popup', 'defer', true );

			wp_localize_script(
				'otter-popup',
				'themeisleGutenberg',
				array(
					'isPreview' => is_preview(),
				)
			);
		}

		if ( ! self::$scripts_loaded['progress-bar'] && has_block( 'themeisle-blocks/progress-bar', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/progress-bar.asset.php';
			wp_register_script( 'otter-progress-bar', OTTER_BLOCKS_URL . 'build/blocks/progress-bar.js', $asset_file['dependencies'], $asset_file['version'], true );
			wp_script_add_data( 'otter-progress-bar', 'defer', true );
		}

		if ( ! self::$scripts_loaded['accordion'] && has_block( 'themeisle-blocks/accordion', $post ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/accordion.asset.php';
			wp_register_script( 'otter-accordion', OTTER_BLOCKS_URL . 'build/blocks/accordion.js', $asset_file['dependencies'], $asset_file['version'], true );
			wp_script_add_data( 'otter-accordion', 'defer', true );
		}
	}

	/**
	 * Enqueue block styles.
	 *
	 * @since   2.0.0
	 * @param null $post Current post.
	 * @access  public
	 */
	public function enqueue_block_styles( $post ) {
		foreach ( self::$blocks as $block ) {
			if ( in_array( $block, self::$styles_loaded ) || ! has_block( 'themeisle-blocks/' . $block, $post ) ) {
				continue;
			}

			$block_path = OTTER_BLOCKS_PATH . '/build/blocks/' . $block;
			$style      = OTTER_BLOCKS_URL . 'build/blocks/' . $block . '/style.css';

			if ( ! file_exists( $block_path ) && defined( 'OTTER_PRO_BUILD_PATH' ) ) {
				$block_path = OTTER_PRO_BUILD_PATH . $block;
				$style      = OTTER_PRO_BUILD_URL . $block . '/style.css';
			}

			$metadata_file = trailingslashit( $block_path ) . 'block.json';
			$style_path    = trailingslashit( $block_path ) . 'style.css';

			$metadata = $this->get_metadata( $metadata_file );

			if ( false === $metadata ) {
				continue;
			}

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/blocks.asset.php';

			$deps = array();

			if ( isset( self::$block_dependencies[ $block ] ) ) {
				$deps = self::$block_dependencies[ $block ];
			}

			if ( file_exists( $style_path ) && ! empty( $metadata['style'] ) ) {
				wp_register_style(
					$metadata['style'],
					$style,
					$deps,
					$asset_file['version']
				);

				wp_style_add_data( $metadata['style'], 'path', $style_path );
			}

			array_push( self::$styles_loaded, $block );
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
			'about-author'  => '\ThemeIsle\GutenbergBlocks\Render\About_Author_Block',
			'form-nonce'    => '\ThemeIsle\GutenbergBlocks\Render\Form_Nonce_Block',
			'google-map'    => '\ThemeIsle\GutenbergBlocks\Render\Google_Map_Block',
			'leaflet-map'   => '\ThemeIsle\GutenbergBlocks\Render\Leaflet_Map_Block',
			'plugin-cards'  => '\ThemeIsle\GutenbergBlocks\Render\Plugin_Card_Block',
			'posts-grid'    => '\ThemeIsle\GutenbergBlocks\Render\Posts_Grid_Block',
			'review'        => '\ThemeIsle\GutenbergBlocks\Render\Review_Block',
			'sharing-icons' => '\ThemeIsle\GutenbergBlocks\Render\Sharing_Icons_Block',
		);

		$dynamic_blocks = apply_filters( 'otter_blocks_register_dynamic_blocks', $dynamic_blocks );

		self::$blocks = array(
			'about-author',
			'accordion',
			'accordion-item',
			'advanced-column',
			'advanced-columns',
			'advanced-heading',
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
			'plugin-cards',
			'popup',
			'posts-grid',
			'pricing',
			'progress-bar',
			'review',
			'service',
			'sharing-icons',
			'slider',
			'tabs',
			'tabs-item',
			'testimonials',
		);

		self::$blocks = apply_filters( 'otter_blocks_register_blocks', self::$blocks );

		$this->enqueue_assets();

		self::$block_dependencies = array(
			'leaflet-map' => array( 'leaflet', 'leaflet-gesture-handling' ),
			'slider'      => array( 'glidejs-core', 'glidejs-theme' ),
		);

		$local_dependencies = array_merge(
			self::$block_dependencies,
			array(
				'button-group'       => array( 'font-awesome-5', 'font-awesome-4-shims' ),
				'font-awesome-icons' => array( 'font-awesome-5', 'font-awesome-4-shims' ),
				'icon-list-item'     => array( 'font-awesome-5', 'font-awesome-4-shims' ),
				'plugin-cards'       => array( 'font-awesome-5', 'font-awesome-4-shims' ),
				'sharing-icons'      => array( 'font-awesome-5', 'font-awesome-4-shims' ),
			)
		);

		foreach ( self::$blocks as $block ) {
			$block_path   = OTTER_BLOCKS_PATH . '/build/blocks/' . $block;
			$editor_style = OTTER_BLOCKS_URL . 'build/blocks/' . $block . '/editor.css';

			if ( ! file_exists( $block_path ) && defined( 'OTTER_PRO_BUILD_PATH' ) ) {
				$block_path   = OTTER_PRO_BUILD_PATH . $block;
				$editor_style = OTTER_PRO_BUILD_URL . $block . '/editor.css';
			}

			$metadata_file     = trailingslashit( $block_path ) . 'block.json';
			$editor_style_path = trailingslashit( $block_path ) . 'editor.css';

			$metadata = $this->get_metadata( $metadata_file );

			if ( false === $metadata ) {
				continue;
			}

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/blocks.asset.php';

			$deps = array();

			if ( isset( $local_dependencies[ $block ] ) ) {
				$deps = $local_dependencies[ $block ];
			}

			if ( file_exists( $editor_style_path ) && ! empty( $metadata['editorStyle'] ) ) {
				wp_register_style(
					$metadata['editorStyle'],
					$editor_style,
					$deps,
					$asset_file['version']
				);
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
	 * Initialize AMP blocks.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init_amp_blocks() {
		$classnames = array(
			'\ThemeIsle\GutenbergBlocks\Render\AMP\Circle_Counter_Block',
			'\ThemeIsle\GutenbergBlocks\Render\AMP\Lottie_Block',
			'\ThemeIsle\GutenbergBlocks\Render\AMP\Slider_Block',
		);

		foreach ( $classnames as $classname ) {
			$classname = new $classname();

			if ( method_exists( $classname, 'instance' ) ) {
				$classname->instance();
			}
		}
	}

	/**
	 * Subscribe to FA enqueue.
	 *
	 * @param string $block_content Block content parsed.
	 * @param array  $block Block details.
	 *
	 * @return mixed
	 */
	public function subscribe_fa( $block_content, $block ) {
		if ( ! isset( $block['blockName'] ) ) {
			return $block_content;
		}

		if ( self::$is_fa_loaded ) {
			return $block_content;
		}

		// always load for those.
		static $always_load = [
			'themeisle-blocks/sharing-icons' => true,
			'themeisle-blocks/plugin-cards'  => true,
		];

		if ( isset( $always_load[ $block['blockName'] ] ) ) {
			self::$is_fa_loaded = true;

			return $block_content;
		}

		if ( 'themeisle-blocks/button' === $block['blockName'] ) {
			if ( isset( $block['attrs']['library'] ) && 'themeisle-icons' === $block['attrs']['library'] ) {
				return $block_content;
			}

			if ( isset( $block['attrs']['iconType'] ) ) {
				self::$is_fa_loaded = true;

				return $block_content;
			}
		}

		if ( 'themeisle-blocks/font-awesome-icons' === $block['blockName'] ) {
			if ( ! isset( $block['attrs']['library'] ) ) {
				self::$is_fa_loaded = true;

				return $block_content;
			}
		}

		if ( 'themeisle-blocks/icon-list-item' === $block['blockName'] ) {
			if ( ! isset( $block['attrs']['library'] ) ) {
				self::$is_fa_loaded = true;

				return $block_content;
			}

			if ( 'fontawesome' === $block['attrs']['library'] ) {
				self::$is_fa_loaded = true;

				return $block_content;
			}
		}

		$has_navigation_block = \WP_Block_Type_Registry::get_instance()->is_registered( 'core/navigation' );

		if ( $has_navigation_block && ( 'core/navigation-link' === $block['blockName'] || 'core/navigation-submenu' === $block['blockName'] ) ) {
			if ( isset( $block['attrs']['className'] ) && strpos( $block['attrs']['className'], 'fa-' ) !== false ) {
				self::$is_fa_loaded = true;

				// See the src/blocks/plugins/menu-icons/inline.css file for where this comes from.
				$styles = '.fab.wp-block-navigation-item,.far.wp-block-navigation-item,.fas.wp-block-navigation-item{-moz-osx-font-smoothing:inherit;-webkit-font-smoothing:inherit;font-weight:inherit}.fab.wp-block-navigation-item:before,.far.wp-block-navigation-item:before,.fas.wp-block-navigation-item:before{font-family:Font Awesome\ 5 Free;margin-right:5px}.fab.wp-block-navigation-item:before,.far.wp-block-navigation-item:before{font-weight:400;padding-right:5px}.fas.wp-block-navigation-item:before{font-weight:900;padding-right:5px}.fab.wp-block-navigation-item:before{font-family:Font Awesome\ 5 Brands}';

				wp_add_inline_style( 'font-awesome-5', $styles );
				return $block_content;
			}
		}

		if ( 'themeisle-blocks/accordion' === $block['blockName'] ) {
			if ( isset( $block['attrs']['icon'] ) || isset( $block['attrs']['openItemIcon'] ) ) {
				self::$is_fa_loaded = true;

				return $block_content;
			}
		}

		return $block_content;
	}

	/**
	 * Load assets in frontend.
	 *
	 * @param string $block_content Content of block.
	 * @param array  $block Block Attributes.
	 * @return string
	 * @since 2.0.5
	 */
	public function load_sticky( $block_content, $block ) {
		if ( ( function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) || self::$scripts_loaded['sticky'] ) {
			return $block_content;
		}

		if ( isset( $block['attrs']['className'] ) && false !== strpos( $block['attrs']['className'], 'o-sticky' ) ) {
			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/sticky.asset.php';
			wp_enqueue_script(
				'otter-sticky',
				OTTER_BLOCKS_URL . 'build/blocks/sticky.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);
			wp_script_add_data( 'otter-sticky', 'defer', true );

			add_action( 'wp_head', array( $this, 'sticky_style' ) );

			self::$scripts_loaded['sticky'] = true;
		}

		return $block_content;
	}

	/**
	 * Add styles for sticky blocks.
	 *
	 * @static
	 * @since 2.0.14
	 * @access public
	 */
	public static function sticky_style() {
		echo '<style id="o-sticky-inline-css">.o-sticky.o-sticky-float { height: 0px; } </style>';
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
