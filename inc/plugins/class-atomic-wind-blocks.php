<?php
/**
 * Atomic Wind Blocks module.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Atomic Wind Blocks
 *
 * Registers the 5 primitive Atomic Wind blocks and all supporting subsystems
 * (Tailwind CSS pipeline, animations, states, query, class editor).
 */
class Atomic_Wind_Blocks {

	/**
	 * CSS version for the Atomic Wind blocks.
	 *
	 * @var string
	 */
	const ATOMIC_WIND_CSS_VERSION = '1.0.0';

	/**
	 * Whether we are currently inside a query loop render.
	 *
	 * @var bool
	 */
	private static $in_query = false;

	/**
	 * Expected Atomic Wind blocks by post ID.
	 *
	 * @var array<int, int>
	 */
	private $expected = array();

	/**
	 * Rendered Atomic Wind blocks by post ID. ID 0 is unknown.
	 *
	 * @var array<int, int>
	 */
	private $rendered = array();

	/**
	 * Hashes of inlined CSS.
	 *
	 * @var array<string, bool>
	 */
	private $inlined = array();

	/**
	 * Initialize the module.
	 *
	 * @return void
	 */
	public function instance() {
		$this->run();
	}

	/**
	 * Run the module if the option is enabled.
	 *
	 * @return void
	 */
	public function run() {
		if ( ! get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) ) {
			return;
		}

		$this->register_blocks();

		add_action( 'enqueue_block_assets', array( $this, 'enqueue_tailwind_generator' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_base_css' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_icons_data' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'output_singular_css' ), 11 );
		add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue_style_builder' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_frontend_animations' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_frontend_states' ) );
		add_filter( 'render_block', array( $this, 'render_query_loop' ), 5, 2 );
		add_filter( 'render_block', array( $this, 'render_post_fields' ), 20, 2 );
		add_filter( 'render_block', array( $this, 'render_animation_attrs' ), 10, 2 );
		add_filter( 'render_block', array( $this, 'render_state_attrs' ), 10, 2 );
		add_filter( 'render_block', array( $this, 'track_rendered_blocks' ), 10, 2 );
		add_action( 'wp_footer', array( $this, 'output_late_css' ), 19 );
		add_action( 'template_redirect', array( $this, 'maybe_render_css_warm_page' ), 0 );
		add_action( 'save_post', array( $this, 'clear_cached_css' ) );
		add_filter( 'block_categories_all', array( $this, 'register_category' ) );
	}

	/**
	 * Check if a post contains any atomic-wind/* block.
	 *
	 * Uses a direct strpos on post_content (already in memory) — no extra DB query.
	 * has_block() requires a full block name and normalizes non-namespaced names to
	 * core/*, so it cannot be used for namespace-prefix matching.
	 *
	 * @param \WP_Post $post Post object.
	 * @return bool
	 */
	private function post_has_atomic_wind_blocks( \WP_Post $post ) {
		return has_blocks( $post ) &&
			false !== strpos( $post->post_content, '<!-- wp:atomic-wind/' );
	}

	/**
	 * Get the path to the plugin root.
	 *
	 * @return string
	 */
	private function base_path() {
		return OTTER_BLOCKS_PATH;
	}

	/**
	 * Get the build directory path.
	 *
	 * @return string
	 */
	private function build_path() {
		return $this->base_path() . '/build/atomic-wind';
	}

	/**
	 * Get a plugins_url relative to the otter-blocks root.
	 *
	 * @param string $path Relative path.
	 * @return string
	 */
	private function plugin_url( $path ) {
		return plugins_url( $path, $this->base_path() . '/otter-blocks.php' );
	}

	/**
	 * Register all Atomic Wind block types from the build directory.
	 *
	 * @return void
	 */
	private function register_blocks() {
		$build_dir = $this->build_path() . '/blocks';

		if ( ! is_dir( $build_dir ) ) {
			return;
		}

		foreach ( scandir( $build_dir ) as $block ) {
			if ( '.' === $block || '..' === $block ) {
				continue;
			}

			$block_path = $build_dir . '/' . $block;

			if ( is_dir( $block_path ) && file_exists( $block_path . '/block.json' ) ) {
				register_block_type( $block_path );
			}
		}
	}

	/**
	 * Enqueue the Tailwind CSS generator in the editor.
	 *
	 * @return void
	 */
	public function enqueue_tailwind_generator() {
		if ( ! is_admin() ) {
			return;
		}

		$asset_file = $this->build_path() . '/tailwind-generator-editor.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'atomic-wind-tailwind-generator',
			$this->plugin_url( 'build/atomic-wind/tailwind-generator-editor.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	/**
	 * Enqueue base CSS that zeroes out margins for all atomic-wind blocks.
	 *
	 * @return void
	 */
	public function enqueue_base_css() {
		$css = '[class*="wp-block-atomic-wind-"]{margin:0;max-width:unset;}[class*="wp-block-atomic-wind-"] p{margin:0;}';

		// Always reset frontend blocks, including those outside the main query.
		if ( ! is_admin() ) {
			wp_register_style( 'atomic-wind-base', false, [], OTTER_BLOCKS_VERSION );
			wp_add_inline_style( 'atomic-wind-base', $css );
			return;
		}

		global $post;

		if ( ! $post || ! $this->post_has_atomic_wind_blocks( $post ) ) {
			return;
		}

		wp_register_style( 'atomic-wind-base', false, [], OTTER_BLOCKS_VERSION );
		wp_enqueue_style( 'atomic-wind-base' );
		$css .= '.editor-styles-wrapper .wp-block[class*="wp-block-atomic-wind-"]{margin:0;max-width:unset;}.editor-styles-wrapper [class*="wp-block-atomic-wind-"] p{margin:0;}';
		wp_add_inline_style( 'atomic-wind-base', $css );
	}

	/**
	 * Inject window.atomicWindIcons data for the icon block editor UI.
	 *
	 * @return void
	 */
	public function enqueue_icons_data() {
		$json_path = $this->base_path() . '/assets/atomic-wind/icons.json';
		$icons     = array();
		$icons_map = new \stdClass();

		if ( is_file( $json_path ) ) {
			if ( function_exists( 'wpcom_vip_file_get_contents' ) ) {
				$content = wpcom_vip_file_get_contents( $json_path );
			} else {
				$content = file_get_contents( $json_path ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
			}
			if ( $content ) {
				$map = json_decode( $content, true );
				if ( is_array( $map ) ) {
					$icons     = array_keys( $map );
					$icons_map = $map;
				}
			}
		}

		wp_add_inline_script(
			'wp-blocks',
			'window.atomicWindIcons = ' . wp_json_encode(
				array(
					'icons'    => $icons,
					'iconsMap' => $icons_map,
				)
			) . ';' .
			'window.atomicWindEditor = ' . wp_json_encode(
				array(
					'restUrl'   => rest_url( 'otter/v1/atomic-wind' ),
					'nonce'     => wp_create_nonce( 'wp_rest' ),
					'warmUrl'   => home_url( '/' ),
					'warmNonce' => wp_create_nonce( 'atomic_wind_css_warm' ),
				)
			) . ';',
			'before'
		);
	}

	/**
	 * Enqueue the unified editor script and styles (animations, states, query, class editor).
	 *
	 * @return void
	 */
	public function enqueue_editor_assets() {
		$asset_file = $this->build_path() . '/editor.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'atomic-wind-editor',
			$this->plugin_url( 'build/atomic-wind/editor.js' ),
			array_merge( $asset['dependencies'], array( 'wp-blocks', 'wp-hooks' ) ),
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'atomic-wind-editor',
			$this->plugin_url( 'build/atomic-wind/style-editor.css' ),
			array(),
			$asset['version']
		);
	}

	/**
	 * Enqueue the frontend Tailwind fallback.
	 *
	 * @return void
	 */
	private function enqueue_generator() {
		$generator_asset = $this->build_path() . '/tailwind-generator-frontend.asset.php';

		if ( ! file_exists( $generator_asset ) ) {
			return;
		}

		$gen = include $generator_asset;
		wp_enqueue_script(
			'atomic-wind-tailwind-generator',
			$this->plugin_url( 'build/atomic-wind/tailwind-generator-frontend.js' ),
			$gen['dependencies'],
			$gen['version'],
			true
		);
	}

	/**
	 * Load the queried post's CSS in the head on singular views.
	 *
	 * The post is guaranteed to render, so inlining its cached CSS early avoids
	 * a flash of unstyled content for the main content. Everything else (hooked
	 * layouts, embeds) stays on the render-tracked footer path.
	 *
	 * @return void
	 */
	public function output_singular_css() {
		if ( ! is_singular() ) {
			return;
		}

		$queried = get_queried_object();

		if ( ! $queried instanceof \WP_Post || ! $this->post_has_atomic_wind_blocks( $queried ) ) {
			return;
		}

		$this->expected[ $queried->ID ] = substr_count( $queried->post_content, '<!-- wp:atomic-wind/' );
		wp_enqueue_style( 'atomic-wind-base' );

		$cached_css = $this->get_cached_css( $queried->ID );

		if ( ! $cached_css ) {
			$this->enqueue_generator();
			return;
		}

		$this->inlined[ md5( $cached_css ) ] = true;
		wp_register_style( 'atomic-wind-tailwind', false, [], OTTER_BLOCKS_VERSION );
		wp_enqueue_style( 'atomic-wind-tailwind' );
		wp_add_inline_style( 'atomic-wind-tailwind', $cached_css );
	}

	/**
	 * Enqueue the style builder for editable singular posts without cached CSS.
	 *
	 * @return void
	 */
	public function maybe_enqueue_style_builder() {
		if ( ! is_singular() ) {
			return;
		}

		$queried = get_queried_object();

		if ( ! $queried instanceof \WP_Post
			|| ! $this->post_has_atomic_wind_blocks( $queried )
			|| $this->get_cached_css( $queried->ID )
			|| ! current_user_can( 'edit_post', $queried->ID ) ) {
			return;
		}

		$builder_asset = $this->build_path() . '/style-builder.asset.php';

		if ( ! file_exists( $builder_asset ) ) {
			return;
		}

		$sb = include $builder_asset;
		wp_enqueue_script(
			'atomic-wind-style-builder',
			$this->plugin_url( 'build/atomic-wind/style-builder.js' ),
			$sb['dependencies'],
			$sb['version'],
			true
		);

		wp_localize_script(
			'atomic-wind-style-builder',
			'atomicWindStyleBuilder',
			array(
				'postId'  => $queried->ID,
				'restUrl' => rest_url( 'otter/v1/atomic-wind' ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
			)
		);
	}

	/**
	 * Track frontend Atomic Wind blocks by current post.
	 *
	 * Query re-renders are skipped to avoid duplicate counts.
	 *
	 * @param string               $block_content Block content.
	 * @param array<string, mixed> $block         Block data.
	 * @return string
	 */
	public function track_rendered_blocks( $block_content, $block ) {
		if ( is_admin() || self::$in_query ) {
			return $block_content;
		}

		$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
		if ( 0 !== strpos( $block_name, 'atomic-wind/' ) ) {
			return $block_content;
		}

		wp_enqueue_style( 'atomic-wind-base' );

		$id  = get_the_ID();
		$key = $id ? $id : 0;

		if ( isset( $this->rendered[ $key ] ) ) {
			++$this->rendered[ $key ];
		} else {
			$this->rendered[ $key ] = 1;
		}

		return $block_content;
	}

	/**
	 * Load CSS for blocks rendered after the head.
	 *
	 * Missing or unattributed CSS uses the generator.
	 *
	 * @return void
	 */
	public function output_late_css() {
		$blobs           = array();
		$needs_generator = false;

		foreach ( $this->rendered as $id => $count ) {
			if ( ! isset( $this->expected[ $id ] ) ) {
				$post = $id ? get_post( $id ) : null;

				if ( $post instanceof \WP_Post && $this->post_has_atomic_wind_blocks( $post ) ) {
					$this->expected[ $id ] = substr_count( $post->post_content, '<!-- wp:atomic-wind/' );

					$cached_css = $this->get_cached_css( $id );

					if ( $cached_css ) {
						$hash = md5( $cached_css );
						if ( ! isset( $this->inlined[ $hash ] ) ) {
							$this->inlined[ $hash ] = true;
							$blobs[]                = $cached_css;
						}
					} else {
						$needs_generator = true;
					}
				} else {
					$this->expected[ $id ] = 0;
				}
			}

			if ( $count > $this->expected[ $id ] ) {
				$needs_generator = true;
			}
		}

		if ( ! empty( $blobs ) ) {
			wp_register_style( 'atomic-wind-tailwind-late', false, [], OTTER_BLOCKS_VERSION );
			wp_enqueue_style( 'atomic-wind-tailwind-late' );
			wp_add_inline_style( 'atomic-wind-tailwind-late', implode( "\n", $blobs ) );
		}

		if ( $needs_generator ) {
			$this->enqueue_generator();
		}
	}

	/**
	 * Register REST API route for saving generated CSS.
	 *
	 * @return void
	 */
	public function register_rest_routes() {
		register_rest_route(
			'otter/v1',
			'/atomic-wind/style',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_save_style' ),
				'permission_callback' => array( $this, 'rest_save_style_permissions' ),
				'args'                => array(
					'css'    => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => array( $this, 'sanitize_css' ),
					),
					'postId' => array(
						'type'     => 'integer',
						'required' => true,
					),
				),
			) 
		);
	}

	/**
	 * REST callback: save generated Tailwind CSS to post meta.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @phpstan-param \WP_REST_Request<array<string, mixed>> $request
	 * @return \WP_REST_Response
	 */
	public function rest_save_style( \WP_REST_Request $request ) {
		$post_id = absint( $request->get_param( 'postId' ) );
		$css     = $request->get_param( 'css' );

		$success = update_post_meta( $post_id, '_atomic_wind_css', wp_slash( $css ) );
		update_post_meta( $post_id, '_atomic_wind_css_version', self::ATOMIC_WIND_CSS_VERSION );

		return new \WP_REST_Response( array( 'success' => $success ), 200 );
	}

	/**
	 * Read cached CSS, ignoring stylesheets built by an older generator.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	private function get_cached_css( $post_id ) {
		if ( self::ATOMIC_WIND_CSS_VERSION !== get_post_meta( $post_id, '_atomic_wind_css_version', true ) ) {
			return '';
		}

		$css = get_post_meta( $post_id, '_atomic_wind_css', true );

		return is_string( $css ) ? $css : '';
	}

	/**
	 * REST permission callback for the style endpoint.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @phpstan-param \WP_REST_Request<array<string, mixed>> $request
	 * @return bool
	 */
	public function rest_save_style_permissions( \WP_REST_Request $request ) {
		$post_id = absint( $request->get_param( 'postId' ) );

		return current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Clear cached Tailwind CSS when a post is saved.
	 *
	 * Forces the frontend to regenerate CSS on the next page load.
	 *
	 * @param int $post_id Post ID.
	 * @return void
	 */
	public function clear_cached_css( $post_id ) {
		delete_post_meta( $post_id, '_atomic_wind_css' );
		delete_post_meta( $post_id, '_atomic_wind_css_version' );
	}

	/**
	 * Render a stripped, frontend-shaped page for warming the CSS cache.
	 *
	 * @return void
	 */
	public function maybe_render_css_warm_page() {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- nonce is verified below via can_render_css_warm().
		if ( empty( $_GET['atomic_wind_css_warm'] ) || empty( $_GET['post_id'] ) ) {
			return;
		}

		$nonce   = sanitize_text_field( wp_unslash( $_GET['atomic_wind_css_warm'] ) );
		$post_id = absint( wp_unslash( $_GET['post_id'] ) );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		if ( ! $this->can_render_css_warm( $post_id, $nonce ) ) {
			return;
		}

		$post = get_post( $post_id );
		if ( ! $post instanceof \WP_Post || ! $this->post_has_atomic_wind_blocks( $post ) ) {
			// Nothing to warm — leave the (already-cleared) cache empty.
			return;
		}

		nocache_headers();
		header( 'Content-Type: text/html; charset=' . get_option( 'blog_charset' ) );
		header( 'X-Robots-Tag: noindex, nofollow', true );

		echo $this->render_css_warm_page_html( $post ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- self-contained document built below with per-part escaping.
		exit;
	}

	/**
	 * Whether the current request may render the CSS warm page for a post.
	 *
	 * @param int    $post_id Post ID from the request.
	 * @param string $nonce   Nonce from the request.
	 * @return bool
	 */
	private function can_render_css_warm( $post_id, $nonce ) {
		return $post_id > 0
			&& false !== wp_verify_nonce( $nonce, 'atomic_wind_css_warm' )
			&& current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Build the minimal HTML document for the CSS warm iframe.
	 *
	 * Kept separate from the request handling so it stays pure/testable: it
	 * returns a string and neither reads superglobals nor calls exit().
	 *
	 * @param \WP_Post $post_obj Post to render.
	 * @return string
	 */
	private function render_css_warm_page_html( \WP_Post $post_obj ) {
		global $post;

		$previous = $post;
		$post     = $post_obj; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- temporary, restored below, so render_block filters see the warmed post.
		setup_postdata( $post );
		$content = do_blocks( $post_obj->post_content );
		wp_reset_postdata();
		$post = $previous; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- restore the original global.

		$generator = $this->build_asset_url( 'tailwind-generator-frontend' );
		$builder   = $this->build_asset_url( 'style-builder' );

		$config = wp_json_encode(
			array(
				'postId'  => (int) $post_obj->ID,
				'restUrl' => rest_url( 'otter/v1/atomic-wind' ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
			)
		);

		$post_id_json = wp_json_encode( (int) $post_obj->ID );

		// Base reset so the in-browser generator measures the real frontend layout.
		$base_css = '[class*="wp-block-atomic-wind-"]{margin:0;max-width:unset;}[class*="wp-block-atomic-wind-"] p{margin:0;}';

		// On css-saved, notify the opener (the editor) so it can drop the iframe.
		// The payload carries no secret; the editor still validates the message origin.
		$ping = 'document.addEventListener("atomic-wind:css-saved",function(){'
			. 'if(window.parent&&window.parent!==window){'
			. 'var t="*";try{if(document.referrer){t=new URL(document.referrer).origin;}}catch(e){}'
			. 'window.parent.postMessage({type:"atomic-wind:css-warmed",postId:' . $post_id_json . '},t);}});';

		$html  = '<!DOCTYPE html><html ' . get_language_attributes() . '><head>';
		$html .= '<meta charset="' . esc_attr( get_option( 'blog_charset' ) ) . '">';
		$html .= '<meta name="viewport" content="width=1024">';
		$html .= '<meta name="robots" content="noindex,nofollow">';
		$html .= '<style id="atomic-wind-base-inline-css">' . $base_css . '</style>';
		$html .= '</head><body class="atomic-wind-css-warm">';
		$html .= $content;
		$html .= '<script>window.atomicWindStyleBuilder = ' . $config . ';</script>';
		$html .= '<script src="' . esc_url( $generator ) . '"></script>';
		$html .= '<script src="' . esc_url( $builder ) . '"></script>';
		$html .= '<script>' . $ping . '</script>';
		$html .= '</body></html>';

		return $html;
	}

	/**
	 * Build a versioned URL for an atomic-wind build script.
	 *
	 * @param string $name Script base name (without extension), e.g. `style-builder`.
	 * @return string
	 */
	private function build_asset_url( $name ) {
		$asset_file = $this->build_path() . '/' . $name . '.asset.php';
		$version    = OTTER_BLOCKS_VERSION;

		if ( file_exists( $asset_file ) ) {
			$asset = include $asset_file;
			if ( isset( $asset['version'] ) ) {
				$version = $asset['version'];
			}
		}

		return add_query_arg( 'ver', $version, $this->plugin_url( 'build/atomic-wind/' . $name . '.js' ) );
	}

	/**
	 * Sanitize CSS for storage without stripping @property syntax descriptors.
	 *
	 * Strpping with wp_strip_all_tags destroys valid CSS like syntax: "<color>" because it
	 * looks like an HTML tag. This method only removes patterns that could
	 * break out of a <style> context.
	 *
	 * @param string $css Raw CSS string.
	 * @return string Sanitized CSS.
	 */
	public function sanitize_css( $css ) {
		$css = wp_check_invalid_utf8( $css );
		$css = preg_replace( '/<\/?style\b[^>]*>/i', '', $css );
		$css = preg_replace( '/<\/?script\b[^>]*>/i', '', $css );
		$css = preg_replace( '/<!--.*?-->/s', '', $css );

		return $css;
	}

	/**
	 * Register animations frontend CSS and JS for conditional enqueue.
	 *
	 * @return void
	 */
	public function register_frontend_animations() {
		$asset_file = $this->build_path() . '/animations-frontend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_register_style(
			'atomic-wind-animations',
			$this->plugin_url( 'build/atomic-wind/style-animations-frontend.css' ),
			array(),
			$asset['version']
		);

		wp_register_script(
			'atomic-wind-animations-frontend',
			$this->plugin_url( 'build/atomic-wind/animations-frontend.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	/**
	 * Register states frontend JS for conditional enqueue.
	 *
	 * @return void
	 */
	public function register_frontend_states() {
		$asset_file = $this->build_path() . '/states-frontend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_register_script(
			'atomic-wind-states-frontend',
			$this->plugin_url( 'build/atomic-wind/states-frontend.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	/**
	 * Render query loop for box blocks with queryPostType.
	 *
	 * @param string               $block_content Block content.
	 * @param array<string, mixed> $block         Block data.
	 * @return string
	 */
	public function render_query_loop( $block_content, $block ) {
		$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
		if ( 'atomic-wind/box' !== $block_name ) {
			return $block_content;
		}

		$post_type = isset( $block['attrs']['queryPostType'] ) ? $block['attrs']['queryPostType'] : '';
		if ( ! $post_type ) {
			return $block_content;
		}

		global $post;
		$saved_post = $post;

		$args = array(
			'post_type'      => sanitize_key( $post_type ),
			'posts_per_page' => isset( $block['attrs']['queryCount'] ) ? min( absint( $block['attrs']['queryCount'] ), 100 ) : 3,
			'orderby'        => isset( $block['attrs']['queryOrderBy'] ) ? sanitize_key( $block['attrs']['queryOrderBy'] ) : sanitize_key( 'date' ),
			'order'          => isset( $block['attrs']['queryOrder'] ) && strtoupper( $block['attrs']['queryOrder'] ) === 'ASC' ? 'ASC' : 'DESC',
			'no_found_rows'  => true,
		);

		$taxonomy_filter = isset( $block['attrs']['queryTaxonomy'] ) ? sanitize_text_field( $block['attrs']['queryTaxonomy'] ) : '';
		if ( $taxonomy_filter && false !== strpos( $taxonomy_filter, ':' ) ) {
			$parts = explode( ':', $taxonomy_filter, 2 );
			$tax   = sanitize_key( $parts[0] );
			$term  = sanitize_key( $parts[1] );
			if ( $tax && $term ) {
				$args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
					array(
						'taxonomy' => $tax,
						'field'    => 'slug',
						'terms'    => array( $term ),
					),
				);
			}
		}

		if ( ! empty( $block['attrs']['queryExcludeCurrent'] ) && $saved_post ) {
			$args['post__not_in'] = array( $saved_post->ID ); // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in
		}

		$sticky = isset( $block['attrs']['querySticky'] ) ? sanitize_key( $block['attrs']['querySticky'] ) : '';
		if ( 'exclude' === $sticky ) {
			$args['ignore_sticky_posts'] = true;
		} elseif ( 'only' === $sticky ) {
			$sticky_ids = get_option( 'sticky_posts' );
			if ( ! empty( $sticky_ids ) ) {
				$args['post__in']            = $sticky_ids;
				$args['ignore_sticky_posts'] = true;
			} else {
				return '';
			}
		}

		$query = new \WP_Query( $args );

		if ( ! $query->have_posts() ) {
			wp_reset_postdata();
			$post = $saved_post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			return '';
		}

		preg_match( '/^\s*(<[^>]+>)/s', $block_content, $open_match );
		preg_match( '/(<\/[a-zA-Z0-9]+>)\s*$/s', $block_content, $close_match );
		$opening_tag = isset( $open_match[1] ) ? $open_match[1] : '';
		$closing_tag = isset( $close_match[1] ) ? $close_match[1] : '';

		$loop_output    = '';
		self::$in_query = true;

		while ( $query->have_posts() ) {
			$query->the_post();
			foreach ( $block['innerBlocks'] as $inner_block ) {
				$loop_output .= render_block( $inner_block );
			}
		}

		self::$in_query = false;
		wp_reset_postdata();
		$post = $saved_post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		return $opening_tag . $loop_output . $closing_tag;
	}

	/**
	 * Replace block content with post field data inside query loops.
	 *
	 * @param string               $block_content Block content.
	 * @param array<string, mixed> $block         Block data.
	 * @return string
	 */
	public function render_post_fields( $block_content, $block ) {
		$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
		if ( 0 !== strpos( $block_name, 'atomic-wind/' ) ) {
			return $block_content;
		}

		$post_field = isset( $block['attrs']['postField'] ) ? $block['attrs']['postField'] : '';
		if ( ! $post_field || ! self::$in_query ) {
			return $block_content;
		}

		$block_name = $block['blockName'];

		if ( 'atomic-wind/text' === $block_name ) {
			$value = '';
			switch ( $post_field ) {
				case 'title':
					$value = get_the_title();
					break;
				case 'excerpt':
					$length = isset( $block['attrs']['excerptLength'] ) ? absint( $block['attrs']['excerptLength'] ) : 25;
					$raw    = get_the_excerpt();
					$value  = wp_trim_words( wp_strip_all_tags( $raw ), $length, '&hellip;' );
					break;
				case 'date':
					$value = get_the_date();
					break;
				case 'author':
					$value = get_the_author();
					break;
				case 'categories':
					$cats = get_the_category();
					if ( $cats ) {
						$value = implode( ', ', wp_list_pluck( $cats, 'name' ) );
					}
					break;
				case 'tags':
					$tags = get_the_tags();
					if ( $tags ) {
						$value = implode( ', ', wp_list_pluck( $tags, 'name' ) );
					}
					break;
				case 'modified_date':
					$value = get_the_modified_date();
					break;
				case 'comment_count':
					$value = (string) get_comments_number();
					break;
				case 'reading_time':
					$content    = get_the_content();
					$word_count = str_word_count( wp_strip_all_tags( $content ) );
					$minutes    = max( 1, (int) ceil( $word_count / 200 ) );
					/* translators: %d: number of minutes */
					$value = sprintf( _n( '%d min read', '%d min read', $minutes, 'otter-blocks' ), $minutes );
					break;
				case 'custom_field':
					$meta_key = isset( $block['attrs']['customFieldKey'] ) ? sanitize_text_field( $block['attrs']['customFieldKey'] ) : '';
					if ( $meta_key ) {
						$value = '';
						if ( function_exists( 'get_field' ) ) {
							$acf = get_field( $meta_key, get_the_ID() );
							if ( is_string( $acf ) ) {
								$value = $acf;
							}
						}
						if ( ! $value ) {
							$raw = get_post_meta( get_the_ID(), $meta_key, true );
							if ( is_string( $raw ) ) {
								$value = $raw;
							}
						}
					}
					break;
			}
			if ( $value ) {
				$escaped       = esc_html( $value );
				$block_content = preg_replace_callback(
					'/^\s*(<[^>]+>).*(<\/[a-zA-Z0-9]+>)\s*$/s',
					function ( $m ) use ( $escaped ) {
						return $m[1] . $escaped . $m[2];
					},
					$block_content
				);
			}
		} elseif ( 'atomic-wind/link' === $block_name ) {
			$url = '';
			switch ( $post_field ) {
				case 'permalink':
					$url = get_the_permalink();
					break;
				case 'author_posts_url':
					$url = get_author_posts_url( (int) get_the_author_meta( 'ID' ) );
					break;
				case 'category_link':
					$cats = get_the_category();
					if ( $cats && ! empty( $cats[0] ) ) {
						$url = get_category_link( $cats[0]->term_id );
					}
					break;
				case 'tag_link':
					$tags = get_the_tags();
					if ( $tags && ! empty( $tags[0] ) ) {
						$url = get_tag_link( $tags[0]->term_id );
					}
					break;
				case 'date_archive':
					$url = get_month_link( get_the_date( 'Y' ), get_the_date( 'n' ) );
					break;
				case 'author_archive':
					$url = get_author_posts_url( (int) get_the_author_meta( 'ID' ) );
					break;
			}
			if ( $url ) {
				$href = 'href="' . esc_url( $url ) . '"';
				if ( false !== strpos( $block_content, 'href="' ) ) {
					$block_content = preg_replace( '/href="[^"]*"/', $href, $block_content );
				} else {
					$block_content = preg_replace( '/^(\s*<a\b)/', '$1 ' . $href, $block_content );
				}
			}
		} elseif ( 'atomic-wind/image' === $block_name ) {
			if ( 'featured_image' === $post_field ) {
				$thumb_id = get_post_thumbnail_id();
				if ( ! $thumb_id ) {
					return '';
				}
				$src = wp_get_attachment_image_url( $thumb_id, 'large' );
				$alt = get_post_meta( $thumb_id, '_wp_attachment_image_alt', true );
				if ( ! $alt ) {
					$alt = get_the_title();
				}
				$block_content = preg_replace( '/src="[^"]*"/', 'src="' . esc_url( $src ) . '"', $block_content );
				$block_content = preg_replace( '/alt="[^"]*"/', 'alt="' . esc_attr( $alt ) . '"', $block_content );
			} elseif ( 'author_avatar' === $post_field ) {
				$avatar_url = get_avatar_url( get_the_author_meta( 'ID' ), array( 'size' => 256 ) );
				if ( $avatar_url ) {
					$alt           = get_the_author();
					$block_content = preg_replace( '/src="[^"]*"/', 'src="' . esc_url( $avatar_url ) . '"', $block_content );
					$block_content = preg_replace( '/alt="[^"]*"/', 'alt="' . esc_attr( $alt ) . '"', $block_content );
				}
			}
		}

		return $block_content;
	}

	/**
	 * Inject data-animation attributes into server-rendered blocks.
	 *
	 * @param string               $block_content Block content.
	 * @param array<string, mixed> $block         Block data.
	 * @return string
	 */
	public function render_animation_attrs( $block_content, $block ) {
		$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
		if ( 0 !== strpos( $block_name, 'atomic-wind/' ) ) {
			return $block_content;
		}

		$animation = isset( $block['attrs']['animation'] ) ? $block['attrs']['animation'] : '';

		if ( ! $animation ) {
			return $block_content;
		}

		wp_enqueue_style( 'atomic-wind-animations' );
		wp_enqueue_script( 'atomic-wind-animations-frontend' );

		if ( false !== strpos( $block_content, 'data-animation' ) ) {
			return $block_content;
		}

		$attrs = ' data-animation="' . esc_attr( $animation ) . '"';

		$delay = isset( $block['attrs']['animationDelay'] ) ? (string) $block['attrs']['animationDelay'] : '';
		if ( '' !== $delay && '0' !== $delay ) {
			$attrs .= ' data-animation-delay="' . esc_attr( $delay ) . '"';
		}

		return preg_replace( '/^(<[a-zA-Z][a-zA-Z0-9]*)\b/', '$1' . $attrs, $block_content, 1 );
	}

	/**
	 * Inject data-show-if / data-hide-if attributes into server-rendered blocks.
	 *
	 * @param string               $block_content Block content.
	 * @param array<string, mixed> $block         Block data.
	 * @return string
	 */
	public function render_state_attrs( $block_content, $block ) {
		$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
		if ( 0 !== strpos( $block_name, 'atomic-wind/' ) ) {
			return $block_content;
		}

		$has_state = false;

		$show_if       = isset( $block['attrs']['showIf'] ) ? $block['attrs']['showIf'] : '';
		$hide_if       = isset( $block['attrs']['hideIf'] ) ? $block['attrs']['hideIf'] : '';
		$trigger       = isset( $block['attrs']['stateTrigger'] ) ? $block['attrs']['stateTrigger'] : '';
		$state_action  = isset( $block['attrs']['stateAction'] ) ? $block['attrs']['stateAction'] : 'toggle';
		$state_value   = isset( $block['attrs']['stateValue'] ) ? $block['attrs']['stateValue'] : '';
		$state_default = ! empty( $block['attrs']['stateDefault'] );

		if ( $show_if || $hide_if || $trigger ) {
			$has_state = true;
		}

		if ( ! $has_state ) {
			return $block_content;
		}

		wp_enqueue_script( 'atomic-wind-states-frontend' );

		$attrs = '';
		if ( $show_if ) {
			$attrs .= ' data-show-if="' . esc_attr( $show_if ) . '"';
		}
		if ( $hide_if ) {
			$attrs .= ' data-hide-if="' . esc_attr( $hide_if ) . '"';
		}
		if ( $trigger ) {
			$attrs .= ' data-state-trigger="' . esc_attr( $trigger ) . '"';
			$attrs .= ' data-state-action="' . esc_attr( $state_action ) . '"';

			if ( 'set' === $state_action && $state_value ) {
				$attrs .= ' data-state-value="' . esc_attr( $state_value ) . '"';
			}

			if ( $state_default ) {
				$attrs .= ' data-state-default';
			}
		}

		if ( ! $attrs || false !== strpos( $block_content, 'data-show-if' ) || false !== strpos( $block_content, 'data-hide-if' ) || false !== strpos( $block_content, 'data-state-trigger' ) ) {
			return $block_content;
		}

		return preg_replace( '/^(\s*<[a-zA-Z][a-zA-Z0-9]*)\b/', '$1' . $attrs, $block_content, 1 );
	}

	/**
	 * Prepend the atomic-wind block category.
	 *
	 * @param array<int, array<string, string>> $categories Existing categories.
	 * @return array<int, array<string, string>>
	 */
	public function register_category( $categories ) {
		array_unshift(
			$categories,
			array(
				'slug'  => 'atomic-wind',
				'title' => __( 'Atomic Wind', 'otter-blocks' ),
			) 
		);

		return $categories;
	}
}
