<?php
/**
 * Class TestNoticeDismissal
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\LimitedOffers;
use ThemeIsle\GutenbergBlocks\Pro;

/**
 * Admin notice dismissal test case.
 *
 * Covers the dashboard upsell and limited-offer notices: only administrators
 * see them, and only administrators with a valid nonce can dismiss them.
 */
class TestNoticeDismissal extends WP_UnitTestCase {

	/**
	 * Administrator user ID.
	 *
	 * @var int
	 */
	private $admin_id;

	/**
	 * Subscriber user ID.
	 *
	 * @var int
	 */
	private $subscriber_id;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();

		$this->admin_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$this->subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );

		if ( ! function_exists( 'tsdk_utmify' ) ) {
			function tsdk_utmify( $link ) {
				return $link;
			}
		}
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		unset( $_POST['nonce'] );
		delete_option( 'themeisle_blocks_settings_notifications' );
		delete_option( 'dismiss_themeisle_notice_event_' );
		parent::tear_down();
	}

	/**
	 * Call a dismissal handler and swallow the `wp_die()` it ends with.
	 *
	 * @param callable $handler The handler.
	 * @param string   $action  The nonce action.
	 */
	private function dismiss( $handler, $action ) {
		$_POST['nonce'] = wp_create_nonce( $action );

		try {
			call_user_func( $handler );
		} catch ( WPDieException $e ) {
			unset( $e );
		}
	}

	/**
	 * Capture the output of a notice renderer.
	 *
	 * @param callable $renderer The renderer.
	 *
	 * @return string
	 */
	private function render( $renderer ) {
		ob_start();
		call_user_func( $renderer );
		return (string) ob_get_clean();
	}

	/**
	 * Read the dashboard upsell dismissal flag.
	 *
	 * @return bool
	 */
	private function upsell_dismissed() {
		$notifications = get_option( 'themeisle_blocks_settings_notifications', array() );
		return ! empty( $notifications['dashboard_upsell'] );
	}

	/**
	 * The dashboard upsell dismissal needs a nonce.
	 */
	public function test_upsell_dismissal_without_nonce_keeps_notice() {
		wp_set_current_user( $this->admin_id );

		Pro::instance()->dismiss_dashboard_notice();

		$this->assertFalse( $this->upsell_dismissed() );
	}

	/**
	 * The dashboard upsell dismissal needs `manage_options`.
	 */
	public function test_upsell_dismissal_requires_manage_options() {
		wp_set_current_user( $this->subscriber_id );
		$this->dismiss( array( Pro::instance(), 'dismiss_dashboard_notice' ), 'dismiss_otter_notice' );
		$this->assertFalse( $this->upsell_dismissed() );

		wp_set_current_user( $this->admin_id );
		$this->dismiss( array( Pro::instance(), 'dismiss_dashboard_notice' ), 'dismiss_otter_notice' );
		$this->assertTrue( $this->upsell_dismissed() );
	}

	/**
	 * The dashboard upsell notice renders only for administrators.
	 */
	public function test_upsell_notice_renders_only_for_administrators() {
		wp_set_current_user( $this->subscriber_id );
		$this->assertSame( '', $this->render( array( Pro::instance(), 'dashboard_upsell_notice' ) ) );

		wp_set_current_user( $this->admin_id );
		$this->assertStringContainsString( 'o-dismiss-notice', $this->render( array( Pro::instance(), 'dashboard_upsell_notice' ) ) );
	}

	/**
	 * The limited-offer dismissal needs a nonce.
	 */
	public function test_offer_dismissal_without_nonce_keeps_notice() {
		wp_set_current_user( $this->admin_id );
		$offers = new LimitedOffers();

		try {
			$offers->disable_notification_ajax();
		} catch ( WPDieException $e ) {
			unset( $e );
		}

		$this->assertTrue( $offers->can_show_dashboard_banner() );
	}

	/**
	 * The limited-offer dismissal needs `manage_options`.
	 */
	public function test_offer_dismissal_requires_manage_options() {
		$offers = new LimitedOffers();

		wp_set_current_user( $this->subscriber_id );
		$this->dismiss( array( $offers, 'disable_notification_ajax' ), 'dismiss_themeisle_event_notice_otter' );
		$this->assertTrue( $offers->can_show_dashboard_banner() );

		wp_set_current_user( $this->admin_id );
		$this->dismiss( array( $offers, 'disable_notification_ajax' ), 'dismiss_themeisle_event_notice_otter' );
		$this->assertFalse( $offers->can_show_dashboard_banner() );
	}

	/**
	 * The limited-offer notice renders only for administrators.
	 */
	public function test_offer_notice_renders_only_for_administrators() {
		$offers = new LimitedOffers();

		wp_set_current_user( $this->subscriber_id );
		$this->assertSame( '', $this->render( array( $offers, 'render_notice' ) ) );

		wp_set_current_user( $this->admin_id );
		$this->assertStringContainsString( 'themeisle-sale', $this->render( array( $offers, 'render_notice' ) ) );
	}
}
