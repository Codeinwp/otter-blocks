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
	 * The banner URL.
	 *
	 * @var string
	 */
	public $banner_url = OTTER_BLOCKS_URL . 'assets/images/black-friday-banner.png'; // TODO: change this based on product.

	/**
	 * The key for WP Options to disable the dashboard notification.
	 *
	 * @var string
	 */
	public static $wp_option_dismiss_notification_key = 'dismiss_themeisle_bf_notice';

	/**
	 * LimitedOffers constructor.
	 */
	public function __construct() {
		try {
			if ( $this->is_deal_active( 'bf' ) ) {
				$this->activate_bff();
			}
		} catch ( Exception $e ) {
			// Do nothing.
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
		add_action( 'admin_notices', array( $this, 'render_dashboard_banner' ) );
		add_action( 'wp_ajax_dismiss_themeisle_bf_notice', array( $this, 'disable_notification_ajax' ) );
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
	 * Activate the BFF deal.
	 *
	 * @return void
	 */
	public function activate_bff() {
		$this->active = 'bf';
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
	 * Check if the deal is active with the given slug.
	 *
	 * @param string $slug Slug of the deal.
	 *
	 * @throws Exception When date is invalid.
	 */
	public function is_deal_active( $slug ) {

		if ( empty( $slug ) ) {
			return false;
		}

		if ( 'bf' === $slug ) {
			$start_date = '2023-10-10 00:00:00'; // TODO: Add the correct date.
			$end_date   = '2023-11-27 23:59:00';
		} else {
			return false;
		}

		return $this->check_date_range( $start_date, $end_date );
	}

	/**
	 * Get the remaining time for the deal in a human readable format.
	 *
	 * @param string $slug Slug of the deal.
	 * @return string Remaining time for the deal.
	 */
	public function get_remaining_time_for_deal( $slug ) {
		if ( empty( $slug ) ) {
			return '';
		}

		if ( 'bf' === $slug ) {
			$end_date = '2023-11-27 23:59:00';
		} else {
			return '';
		}

		try {
			$end_date     = new DateTime( $end_date, new DateTimeZone( 'GMT' ) );
			$current_date = new DateTime( 'now', new DateTimeZone( 'GMT' ) );
			$diff         = $end_date->diff( $current_date );

			if ( $diff->days > 0 ) {
				return $diff->format( '%a days' );
			}

			if ( $diff->h > 0 ) {
				return $diff->format( '%h hours' );
			}

			if ( $diff->i > 0 ) {
				return $diff->format( '%i minutes' );
			}

			return $diff->format( '%s seconds' );
		} catch ( Exception $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( $e->getMessage() ); // phpcs:ignore
			}
		}

		return '';
	}

	/**
	 * Check if the current date is in the range of the offer.
	 *
	 * @param string $start Start date.
	 * @param string $end   End date.
	 *
	 * @throws Exception When date is invalid.
	 */
	public function check_date_range( $start, $end ) {

		$start_date = new DateTime( $start, new DateTimeZone( 'GMT' ) );
		$end_date   = new DateTime( $end, new DateTimeZone( 'GMT' ) );


		$current_date = new DateTime( 'now', new DateTimeZone( 'GMT' ) );

		return $current_date >= $start_date && $current_date <= $end_date;
	}

	/**
	 * Get the localized data for the plugin.
	 *
	 * @return array Localized data.
	 */
	public function get_localized_data() {
		return array(
			'active'        => $this->is_active(),
			'deal'          => $this->get_active_deal(),
			'remainingTime' => $this->get_remaining_time_for_deal( $this->get_active_deal() ),
			'bannerUrl'     => $this->banner_url,
			'linkDashboard' => tsdk_utmify( 'https://themeisle.com/plugins/otter-blocks/blackfriday', 'blackfridayltd23', 'dashboard' ), // TODO: change this based on product.
			'linkGlobal'    => tsdk_utmify( 'https://themeisle.com/plugins/otter-blocks/blackfriday', 'blackfridayltd23', 'global' ),
		);
	}

	/**
	 * Disable the notification via ajax.
	 *
	 * @return void
	 */
	public function disable_notification_ajax() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['nonce'] ), 'dismiss_themeisle_bf_notice' ) ) {
			wp_die( esc_html( __( 'Invalid nonce! Refresh the page and try again.', 'otter-blocks' ) ) );
		}

		update_option( self::$wp_option_dismiss_notification_key, true );
		wp_die( 'success' );
	}

	/**
	 * Render the dashboard banner.
	 *
	 * @return void
	 */
	public function render_dashboard_banner() {

		$message = sprintf(
		// translators: %1$s - sale title, %2$s - license type, %3$s - number of licenses, %4$s - url .
			__( '%1$s - Save big with a %2$s of Otter Pro Plan. %3$s, for a limited time.', 'otter-blocks' ),
			'<strong>' . __( 'Otter Black Friday Sale', 'otter-blocks' ) . '</strong>', // TODO: change this based on product.
			'<strong>' . __( 'Lifetime License', 'otter-blocks' ) . '</strong>',
			'<strong>' . __( 'Only 100 licenses', 'otter-blocks' ) . '</strong>'
		);

		?>
		<style>
			.themeisle-sale {
				padding: 10px 5px;
			}
		</style>
		<div class="themeisle-sale notice notice-info is-dismissible">
			<div class="notice-dismiss"></div>
			<span>
				<?php echo wp_kses_post( $message ); ?>
			</span>
			<span class="themeisle-sale-error"></span>
			<a href="<?php echo esc_url( tsdk_utmify( 'https://themeisle.com/plugins/otter-blocks/blackfriday', 'blackfridayltd23', 'dashboard' ) ); ?>" target="_blank" rel="external noreferrer noopener">
				<?php esc_html_e( 'Learn more', 'otter-blocks' ); ?>
			</a>
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
							action: 'dismiss_themeisle_bf_notice',
							nonce: '<?php echo esc_attr( wp_create_nonce( 'dismiss_themeisle_bf_notice' ) ); ?>'
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
	 * Check if we can show the dashboard banner.
	 *
	 * @return bool
	 */
	public static function can_show_dashboard_banner() {
		return ! get_option( self::$wp_option_dismiss_notification_key, false );
	}
}
