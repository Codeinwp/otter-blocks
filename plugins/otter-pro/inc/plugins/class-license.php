<?php
/**
 * License Manager.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

/**
 * Class License
 */
class License {
	/**
	 * The main instance var.
	 *
	 * @var License
	 */
	protected static $instance = null;

	/**
	 * Price ID to licence type map
	 *
	 * @var int[]
	 */
	public static $plans_map = [
		1 => 1,
		2 => 2,
		3 => 3,
		4 => 1,
		5 => 2,
		6 => 3,
	];

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'admin_init', array( $this, 'inherit_license_from_neve' ) );
	}

	/**
	 * Inherit license from Neve
	 */
	public function inherit_license_from_neve() {
		$should_inherit = ! get_option( 'otter_pro_inherited_autoactivate', false );
		if ( $should_inherit && false === self::has_active_license() && 'valid' === apply_filters( 'product_neve_license_status', false ) ) {
			$neve_license = apply_filters( 'product_neve_license_key', 'free' );
			apply_filters( 'themeisle_sdk_license_process_otter', $neve_license, 'activate' );
			update_option( 'otter_pro_inherited_autoactivate', true );
		}
	}

	/**
	 * Get active license.
	 *
	 * @return true
	 */
	public static function has_active_license() {
		$status = self::get_license_data();

		if ( ! $status ) {
			return false;
		}

		if ( ! isset( $status->license ) ) {
			return false;
		}

		$invalid_statuses = array(
			'expired',
			'revoked',
			'missing',
			'invalid',
			'site_inactive',
			'item_name_mismatch',
			'no_activations_left',
		);

		if ( in_array( $status->license, $invalid_statuses ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Check if license is expired.
	 *
	 * @return true
	 */
	public static function has_expired_license() {
		$status = self::get_license_data();

		if ( ! $status ) {
			return false;
		}

		if ( ! isset( $status->license ) ) {
			return false;
		}

		if ( 'active_expired' !== $status->license ) {
			return false;
		}

		return true;
	}

	/**
	 * Get the license expiration date.
	 *
	 * @param string $format format of the date.
	 * @return false|string
	 */
	public static function get_license_expiration_date( $format = 'F Y' ) {
		$data = self::get_license_data();

		if ( isset( $data->expires ) ) {
			$parsed = date_parse( $data->expires );
			$time   = mktime( $parsed['hour'], $parsed['minute'], $parsed['second'], $parsed['month'], $parsed['day'], $parsed['year'] );
			return gmdate( $format, $time );
		}

		return false;
	}

	/**
	 * Get the licence type.
	 * 1 - personal, 2 - business, 3 - agency.
	 *
	 * @return int
	 */
	public static function get_license_type() {
		$license = self::get_license_data();
		if ( false === $license ) {
			return -1;
		}

		if ( ! isset( $license->price_id ) ) {
			return -1;
		}

		if ( isset( $license->license ) && ( 'valid' !== $license->license && 'active_expired' !== $license->license ) ) {
			return - 1;
		}

		if ( ! array_key_exists( $license->price_id, self::$plans_map ) ) {
			return -1;
		}

		return self::$plans_map[ $license->price_id ];
	}

	/**
	 * Get the license data.
	 *
	 * @return bool|\stdClass
	 */
	public static function get_license_data() {
		$option_name = basename( dirname( OTTER_PRO_BASEFILE ) );
		$option_name = str_replace( '-', '_', strtolower( trim( $option_name ) ) );
		return get_option( $option_name . '_license_data' );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.1
	 * @access public
	 * @return WooCommerce_Builder
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
	 * @since 2.0.1
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
	 * @since 2.0.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
