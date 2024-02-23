<?php
/**
 * Offers.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use DateTime;
use DateTimeZone;
use Exception;

/**
 * Class LimitedOffers
 */
class LimitedOffers {

	/**
	 * Active deal.
	 *
	 * @var string
	 */
	private $active = '';

	/**
	 * The key for WP Options to disable the dashboard notification.
	 *
	 * @var string
	 */
	public $wp_option_dismiss_notification_key_base = 'dismiss_themeisle_notice_event_';

	/**
	 * Metadata for announcements.
	 *
	 * @var array
	 */
	public $assets = array();

	/**
	 * Timeline for the offers.
	 *
	 * @var array
	 */
	public $announcements = array();

	/**
	 * LimitedOffers constructor.
	 */
	public function __construct() {
		$this->announcements = apply_filters( 'themeisle_sdk_announcements', array() );

		if ( empty( $this->announcements ) || ! is_array( $this->announcements ) ) {
			return;
		}
	
		try {
			foreach ( $this->announcements as $announcement => $event_data ) {
				if ( false !== strpos( $announcement, 'black_friday' ) ) {
					if (
						empty( $event_data ) ||
						! is_array( $event_data ) ||
						empty( $event_data['active'] ) ||
						empty( $event_data['otter_dashboard_url'] ) ||
						! isset( $event_data['urgency_text'] )
					) {
						continue;
					}

					$this->active = $announcement;
					$this->prepare_black_friday_assets( $event_data );
				}
			}
		} catch ( Exception $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( $e->getMessage() ); // phpcs:ignore
			}
		}
	}

	/**
	 * Load hooks for the dashboard.
	 *
	 * @return void
	 */
	public function load_dashboard_hooks() {

		if ( empty( $this->assets['globalNoticeUrl'] ) ) {
			return;
		}

		add_filter( 'themeisle_products_deal_priority', array( $this, 'add_priority' ) );
		add_action( 'admin_notices', array( $this, 'render_notice' ) );
		add_action( 'wp_ajax_dismiss_themeisle_event_notice_otter', array( $this, 'disable_notification_ajax' ) );
	}

	/**
	 * Check if we have an active deal.
	 *
	 * @return bool True if the deal is active.
	 */
	public function is_active() {
		return ! empty( $this->active );
	}

	/**
	 * Activate the Black Friday deal.
	 *
	 * @param array $data Event data.
	 *
	 * @return void
	 */
	public function prepare_black_friday_assets( $data ) {
		$this->assets = array_merge(
			$this->assets,
			array(
				'bannerUrl'      => OTTER_BLOCKS_URL . 'assets/images/black-friday-banner.png',
				'bannerAlt'      => 'Otter Black Friday Sale',
				'bannerStoreUrl' => esc_url_raw( $data['otter_dashboard_url'] ),
				'urgencyText'    => esc_html( $data['urgency_text'] ),
			)
		);
	}

	/**
	 * Get the slug of the active deal.
	 *
	 * @return string Active deal.
	 */
	public function get_active_deal() {
		return $this->active;
	}

	/**
	 * Get the localized data for the plugin.
	 *
	 * @return array Localized data.
	 */
	public function get_localized_data() {
		return array_merge(
			array(
				'active'   => $this->is_active(),
				'dealSlug' => $this->get_active_deal(),
			),
			$this->assets
		);
	}

	/**
	 * Disable the notification via ajax.
	 *
	 * @return void
	 */
	public function disable_notification_ajax() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['nonce'] ), 'dismiss_themeisle_event_notice_otter' ) ) {
			wp_die( esc_html( __( 'Invalid nonce! Refresh the page and try again.', 'otter-blocks' ) ) );
		}

		// We record the time and the plugin of the dismissed notification.
		update_option( $this->wp_option_dismiss_notification_key_base . $this->active, 'otter_' . $this->active . '_' . current_time( 'Y_m_d' ) );
		wp_die( 'success' );
	}

	/**
	 * Render the dashboard banner.
	 *
	 * @return void
	 */
	public function render_notice() {

		if ( ! $this->has_priority() ) {
			return;
		}

		$message = 'Otter <strong>Black Friday Sale</strong> - Save big with a <strong>Lifetime License</strong> of Otter Pro Plan. <strong>Only 100 licenses</strong>, for a limited time!';

		?>
		<style>
			.themeisle-sale {
				padding: 10px 15px;

				display: flex;
				align-items: center;
			}
			.themeisle-sale svg {
				margin-right: 15px;
				min-width: 24px;
			}
			.themeisle-sale a {
				margin-left: 5px;
			}
			.themeisle-sale-error {
				color: red;
			}
			.themeisle-sdk-notice:is([id*="review"]) { /* Do not show the review notice when the sale is active. */
				display: none;
			}
		</style>
		<div class="themeisle-sale notice notice-info is-dismissible">
			<div class="notice-dismiss"></div>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 32" width="20" height="20">
			<path d="M19.831 7.877c0.001-0.003 0.001-0.005 0.001-0.009s-0-0.006-0.001-0.009l0 0c-0.047-0.081-0.092-0.164-0.132-0.247l-0.057-0.115c-0.277-0.498-0.381-0.99-1.033-1.064h-0.045c-0.001 0-0.002 0-0.003 0-0.486 0-0.883 0.382-0.908 0.862l-0 0.002c0.674 0.126 1.252 0.278 1.813 0.468l-0.092-0.027 0.283 0.096 0.147 0.053s0.028 0 0.028-0.011z" />
			<path d="M23.982 13.574c-0.008-2.41-0.14-4.778-0.39-7.112l0.026 0.299 0.070-0.019c0.459-0.139 0.787-0.558 0.787-1.053 0-0.479-0.307-0.887-0.735-1.037l-0.008-0.002h-0.026c-0.479-0.164-0.874-0.468-1.149-0.861l-0.005-0.007c-2.7-3.96-8.252-3.781-8.252-3.781s-5.55-0.179-8.25 3.781c-0.28 0.401-0.676 0.704-1.14 0.862l-0.016 0.005c-0.441 0.148-0.754 0.557-0.754 1.040 0 0.009 0 0.017 0 0.026l-0-0.001c-0 0.010-0.001 0.022-0.001 0.034 0 0.493 0.335 0.907 0.789 1.029l0.007 0.002 0.045 0.011c-0.224 2.034-0.356 4.403-0.364 6.801l-0 0.012s-9.493 13.012-1.277 17.515c4.733 2.431 6.881-0.769 6.881-0.769s1.397-1.661-1.784-3.355v-4.609c0.006-0.344 0.282-0.621 0.625-0.628h1.212v-0.59c0-0.275 0.223-0.498 0.498-0.498v0h1.665c0.274 0.001 0.496 0.224 0.496 0.498 0 0 0 0 0 0v0 0.59h2.721v-0.59c0-0.275 0.223-0.498 0.498-0.498v0h1.665c0.271 0.005 0.49 0.226 0.49 0.498 0 0 0 0 0 0v0 0.59h1.209c0 0 0 0 0 0 0.349 0 0.633 0.28 0.639 0.627v4.584c-3.193 1.703-1.784 3.355-1.784 3.355s2.148 3.193 6.879 0.769c8.222-4.503-1.269-17.515-1.269-17.515zM22.586 10.261c-0.097 1.461-0.67 2.772-1.563 3.797l0.007-0.008c-1.703 2.010-4.407 3.249-6.721 4.432v0c-2.325-1.177-5.026-2.416-6.736-4.432-0.883-1.019-1.455-2.329-1.555-3.769l-0.001-0.020c-0.126-2.22 0.583-5.929 3.044-6.74 2.416-0.788 3.947 1.288 4.494 2.227 0.152 0.258 0.429 0.428 0.745 0.428s0.593-0.17 0.743-0.424l0.002-0.004c0.551-0.932 2.080-3.008 4.494-2.22 2.474 0.805 3.174 4.513 3.046 6.734z" />
			<path d="M19.463 10.087h-0.028c-0.192 0.026-0.121 0.251-0.047 0.356 0.254 0.349 0.407 0.787 0.407 1.26 0 0.006-0 0.012-0 0.018v-0.001c-0.001 0.469-0.255 0.878-0.633 1.1l-0.006 0.003c-0.739 0.426-1.377-0.145-2.054-0.398-0.72-0.269-1.552-0.434-2.42-0.455l-0.009-0v-1.033c1.020-0.233 1.894-0.76 2.551-1.486l0.004-0.004c0.151-0.163 0.244-0.383 0.244-0.623 0-0.316-0.159-0.595-0.402-0.76l-0.003-0.002c-0.768-0.551-1.728-0.881-2.764-0.881-1.054 0-2.029 0.341-2.819 0.92l0.013-0.009c-0.224 0.166-0.367 0.429-0.367 0.726 0 0.226 0.083 0.433 0.221 0.591l-0.001-0.001c0.665 0.751 1.55 1.295 2.553 1.53l0.033 0.007v1.050c-0.742 0.021-1.448 0.14-2.118 0.343l0.057-0.015c-0.341 0.103-0.631 0.219-0.908 0.358l0.033-0.015c-0.519 0.26-1.037 0.436-1.58 0.121-0.371-0.213-0.617-0.607-0.617-1.058 0-0.002 0-0.004 0-0.007v0c0-0.002 0-0.004 0-0.007 0-0.47 0.153-0.905 0.411-1.257l-0.004 0.006c0.047-0.068 0.089-0.17 0.026-0.241s-0.189 0-0.27 0.030c-0.189 0.099-0.348 0.227-0.479 0.381l-0.002 0.002c-0.245 0.296-0.394 0.679-0.394 1.097 0 0.004 0 0.007 0 0.011v-0.001c0.008 0.706 0.393 1.321 0.964 1.651l0.009 0.005c0.296 0.178 0.654 0.283 1.036 0.283 0.364 0 0.706-0.095 1.001-0.263l-0.010 0.005c0.877-0.461 1.917-0.731 3.019-0.731 0.069 0 0.137 0.001 0.206 0.003l-0.010-0h0.030c1.277 0 2.382 0.266 3.266 0.775 0.27 0.159 0.594 0.253 0.94 0.253 0.001 0 0.002 0 0.003 0h-0c0.355-0.002 0.688-0.098 0.974-0.265l-0.009 0.005c0.606-0.357 1.007-1.007 1.007-1.75 0-0.001 0-0.003 0-0.004v0c0.001-0.026 0.002-0.056 0.002-0.086 0-0.625-0.34-1.171-0.846-1.462l-0.008-0.004c-0.056-0.040-0.125-0.065-0.199-0.070l-0.001-0zM13.101 8.831c-0.238 0.213-0.468 0.581-0.832 0.345-0.061-0.041-0.114-0.086-0.161-0.136l-0-0c-0.063-0.063-0.101-0.15-0.101-0.247 0-0.133 0.074-0.248 0.182-0.308l0.002-0.001c0.594-0.309 1.203-0.543 1.884-0.49-0.324 0.281-0.649 0.56-0.973 0.837z" />
			<path d="M15.89 13.578c-0.367 0.483-0.941 0.792-1.588 0.792s-1.221-0.309-1.585-0.787l-0.004-0.005c-0.064-0.103-0.177-0.171-0.306-0.171-0.199 0-0.36 0.161-0.36 0.36 0 0.091 0.034 0.174 0.090 0.238l-0-0c0.499 0.659 1.283 1.080 2.164 1.080s1.665-0.421 2.159-1.073l0.005-0.007c0.043-0.059 0.068-0.132 0.068-0.212 0-0.116-0.055-0.22-0.14-0.286l-0.001-0.001c-0.059-0.045-0.134-0.072-0.215-0.072-0.117 0-0.221 0.056-0.286 0.143l-0.001 0.001z" />
			<path d="M18.507 11.707c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" />
			<path d="M17.389 11.049c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" />
			<path d="M10.798 11.707c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" />
			<path d="M11.918 11.049c0 0.194-0.157 0.351-0.351 0.351s-0.351-0.157-0.351-0.351c0-0.194 0.157-0.351 0.351-0.351s0.351 0.157 0.351 0.351z" />
			<path d="M8.773 7.877c-0.001-0.003-0.002-0.005-0.002-0.009s0.001-0.006 0.002-0.009l-0 0c0.047-0.081 0.089-0.164 0.132-0.247 0.019-0.038 0.036-0.079 0.057-0.115 0.275-0.498 0.379-0.99 1.033-1.064h0.045c0 0 0.001 0 0.001 0 0.487 0 0.884 0.382 0.91 0.862l0 0.002c-0.678 0.124-1.261 0.277-1.827 0.468l0.092-0.027-0.275 0.096-0.1 0.036-0.045 0.017s-0.023 0-0.023-0.011z" />
			</svg>
			<span>
				<?php echo wp_kses_post( $message ); ?>
				<a href="<?php echo esc_url( ! empty( $this->assets['globalNoticeUrl'] ) ? $this->assets['globalNoticeUrl'] : '' ); ?>" target="_blank" rel="external noreferrer noopener">
					<?php esc_html_e( 'Learn more', 'otter-blocks' ); ?>
				</a>
			</span>
			<span class="themeisle-sale-error"></span>
		</div>
		<script type="text/javascript">
			window.document.addEventListener( 'DOMContentLoaded', () => {
				const button = document.querySelector( '.themeisle-sale.notice .notice-dismiss' );
				button?.addEventListener( 'click', e => {
					e.preventDefault();
					fetch('<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams({
							action: 'dismiss_themeisle_event_notice_otter',
							nonce: '<?php echo esc_attr( wp_create_nonce( 'dismiss_themeisle_event_notice_otter' ) ); ?>'
						})
					})
					.then(response => response.text())
					.then(response => {
						if ( ! response?.includes( 'success' ) ) {
							document.querySelector( '.themeisle-sale-error' ).innerHTML = response;
							return;
						}

						jQuery( '.themeisle-sale.notice' ).fadeOut()
					})
					.catch(error => {
						console.error( 'Error:', error );
						document.querySelector( '.themeisle-sale-error' ).innerHTML = error;
					});
				});
			});
		</script>
		<?php
	}

	/**
	 * Check if we can show the dashboard banner. Since it is shared between plugins, the user need only to dismiss it once.
	 *
	 * @return bool
	 */
	public function can_show_dashboard_banner() {
		return ! get_option( $this->wp_option_dismiss_notification_key_base . $this->active, false );
	}

	/**
	 * Add product priority to the filter.
	 *
	 * @param array $products Registered products.
	 * @return array Array enhanced with Neve priority.
	 */
	public function add_priority( $products ) {
		$products['otter'] = 1;
		return $products;
	}

	/**
	 * Check if the current product has priority.
	 * Use this for conditional rendering if you want to show the banner only for one product.
	 *
	 * @return bool True if the current product has priority.
	 */
	public function has_priority() {
		$products = apply_filters( 'themeisle_products_deal_priority', array() );

		if ( empty( $products ) ) {
			return true;
		}

		$highest_priority = array_search( min( $products ), $products, true );
		return 'otter' === $highest_priority;
	}
}
