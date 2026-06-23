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

	/**
	 * Default prompt actions include the eight built-in toolbar action ids.
	 */
	public function test_prompt_actions_defaults_include_eight_builtin_ids() {
		$registered_settings = get_registered_settings();
		$defaults            = $registered_settings['themeisle_blocks_settings_prompt_actions']['default'];
		$ids                 = array_column( $defaults, 'id' );

		$this->assertSame(
			array( 'rewrite', 'summarize', 'expand', 'shorten', 'translate', 'tone', 'grammar', 'simplify' ),
			$ids
		);
	}

	/**
	 * Built-in default prompts are plain instructions with no magic tags.
	 */
	public function test_prompt_actions_defaults_are_plain_prompts() {
		$defaults = Options_Settings::get_default_prompt_actions();

		foreach ( $defaults as $action ) {
			$this->assertArrayNotHasKey( 'availability', $action );
			$this->assertArrayNotHasKey( 'type', $action );
			$this->assertArrayNotHasKey( 'tones', $action );
			$this->assertStringNotContainsString( '{', $action['prompt'] );
		}
	}

	/**
	 * Legacy { title, prompt } payloads sanitize without fatal errors.
	 */
	public function test_prompt_actions_sanitize_legacy_payload() {
		$registered_settings = get_registered_settings();
		$callback            = $registered_settings['themeisle_blocks_settings_prompt_actions']['sanitize_callback'];

		$sanitized = call_user_func(
			$callback,
			array(
				array(
					'title'  => 'Fix Grammar',
					'prompt' => 'Fix any grammatical errors in the following: {text_input}',
				),
			)
		);

		$this->assertCount( 1, $sanitized );
		$this->assertSame( 'Fix Grammar', $sanitized[0]['title'] );
		$this->assertSame( 'Fix any grammatical errors in the following: {text_input}', $sanitized[0]['prompt'] );
		$this->assertTrue( $sanitized[0]['enabled'] );
		$this->assertTrue( $sanitized[0]['custom'] );
	}

	/**
	 * Disabled actions survive sanitization; legacy magic-tag fields are dropped.
	 */
	public function test_prompt_actions_sanitize_preserves_enabled_and_drops_legacy_fields() {
		$registered_settings = get_registered_settings();
		$callback            = $registered_settings['themeisle_blocks_settings_prompt_actions']['sanitize_callback'];

		$sanitized = call_user_func(
			$callback,
			array(
				array(
					'id'           => 'rewrite',
					'title'        => 'Rewrite',
					'prompt'       => 'Rewrite this for clarity and flow.',
					'enabled'      => false,
					'custom'       => false,
					'availability' => 'any',
					'type'         => 'prompt',
				),
			)
		);

		$this->assertFalse( $sanitized[0]['enabled'] );
		$this->assertArrayNotHasKey( 'availability', $sanitized[0] );
		$this->assertArrayNotHasKey( 'type', $sanitized[0] );
		$this->assertArrayNotHasKey( 'tones', $sanitized[0] );
	}

	/**
	 * Custom actions beyond the cap are preserved but forced disabled.
	 */
	public function test_prompt_actions_sanitize_disables_customs_beyond_cap() {
		$registered_settings = get_registered_settings();
		$callback            = $registered_settings['themeisle_blocks_settings_ai_toolbar_actions']['sanitize_callback'];

		$payload = array();

		for ( $i = 0; $i < 7; $i++ ) {
			$payload[] = array(
				'id'           => 'custom-' . $i,
				'title'        => 'Custom ' . $i,
				'prompt'       => 'Prompt ' . $i,
				'enabled'      => true,
				'custom'       => true,
				'availability' => 'richtext',
				'type'         => 'prompt',
			);
		}

		$sanitized = call_user_func( $callback, $payload );

		$this->assertCount( 7, $sanitized );

		foreach ( array_slice( $sanitized, 0, 5 ) as $action ) {
			$this->assertTrue( $action['enabled'] );
		}

		foreach ( array_slice( $sanitized, 5 ) as $action ) {
			$this->assertFalse( $action['enabled'] );
			$this->assertTrue( $action['custom'] );
			$this->assertNotEmpty( $action['id'] );
		}
	}

	/**
	 * Over-cap custom actions without an id still receive a generated id.
	 */
	public function test_prompt_actions_sanitize_assigns_ids_to_over_cap_customs() {
		$registered_settings = get_registered_settings();
		$callback            = $registered_settings['themeisle_blocks_settings_ai_toolbar_actions']['sanitize_callback'];

		$payload = array();

		for ( $i = 0; $i < 6; $i++ ) {
			$payload[] = array(
				'title'  => 'Custom ' . $i,
				'prompt' => 'Prompt ' . $i,
			);
		}

		$sanitized = call_user_func( $callback, $payload );

		$this->assertCount( 6, $sanitized );
		$this->assertFalse( $sanitized[5]['enabled'] );
		$this->assertTrue( $sanitized[5]['custom'] );
		$this->assertStringStartsWith( 'custom-', $sanitized[5]['id'] );
	}

	/**
	 * Migration copies legacy toolbar actions into the canonical option.
	 */
	public function test_migrate_ai_toolbar_actions_from_legacy() {
		delete_option( Options_Settings::AI_TOOLBAR_ACTIONS_OPTION );
		delete_option( Options_Settings::AI_TOOLBAR_ACTIONS_MIGRATED_OPTION );
		update_option(
			Options_Settings::LEGACY_TOOLBAR_ACTIONS_OPTION,
			array(
				array(
					'id'           => 'rewrite',
					'title'        => 'Rewrite',
					'prompt'       => 'Rewrite this block for clarity and flow:\n\n{block_content}',
					'enabled'      => true,
					'custom'       => false,
					'availability' => 'richtext',
					'type'         => 'prompt',
				),
			)
		);

		$this->options_settings->migrate_ai_toolbar_actions();

		$migrated = get_option( Options_Settings::AI_TOOLBAR_ACTIONS_OPTION );

		$this->assertCount( 8, $migrated );
		$this->assertSame( 'rewrite', $migrated[0]['id'] );
		$this->assertSame(
			array( 'rewrite', 'summarize', 'expand', 'shorten', 'translate', 'tone', 'grammar', 'simplify' ),
			array_column( $migrated, 'id' )
		);
		$this->assertTrue( get_option( Options_Settings::AI_TOOLBAR_ACTIONS_MIGRATED_OPTION ) );
	}

	/**
	 * Migration keeps legacy custom actions first and appends the missing builtins.
	 */
	public function test_migrate_ai_toolbar_actions_merges_builtins_after_legacy_customs() {
		delete_option( Options_Settings::AI_TOOLBAR_ACTIONS_OPTION );
		delete_option( Options_Settings::AI_TOOLBAR_ACTIONS_MIGRATED_OPTION );
		update_option(
			Options_Settings::LEGACY_TOOLBAR_ACTIONS_OPTION,
			array(
				array(
					'title'  => 'Fix Grammar',
					'prompt' => 'Fix any grammatical errors in the following: {text_input}',
				),
			)
		);

		$this->options_settings->migrate_ai_toolbar_actions();

		$migrated = get_option( Options_Settings::AI_TOOLBAR_ACTIONS_OPTION );

		$this->assertCount( 9, $migrated );
		$this->assertTrue( $migrated[0]['custom'] );
		$this->assertSame( 'Fix Grammar', $migrated[0]['title'] );
		$this->assertSame(
			array( 'rewrite', 'summarize', 'expand', 'shorten', 'translate', 'tone', 'grammar', 'simplify' ),
			array_column( array_slice( $migrated, 1 ), 'id' )
		);
	}

	/**
	 * Canonical toolbar actions are preferred over legacy values.
	 */
	public function test_get_ai_toolbar_actions_prefers_canonical_option() {
		update_option(
			Options_Settings::AI_TOOLBAR_ACTIONS_OPTION,
			array(
				array(
					'id'           => 'custom-test',
					'title'        => 'Custom Test',
					'prompt'       => 'Custom prompt',
					'enabled'      => true,
					'custom'       => true,
					'availability' => 'richtext',
					'type'         => 'prompt',
				),
			)
		);

		update_option(
			Options_Settings::LEGACY_TOOLBAR_ACTIONS_OPTION,
			array(
				array(
					'id'           => 'rewrite',
					'title'        => 'Rewrite',
					'prompt'       => 'Legacy prompt',
					'enabled'      => true,
					'custom'       => false,
					'availability' => 'richtext',
					'type'         => 'prompt',
				),
			)
		);

		$actions = Options_Settings::get_ai_toolbar_actions();

		$this->assertCount( 1, $actions );
		$this->assertSame( 'custom-test', $actions[0]['id'] );
	}
}
