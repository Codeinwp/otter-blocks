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
	 * Temp renderer files to remove after the test, even if it failed part way.
	 *
	 * @var array<string>
	 */
	private $temp_renderer_files = array();

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		delete_option( 'themeisle_blocks_settings_global_defaults' );

		// Restore permissions before unlinking: a test that fails mid-way would
		// otherwise leave an unreadable file behind and poison later runs.
		foreach ( $this->temp_renderer_files as $file ) {
			if ( file_exists( $file ) ) {
				chmod( $file, 0644 );
				unlink( $file );
			}
		}

		$this->temp_renderer_files = array();

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

	/**
	 * Run register_blocks() with `form-captcha` mapped to $classname.
	 *
	 * register_blocks() already ran once via the `init` hook fired during
	 * bootstrap, so the plugin's blocks are unregistered first to keep this a
	 * clean registration instead of "already registered" notices.
	 *
	 * @param string $classname                Renderer class to map form-captcha to.
	 * @param string $expected_include_failure Path whose failed include is expected, or empty if no include failure is expected.
	 * @return void
	 */
	private function register_blocks_with_captcha_renderer( $classname, $expected_include_failure = '' ) {
		$filter = function ( $dynamic_blocks ) use ( $classname ) {
			$dynamic_blocks['form-captcha'] = $classname;

			return $dynamic_blocks;
		};

		add_filter( 'otter_blocks_register_dynamic_blocks', $filter );

		$registry = \WP_Block_Type_Registry::get_instance();

		foreach ( array_keys( $registry->get_all_registered() ) as $name ) {
			if ( 0 === strpos( $name, 'themeisle-blocks/' ) ) {
				$registry->unregister( $name );
			}
		}

		$previous = set_error_handler(
			function ( $level, $message, $file = '', $line = 0 ) use ( &$previous, $expected_include_failure ) {
				if (
					'' !== $expected_include_failure &&
					E_WARNING === $level &&
					false !== strpos( $message, $expected_include_failure )
				) {
					return true;
				}

				if ( null === $previous ) {
					return false;
				}

				return call_user_func( $previous, $level, $message, $file, $line );
			}
		);

		try {
			( new Registration() )->register_blocks();
		} finally {
			restore_error_handler();
			remove_filter( 'otter_blocks_register_dynamic_blocks', $filter );
		}
	}

	/**
	 * Register a throwaway autoloader that resolves $class from $file the same
	 * way Composer's classmap loader does: an unsuppressed `include` of the
	 * mapped path, with no prior existence check.
	 *
	 * @param string $class Class to map.
	 * @param string $file  Path to include for it.
	 * @return callable The loader, for spl_autoload_unregister.
	 */
	private function register_composer_like_loader( $class, $file ) {
		$loader = function ( $requested ) use ( $class, $file ) {
			if ( ltrim( $class, '\\' ) === $requested ) {
				include $file;
			}
		};

		spl_autoload_register( $loader );

		return $loader;
	}

	/**
	 * Positive control: a loadable renderer must register the block *with* a
	 * render_callback. Without this, the null-callback assertions below would
	 * pass even if registration silently stopped wiring renderers altogether.
	 */
	public function test_register_blocks_uses_the_renderer_when_the_class_is_loadable() {
		$this->register_blocks_with_captcha_renderer( '\ThemeIsle\GutenbergBlocks\Render\Form_Captcha_Block' );

		$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( 'themeisle-blocks/form-captcha' );

		$this->assertNotNull( $block_type, 'The block must be registered.' );
		$this->assertIsCallable( $block_type->render_callback, 'A loadable renderer must be wired as the render callback.' );
	}

	/**
	 * A dynamic block whose mapped renderer class has no autoload entry at all
	 * must not fatal registration for every other block; it should fall back to
	 * plain metadata registration.
	 */
	public function test_register_blocks_survives_dynamic_renderer_class_with_no_autoload_entry() {
		$this->register_blocks_with_captcha_renderer( '\ThemeIsle\GutenbergBlocks\Render\Nonexistent_Form_Captcha_Block' );

		$this->assertCaptchaRegisteredWithoutRenderer();
	}

	/**
	 * Assert the captcha block came through the fallback branch: still registered,
	 * but with no render_callback. `is_registered()` alone would also pass on the
	 * dynamic path, so the null callback is what pins the fallback down.
	 *
	 * @return void
	 */
	private function assertCaptchaRegisteredWithoutRenderer() {
		$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( 'themeisle-blocks/form-captcha' );

		$this->assertNotNull( $block_type, 'The block must still be registered.' );
		$this->assertNull( $block_type->render_callback, 'The block must fall back to registration without a renderer.' );
	}

	/**
	 * A renderer class that is mapped by the autoloader but whose file is absent
	 * from the deployed artifact must degrade the same way. Composer's classmap
	 * returns the path without checking it exists, so the include only warns and
	 * the class stays undefined.
	 */
	public function test_register_blocks_survives_dynamic_renderer_class_whose_file_is_missing() {
		$class  = 'ThemeIsle\GutenbergBlocks\Render\Missing_File_Captcha_Block';
		$file   = get_temp_dir() . 'otter-absent-renderer.php';
		$loader = $this->register_composer_like_loader( $class, $file );

		try {
			$this->register_blocks_with_captcha_renderer( $class, $file );
		} finally {
			spl_autoload_unregister( $loader );
		}

		$this->assertFalse( class_exists( $class, false ), 'The renderer class must not have been defined.' );
		$this->assertCaptchaRegisteredWithoutRenderer();
	}

	/**
	 * Same degradation when the renderer file is present but not readable — a
	 * permissions mishap during deploy. `include` needs read permission, so the
	 * class again stays undefined.
	 */
	public function test_register_blocks_survives_dynamic_renderer_class_whose_file_is_unreadable() {
		$class = 'ThemeIsle\GutenbergBlocks\Render\Unreadable_File_Captcha_Block';
		$file  = get_temp_dir() . 'otter-unreadable-renderer.php';

		$this->temp_renderer_files[] = $file;

		file_put_contents( $file, '<?php namespace ThemeIsle\GutenbergBlocks\Render; class Unreadable_File_Captcha_Block { public function render( $attributes ) { return ""; } }' );
		chmod( $file, 0000 );

		if ( is_readable( $file ) ) {
			$this->markTestSkipped( 'Cannot make a file unreadable as this user (likely running as root).' );
		}

		$loader = $this->register_composer_like_loader( $class, $file );

		try {
			$this->register_blocks_with_captcha_renderer( $class, $file );
		} finally {
			spl_autoload_unregister( $loader );
		}

		$this->assertFalse( class_exists( $class, false ), 'The renderer class must not have been defined.' );
		$this->assertCaptchaRegisteredWithoutRenderer();
	}
}
