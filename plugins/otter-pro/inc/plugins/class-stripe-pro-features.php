<?php
/**
 * Stripe Pro Features.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

/**
 * Class Stripe_Pro_Features
 */
class Stripe_Pro_Features {
	/**
	 * The main instance var.
	 *
	 * @var Stripe_Pro_Features|null
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( License::has_active_license() ) {
			add_action( 'otter_blocks_stripe_checkout_success', array( $this, 'autoresponder' ), 10, 3 );
		}
	}

	/**
	 * Autoresponder.
	 *
	 * @param mixed                                              $attributes Block attributes.
	 * @param \ThemeIsle\GutenbergBlocks\Plugins\Stripe_API|null $stripe Stripe API object.
	 * @param string|null                                        $session_id Session ID.
	 */
	public function autoresponder( $attributes, $stripe, $session_id ) {

		if ( ! isset( $attributes['autoresponder'] ) || ! isset( $attributes['autoresponder']['subject'] ) || ! isset( $attributes['autoresponder']['body'] ) ) {
			return;
		}

		if ( empty( $session_id ) || empty( $stripe ) ) {
			return;
		}

		$transient_key = 'otter_stripe_checkout_' . $session_id;

		$transient = get_transient( $transient_key );
		if ( false !== $transient ) {
			return;
		}

		$email = $stripe->get_session_email( $session_id );
		if ( ! $email ) {
			return;
		}

		$to        = $email;
		$headers[] = 'Content-Type: text/html';
		$headers[] = 'From: ' . get_bloginfo( 'name', 'display' );
		$subject   = $attributes['autoresponder']['subject'];
		$body      = $attributes['autoresponder']['body'];

		// phpcs:ignore
		if ( wp_mail( $to, $subject, $body, $headers ) ) {
			set_transient( $transient_key, true, WEEK_IN_SECONDS );
		}
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return Stripe_Pro_Features
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
