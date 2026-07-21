<?php
/**
 * Otter Dashboard.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;
use ThemeIsle\GutenbergBlocks\Plugins\FSE_Onboarding;
use ThemeIsle\GutenbergBlocks\Plugins\Template_Cloud;
use ThemeIsle\GutenbergBlocks\Server\AI_Client_Adaptor;

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
	 * Transient key for the cached Otter pages count.
	 *
	 * @var string
	 */
	const PAGES_COUNT_CACHE_KEY = 'otter_blocks_pages_with_css_count';

	/**
	 * Post meta keys used as markers that a page uses Otter blocks.
	 *
	 * @var string[]
	 */
	const PAGES_COUNT_META_KEYS = array(
		'_themeisle_gutenberg_block_stylesheet',
		'_themeisle_gutenberg_block_styles',
		'_atomic_wind_css',
	);

	/**
	 * Largest exact page count we display; above this the heading shows "100+".
	 *
	 * @var int
	 */
	const PAGES_COUNT_DISPLAY_CAP = 100;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
		add_action( 'admin_init', array( $this, 'maybe_redirect' ) );
		add_action( 'admin_head', array( $this, 'survey_elements' ) );
		add_action( 'admin_notices', array( $this, 'form_submission_elements' ), 30 );
		add_action( 'admin_head', array( $this, 'add_inline_css' ) );

		$form_options = get_option( 'themeisle_blocks_form_emails' );
		if ( ! empty( $form_options ) ) {
			add_action( 'wp_dashboard_setup', array( $this, 'form_submissions_widget' ) );
		}

		add_filter( 'themeisle-sdk/survey/' . OTTER_PRODUCT_SLUG, array( __CLASS__, 'get_survey_metadata' ), 10, 2 );

		add_action( 'otter_pro_uninstall_feedback_popup_header_after_heading', [ $this, 'uninstall_feedback_popup_after_heading' ] );
		add_action( 'otter_blocks_uninstall_feedback_popup_header_after_heading', [ $this, 'uninstall_feedback_popup_after_heading' ] );

		add_action( 'added_post_meta', array( $this, 'maybe_invalidate_pages_count_cache' ), 10, 4 );
		add_action( 'updated_post_meta', array( $this, 'maybe_invalidate_pages_count_cache' ), 10, 4 );
		add_action( 'deleted_post_meta', array( $this, 'maybe_invalidate_pages_count_cache' ), 10, 4 );
	}

	/**
	 * Count pages that use Otter blocks, inferred from generated CSS post meta.
	 *
	 * Stops counting one past the display cap so large sites avoid a full-table
	 * aggregate; callers treat a result above the cap as "many".
	 *
	 * @return int
	 */
	private function get_number_of_pages() {
		$cached = get_transient( self::PAGES_COUNT_CACHE_KEY );

		if ( false !== $cached ) {
			return (int) $cached;
		}

		global $wpdb;

		$limit = self::PAGES_COUNT_DISPLAY_CAP + 1;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$post_ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT pm.post_id
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE p.post_status NOT IN ( 'trash', 'auto-draft' )
				AND p.post_type IN ( 'page', 'post' )
				AND pm.meta_key IN ( %s, %s, %s )
				AND pm.meta_value != ''
				LIMIT %d",
				self::PAGES_COUNT_META_KEYS[0],
				self::PAGES_COUNT_META_KEYS[1],
				self::PAGES_COUNT_META_KEYS[2],
				$limit
			)
		);

		$result = count( $post_ids );

		set_transient( self::PAGES_COUNT_CACHE_KEY, $result, DAY_IN_SECONDS );

		return $result;
	}


	/**
	 * Inline styles and header links for the Otter uninstall feedback popup.
	 *
	 * Fires inside `.popup--header`, right after the heading, via the SDK
	 * `{product_key}_uninstall_feedback_popup_header_after_heading` action.
	 *
	 * @return void
	 */
	public function uninstall_feedback_popup_after_heading() {
		static $printed_style = false;

		$count = $this->get_number_of_pages();

		// Leave the modal untouched when no pages use Otter blocks.
		if ( $count < 1 ) {
			return;
		}

		$display = $count > self::PAGES_COUNT_DISPLAY_CAP
			? self::PAGES_COUNT_DISPLAY_CAP . '+'
			: (string) $count;

		/* translators: %s: number of pages, e.g. "13". */
		$pages_label = sprintf( _n( '%s page', '%s pages', $count, 'otter-blocks' ), $display );

		$message = sprintf(
			/* translators: %s: number of pages, already wrapped in <strong>, e.g. "13 pages". */
			__( 'Otter Blocks is active on %s. Uninstalling may break parts of your site.', 'otter-blocks' ),
			'<strong>' . esc_html( $pages_label ) . '</strong>'
		);

		$documentation_url = Pro::get_docs_url();
		$support_url       = Pro::is_pro_active()
			? 'https://store.themeisle.com/'
			: 'https://wordpress.org/support/plugin/otter-blocks/';
		?>
		<div class="otter-uninstall-header">
			<div class="otter-uninstall-header__text">
				<div class="otter-uninstall-header__eyebrow"><?php esc_html_e( 'Before you go', 'otter-blocks' ); ?></div>
				<p class="otter-uninstall-header__message"><?php echo wp_kses( $message, array( 'strong' => array() ) ); ?></p>
			</div>
			<div class="otter-uninstall-header__links">
				<a class="otter-uninstall-header__link otter-uninstall-header__link--primary" href="<?php echo esc_url( $documentation_url ); ?>" target="_blank" rel="noopener noreferrer">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
					</svg>
					<?php esc_html_e( 'Documentation', 'otter-blocks' ); ?>
				</a>
				<a class="otter-uninstall-header__link otter-uninstall-header__link--secondary" href="<?php echo esc_url( $support_url ); ?>" target="_blank" rel="noopener noreferrer">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
						<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
					</svg>
					<?php esc_html_e( 'Get Support', 'otter-blocks' ); ?>
				</a>
			</div>
		</div>
		<?php

		if ( $printed_style ) {
			return;
		}

		$printed_style = true;
		?>
		<style>
			/* Replace the default SDK heading with our own header block. */
			#otter-blocks_uninstall_feedback_popup .popup--header h5,
			#otter-pro_uninstall_feedback_popup .popup--header h5 {
				display: none;
			}

			.otter-uninstall-header {
				padding: 13px 16px;
				text-align: left;
			}

			.otter-uninstall-header__eyebrow {
				margin-bottom: 3px;
				font-size: 10px;
				font-weight: 600;
				letter-spacing: 0.07em;
				text-transform: uppercase;
				color: rgba(255, 255, 255, 0.72);
			}

			/* Scope the text colors under the popup id so admin styles can't override them. */
			#otter-blocks_uninstall_feedback_popup .otter-uninstall-header__message,
			#otter-pro_uninstall_feedback_popup .otter-uninstall-header__message {
				margin: 0;
				font-size: 12px;
				font-weight: 500;
				line-height: 1.4;
				color: #fff;
			}

			#otter-blocks_uninstall_feedback_popup .otter-uninstall-header__message strong,
			#otter-pro_uninstall_feedback_popup .otter-uninstall-header__message strong {
				font-size: 12px;
				display: inline;
				font-weight: 700;
				color: #fff;
			}

			.otter-uninstall-header__links {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				margin-top: 11px;
			}

			.otter-uninstall-header__link,
			.otter-uninstall-header__link:hover,
			.otter-uninstall-header__link:focus,
			.otter-uninstall-header__link:active {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				padding: 6px 11px;
				border-radius: 6px;
				font-size: 12px;
				font-weight: 600;
				line-height: 1;
				text-decoration: none;
				box-shadow: none;
				outline: none;
			}

			.otter-uninstall-header__link svg {
				flex: 0 0 auto;
			}

			.otter-uninstall-header__link--primary,
			.otter-uninstall-header__link--primary:hover,
			.otter-uninstall-header__link--primary:focus,
			.otter-uninstall-header__link--primary:active {
				background: #fff;
				color: #23A1CE;
			}

			.otter-uninstall-header__link--secondary,
			.otter-uninstall-header__link--secondary:hover,
			.otter-uninstall-header__link--secondary:focus,
			.otter-uninstall-header__link--secondary:active {
				background: rgba(255, 255, 255, 0.14);
				color: #fff;
			}

			.otter-uninstall-header__link:hover {
				opacity: .9;
			}
		</style>
		<?php
	}

	/**
	 * Invalidate the pages count cache when Otter CSS meta changes.
	 *
	 * @param int    $meta_id    Meta ID.
	 * @param int    $object_id  Post ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 *
	 * @return void
	 */
	public function maybe_invalidate_pages_count_cache( $meta_id, $object_id, $meta_key, $meta_value ) {
		unset( $meta_id, $object_id, $meta_value );

		if ( in_array( $meta_key, self::PAGES_COUNT_META_KEYS, true ) ) {
			delete_transient( self::PAGES_COUNT_CACHE_KEY );
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
			__( 'Blocks', 'otter-blocks' ),
			__( 'Blocks', 'otter-blocks' ),
			'manage_options',
			'otter-blocks-toggle',
			function () {
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
				gap: 6px;
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

			.notice.themeisle-sale {
				margin-top: 40px;
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
	 * Load assets for option page.
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function enqueue_options_assets() {
		$asset_file = include OTTER_BLOCKS_PATH . '/build/dashboard/index.asset.php';

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

		wp_localize_script(
			'otter-blocks-scripts',
			'otterObj',
			$this->get_dashboard_data()
		);

		do_action( 'themeisle_internal_page', OTTER_PRODUCT_SLUG, 'dashboard' );
	}

	/**
	 * Get the latest video from the Otter YouTube playlist.
	 *
	 * Uses the WordPress feed API (SimplePie under the hood), which handles
	 * fetching, XML/namespace parsing and transient caching for us.
	 *
	 * @return array{videoTitle: string, videoLink: string, thumbnail: string|null}
	 */
	private function get_youtube_playlist_data() {
		$playlist_id = 'PLmRasCVwuvpSep2MOsIoE0ncO9JE3FcKP';

		$data = array(
			'videoTitle' => __( 'Otter Tutorials', 'otter-blocks' ),
			'videoLink'  => 'https://youtube.com/playlist?list=' . $playlist_id,
			'thumbnail'  => null,
		);

		$feed = fetch_feed( 'https://www.youtube.com/feeds/videos.xml?playlist_id=' . $playlist_id );

		if ( is_wp_error( $feed ) ) {
			return $data;
		}

		$item = $feed->get_item();

		if ( ! $item ) {
			return $data;
		}

		// YouTube nests <media:thumbnail> inside <media:group>, so the item-level
		// get_thumbnail() returns null; SimplePie exposes it via the enclosure.
		$enclosure = $item->get_enclosure();
		$thumbnail = $enclosure ? $enclosure->get_thumbnail() : '';

		$data['videoTitle'] = $item->get_title();
		$data['videoLink']  = $item->get_permalink();
		$data['thumbnail']  = ! empty( $thumbnail ) ? $thumbnail : null;

		return $data;
	}

	/**
	 * Get the dashboard data to store in global object.
	 *
	 * @return array
	 */
	public function get_dashboard_data() {
		$wp_upload_dir = wp_upload_dir( null, false );
		$basedir       = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$offer         = new LimitedOffers();

		$global_data = array(
			'version'                => OTTER_BLOCKS_VERSION,
			'assetsPath'             => OTTER_BLOCKS_URL . 'assets/',
			'stylesExist'            => is_dir( $basedir ) || boolval( get_transient( 'otter_animations_parsed' ) ),
			'hasPro'                 => Pro::is_pro_installed(),
			'otterPage'              => tsdk_translate_link( tsdk_utmify( 'https://themeisle.com/plugins/otter-blocks/', 'welcome', 'admin' ) ),
			'upgradeLink'            => tsdk_translate_link( tsdk_utmify( Pro::get_url(), 'options', Pro::get_reference() ) ),
			'upgradeLinkFromTc'      => tsdk_utmify( Pro::get_url(), 'templatecloud' ),
			'tcUpgradeLink'          => tsdk_utmify( 'https://themeisle.com/plugins/templates-cloud/', 'templatecloud', 'otter-blocks' ),
			'tcDocs'                 => 'https://docs.themeisle.com/article/2191-templates-cloud-collections',
			'docsLink'               => Pro::get_docs_url(),
			'newPageUrl'             => esc_url( admin_url( 'post-new.php?post_type=page' ) ),
			'showFeedbackNotice'     => $this->should_show_feedback_notice(),
			'deal'                   => ! Pro::is_pro_installed() ? $offer->get_localized_data() : array(),
			'hasOnboarding'          => false !== get_theme_support( FSE_Onboarding::SUPPORT_KEY ),
			'days_since_install'     => intval( ( time() - get_option( 'otter_blocks_install', time() ) ) / DAY_IN_SECONDS ),
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
			'hasPatternSources'      => Template_Cloud::has_used_pattern_sources(),
			'aiClientAvailable'      => AI_Client_Adaptor::is_available(),
			'aiClientSupported'      => function_exists( 'wp_ai_client_prompt' ),
			'connectorsUrl'          => esc_url( admin_url( 'options-connectors.php' ) ),
			'youtubePlaylistData'    => $this->get_youtube_playlist_data(),
		);

		$global_data = apply_filters( 'otter_dashboard_data', $global_data );
		
		if (
			isset( $global_data['license'], $global_data['license']['key'] )
			&& 'free' !== $global_data['license']['key']
			&& 6 <= strlen( $global_data['license']['key'] )
		) {
			$global_data['license']['key'] = str_repeat( '*', 26 ) . substr( $global_data['license']['key'], -6 );
		}

		return $global_data;
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

		if ( is_network_admin() || isset( $_GET['activate-multi'] ) ) { // phpcs:ignore WordPress.VIP.SuperGlobalInputUsage.AccessDetected,WordPress.Security.NonceVerification.Recommended
			return;
		}

		update_option( 'themeisle_blocks_settings_redirect', false );
		wp_safe_redirect( admin_url( 'admin.php?page=otter&welcome=true' ) );
		exit;
	}

	/**
	 * Add elements for the survey.
	 *
	 * @return void
	 */
	public function survey_elements() {
		$screen = get_current_screen();

		if ( 'edit-otter_form_record' === $screen->id ) {
			do_action( 'themeisle_internal_page', OTTER_PRODUCT_SLUG, 'form-submissions' );
		}
	}

	/**
	 * Add elements for Form Block submission page.
	 *
	 * @return void
	 */
	public function form_submission_elements() {
		$screen = get_current_screen();

		if ( 'edit-otter_form_record' === $screen->id ) {
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

			.o-export-split {
				position: relative;
				display: inline-flex;
			}

			.o-export-split #export-submissions {
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
			}

			.o-export-split__toggle {
				border-top-left-radius: 0 !important;
				border-bottom-left-radius: 0 !important;
				border-left: none !important;
				padding: 0 6px !important;
			}

			.o-export-split__menu {
				position: absolute;
				top: 100%;
				right: 0;
				z-index: 10;
				margin: 4px 0 0;
				padding: 4px 0;
				list-style: none;
				background: #fff;
				border: 1px solid #c3c4c7;
				border-radius: 4px;
				box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
				min-width: 220px;
			}

			.o-export-split__item {
				display: block;
				width: 100%;
				padding: 8px 12px;
				background: none;
				border: none;
				text-align: left;
				cursor: pointer;
				font-size: 13px;
			}

			.o-export-split__item:hover,
			.o-export-split__item:focus {
				background: #f0f0f1;
			}

			.wp-core-ui .button.o-locked-action,
			.wp-core-ui .button.o-locked-action:focus {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				color: #ED6F57;
				border-color: #ED6F57;
			}

			.wp-core-ui .button.o-locked-action:hover,
			.wp-core-ui .button.o-locked-action:active {
				color: #E25C4F;
				border-color: #E25C4F;
				background: #fdf1ef;
			}

			.o-locked-action .dashicons-lock {
				font-size: 15px;
				width: 15px;
				height: 15px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
			}

			.o-locked-action .o-menu-badge {
				opacity: 1;
			}

			.otter-banner__actions {
				display: inline-flex;
				align-items: center;
				gap: 12px;
			}

			.o-pro-notice {
				color: #757575;
				font-size: 12px;
			}
		</style>
		<div class="otter-banner">
			<div class="otter-banner__image">
				<img src="<?php echo esc_url( OTTER_BLOCKS_URL . 'assets/images/logo-alt.png' ); ?>" alt="<?php esc_attr_e( 'Otter Blocks', 'otter-blocks' ); ?>" style="width: 90px">
			</div>
			<div class="otter-banner__content">
				<h1 class="otter-banner__title" style="line-height: normal;"><?php esc_html_e( 'Form Submissions', 'otter-blocks' ); ?></h1>

				<?php if ( Pro::is_pro_active() ) : ?>
				<div class="o-export-split">
					<button id="export-submissions" class="button" data-format="xml">
						<?php esc_html_e( 'Export', 'otter-blocks' ); ?>
					</button>
					<button
						id="export-submissions-toggle"
						type="button"
						class="button o-export-split__toggle"
						aria-controls="export-submissions-menu"
						aria-expanded="false"
						aria-label="<?php esc_attr_e( 'Choose file format', 'otter-blocks' ); ?>"
					>
						<span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span>
					</button>
					<ul id="export-submissions-menu" class="o-export-split__menu" hidden>
						<li><button type="button" class="o-export-split__item" data-format="xml"><?php esc_html_e( 'Export as WordPress XML (WXR)', 'otter-blocks' ); ?></button></li>
						<li><button type="button" class="o-export-split__item" data-format="csv"><?php esc_html_e( 'Export as CSV', 'otter-blocks' ); ?></button></li>
					</ul>
				</div>
				<?php else : ?>
				<span class="otter-banner__actions">
					<span class="o-pro-notice"><?php esc_html_e( 'Filter and export form submissions with Otter Pro.', 'otter-blocks' ); ?></span>
					<a
						class="button o-locked-action"
						href="<?php echo esc_url( tsdk_translate_link( tsdk_utmify( 'https://themeisle.com/plugins/otter-blocks/upgrade/', 'form-submissions-export', 'admin' ) ) ); ?>"
						target="_blank"
						rel="noopener"
						title="<?php esc_attr_e( 'Bulk export is available in Otter Pro.', 'otter-blocks' ); ?>"
					>
						<span class="dashicons dashicons-lock" aria-hidden="true"></span>
						<?php esc_html_e( 'Export', 'otter-blocks' ); ?>
						<span class="o-menu-badge"><?php esc_html_e( 'Pro', 'otter-blocks' ); ?></span>
					</a>
				</span>
				<?php endif; ?>
			</div>
		</div>
		<script>
			window.document.addEventListener('DOMContentLoaded', () => {
				const exportBtn = document.querySelector('#export-submissions');
				const toggleBtn = document.querySelector('#export-submissions-toggle');
				const menu = document.querySelector('#export-submissions-menu');

				const closeMenu = () => {
					if (!menu || !toggleBtn) {
						return;
					}

					menu.setAttribute('hidden', '');
					toggleBtn.setAttribute('aria-expanded', 'false');
				};

				const runExport = (format) => {
					fetch('<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams({
							action: 'otter_form_submissions',
							format: format,
							_nonce: '<?php echo esc_attr( wp_create_nonce( 'otter_form_export_submissions' ) ); ?>'
						})
					})
						.then(response => response.text())
						.then(response => {
							const currentDate = new Date();
							const year = currentDate.getFullYear();
							const month = String(currentDate.getMonth() + 1).padStart(2, '0');
							const day = String(currentDate.getDate()).padStart(2, '0');

							const isCsv = 'csv' === format;
							const blob = new Blob([response], {type: isCsv ? 'text/csv;charset=utf-8' : 'text/xml'});
							const url = window.URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = `otter_form_submissions__${year}-${month}-${day}.${isCsv ? 'csv' : 'xml'}`;
							document.body.appendChild(a);
							a.click();
						})
						.catch(error => console.error('Error:', error));
				};

				exportBtn?.addEventListener('click', () => runExport(exportBtn.dataset.format || 'xml'));

				toggleBtn?.addEventListener('click', (event) => {
					event.stopPropagation();

					if (menu.hasAttribute('hidden')) {
						menu.removeAttribute('hidden');
						toggleBtn.setAttribute('aria-expanded', 'true');
					} else {
						closeMenu();
					}
				});

				menu?.querySelectorAll('.o-export-split__item').forEach((item) => {
					item.addEventListener('click', () => {
						runExport(item.dataset.format);
						closeMenu();
					});
				});

				document.addEventListener('click', (event) => {
					if (menu && !menu.hasAttribute('hidden') && !menu.contains(event.target) && event.target !== toggleBtn) {
						closeMenu();
					}
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

		// Submission storage lives in the lite plugin: the widget shows real data for every plan.
		$is_active    = post_type_exists( 'otter_form_record' );
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
	 * Register survey.
	 * 
	 * @param array  $data The data in Formbricks format.
	 * @param string $page_slug The page slug.
	 * 
	 * @return array The data in Frombricks format.
	 */
	public static function get_survey_metadata( $data, $page_slug ) {
		$dash_data           = apply_filters( 'otter_dashboard_data', array() );
		$install_days_number = intval( ( time() - get_option( 'otter_blocks_install', time() ) ) / DAY_IN_SECONDS );

		$data = array(
			'environmentId' => 'clp9hqm8c1osfdl2ixwd0k0iz',
			'attributes'    => array(
				'install_days_number' => $install_days_number,
				'plan'                => isset( $dash_data['license'], $dash_data['license']['type'] ) ? $dash_data['license']['type'] : 'free',
				'freeVersion'         => OTTER_BLOCKS_VERSION,
			),
		);

		if ( isset( $dash_data['license'], $dash_data['license']['key'] ) ) {
			$data['attributes']['license_key'] = apply_filters( 'themeisle_sdk_secret_masking', apply_filters( 'product_otter_license_key', '' ) );
		}

		if ( isset( $dash_data['proVersion'] ) ) {
			$data['attributes']['proVersion'] = $dash_data['proVersion'];
		}

		return $data;
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
