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
		$this->options_settings = new Options_Settings();
		$this->options_settings->register_settings();
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
					'requiredFields' => 'invalid-type',
					'autoresponder' => array(
						'body' => '<strong>ok</strong><form><input type="text"></form>',
					),
				),
			)
		);

		$this->assertSame( 'form-id', $sanitized[0]['form'] );
		$this->assertSame( '', $sanitized[0]['fromEmail'] );
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
