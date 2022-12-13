<?php
/**
 * Pro Support.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Pro
 */
class Pro {
	/**
	 * Singleton.
	 *
	 * @var Pro Class object.
	 */
	protected static $instance = null;

	/**
	 * Method to define hooks needed.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init() {
		if ( 'valid' === apply_filters( 'product_neve_license_status', false ) && true === apply_filters( 'neve_has_block_editor_module', false ) && ! ( defined( 'NEVE_PRO_HIDE_UPDATE_NOTICE' ) && true === NEVE_PRO_HIDE_UPDATE_NOTICE ) ) {
			add_action( 'admin_notices', array( $this, 'old_neve_notice' ) );
		}

		add_action( 'init', array( $this, 'init_upsells' ) );
	}

	/**
	 * Hook upsells
	 *
	 * We do it here because the is_pro_active hook is not fired until the init function.
	 *
	 * @since   2.0.9
	 * @access  public
	 */
	public function init_upsells() {
		if ( self::is_pro_active() ) {
			return;
		}

		add_action( 'add_meta_boxes', array( $this, 'register_metabox' ) );
		add_filter( 'cron_schedules', array( $this, 'add_cron_schedules' ) );
		add_action( 'wp', array( $this, 'schedule_cron_events' ) );
		add_action( 'otter_montly_scheduled_events', array( $this, 'reset_dashboard_notice' ) );
		add_action( 'admin_init', array( $this, 'should_show_dashboard_upsell' ), 11 );
		add_action( 'admin_init', array( $this, 'should_show_bf_upsell' ), 11 );
		add_filter( 'plugin_action_links_' . plugin_basename( OTTER_BLOCKS_BASEFILE ), array( $this, 'add_pro_link' ) );
	}

	/**
	 * Check if Otter Pro is available
	 *
	 * @since   2.0.3
	 * @access  public
	 * @return  bool
	 */
	public static function is_pro_installed() {
		return class_exists( '\ThemeIsle\OtterPro\Main' ) && defined( 'OTTER_PRO_VERSION' );
	}

	/**
	 * Check if Otter Pro is active
	 *
	 * @since   2.0.3
	 * @access  public
	 * @return  bool
	 */
	public static function is_pro_active() {
		return self::is_pro_installed() && 'valid' === apply_filters( 'product_otter_license_status', false );
	}

	/**
	 * Get Otter Pro URL
	 *
	 * @since   2.0.3
	 * @access  public
	 * @return  string
	 */
	public static function get_url() {
		return 'https://themeisle.com/plugins/otter-blocks/upgrade/';
	}

	/**
	 * Get Otter reference install.
	 *
	 * @since   2.0.14
	 * @access  public
	 *
	 * @return string Reference key.
	 */
	public static function get_reference() {
		$ref = get_option( 'otter_reference_key', '' );

		return empty( $ref ) ? null : $ref;
	}
	/**
	 * Get Otter Docs URL
	 *
	 * @since   2.0.3
	 * @access  public
	 * @return  string
	 */
	public static function get_docs_url() {
		return 'https://bit.ly/otter-docs';
	}

	/**
	 * Check if we show Upsell notification or not
	 *
	 * @since   2.0.4
	 * @access  public
	 * @return  bool
	 */
	public static function should_show_upsell() {
		$show_upsell = false;

		if ( defined( 'OTTER_PRO_VERSION' ) ) {
			return $show_upsell;
		}

		$installed     = get_option( 'otter_blocks_install' );
		$notifications = get_option( 'themeisle_blocks_settings_notifications', array() );

		if ( ( ! empty( $installed ) && $installed < strtotime( '-5 days' ) ) || ( defined( 'OTTER_BLOCKS_SHOW_NOTICES' ) && true === OTTER_BLOCKS_SHOW_NOTICES ) ) {
			$show_upsell = true;
		}

		if ( defined( 'OTTER_BLOCKS_SHOW_NOTICES' ) && true === OTTER_BLOCKS_SHOW_NOTICES ) {
			$show_upsell = true;
		}

		if ( isset( $notifications['editor_upsell'] ) && true === boolval( $notifications['editor_upsell'] ) ) {
			$show_upsell = false;
		}

		return $show_upsell;
	}

	/**
	 * Check if we show Upsell notification or not
	 *
	 * @since   2.0.8
	 * @access  public
	 */
	public function should_show_dashboard_upsell() {
		$show_upsell = false;

		$installed     = get_option( 'otter_blocks_install' );
		$notifications = get_option( 'themeisle_blocks_settings_notifications', array() );

		if ( ( ! empty( $installed ) && $installed < strtotime( '-30 days' ) ) || ( defined( 'OTTER_BLOCKS_SHOW_NOTICES' ) && true === OTTER_BLOCKS_SHOW_NOTICES ) ) {
			$show_upsell = true;
		}

		if ( isset( $notifications['dashboard_upsell'] ) && true === boolval( $notifications['dashboard_upsell'] ) ) {
			$show_upsell = false;
		}

		if ( self::bf_deal() ) {
			$show_upsell = false;
		}

		if ( defined( 'OTTER_BLOCKS_SHOW_NOTICES' ) && true === OTTER_BLOCKS_SHOW_NOTICES ) {
			$show_upsell = true;
		}

		if ( $show_upsell ) {
			add_action( 'admin_notices', array( $this, 'dashboard_upsell_notice' ) );
			add_action( 'wp_ajax_dismiss_otter_notice', array( $this, 'dismiss_dashboard_notice' ) );
		}
	}

	/**
	 * Check if we show BFUpsell notification or not
	 *
	 * @since   2.0.8
	 * @access  public
	 */
	public function should_show_bf_upsell() {
		$show_upsell   = self::bf_deal();
		$notifications = get_option( 'themeisle_blocks_settings_notifications', array() );

		if ( defined( 'NEVE_VERSION' ) || defined( 'NEVE_PRO_VERSION' ) ) {
			$show_upsell = false;
		}

		if ( isset( $notifications['2022_bf_notice'] ) && true === boolval( $notifications['2022_bf_notice'] ) ) {
			$show_upsell = false;
		}

		if ( $show_upsell ) {
			add_action( 'admin_notices', array( $this, 'dashboard_upsell_bf_notice' ) );
			add_action( 'wp_ajax_dismiss_otter_bf_notice', array( $this, 'dismiss_dashboard_bf_notice' ) );
		}
	}

	/**
	 * Register Metabox
	 *
	 * @param string $post_type Post type.
	 *
	 * @since   2.0.3
	 * @access  public
	 */
	public function register_metabox( $post_type ) {
		add_meta_box(
			'otter_woo_builder',
			__( 'WooCommerce Builder by Otter', 'otter-blocks' ),
			array( $this, 'render_metabox_upsell' ),
			'product',
			'side',
			'high'
		);
	}

	/**
	 * Render Metabox
	 *
	 * @param string $post_type Post type.
	 *
	 * @since   2.0.3
	 * @access  public
	 */
	public function render_metabox_upsell( $post_type ) {
		if ( ! self::is_pro_installed() ) {
			?>
			<style type="text/css">
				.o-upsell li {
					display: flex;
					align-items: center;
				}

				.o-upsell li::before {
					content: "\f147";
					font-family: 'Dashicons';
					color: #2271B1;
					font-size: 16px;
					margin-right: 5px;
				}
			</style>
			<div class="clear o-upsell">
				<p><?php _e( 'Unlock the full power of WooCommerce Builder with Otter Pro:', 'otter-blocks' ); ?></p>

				<ul>
					<li><?php _e( 'WooCommerce Block Builder', 'otter-blocks' ); ?></li>
					<li><?php _e( 'Add to Cart Block', 'otter-blocks' ); ?></li>
					<li><?php _e( 'Review Comparison  Block', 'otter-blocks' ); ?></li>
					<li><?php _e( 'Priority Support', 'otter-blocks' ); ?></li>
				</ul>

				<a href="<?php echo esc_url_raw( tsdk_utmify( self::get_url(), 'woobuilder', 'wooproducteditor' ) ); ?>" target="_blank" class="button button-primary">
					<?php _e( 'Discover Otter Pro', 'otter-blocks' ); ?>
				</a>
			</div>
			<?php
			return;
		}

		?>
		<div class="clear">
			<p><?php _e( 'Unlock the full power of WooCommerce Builder by activating Otter Pro license.', 'otter-blocks' ); ?></p>

			<a href="<?php echo esc_url( admin_url( 'options-general.php?page=otter' ) ); ?>" target="_blank" class="button button-primary">
				<?php _e( 'Activate License', 'otter-blocks' ); ?>
			</a>
		</div>
		<?php
	}

	/**
	 * Notice displayed if using old version of Neve.
	 *
	 * @since   2.0.3
	 * @access  public
	 */
	public function old_neve_notice() {
		$plugin_name = __( 'Block Editor Booster', 'otter-blocks' );
		$message     = __( 'You need to make sure Neve & Neve Pro Addons are updated to the latest version to continue using Block Editor Booster.', 'otter-blocks' );

		printf(
			'<div class="error"><p><b>%1$s</b> %2$s <a href="%3$s">%4$s</a></p></div>',
			esc_html( $plugin_name ),
			esc_html( $message ),
			esc_url( admin_url( 'update-core.php' ) ),
			esc_html__( 'Update', 'otter-blocks' )
		);
	}

	/**
	 * Notice for Dashboard upsell.
	 *
	 * @since   2.0.8
	 * @access  public
	 */
	public function dashboard_upsell_notice() {
		?>
		<script type="text/javascript">
			const disableNotice = $ => {
				const button = document.querySelector( '.o-dismiss-notice' );

				if ( null !== button ) {
					$( button ).on( 'click', e => {
						e.preventDefault()
						$.post(
							'<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>',
							{
								nonce: '<?php echo esc_attr( wp_create_nonce( 'dismiss_otter_notice' ) ); ?>',
								action: 'dismiss_otter_notice',
								success: function () {
									$( '.o-notice' ).fadeOut()
								}
							}
						)
					})
				}
			};

			jQuery( document ).ready( () => disableNotice( jQuery ) );
		</script>
		<?php
		$prefix  = __( 'You\'re using Otter!', 'otter-blocks' );
		$message = __( 'Enhance your WordPress site building with Otter Pro.', 'otter-blocks' );
		$notice  = printf(
			'<div class="o-notice notice notice-info is-dismissible">
				<svg style="float: left; margin: .5em 0; padding: 2px; padding-right: 10px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 32" width="20" height="20" class"otter-icon"><path d="M19.831 7.877c0.001-0.003 0.001-0.005 0.001-0.009s-0-0.006-0.001-0.009l0 0c-0.047-0.081-0.092-0.164-0.132-0.247l-0.057-0.115c-0.277-0.498-0.381-0.99-1.033-1.064h-0.045c-0.001 0-0.002 0-0.003 0-0.486 0-0.883 0.382-0.908 0.862l-0 0.002c0.674 0.126 1.252 0.278 1.813 0.468l-0.092-0.027 0.283 0.096 0.147 0.053s0.028 0 0.028-0.011z" /><path d="M23.982 13.574c-0.008-2.41-0.14-4.778-0.39-7.112l0.026 0.299 0.070-0.019c0.459-0.139 0.787-0.558 0.787-1.053 0-0.479-0.307-0.887-0.735-1.037l-0.008-0.002h-0.026c-0.479-0.164-0.874-0.468-1.149-0.861l-0.005-0.007c-2.7-3.96-8.252-3.781-8.252-3.781s-5.55-0.179-8.25 3.781c-0.28 0.401-0.676 0.704-1.14 0.862l-0.016 0.005c-0.441 0.148-0.754 0.557-0.754 1.040 0 0.009 0 0.017 0 0.026l-0-0.001c-0 0.010-0.001 0.022-0.001 0.034 0 0.493 0.335 0.907 0.789 1.029l0.007 0.002 0.045 0.011c-0.224 2.034-0.356 4.403-0.364 6.801l-0 0.012s-9.493 13.012-1.277 17.515c4.733 2.431 6.881-0.769 6.881-0.769s1.397-1.661-1.784-3.355v-4.609c0.006-0.344 0.282-0.621 0.625-0.628h1.212v-0.59c0-0.275 0.223-0.498 0.498-0.498v0h1.665c0.274 0.001 0.496 0.224 0.496 0.498 0 0 0 0 0 0v0 0.59h2.721v-0.59c0-0.275 0.223-0.498 0.498-0.498v0h1.665c0.271 0.005 0.49 0.226 0.49 0.498 0 0 0 0 0 0v0 0.59h1.209c0 0 0 0 0 0 0.349 0 0.633 0.28 0.639 0.627v4.584c-3.193 1.703-1.784 3.355-1.784 3.355s2.148 3.193 6.879 0.769c8.222-4.503-1.269-17.515-1.269-17.515zM22.586 10.261c-0.097 1.461-0.67 2.772-1.563 3.797l0.007-0.008c-1.703 2.010-4.407 3.249-6.721 4.432v0c-2.325-1.177-5.026-2.416-6.736-4.432-0.883-1.019-1.455-2.329-1.555-3.769l-0.001-0.020c-0.126-2.22 0.583-5.929 3.044-6.74 2.416-0.788 3.947 1.288 4.494 2.227 0.152 0.258 0.429 0.428 0.745 0.428s0.593-0.17 0.743-0.424l0.002-0.004c0.551-0.932 2.080-3.008 4.494-2.22 2.474 0.805 3.174 4.513 3.046 6.734z" /><path d="M19.463 10.087h-0.028c-0.192 0.026-0.121 0.251-0.047 0.356 0.254 0.349 0.407 0.787 0.407 1.26 0 0.006-0 0.012-0 0.018v-0.001c-0.001 0.469-0.255 0.878-0.633 1.1l-0.006 0.003c-0.739 0.426-1.377-0.145-2.054-0.398-0.72-0.269-1.552-0.434-2.42-0.455l-0.009-0v-1.033c1.020-0.233 1.894-0.76 2.551-1.486l0.004-0.004c0.151-0.163 0.244-0.383 0.244-0.623 0-0.316-0.159-0.595-0.402-0.76l-0.003-0.002c-0.768-0.551-1.728-0.881-2.764-0.881-1.054 0-2.029 0.341-2.819 0.92l0.013-0.009c-0.224 0.166-0.367 0.429-0.367 0.726 0 0.226 0.083 0.433 0.221 0.591l-0.001-0.001c0.665 0.751 1.55 1.295 2.553 1.53l0.033 0.007v1.050c-0.742 0.021-1.448 0.14-2.118 0.343l0.057-0.015c-0.341 0.103-0.631 0.219-0.908 0.358l0.033-0.015c-0.519 0.26-1.037 0.436-1.58 0.121-0.371-0.213-0.617-0.607-0.617-1.058 0-0.002 0-0.004 0-0.007v0c0-0.002 0-0.004 0-0.007 0-0.47 0.153-0.905 0.411-1.257l-0.004 0.006c0.047-0.068 0.089-0.17 0.026-0.241s-0.189 0-0.27 0.030c-0.189 0.099-0.348 0.227-0.479 0.381l-0.002 0.002c-0.245 0.296-0.394 0.679-0.394 1.097 0 0.004 0 0.007 0 0.011v-0.001c0.008 0.706 0.393 1.321 0.964 1.651l0.009 0.005c0.296 0.178 0.654 0.283 1.036 0.283 0.364 0 0.706-0.095 1.001-0.263l-0.010 0.005c0.877-0.461 1.917-0.731 3.019-0.731 0.069 0 0.137 0.001 0.206 0.003l-0.010-0h0.030c1.277 0 2.382 0.266 3.266 0.775 0.27 0.159 0.594 0.253 0.94 0.253 0.001 0 0.002 0 0.003 0h-0c0.355-0.002 0.688-0.098 0.974-0.265l-0.009 0.005c0.606-0.357 1.007-1.007 1.007-1.75 0-0.001 0-0.003 0-0.004v0c0.001-0.026 0.002-0.056 0.002-0.086 0-0.625-0.34-1.171-0.846-1.462l-0.008-0.004c-0.056-0.040-0.125-0.065-0.199-0.070l-0.001-0zM13.101 8.831c-0.238 0.213-0.468 0.581-0.832 0.345-0.061-0.041-0.114-0.086-0.161-0.136l-0-0c-0.063-0.063-0.101-0.15-0.101-0.247 0-0.133 0.074-0.248 0.182-0.308l0.002-0.001c0.594-0.309 1.203-0.543 1.884-0.49-0.324 0.281-0.649 0.56-0.973 0.837z" /><path d="M15.89 13.578c-0.367 0.483-0.941 0.792-1.588 0.792s-1.221-0.309-1.585-0.787l-0.004-0.005c-0.064-0.103-0.177-0.171-0.306-0.171-0.199 0-0.36 0.161-0.36 0.36 0 0.091 0.034 0.174 0.090 0.238l-0-0c0.499 0.659 1.283 1.080 2.164 1.080s1.665-0.421 2.159-1.073l0.005-0.007c0.043-0.059 0.068-0.132 0.068-0.212 0-0.116-0.055-0.22-0.14-0.286l-0.001-0.001c-0.059-0.045-0.134-0.072-0.215-0.072-0.117 0-0.221 0.056-0.286 0.143l-0.001 0.001z" /><path d="M18.507 11.707c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M17.389 11.049c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M10.798 11.707c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M11.918 11.049c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M8.773 7.877c-0.001-0.003-0.002-0.005-0.002-0.009s0.001-0.006 0.002-0.009l-0 0c0.047-0.081 0.089-0.164 0.132-0.247 0.019-0.038 0.036-0.079 0.057-0.115 0.275-0.498 0.379-0.99 1.033-1.064h0.045c0 0 0.001 0 0.001 0 0.487 0 0.884 0.382 0.91 0.862l0 0.002c-0.678 0.124-1.261 0.277-1.827 0.468l0.092-0.027-0.275 0.096-0.1 0.036-0.045 0.017s-0.023 0-0.023-0.011z" /></svg>
				<p>
					<b>%1$s</b> %2$s <a target="_blank" href="%3$s">%4$s</a> <a class="notice-dismiss o-dismiss-notice" href="#"><span class="screen-reader-text">%5$s</span></a>
				</p>
			</div>',
			esc_html( $prefix ),
			esc_html( $message ),
			esc_url_raw( tsdk_utmify( self::get_url(), 'noticeusing', 'editor' ) ),
			esc_html__( 'Learn more', 'otter-blocks' ),
			esc_html__( 'Dismiss notice', 'otter-blocks' )
		);
	}

	/**
	 * Notice for BF upsell.
	 *
	 * @access  public
	 */
	public function dashboard_upsell_bf_notice() {
		$current_screen = get_current_screen();

		if ( isset( $current_screen->base ) && 'settings_page_otter' === $current_screen->base ) {
			return;
		}
		?>
		<script type="text/javascript">
			const disableBFNotice = $ => {
				const button = document.querySelector( '.o-dismiss-bf-notice' );

				if ( null !== button ) {
					$( button ).on( 'click', e => {
						e.preventDefault()
						$.post(
							'<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>',
							{
								nonce: '<?php echo esc_attr( wp_create_nonce( 'dismiss_otter_bf_notice' ) ); ?>',
								action: 'dismiss_otter_bf_notice',
								success: function () {
									$( '.o-notice' ).fadeOut()
								}
							}
						)
					})
				}
			};

			jQuery( document ).ready( () => disableBFNotice( jQuery ) );
		</script>
		<?php
		$prefix = __( 'Otter Black Friday Sale', 'otter-blocks' );
		$notice = printf(
			'<div class="o-notice notice notice-info is-dismissible">
				<svg style="float: left; margin: .5em 0; padding: 2px; padding-right: 10px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 32" width="20" height="20" class"otter-icon"><path d="M19.831 7.877c0.001-0.003 0.001-0.005 0.001-0.009s-0-0.006-0.001-0.009l0 0c-0.047-0.081-0.092-0.164-0.132-0.247l-0.057-0.115c-0.277-0.498-0.381-0.99-1.033-1.064h-0.045c-0.001 0-0.002 0-0.003 0-0.486 0-0.883 0.382-0.908 0.862l-0 0.002c0.674 0.126 1.252 0.278 1.813 0.468l-0.092-0.027 0.283 0.096 0.147 0.053s0.028 0 0.028-0.011z" /><path d="M23.982 13.574c-0.008-2.41-0.14-4.778-0.39-7.112l0.026 0.299 0.070-0.019c0.459-0.139 0.787-0.558 0.787-1.053 0-0.479-0.307-0.887-0.735-1.037l-0.008-0.002h-0.026c-0.479-0.164-0.874-0.468-1.149-0.861l-0.005-0.007c-2.7-3.96-8.252-3.781-8.252-3.781s-5.55-0.179-8.25 3.781c-0.28 0.401-0.676 0.704-1.14 0.862l-0.016 0.005c-0.441 0.148-0.754 0.557-0.754 1.040 0 0.009 0 0.017 0 0.026l-0-0.001c-0 0.010-0.001 0.022-0.001 0.034 0 0.493 0.335 0.907 0.789 1.029l0.007 0.002 0.045 0.011c-0.224 2.034-0.356 4.403-0.364 6.801l-0 0.012s-9.493 13.012-1.277 17.515c4.733 2.431 6.881-0.769 6.881-0.769s1.397-1.661-1.784-3.355v-4.609c0.006-0.344 0.282-0.621 0.625-0.628h1.212v-0.59c0-0.275 0.223-0.498 0.498-0.498v0h1.665c0.274 0.001 0.496 0.224 0.496 0.498 0 0 0 0 0 0v0 0.59h2.721v-0.59c0-0.275 0.223-0.498 0.498-0.498v0h1.665c0.271 0.005 0.49 0.226 0.49 0.498 0 0 0 0 0 0v0 0.59h1.209c0 0 0 0 0 0 0.349 0 0.633 0.28 0.639 0.627v4.584c-3.193 1.703-1.784 3.355-1.784 3.355s2.148 3.193 6.879 0.769c8.222-4.503-1.269-17.515-1.269-17.515zM22.586 10.261c-0.097 1.461-0.67 2.772-1.563 3.797l0.007-0.008c-1.703 2.010-4.407 3.249-6.721 4.432v0c-2.325-1.177-5.026-2.416-6.736-4.432-0.883-1.019-1.455-2.329-1.555-3.769l-0.001-0.020c-0.126-2.22 0.583-5.929 3.044-6.74 2.416-0.788 3.947 1.288 4.494 2.227 0.152 0.258 0.429 0.428 0.745 0.428s0.593-0.17 0.743-0.424l0.002-0.004c0.551-0.932 2.080-3.008 4.494-2.22 2.474 0.805 3.174 4.513 3.046 6.734z" /><path d="M19.463 10.087h-0.028c-0.192 0.026-0.121 0.251-0.047 0.356 0.254 0.349 0.407 0.787 0.407 1.26 0 0.006-0 0.012-0 0.018v-0.001c-0.001 0.469-0.255 0.878-0.633 1.1l-0.006 0.003c-0.739 0.426-1.377-0.145-2.054-0.398-0.72-0.269-1.552-0.434-2.42-0.455l-0.009-0v-1.033c1.020-0.233 1.894-0.76 2.551-1.486l0.004-0.004c0.151-0.163 0.244-0.383 0.244-0.623 0-0.316-0.159-0.595-0.402-0.76l-0.003-0.002c-0.768-0.551-1.728-0.881-2.764-0.881-1.054 0-2.029 0.341-2.819 0.92l0.013-0.009c-0.224 0.166-0.367 0.429-0.367 0.726 0 0.226 0.083 0.433 0.221 0.591l-0.001-0.001c0.665 0.751 1.55 1.295 2.553 1.53l0.033 0.007v1.050c-0.742 0.021-1.448 0.14-2.118 0.343l0.057-0.015c-0.341 0.103-0.631 0.219-0.908 0.358l0.033-0.015c-0.519 0.26-1.037 0.436-1.58 0.121-0.371-0.213-0.617-0.607-0.617-1.058 0-0.002 0-0.004 0-0.007v0c0-0.002 0-0.004 0-0.007 0-0.47 0.153-0.905 0.411-1.257l-0.004 0.006c0.047-0.068 0.089-0.17 0.026-0.241s-0.189 0-0.27 0.030c-0.189 0.099-0.348 0.227-0.479 0.381l-0.002 0.002c-0.245 0.296-0.394 0.679-0.394 1.097 0 0.004 0 0.007 0 0.011v-0.001c0.008 0.706 0.393 1.321 0.964 1.651l0.009 0.005c0.296 0.178 0.654 0.283 1.036 0.283 0.364 0 0.706-0.095 1.001-0.263l-0.010 0.005c0.877-0.461 1.917-0.731 3.019-0.731 0.069 0 0.137 0.001 0.206 0.003l-0.010-0h0.030c1.277 0 2.382 0.266 3.266 0.775 0.27 0.159 0.594 0.253 0.94 0.253 0.001 0 0.002 0 0.003 0h-0c0.355-0.002 0.688-0.098 0.974-0.265l-0.009 0.005c0.606-0.357 1.007-1.007 1.007-1.75 0-0.001 0-0.003 0-0.004v0c0.001-0.026 0.002-0.056 0.002-0.086 0-0.625-0.34-1.171-0.846-1.462l-0.008-0.004c-0.056-0.040-0.125-0.065-0.199-0.070l-0.001-0zM13.101 8.831c-0.238 0.213-0.468 0.581-0.832 0.345-0.061-0.041-0.114-0.086-0.161-0.136l-0-0c-0.063-0.063-0.101-0.15-0.101-0.247 0-0.133 0.074-0.248 0.182-0.308l0.002-0.001c0.594-0.309 1.203-0.543 1.884-0.49-0.324 0.281-0.649 0.56-0.973 0.837z" /><path d="M15.89 13.578c-0.367 0.483-0.941 0.792-1.588 0.792s-1.221-0.309-1.585-0.787l-0.004-0.005c-0.064-0.103-0.177-0.171-0.306-0.171-0.199 0-0.36 0.161-0.36 0.36 0 0.091 0.034 0.174 0.090 0.238l-0-0c0.499 0.659 1.283 1.080 2.164 1.080s1.665-0.421 2.159-1.073l0.005-0.007c0.043-0.059 0.068-0.132 0.068-0.212 0-0.116-0.055-0.22-0.14-0.286l-0.001-0.001c-0.059-0.045-0.134-0.072-0.215-0.072-0.117 0-0.221 0.056-0.286 0.143l-0.001 0.001z" /><path d="M18.507 11.707c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M17.389 11.049c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M10.798 11.707c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M11.918 11.049c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" /><path d="M8.773 7.877c-0.001-0.003-0.002-0.005-0.002-0.009s0.001-0.006 0.002-0.009l-0 0c0.047-0.081 0.089-0.164 0.132-0.247 0.019-0.038 0.036-0.079 0.057-0.115 0.275-0.498 0.379-0.99 1.033-1.064h0.045c0 0 0.001 0 0.001 0 0.487 0 0.884 0.382 0.91 0.862l0 0.002c-0.678 0.124-1.261 0.277-1.827 0.468l0.092-0.027-0.275 0.096-0.1 0.036-0.045 0.017s-0.023 0-0.023-0.011z" /></svg>
				<p>
					<b>%1$s</b> Save big with a <b>Lifetime License</b> on all Otter Pro Plans. <b>Only 100 licenses</b> will be available! <a target="_blank" href="%2$s">%3$s</a> <a class="notice-dismiss o-dismiss-bf-notice" href="#"><span class="screen-reader-text">%4$s</span></a>
				</p>
			</div>',
			esc_html( $prefix ),
			esc_url_raw( 'https://bit.ly/otter-2022bf' ),
			esc_html__( 'Learn more', 'otter-blocks' ),
			esc_html__( 'Dismiss notice', 'otter-blocks' )
		);
	}

	/**
	 * Dismiss Dashboard upsell.
	 *
	 * @since   2.0.8
	 * @access  public
	 */
	public function dismiss_dashboard_notice() {
		if ( ! isset( $_POST['nonce'] ) ) {
			return;
		}

		if ( ! wp_verify_nonce( sanitize_text_field( $_POST['nonce'] ), 'dismiss_otter_notice' ) ) {
			return;
		}

		$notifications                     = get_option( 'themeisle_blocks_settings_notifications', array() );
		$notifications['dashboard_upsell'] = true;
		update_option( 'themeisle_blocks_settings_notifications', $notifications );
		wp_die();
	}

	/**
	 * Dismiss Dashboard bf upsell.
	 *
	 * @access  public
	 */
	public function dismiss_dashboard_bf_notice() {
		if ( ! isset( $_POST['nonce'] ) ) {
			return;
		}

		if ( ! wp_verify_nonce( sanitize_text_field( $_POST['nonce'] ), 'dismiss_otter_bf_notice' ) ) {
			return;
		}

		$notifications                   = get_option( 'themeisle_blocks_settings_notifications', array() );
		$notifications['2022_bf_notice'] = true;
		update_option( 'themeisle_blocks_settings_notifications', $notifications );
		wp_die();
	}

	/**
	 * Add new cron schedule.
	 *
	 * @param array $schedules Cron Schedules.
	 *
	 * @since   2.0.8
	 * @access  public
	 */
	public function add_cron_schedules( $schedules = array() ) {
		// Adds once monthly to the existing schedules.
		$schedules['monthly'] = array(
			'display'  => __( 'Monthly', 'otter-blocks' ),
			'interval' => 2635200,
		);

		return $schedules;
	}

	/**
	 * Schedule cron events.
	 *
	 * @since   2.0.8
	 * @access  public
	 */
	public function schedule_cron_events() {
		if ( ! wp_next_scheduled( 'otter_montly_scheduled_events' ) ) {
			wp_schedule_event( current_time( 'timestamp', true ), 'monthly', 'otter_montly_scheduled_events' );
		}
	}

	/**
	 * Rest dashboard notice settings.
	 *
	 * @since   2.0.8
	 * @access  public
	 */
	public function reset_dashboard_notice() {
		$notifications = get_option( 'themeisle_blocks_settings_notifications', array() );

		if ( isset( $notifications['dashboard_upsell'] ) && true === boolval( $notifications['dashboard_upsell'] ) ) {
			$notifications['dashboard_upsell'] = false;
			update_option( 'themeisle_blocks_settings_notifications', $notifications );
		}
	}

	/**
	 * Should show BF Deal?.
	 *
	 * @param bool $days To show in bool or days.
	 *
	 * @since  2.1.1
	 * @access public
	 */
	public static function bf_deal( $days = false ) {
		$start_time   = '2022-11-21T00:00:00';
		$end_time     = '2022-11-28T23:59:00';
		$offset       = 60 * get_option( 'gmt_offset' );
		$sign         = $offset < 0 ? '-' : '+';
		$absmin       = abs( $offset );
		$timezone     = sprintf( '%s%02d:%02d', $sign, $absmin / 60, $absmin % 60 );
		$start_date   = strtotime( $start_time . $timezone );
		$current_time = time();
		$end_date     = strtotime( $end_time . $timezone );

		if ( $days ) {
			$days_between = ceil( abs( $end_date - $current_time ) / 86400 );
			return $days_between;
		}

		$start_date = $current_time > $start_date;
		$end_date   = $current_time < $end_date;

		if ( $start_date && $end_date && ! self::is_pro_installed() ) {
			return true;
		}

		return false;
	}

	/**
	 * Add Pro Link to Plugins Page
	 *
	 * @param array $links Action Links.
	 *
	 * @since  2.1.6
	 * @access public
	 */
	public function add_pro_link( $links ) {
		$links[] = sprintf(
			'<a href="%s" target="_blank" style="color:#ed6f57;font-weight:bold;">%s</a>',
			esc_url_raw( tsdk_utmify( self::get_url(), 'pluginspage', 'action' ) ),
			__( 'Get Otter Pro', 'otter-blocks' )
		);

		return $links;
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
