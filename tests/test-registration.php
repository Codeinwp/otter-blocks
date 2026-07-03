<?php
/**
 * Class Test_Registration
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Registration;

/**
 * Editor localization tests: the global defaults handed to the editor must
 * always be an object, or every block's Edit component crashes on null.
 */
class Test_Registration extends WP_UnitTestCase {

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		delete_option( 'themeisle_blocks_settings_global_defaults' );

		parent::tear_down();
	}

	/**
	 * Ensure an option stored as an empty string localizes as an object, not null.
	 */
	public function test_editor_global_defaults_is_object_when_option_is_empty_string() {
		update_option( 'themeisle_blocks_settings_global_defaults', '' );

		$this->assertEquals( new stdClass(), Registration::get_editor_global_defaults() );
	}

	/**
	 * Ensure corrupt JSON localizes as an object, not null.
	 */
	public function test_editor_global_defaults_is_object_when_option_is_corrupt() {
		update_option( 'themeisle_blocks_settings_global_defaults', '{"themeisle-blocks/button-group":' );
		$this->assertEquals( new stdClass(), Registration::get_editor_global_defaults() );

		update_option( 'themeisle_blocks_settings_global_defaults', 'null' );
		$this->assertEquals( new stdClass(), Registration::get_editor_global_defaults() );
	}

	/**
	 * Ensure valid stored defaults still come through decoded.
	 */
	public function test_editor_global_defaults_decodes_valid_json() {
		update_option( 'themeisle_blocks_settings_global_defaults', '{"themeisle-blocks/button-group":{"fontSize":"20px"}}' );

		$defaults = Registration::get_editor_global_defaults();

		$this->assertSame( '20px', $defaults->{'themeisle-blocks/button-group'}->fontSize );
	}

	/**
	 * Ensure a missing option localizes as an object.
	 */
	public function test_editor_global_defaults_is_object_when_option_is_missing() {
		delete_option( 'themeisle_blocks_settings_global_defaults' );

		$this->assertEquals( new stdClass(), Registration::get_editor_global_defaults() );
	}
}
