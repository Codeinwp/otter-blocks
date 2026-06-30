<?php
/**
 * Class Test_Options_Settings
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Options_Settings;

/**
 * Options settings tests.
 */
class Test_Options_Settings extends WP_UnitTestCase {
	/**
	 * @var Options_Settings
	 */
	private $options_settings;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();
		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );
		delete_option( 'themeisle_blocks_settings_atomic_wind_defaulted' );
		delete_option( 'otter_blocks_install' );
		$this->options_settings = new Options_Settings();
		$this->options_settings->register_settings();
	}

	/**
	 * Fresh installs (< 1 day) with no saved preference get Atomic Wind enabled.
	 */
	public function test_maybe_default_atomic_wind_blocks_enables_for_fresh_install() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * Installs older than one day without a saved preference stay off.
	 */
	public function test_maybe_default_atomic_wind_blocks_skips_old_installs() {
		update_option( 'otter_blocks_install', time() - ( 2 * DAY_IN_SECONDS ) );

		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * Missing install timestamp should not opt fresh sites in blindly.
	 */
	public function test_maybe_default_atomic_wind_blocks_skips_when_install_timestamp_missing() {
		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * A stored off value must not be overwritten on a fresh install.
	 */
	public function test_maybe_default_atomic_wind_blocks_respects_stored_disable() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );
		add_option( 'themeisle_blocks_settings_atomic_wind_blocks', '' );

		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertFalse( (bool) get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * Disabling after the default ran must stick (REST stores false by deleting the option).
	 */
	public function test_maybe_default_atomic_wind_blocks_does_not_reenable_after_user_disables() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		$this->options_settings->maybe_default_atomic_wind_blocks();
		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );

		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );

		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * An explicit enable on an old install must not be cleared.
	 */
	public function test_maybe_default_atomic_wind_blocks_respects_explicit_enable() {
		update_option( 'otter_blocks_install', time() - ( 2 * DAY_IN_SECONDS ) );
		update_option( 'themeisle_blocks_settings_atomic_wind_blocks', true );

		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * The default runs once per site; a later disable must not be overwritten.
	 */
	public function test_maybe_default_atomic_wind_blocks_runs_once() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		$this->options_settings->maybe_default_atomic_wind_blocks();
		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );

		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * Install exactly at the one-day boundary should stay off.
	 */
	public function test_maybe_default_atomic_wind_blocks_skips_install_at_one_day_boundary() {
		update_option( 'otter_blocks_install', time() - DAY_IN_SECONDS );

		$this->options_settings->maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * Ensure form/media tags are removed from allowed mail HTML.
	 */
	public function test_get_allowed_mail_html_removes_disallowed_tags() {
		$allowed_html = Options_Settings::get_allowed_mail_html();

		$this->assertIsArray( $allowed_html );
		$this->assertArrayNotHasKey( 'input', $allowed_html );
		$this->assertArrayNotHasKey( 'form', $allowed_html );
		$this->assertArrayNotHasKey( 'video', $allowed_html );
		$this->assertArrayNotHasKey( 'audio', $allowed_html );
	}

	/**
	 * Ensure common post tags remain available.
	 */
	public function test_get_allowed_mail_html_keeps_common_post_tags() {
		$allowed_html = Options_Settings::get_allowed_mail_html();

		$this->assertArrayHasKey( 'a', $allowed_html );
		$this->assertArrayHasKey( 'p', $allowed_html );
		$this->assertArrayHasKey( 'strong', $allowed_html );
	}

	/**
	 * Ensure form email setting sanitize callback strips unsafe values.
	 */
	public function test_form_emails_sanitize_callback_sanitizes_nested_data() {
		$registered_settings = get_registered_settings();
		$callback            = $registered_settings['themeisle_blocks_form_emails']['sanitize_callback'];

		$sanitized = call_user_func(
			$callback,
			array(
				array(
					'form'          => ' form-id<script> ',
					'fromEmail'     => 'bad-email',
					'replyTo'       => "sales@example.com\r\nBcc: evil@attacker.com",
					'requiredFields' => 'invalid-type',
					'autoresponder' => array(
						'body' => '<strong>ok</strong><form><input type="text"></form>',
					),
				),
				array(
					'form'    => 'second-form',
					'replyTo' => 'sales@example.com',
				),
			)
		);

		$this->assertSame( 'form-id', $sanitized[0]['form'] );
		$this->assertSame( '', $sanitized[0]['fromEmail'] );
		$this->assertStringNotContainsString( "\r", $sanitized[0]['replyTo'] );
		$this->assertStringNotContainsString( "\n", $sanitized[0]['replyTo'] );
		$this->assertSame( 'sales@example.com', $sanitized[1]['replyTo'] );
		$this->assertSame( array(), $sanitized[0]['requiredFields'] );
		$this->assertStringContainsString( '<strong>ok</strong>', $sanitized[0]['autoresponder']['body'] );
		$this->assertStringNotContainsString( '<form>', $sanitized[0]['autoresponder']['body'] );
		$this->assertStringNotContainsString( '<input', $sanitized[0]['autoresponder']['body'] );
	}

	/**
	 * Ensure webhooks sanitize callback sanitizes URL and headers.
	 */
	public function test_webhooks_sanitize_callback_sanitizes_headers_and_url() {
		$registered_settings = get_registered_settings();
		$callback            = $registered_settings['themeisle_webhooks_options']['sanitize_callback'];

		$sanitized = call_user_func(
			$callback,
			array(
				array(
					'id'      => 'hook<script>',
					'url'     => 'javascript:alert(1)',
					'headers' => array(
						array(
							'key'   => ' Authorization ',
							'value' => ' Bearer token ',
						),
					),
				),
			)
		);

		$this->assertSame( 'hook', $sanitized[0]['id'] );
		$this->assertSame( '', $sanitized[0]['url'] );
		$this->assertSame( 'Authorization', $sanitized[0]['headers'][0]['key'] );
		$this->assertSame( 'Bearer token', $sanitized[0]['headers'][0]['value'] );
	}

	/**
	 * Ensure the AI usage sanitize callback enforces the stored shape: the
	 * option is REST-writable, so non-integer counts and malformed entries
	 * must not survive a write.
	 */
	public function test_ai_usage_sanitize_callback_enforces_shape() {
		$registered_settings = get_registered_settings();
		$callback            = $registered_settings['themeisle_otter_ai_usage']['sanitize_callback'];

		$sanitized = call_user_func(
			$callback,
			array(
				'usage_count' => array(
					array(
						'key'   => ' action<script> ',
						'value' => '7',
					),
					array(
						'key'   => 'negative',
						'value' => -3,
					),
					array(
						'key'   => 'corrupted',
						'value' => 'not-a-number',
					),
					'not-an-entry',
				),
				'prompts'     => array(
					array(
						'key'    => 'action',
						'values' => array( 'prompt one', 42, 'prompt two' ),
					),
					array(
						'key'    => 'missing-values',
						'values' => 'not-an-array',
					),
				),
			)
		);

		$this->assertSame( 'action', $sanitized['usage_count'][0]['key'] );
		$this->assertSame( 7, $sanitized['usage_count'][0]['value'] );
		$this->assertSame( 0, $sanitized['usage_count'][1]['value'] );
		$this->assertCount( 2, $sanitized['usage_count'] );
		$this->assertSame( array( 'prompt one', 'prompt two' ), $sanitized['prompts'][0]['values'] );
		$this->assertCount( 1, $sanitized['prompts'] );

		// Non-array writes collapse to the empty shape.
		$this->assertSame(
			array(
				'usage_count' => array(),
				'prompts'     => array(),
			),
			call_user_func( $callback, 'garbage' )
		);
	}
}
