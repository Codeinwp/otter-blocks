<?php
/**
 * Otter Dashboard.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;
use ThemeIsle\GutenbergBlocks\Plugins\FSE_Onboarding;

/**
 * Class Dashboard
 */
class Dashboard {

	/**
	 * The main instance var.
	 *
	 * @var Dashboard|null
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
		add_action( 'admin_init', array( $this, 'maybe_redirect' ) );
		add_action( 'admin_notices', array( $this, 'maybe_add_otter_banner' ), 30 );
		add_action( 'admin_head', array( $this, 'add_inline_css' ) );

		$form_options = get_option( 'themeisle_blocks_form_emails' );
		if ( ! empty( $form_options ) ) {
			add_action( 'wp_dashboard_setup', array( $this, 'form_submissions_widget' ) );
		}
	}

	/**
	 * Register Admin Page
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function register_menu_page() {
		$otter_icon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcyIgogICB3aWR0aD0iMTc4LjY2NjY3IgogICBoZWlnaHQ9IjE3Ny4zMzMzMyIKICAgdmlld0JveD0iMCAwIDE3OC42NjY2NyAxNzcuMzMzMzMiCiAgIHNvZGlwb2RpOmRvY25hbWU9Ik90dGVyIFZlY3RvciBzaW1wbGUuYWkiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnMKICAgICBpZD0iZGVmczYiPgogICAgPGNsaXBQYXRoCiAgICAgICBjbGlwUGF0aFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIKICAgICAgIGlkPSJjbGlwUGF0aDE2Ij4KICAgICAgPHBhdGgKICAgICAgICAgZD0iTSAwLDEzMyBIIDEzNCBWIDAgSCAwIFoiCiAgICAgICAgIGlkPSJwYXRoMTQiIC8+CiAgICA8L2NsaXBQYXRoPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9Im5hbWVkdmlldzQiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjMDAwMDAwIgogICAgIGJvcmRlcm9wYWNpdHk9IjAuMjUiCiAgICAgaW5rc2NhcGU6c2hvd3BhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCIKICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIwIgogICAgIGlua3NjYXBlOmRlc2tjb2xvcj0iI2QxZDFkMSIgLz4KICA8ZwogICAgIGlkPSJnOCIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlua3NjYXBlOmxhYmVsPSJPdHRlciBWZWN0b3Igc2ltcGxlIgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDEuMzMzMzMzMywwLDAsLTEuMzMzMzMzMywwLDE3Ny4zMzMzMykiPgogICAgPGcKICAgICAgIGlkPSJnMTAiPgogICAgICA8ZwogICAgICAgICBpZD0iZzEyIgogICAgICAgICBjbGlwLXBhdGg9InVybCgjY2xpcFBhdGgxNikiPgogICAgICAgIDxnCiAgICAgICAgICAgaWQ9ImcxOCIKICAgICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4Ny4zLDk2LjEpIj4KICAgICAgICAgIDxwYXRoCiAgICAgICAgICAgICBkPSJNIDAsMCBDIDAsMC4xIDAsMC4xIDAsMCAtMC4yLDAuNCAtMC4zLDAuNyAtMC41LDEgLTAuNiwxLjEgLTAuNiwxLjMgLTAuNywxLjQgLTEuNywzLjIgLTIuMSw1IC00LjUsNS4zIEggLTQuNyBDIC01LjYsNS4zIC02LjQsNSAtNyw0LjQgLTcuNiwzLjggLTgsMyAtOC4xLDIuMiAtNS45LDEuOCAtMy44LDEuMyAtMS43LDAuNiBMIC0wLjcsMC4yIC0wLjMsMC4xIDAsMCBjIC0wLjEsMCAtMC4xLDAgMCwwIgogICAgICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICAgIGlkPSJwYXRoMjAiIC8+CiAgICAgICAgPC9nPgogICAgICAgIDxnCiAgICAgICAgICAgaWQ9ImcyMiIKICAgICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5Ny40LDg3LjUpIj4KICAgICAgICAgIDxwYXRoCiAgICAgICAgICAgICBkPSJtIDAsMCBjIC0wLjMsLTUuMSAtMi40LC0xMCAtNS43LC0xMy44IC02LjMsLTcuNCAtMTYuMiwtMTEuOSAtMjQuNywtMTYuMiAtOC41LDQuMyAtMTguNCw4LjggLTI0LjcsMTYuMSAtMy40LDMuOSAtNS40LDguNyAtNS43LDEzLjggLTAuNSw4LjEgMi4xLDIxLjYgMTEuMiwyNC42IDguOSwyLjkgMTQuNSwtNC43IDE2LjUsLTguMSAwLjMsLTAuNSAwLjcsLTAuOSAxLjIsLTEuMSAwLjUsLTAuMyAxLC0wLjQgMS42LC0wLjQgMC42LDAgMS4xLDAuMSAxLjYsMC40IDAuNSwwLjMgMC45LDAuNyAxLjIsMS4xIDIsMy41IDcuNywxMSAxNi41LDguMSBDIC0yLjEsMjEuNiAwLjUsOCAwLDAgbSA1LjEsLTEyLjEgYyAwLDAgMCwxMy44IC0xLjMsMjQuOCAwLjEsMCAwLjIsMC4xIDAuMywwLjEgMC44LDAuMiAxLjUsMC43IDIuMSwxLjQgMC41LDAuNyAwLjgsMS41IDAuOCwyLjMgMCwwLjggLTAuMiwxLjcgLTAuNywyLjQgLTAuNSwwLjcgLTEuMiwxLjIgLTIsMS41IEggNC4yIEMgMi41LDIxIDEsMjIuMSAwLDIzLjYgYyAtNC43LDYuNyAtMTEuNiwxMC4xIC0xNy42LDExLjkgLTQuMiwxLjIgLTguNSwxLjggLTEyLjgsMS44IC00LjYsMCAtOS4yLC0wLjcgLTEzLjYsLTIuMSAtNS44LC0xLjggLTEyLjMsLTUuMyAtMTYuNywtMTEuNyAtMSwtMS41IC0yLjUsLTIuNiAtNC4yLC0zLjIgLTAuOCwtMC4zIC0xLjUsLTAuOCAtMiwtMS41IC0wLjUsLTAuNyAtMC43LC0xLjUgLTAuNywtMi40IDAsLTAuOSAwLjMsLTEuNyAwLjgsLTIuNCAwLjUsLTAuNyAxLjMsLTEuMiAyLjEsLTEuNCBsIDAuMiwtMC4xIEMgLTY0LjksOSAtNjUuMiw1LjMgLTY1LjQsMS43IGMgLTAuNCwtNy42IC0wLjQsLTE0IC0wLjQsLTE0IDAsMCAtMTUuNiwtMjEuMSAtMTYuOSwtNDAgLTAuNywtOS40IDIuMiwtMTguMyAxMi4yLC0yMy44IDE3LjQsLTguOSAyNS4zLDIuOCAyNS4zLDIuOCAwLDAgNS4xLDYuMSAtNi42LDEyLjIgdiAxNi45IGMgMCwwLjYgMC4zLDEuMiAwLjcsMS42IDAuNCwwLjQgMSwwLjcgMS42LDAuNyBoIDQuNCB2IDIuMiBjIDAsMC41IDAuMiwwLjkgMC41LDEuMyAwLjMsMC4zIDAuOCwwLjUgMS4zLDAuNSBoIDYuMSBjIDAuNSwwIDAuOSwtMC4yIDEuMywtMC41IDAuMywtMC4zIDAuNSwtMC44IDAuNSwtMS4zIHYgLTIuMiBoIDEwIHYgMi4yIGMgMCwwLjUgMC4yLDAuOSAwLjUsMS4zIDAuMywwLjMgMC44LDAuNSAxLjMsMC41IGggNi4xIGMgMC41LDAgMC45LC0wLjIgMS4zLC0wLjUgMC4zLC0wLjMgMC41LC0wLjggMC41LC0xLjMgdiAtMi4yIGggNC40IGMgMC42LDAgMS4yLC0wLjIgMS42LC0wLjcgMC40LC0wLjQgMC43LC0xIDAuNywtMS42IHYgLTE2LjcgYyAtMTEuNywtNi4yIC02LjUsLTEyLjIgLTYuNSwtMTIuMiAwLDAgNy45LC0xMS43IDI1LjMsLTIuOCAzMC4yLDE2LjQgLTQuNyw2My44IC00LjcsNjMuOCIKICAgICAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgICBpZD0icGF0aDI0IiAvPgogICAgICAgIDwvZz4KICAgICAgICA8ZwogICAgICAgICAgIGlkPSJnMjYiCiAgICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDYuNyw5Ni4xKSI+CiAgICAgICAgICA8cGF0aAogICAgICAgICAgICAgZD0iTSAwLDAgQyAwLDAuMSAwLDAuMSAwLDAgMC4yLDAuNCAwLjMsMC43IDAuNSwxIDAuNiwxLjEgMC42LDEuMyAwLjcsMS40IDEuNywzLjIgMi4xLDUgNC41LDUuMyBIIDQuNyBDIDUuNiw1LjMgNi40LDUgNyw0LjQgNy42LDMuOCA4LDMgOCwyLjIgNS44LDEuOCAzLjcsMS4zIDEuNiwwLjYgTCAwLjYsMC4yIDAuMiwwLjEgMCwwIGMgMC4xLDAgMCwwIDAsMCIKICAgICAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgICBpZD0icGF0aDI4IiAvPgogICAgICAgIDwvZz4KICAgICAgICA8ZwogICAgICAgICAgIGlkPSJnMzAiCiAgICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjYuMSw3OS4yKSI+CiAgICAgICAgICA8cGF0aAogICAgICAgICAgICAgZD0ibSAwLDAgdiAtMi43IGMgLTEuOCwwIC0zLjcsLTAuMyAtNS40LC0wLjkgLTAuOCwtMC4yIC0xLjYsLTAuNSAtMi4zLC0wLjkgLTEuNCwtMC42IC0yLjcsLTEuMSAtNC4yLC0wLjMgLTAuNSwwLjMgLTAuOSwwLjcgLTEuMiwxLjIgLTAuMywwLjUgLTAuNCwxIC0wLjQsMS42IDAsMS4yIDAuNCwyLjMgMS4xLDMuMyAwLjEsMC4yIDAuMiwwLjUgMC4xLDAuNiAtMC4yLDAuMiAtMC41LDAgLTAuNywtMC4xIC0wLjUsLTAuMyAtMC45LC0wLjYgLTEuMywtMSAtMC43LC0wLjggLTEuMSwtMS45IC0xLjEsLTIuOSAwLC0wLjkgMC4zLC0xLjcgMC43LC0yLjUgMC41LC0wLjggMS4xLC0xLjQgMS45LC0xLjggMC44LC0wLjUgMS43LC0wLjcgMi43LC0wLjcgMC45LDAgMS45LDAuMiAyLjcsMC43IDIuNiwxLjMgNS41LDIgOC41LDEuOSBoIDAuMSBjIDMsMC4xIDYsLTAuNiA4LjYsLTIgMC44LC0wLjQgMS42LC0wLjcgMi41LC0wLjcgMC45LDAgMS43LDAuMiAyLjUsMC43IDAuOCwwLjUgMS41LDEuMSAyLDEuOSAwLjUsMC44IDAuNywxLjcgMC43LDIuNiAwLDAuOCAtMC4yLDEuNyAtMC42LDIuNCAtMC40LDAuNyAtMSwxLjMgLTEuOCwxLjcgQyAxNSwyLjIgMTQuOCwyLjMgMTQuNiwyLjMgSCAxNC41IEMgMTQsMi4yIDE0LjIsMS43IDE0LjQsMS40IGMgMC43LC0xIDEuMSwtMi4yIDEuMSwtMy40IDAsLTAuNiAtMC4yLC0xLjIgLTAuNSwtMS43IC0wLjMsLTAuNSAtMC43LC0wLjkgLTEuMywtMS4yIC0yLC0xLjEgLTMuNiwwLjQgLTUuNCwxIC0yLDAuNyAtNC4yLDEuMSAtNi40LDEuMiBsIDAsMi43IHoiCiAgICAgICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgICAgaWQ9InBhdGgzMiIgLz4KICAgICAgICA8L2c+CiAgICAgICAgPGcKICAgICAgICAgICBpZD0iZzM0IgogICAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDY4LjMsODAuOCkiPgogICAgICAgICAgPHBhdGgKICAgICAgICAgICAgIGQ9Im0gMCwwIGMgMy42LDAuOCA2LjksMi43IDkuNCw1LjQgMC4zLDAuNCAwLjYsMC44IDAuNywxLjIgMC4xLDAuNSAwLjIsMC45IDAuMSwxLjQgLTAuMSwwLjUgLTAuMiwwLjkgLTAuNSwxLjQgLTAuMywwLjQgLTAuNiwwLjggLTEsMSAtMywyLjEgLTYuNiwzLjIgLTEwLjIsMy4yIC0zLjcsMCAtNy4yLC0xLjIgLTEwLjIsLTMuMyAtMC40LC0wLjMgLTAuNywtMC42IC0wLjksLTEgQyAtMTIuOCw4LjkgLTEzLDguNSAtMTMsOCBjIC0wLjEsLTAuNCAwLC0wLjkgMC4xLC0xLjMgMC4xLC0wLjQgMC40LC0wLjggMC43LC0xLjIgMi41LC0yLjggNS44LC00LjggOS41LC01LjYgMSwtMC4xIDEuOSwtMC4xIDIuNywwLjEiCiAgICAgICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgICAgaWQ9InBhdGgzNiIgLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=';

		$page_hook_suffix = add_menu_page(
			__( 'Otter Blocks', 'otter-blocks' ),
			__( 'Otter Blocks', 'otter-blocks' ),
			'manage_options',
			'otter',
			array( $this, 'menu_callback' ),
			$otter_icon
		);

		add_action( "admin_print_scripts-$page_hook_suffix", array( $this, 'enqueue_options_assets' ) );

		/**
		 * Add shortcut to the Blocks tab in Dashboard.
		 */
		

		add_submenu_page(
			'otter',
			__( 'Settings', 'otter-blocks' ),
			__( 'Settings', 'otter-blocks' ),
			'manage_options',
			'otter'
		);

		add_submenu_page(
			'otter',
			__( 'Submissions', 'otter-blocks' ),
			sprintf(
				'<div class="o-menu-submissions">%s <span class="o-menu-badge">%s</span></div>',
				esc_html__( 'Submissions', 'otter-blocks' ),
				esc_html__( 'Pro', 'otter-blocks' )
			),
			'manage_options',
			'form-submissions-free',
			array( $this, 'form_submissions_callback' ),
			10
		);

		add_submenu_page(
			'otter',
			__( 'Blocks', 'otter-blocks' ),
			__( 'Blocks', 'otter-blocks' ),
			'manage_options',
			'otter-blocks-toggle',
			function() {
				echo '<p>Redirecting...</p>
				<script>document.location.href = "/wp-admin/admin.php?page=otter#blocks";</script>';
			}
		);
	}

	/**
	 * Add inline CSS.
	 */
	public function add_inline_css() {
		?>
		<style>
			.o-menu-submissions {
				display: flex;
				align-items: center;
			}

			.o-menu-badge {
				border: 1px solid;
				border-radius: 16px;
				color: inherit;
				font-size: 10px;
				font-weight: 600;
				line-height: 8px;
				margin: 0;
				opacity: .8;
				padding: 4px 6px;
				text-transform: uppercase;
			}
		</style>
		<?php
	
	}

	/**
	 * Register Admin Page
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function menu_callback() {
		echo '<div id="otter"></div>';
	}

	/**
	 * The content of the form submissions upsell page.
	 */
	public function form_submissions_callback() {
		?>
		<style>
			div.error, div.notice {
				display: none;
			}

			.otter-form-submissions-upsell-content {
				text-align: center;
				padding: 40px 20px;
				max-width: 520px;
				margin: 0 auto;
			}

			.otter-form-submissions-upsell-content h2 {
				font-size: 32px;
				margin-bottom: 25px;
			}

			.otter-form-submissions-upsell-content p {
				font-size: 14px;
				margin-bottom: 20px;
			}

			.otter-form-submissions-upsell-content .button {
				font-size: 16px;
				padding: 10px 50px;
				background-color: #ED6F57;
				border-color: #ED6F57;
			}

			.otter-form-submissions-upsell-content .button:hover {
				background-color: #E25C4F;
				border-color: #E25C4F;
			}
		</style>
		<div id="otter-form-submissions-upsell">
			<div class="otter-form-submissions-upsell-content">
				<img style="max-width: 100%" src="<?php echo esc_url( OTTER_BLOCKS_URL . 'assets/images/form-submissions-upsell.svg' ); ?>" alt="Otter Form Submissions Upsell" />
				<h2 style="line-height: 1"><?php esc_html_e( 'Collect Your Form Submissions', 'otter-blocks' ); ?></h2>
				<p><?php esc_html_e( 'Store, manage and analyze your form submissions with ease – all in one place. With Otter powerful features, managing submissions has never been simpler.', 'otter-blocks' ); ?></p>
				<a href="<?php echo esc_url( tsdk_utmify( 'https://themeisle.com/plugins/otter-blocks/upgrade/', 'form-submissions', 'admin' ) ); ?>" class="button button-primary" target="_blank"><?php esc_html_e( 'Explore Otter PRO', 'otter-blocks' ); ?></a>
			</div>
		</div>
		<?php
	}

	/**
	 * Load assets for option page.
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function enqueue_options_assets() {
		$wp_upload_dir = wp_upload_dir( null, false );
		$basedir       = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$asset_file    = include OTTER_BLOCKS_PATH . '/build/dashboard/index.asset.php';

		wp_enqueue_style(
			'otter-blocks-styles',
			OTTER_BLOCKS_URL . 'build/dashboard/style-index.css',
			array( 'wp-components' ),
			$asset_file['version']
		);

		wp_enqueue_script(
			'otter-blocks-scripts',
			OTTER_BLOCKS_URL . 'build/dashboard/index.js',
			array_merge( $asset_file['dependencies'], [ 'updates' ] ),
			$asset_file['version'],
			true
		);

		wp_set_script_translations( 'otter-blocks-scripts', 'otter-blocks' );

		$offer = new LimitedOffers();

		wp_localize_script(
			'otter-blocks-scripts',
			'otterObj',
			apply_filters(
				'otter_dashboard_data',
				array(
					'version'                => OTTER_BLOCKS_VERSION,
					'assetsPath'             => OTTER_BLOCKS_URL . 'assets/',
					'stylesExist'            => is_dir( $basedir ) || boolval( get_transient( 'otter_animations_parsed' ) ),
					'hasPro'                 => Pro::is_pro_installed(),
					'upgradeLink'            => tsdk_utmify( Pro::get_url(), 'options', Pro::get_reference() ),
					'docsLink'               => Pro::get_docs_url(),
					'showFeedbackNotice'     => $this->should_show_feedback_notice(),
					'deal'                   => ! Pro::is_pro_installed() ? $offer->get_localized_data() : array(),
					'hasOnboarding'          => false !== get_theme_support( FSE_Onboarding::SUPPORT_KEY ),
					'days_since_install'     => round( ( time() - get_option( 'otter_blocks_install', time() ) ) / DAY_IN_SECONDS ),
					'rootUrl'                => get_site_url(),
					'neveThemePreviewUrl'    => esc_url(
						add_query_arg(
							array(
								'theme' => 'neve',
							),
							admin_url( 'theme-install.php' )
						)
					),
					'neveThemeActivationUrl' => esc_url(
						add_query_arg(
							array(
								'action'     => 'activate',
								'stylesheet' => 'neve',
								'_wpnonce'   => wp_create_nonce( 'switch-theme_neve' ),
							),
							admin_url( 'themes.php' )
						)
					),
					'neveDashboardUrl'       => esc_url(
						add_query_arg(
							array(
								'page' => 'neve-welcome',
							),
							admin_url( 'admin.php' )
						)
					),
					'neveInstalled'          => defined( 'NEVE_VERSION' ),
				)
			)
		);
	}

	/**
	 * Maybe redirect to dashboard page.
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function maybe_redirect() {
		if ( ! get_option( 'themeisle_blocks_settings_redirect' ) ) {
			return;
		}

		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			return;
		}

		if ( is_network_admin() || isset( $_GET['activate-multi'] ) ) { // phpcs:ignore WordPress.VIP.SuperGlobalInputUsage.AccessDetected,WordPress.Security.NonceVerification.NoNonceVerification
			return;
		}

		update_option( 'themeisle_blocks_settings_redirect', false );
		wp_safe_redirect( admin_url( 'admin.php?page=otter' ) );
		exit;
	}

	/**
	 * Add the Otter banner on the 'edit-otter_form_record' page.
	 *
	 * @return void
	 */
	public function maybe_add_otter_banner() {
		$screen = get_current_screen();
		if ( 'edit-otter_form_record' === $screen->id || 'otter-blocks_page_form-submissions-free' === $screen->id ) {
			$this->the_otter_banner();
		}
	}

	/**
	 * Whether to show the feedback notice or not.
	 *
	 * @return bool
	 */
	private function should_show_feedback_notice() {
		$installed = get_option( 'otter_blocks_install' );

		return ! empty( $installed ) && $installed < strtotime( '-5 days' );
	}

	/**
	 * The top Otter banner.
	 *
	 * @return void
	 */
	private function the_otter_banner() {
		?>
		<style>
			#screen-options-link-wrap {
				display: none;
			}

			.otter-banner {
				display: flex;
				background: #fff;
				padding: 10px 20px;
				margin-left: -20px
			}

			.otter-banner__content {
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				align-content: center;
				width: 100%;
				margin-left: 10px;
				align-items: center;
			}

			.otter-banner__version {
				align-self: center;
				font-size: 11px;
			}

			/* Hide the "Add New" button for Multisite WP. Second part is for Elementor */
			a.page-title-action:first-of-type, #e-admin-top-bar-root:not(.e-admin-top-bar--active)~#wpbody .wrap a.page-title-action:first-of-type {
				display: none;
			}

			#export-submissions {
				font-size: 14px;
				max-height: 35px;
			}
		</style>
		<div class="otter-banner">
			<div class="otter-banner__image">
				<img src="<?php echo esc_url( OTTER_BLOCKS_URL . 'assets/images/logo-alt.png' ); ?>" alt="<?php esc_attr_e( 'Otter Blocks', 'otter-blocks' ); ?>" style="width: 90px">
			</div>
			<div class="otter-banner__content">
				<h1 class="otter-banner__title" style="line-height: normal;"><?php esc_html_e( 'Form Submissions', 'otter-blocks' ); ?></h1>

				<?php if ( Pro::is_pro_active() ) : ?>
				<button id="export-submissions" class="button">
					<?php esc_html_e( 'Export', 'otter-blocks' ); ?>
				</button>
				<?php endif; ?>
			</div>
		</div>
		<script>
			window.document.addEventListener('DOMContentLoaded', () => {
				document.querySelector('#export-submissions')?.addEventListener('click', () => {
					fetch('<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams({
							action: 'otter_form_submissions',
							_nonce: '<?php echo esc_attr( wp_create_nonce( 'otter_form_export_submissions' ) ); ?>'
						})
					})
						.then(response => response.text())
						.then(response => {
							const currentDate = new Date();
							const year = currentDate.getFullYear();
							const month = String(currentDate.getMonth() + 1).padStart(2, '0');
							const day = String(currentDate.getDate()).padStart(2, '0');

							const blob = new Blob([response], {type: 'text/xml'});
							const url = window.URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = `otter_form_submissions__${year}-${month}-${day}.xml`;
							document.body.appendChild(a);
							a.click();
						})
						.catch(error => console.error('Error:', error));
				});

			})
		</script>
		<?php
	}

	/**
	 * Hook the form submissions widget.
	 *
	 * @return void
	 */
	public function form_submissions_widget() {
		wp_add_dashboard_widget(
			'otter_form_submissions_widget',
			__( 'Otter Blocks - Form Submissions', 'otter-blocks' ),
			array( $this, 'form_submissions_widget_content' )
		);
	}

	/**
	 * Display the form submissions widget content.
	 *
	 * @return void
	 */
	public function form_submissions_widget_content() {

		$is_active    = Pro::is_pro_active();
		$entries      = array();
		$count        = 0;
		$posts_filter = 'all';

		if ( $is_active ) {
			$posts_filter = isset( $_GET['otter_nonce'] ) && wp_verify_nonce( sanitize_key( $_GET['otter_nonce'] ), 'otter_widget_nonce' ) && isset( $_GET['otter_form_widget_filter'] ) ? sanitize_key( $_GET['otter_form_widget_filter'] ) : 'all';

			$query_args = array(
				'post_type'      => 'otter_form_record',
				'posts_per_page' => 5,
			);

			if ( 'all' !== $posts_filter ) {
				$query_args['post_status'] = $posts_filter;
			}

			$query = new \WP_Query( $query_args );


			$records_count = wp_count_posts( 'otter_form_record' );

			$count = $records_count->read + $records_count->unread;

			if ( 'read' === $posts_filter ) {
				$count = $records_count->read;
			} elseif ( 'unread' === $posts_filter ) {
				$count = $records_count->unread;
			}

			if ( $query->have_posts() ) {

				while ( $query->have_posts() ) {
					$query->the_post();

					$meta = get_post_meta( get_the_ID(), 'otter_form_record_meta', true );

					$title = null;
					$date  = null;

					if ( isset( $meta['post_id']['value'] ) ) {
						$date = get_the_date( 'F j, H:i', $meta['post_id']['value'] );
					}

					if ( isset( $meta['inputs'] ) && is_array( $meta['inputs'] ) ) {
						// Find the first email field and use that as the title.
						foreach ( $meta['inputs'] as $input ) {
							if ( isset( $input['type'] ) && 'email' === $input['type'] && ! empty( $input['value'] ) ) {
								$title = $input['value'];
								break;
							}
						}
					}


					if ( ! $title ) {

						if ( isset( $meta['post_id']['value'] ) ) {
							$title = __( 'Submission', 'otter-blocks' ) . ' #' . get_the_ID();
						} else {
							$title = __( 'No title', 'otter-blocks' );
						}
					}

					$entries[] = array(
						'title' => $title,
						'date'  => $date,
					);
				}
			}
		}

		?>
		<style>
			.o-upsell-container {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				margin-bottom: 8px;
			}

			.o-upsell-banner {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				padding: 24px;
				gap: 12px;
				isolation: isolate;

				width: fit-content;

				background: #FFFFFF;
				box-shadow: 0px 2px 25px 10px rgba(0, 0, 0, 0.08);
				border-radius: 6px;

				/* Inside auto layout */

				flex: none;
				order: 0;
				align-self: stretch;
				flex-grow: 0;

			}

			.o-upsell-banner .o-banner-tile {
				font-weight: 600;
				font-size: 16px;
				line-height: 150%;
				text-align: center;
			}

			.o-upsell-banner p {
				font-weight: 400;
				font-size: 13px;
				line-height: 150%;
				display: flex;
				align-items: center;
				text-align: center;
				margin: 0px;
			}

			.o-upsell-banner a {
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				padding: 13.5px 24px;
				background: #ED6F57;
				border-radius: 2px;
				font-style: normal;
				font-weight: 600;
				font-size: 13px;
				line-height: 13px;
				color: #FFFFFF;
			}

			.o-upsell-banner img {
				width: 80px
			}

			.otter-form-submissions-widget {
				padding: 6px 3px 0px 3px;
			}

			.otter-form-submissions-widget a {
				text-decoration: none;
				text-align: center;
			}

			.otter-form-submissions-widget, .o-form-entries, .o-entries-list {
				display: flex;
				flex-direction: column;
			}

			.o-form-entries {
				gap: 12px;
			}

			.o-entries-header, .o-entry {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				font-size: 14px;
			}


			.o-entries-header .o-title {
				font-size: 14px;
				font-weight: 600;
			}

			.o-entries-list {
				gap: 5px;
				font-size: 13px;
			}

			.o-entry.header {
				font-size: 14px;
				font-weight: bold;
			}

			.o-entry:not(:last-child) {
				padding-bottom: 6px;
				border-bottom: 1px solid #eee;
			}

			.o-submissions-view {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				padding-top: 10px;
			}

			.otter-form-submissions-widget.inactive .o-form-entries {
				color: #CCC;
			}

		</style>
		<?php if ( $is_active ) { ?>
			<script>
				window.document.addEventListener('DOMContentLoaded', () => {
					const select = document.querySelector('#otter_form_submissions_widget #otter-form-submissions-widget__form-select');
					const entriesContainer = document.querySelector('#otter_form_submissions_widget .o-entries-list');

					if (select && entriesContainer) {
						select.addEventListener('change', (e) => {
							const value = e.target.value;

							// change the url param based on the value
							const url = new URL(window.location.href);
							url.searchParams.set('otter_form_widget_filter', value);
							url.searchParams.set('otter_nonce', '<?php echo esc_attr( wp_create_nonce( 'otter_widget_nonce' ) ); ?>')
							url.hash = '#otter_form_submissions_widget';

							window.location.href = url.href;
						})
					}
				})
			</script>
		<?php } ?>
		<div class="otter-form-submissions-widget <?php echo ! $is_active ? 'inactive' : ''; ?>">

			<?php if ( ! $is_active ) { ?>
				<div class="o-upsell-container">
					<div class="o-upsell-banner">
						<img src="<?php echo esc_url_raw( OTTER_BLOCKS_URL . 'assets/images/logo-alt.png' ); ?>" alt="Otter Logo" />
						<div class="o-banner-tile">
							<?php esc_html_e( 'Collect your Form Submissions with Otter Blocks', 'otter-blocks' ); ?>
						</div>
						<p><?php esc_html_e( 'With Otter\'s powerful features, you can easily store and manage form submissions - all in one place.', 'otter-blocks' ); ?></p>
						<a target="_blank" href="<?php echo esc_url( Pro::get_url() ); ?>" ><?php esc_html_e( 'Upgrade to Otter Pro', 'otter-blocks' ); ?></a>
					</div>
				</div>
			<?php } ?>

			<div class="o-form-entries">
				<div class="o-entries-header">
					<div class="o-title">
						<?php if ( 0 === count( $entries ) || ! $is_active ) { ?>
							<?php esc_html_e( 'Total Entries', 'otter-blocks' ); ?>
						<?php } else { ?>
							<?php esc_html_e( 'Total Entries', 'otter-blocks' ); ?>:
							<span class="otter-form-submissions-widget__total-entries">
							<?php echo esc_html( strval( $count ) ); ?>
						</span>
						<?php } ?>
					</div>

					<select name="otter-form-submissions-widget__form-select" id="otter-form-submissions-widget__form-select" class="o-entries-filter" <?php echo ! $is_active ? 'disabled' : ''; ?> >
						<option value="all" <?php echo 'all' === $posts_filter ? 'selected' : ''; ?> ><?php esc_html_e( 'All', 'otter-blocks' ); ?></option>
						<option value="read" <?php echo 'read' === $posts_filter ? 'selected' : ''; ?>><?php esc_html_e( 'Read', 'otter-blocks' ); ?></option>
						<option value="unread" <?php echo 'unread' === $posts_filter ? 'selected' : ''; ?>><?php esc_html_e( 'Unread', 'otter-blocks' ); ?></option>
					</select>
				</div>
				<div class="o-entries-list">
					<?php if ( 0 === count( $entries ) || ! $is_active ) { ?>
						<div class="o-no-entries">
							<?php esc_html_e( 'Your submission will appear here.', 'otter-blocks' ); ?>
						</div>
					<?php } else { ?>
						<div class="o-entry header">
							<div class="o-entry__title">
								<?php esc_html_e( 'Submission', 'otter-blocks' ); ?>
							</div>
							<div class="o-entry__date">
								<?php esc_html_e( 'Date', 'otter-blocks' ); ?>
							</div>
						</div>
						<?php foreach ( $entries as $entry ) { ?>
							<div class="o-entry">
								<div class="o-entry__title">
									<?php echo esc_html( $entry['title'] ); ?>
								</div>
								<div class="o-entry__date">
									<?php echo esc_html( $entry['date'] ); ?>

								</div>
							</div>
						<?php } ?>
						<div class="o-submissions-view">
							<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=otter_form_record' ) ); ?>" ><?php esc_html_e( 'Manage all Submissions', 'otter-blocks' ); ?></a>
						</div>
					<?php } ?>
				</div>
			</div>


		</div>
		<?php
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return Dashboard
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
	 * @since 1.7.1
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
	 * @since 1.7.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
