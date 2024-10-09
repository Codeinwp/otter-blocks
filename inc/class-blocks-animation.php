<?php
/**
 * Class for Animation logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Blocks_Animation
 */
class Blocks_Animation {

	/**
	 * The main instance var.
	 *
	 * @var Blocks_Animation|null
	 */
	public static $instance = null;

	/**
	 * Flag to mark that the scripts which have loaded.
	 *
	 * @var array
	 */
	public static $scripts_loaded = array(
		'animation' => false,
		'count'     => false,
		'typing'    => false,
	);

	/**
	 * Allow to load in frontend.
	 *
	 * @var bool
	 */
	public static $can_load_frontend = true;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( ! defined( 'BLOCKS_ANIMATION_URL' ) ) {
			define( 'BLOCKS_ANIMATION_URL', OTTER_BLOCKS_URL );
			define( 'BLOCKS_ANIMATION_PATH', OTTER_BLOCKS_PATH );
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_frontend_assets' ) );
		add_filter( 'render_block', array( $this, 'frontend_load' ), 800, 2 );
		// Welcome notice.
		if ( ! defined( 'OTTER_BLOCKS_PATH' ) ) {
			add_action( 'admin_notices', array( $this, 'render_welcome_notice' ), 0 );
			add_action( 'wp_ajax_otter_animation_dismiss_welcome_notice', array( $this, 'remove_welcome_notice' ) );
		}
	}

	/**
	 * Load Gutenberg editor assets.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function enqueue_editor_assets() {
		$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/index.asset.php';

		wp_enqueue_style(
			'otter-animation',
			BLOCKS_ANIMATION_URL . 'build/animation/index.css',
			array(),
			$asset_file['version']
		);

		if ( defined( 'OTTER_BLOCKS_VERSION' ) ) {
			array_push( $asset_file['dependencies'], 'otter-blocks' );
		}

		wp_enqueue_script(
			'otter-animation',
			BLOCKS_ANIMATION_URL . 'build/animation/index.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_localize_script(
			'otter-animation',
			'blocksAnimation',
			array(
				'hasOtter' => defined( 'OTTER_BLOCKS_VERSION' ),
			)
		);

		wp_set_script_translations( 'otter-animation', 'blocks-animation' );

		$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/anim-count.asset.php';
		wp_enqueue_script(
			'otter-count',
			BLOCKS_ANIMATION_URL . 'build/animation/anim-count.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_script_add_data( 'otter-count', 'defer', true );

		wp_enqueue_script(
			'otter-typing',
			BLOCKS_ANIMATION_URL . 'build/animation/anim-typing.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_script_add_data( 'otter-typing', 'defer', true );
	}

	/**
	 * Load Gutenberg assets.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function enqueue_block_frontend_assets() {
		if ( function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) {
			self::$can_load_frontend = false;
		}

		global $post;

		if ( is_singular() && strpos( get_the_content( null, false, $post ), '<!-- wp:' ) === false ) {
			self::$can_load_frontend = false;
		}
	}

	/**
	 * Load assets in frontend.
	 *
	 * @param string $block_content Content of block.
	 * @param array  $block Block Attributes.
	 * @return string
	 * @since 2.0.5
	 */
	public function frontend_load( $block_content, $block ) {
		$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/frontend.asset.php';

		wp_register_style(
			'otter-animation',
			BLOCKS_ANIMATION_URL . 'build/animation/index.css',
			array(),
			$asset_file['version']
		);

		if ( ! self::$can_load_frontend ) {
			return $block_content;
		}

		if ( ! self::$scripts_loaded['animation'] && strpos( $block_content, 'animated' ) ) {
			if ( ! defined( 'OTTER_BLOCKS_VERSION' ) || ( defined( 'OTTER_BLOCKS_VERSION' ) && ! get_option( 'themeisle_blocks_settings_optimize_animations_css', true ) ) ) {
				wp_enqueue_style( 'otter-animation' );
			}

			wp_enqueue_script(
				'otter-animation-frontend',
				BLOCKS_ANIMATION_URL . 'build/animation/frontend.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-animation-frontend', 'async', true );

			add_action( 'wp_footer', array( $this, 'add_frontend_anim_inline_style' ), 10 );

			self::$scripts_loaded['animation'] = true;
		}

		if ( ! self::$scripts_loaded['count'] && strpos( $block_content, 'o-anim-count' ) ) {
			$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/anim-count.asset.php';
			wp_enqueue_script(
				'otter-count',
				BLOCKS_ANIMATION_URL . 'build/animation/anim-count.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-count', 'defer', true );
			self::$scripts_loaded['count'] = true;
		}

		if ( ! self::$scripts_loaded['typing'] && strpos( $block_content, 'o-anim-typing' ) ) {
			$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/anim-typing.asset.php';
			wp_enqueue_script(
				'otter-typing',
				BLOCKS_ANIMATION_URL . 'build/animation/anim-typing.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-typing', 'defer', true );
			self::$scripts_loaded['typing'] = true;
		}

		return $block_content;
	}

	/**
	 * Add no script tag.
	 *
	 * @access public
	 * @since 2.0.14
	 */
	public static function add_frontend_anim_inline_style() {
		echo '<style id="o-anim-hide-inline-css"> .animated:not(.o-anim-ready) {
			visibility: hidden;
			animation-play-state: paused;
			animation: none !important;
		 }</style>
		 <noscript><style>.animated { visibility: visible; animation-play-state: running; }</style></noscript>';
	}

	/**
	 * Render the welcome notice.
	 *
	 * @return void
	 */
	public function render_welcome_notice() {
		if ( ! $this->should_show_welcome_notice() ) {
			return;
		}

		$otter_status = $this->get_blocks_animations_status();

		$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/welcome-notice.asset.php';

		wp_enqueue_style(
			'otter-animation-welcome-notice-styles',
			BLOCKS_ANIMATION_URL . 'build/animation/style-welcome-notice.css',
			array( 'wp-components' ),
			$asset_file['version']
		);

		wp_enqueue_script(
			'otter-animation-welcome-notice-scripts',
			BLOCKS_ANIMATION_URL . 'build/animation/welcome-notice.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_set_script_translations( 'otter-animation-welcome-notice-scripts', 'otter-blocks' );

		wp_localize_script(
			'otter-animation-welcome-notice-scripts',
			'otterAnimationWelcodeNoticeData',
			array(
				'nonce'         => wp_create_nonce( 'otter_animation_dismiss_welcome_notice' ),
				'ajaxUrl'       => esc_url( admin_url( 'admin-ajax.php' ) ),
				'otterStatus'   => $otter_status,
				'activationUrl' => esc_url(
					add_query_arg(
						array(
							'plugin_status' => 'all',
							'paged'         => '1',
							'action'        => 'activate',
							'plugin'        => rawurlencode( 'otter-blocks/otter-blocks.php' ),
							'_wpnonce'      => wp_create_nonce( 'activate-plugin_otter-blocks/otter-blocks.php' ),
						),
						admin_url( 'plugins.php' )
					)
				),
				'activating'    => __( 'Activating', 'otter-blocks' ) . '&hellip;',
				'installing'    => __( 'Installing', 'otter-blocks' ) . '&hellip;',
				'done'          => __( 'Done', 'otter-blocks' ),
			)
		);

		$notice_html  = '<div class="notice notice-info otter-animation-welcome-notice">';
		$notice_html .= '<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>';
		$notice_html .= '<div class="notice-content">';

		$notice_html .= '<img class="otter-preview" style="max-height: 300px;" src="' . esc_url( BLOCKS_ANIMATION_URL . '/assets/images/welcome-notice.png' ) . '" alt="' . esc_attr__( 'Otter Blocks preview', 'otter-blocks' ) . '"/>';

		$notice_html .= '<div class="notice-copy">';

		$notice_html .= '<h1 class="notice-title">';
		$notice_html .= sprintf(
			/* translators: %1$s: Add-on Blocks, %2$s: Enhanced Animations, %3$s: Visibility Conditions */
			__( 'Power Up Your Site with %1$s, %2$s, %3$s, and more!', 'otter-blocks' ), 
			'<span>' . __( 'Add-on Blocks', 'otter-blocks' ) . '</span>', 
			'<span>' . __( 'Enhanced Animations', 'otter-blocks' ) . '</span>', 
			'<span>' . __( 'Visibility Conditions', 'otter-blocks' ) . '</span>' 
		);

		$notice_html .= '</h1>';

		$notice_html .= '<p class="description">' . __( 'Otter is a Gutenberg Blocks page builder plugin that adds extra functionality to the WordPress Block Editor (also known as Gutenberg) for a better page building experience without the need for traditional page builders.', 'otter-blocks' ) . '</p>';

		$notice_html .= '<div class="actions">';

		/* translators: %s: Otter Blocks */
		$notice_html .= '<button id="otter-animation-install-otter" class="button button-primary button-hero">';
		$notice_html .= '<span class="dashicons dashicons-update hidden"></span>';
		$notice_html .= '<span class="text">';
		$notice_html .= 'installed' === $otter_status ?
			/* translators: %s: Otter Blocks */
			sprintf( __( 'Activate %s', 'otter-blocks' ), 'Otter Blocks' ) :
			/* translators: %s: Otter Blocks */
			sprintf( __( 'Install & Activate %s', 'otter-blocks' ), 'Otter Blocks' );
		$notice_html .= '</span>';
		$notice_html .= '</button>';

		$notice_html .= '<a href="https://wordpress.org/plugins/otter-blocks/" target="_blank" class="button button-secondary button-hero">';
		$notice_html .= '<span>' . __( 'Learn More', 'otter-blocks' ) . '</span>';
		$notice_html .= '<span class="dashicons dashicons-external"></span>';
		$notice_html .= '</a>';

		$notice_html .= '</div>';

		$notice_html .= '</div>';
		$notice_html .= '</div>';
		$notice_html .= '</div>';

		echo wp_kses_post( $notice_html );
	}

	/**
	 * Get the blocks animations plugin status.
	 *
	 * @return string
	 */
	private function get_blocks_animations_status() {
		$status = 'not-installed';

		if ( file_exists( ABSPATH . 'wp-content/plugins/otter-blocks/otter-blocks.php' ) ) {
			return 'installed';
		}

		return $status;
	}

	/**
	 * Should we show the welcome notice?
	 *
	 * @return bool
	 */
	private function should_show_welcome_notice() {
		// Already using otter blocks.
		if ( is_plugin_active( 'otter-blocks/otter-blocks.php' ) ) {
			return false;
		}

		// Notice was dismissed.
		if ( get_option( 'otter_animation_dismiss_welcome_notice', false ) ) {
			return false;
		}

		$screen = get_current_screen();

		// Only show in dashboard/themes/plugins.
		if ( ! in_array( $screen->id, array( 'dashboard', 'plugins', 'themes' ) ) ) {
			return false;
		}

		// AJAX actions.
		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			return false;
		}

		// Don't show in network admin.
		if ( is_network_admin() ) {
			return false;
		}

		// User can't dismiss. We don't show it.
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		// User can't install plugins. We don't show it.
		if ( ! current_user_can( 'install_plugins' ) ) {
			return false;
		}

		// Block editor context.
		if ( $screen->is_block_editor() ) {
			return false;
		}

		// Dismiss after one week from activation.
		$display_time = get_option( 'otter_animation_welcome_notice_display_time', false );
		// Save notice display time to auto dismiss after a week.
		if ( $display_time ) {
			$display_time = time();
			update_option( 'otter_animation_welcome_notice_display_time', $display_time );
		}

		if ( ! empty( $display_time ) && time() - intval( $display_time ) > WEEK_IN_SECONDS ) {
			update_option( 'otter_animation_dismiss_welcome_notice', true );

			return false;
		}

		return true;
	}

	/**
	 * Dismiss the welcome notice.
	 *
	 * @return void
	 */
	public function remove_welcome_notice() {
		if ( ! isset( $_POST['nonce'] ) ) {
			return;
		}
		if ( ! wp_verify_nonce( sanitize_text_field( $_POST['nonce'] ), 'otter_animation_dismiss_welcome_notice' ) ) {
			return;
		}
		update_option( 'otter_animation_dismiss_welcome_notice', true );
		wp_die();
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Blocks_Animation
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
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
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
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}
}
