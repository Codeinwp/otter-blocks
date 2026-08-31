<?php
/**
 * Tests for the Otter Pro autoloader.
 *
 * @package gutenberg-blocks
 */

/**
 * Otter Pro autoloader test case.
 */
class TestOtterProAutoloader extends WP_UnitTestCase {

	/**
	 * Temporary base directory holding the fixture class files.
	 *
	 * @var string
	 */
	private $base_dir = '';

	/**
	 * Set up each test.
	 */
	public function set_up() {
		parent::set_up();

		require_once dirname( dirname( __FILE__ ) ) . '/plugins/otter-pro/autoloader.php';

		$this->base_dir = get_temp_dir() . 'otter-pro-autoloader-' . wp_generate_password( 8, false );

		mkdir( $this->base_dir . '/plugins', 0777, true );
	}

	/**
	 * Tear down each test.
	 */
	public function tear_down() {
		$this->remove_dir( $this->base_dir );

		parent::tear_down();
	}

	/**
	 * A class whose file is missing must not fatal the request.
	 */
	public function test_missing_file_does_not_fatal() {
		$autoloader = new \ThemeIsle\OtterPro\Autoloader();
		$autoloader->add_namespace( '\ThemeIsle\OtterProTest', $this->base_dir );

		$this->assertFalse( $autoloader->load_class( 'ThemeIsle\OtterProTest\Plugins\Definitely_Missing_Class' ) );
	}

	/**
	 * An existing class file is still located and required.
	 */
	public function test_existing_file_is_loaded() {
		$this->write_class_file( 'plugins/class-loadable-fixture.php', 'Otter_Pro_Loadable_Fixture' );

		$autoloader = new \ThemeIsle\OtterPro\Autoloader();
		$autoloader->add_namespace( '\ThemeIsle\OtterProTest', $this->base_dir );

		$this->assertNotFalse( $autoloader->load_class( 'ThemeIsle\OtterProTest\Plugins\Loadable_Fixture' ) );
		$this->assertTrue( class_exists( 'Otter_Pro_Loadable_Fixture', false ) );
	}

	/**
	 * A missing file in the first base directory must not stop the second one from resolving.
	 */
	public function test_second_base_directory_is_searched() {
		$second_dir = $this->base_dir . '-second';
		mkdir( $second_dir . '/plugins', 0777, true );

		$this->write_class_file( 'plugins/class-second-dir-fixture.php', 'Otter_Pro_Second_Dir_Fixture', $second_dir );

		$autoloader = new \ThemeIsle\OtterPro\Autoloader();
		$autoloader->add_namespace( '\ThemeIsle\OtterProTest', $this->base_dir );
		$autoloader->add_namespace( '\ThemeIsle\OtterProTest', $second_dir );

		$loaded = $autoloader->load_class( 'ThemeIsle\OtterProTest\Plugins\Second_Dir_Fixture' );

		$this->remove_dir( $second_dir );

		$this->assertNotFalse( $loaded, 'The second base directory should be searched with an unmangled relative path.' );
		$this->assertTrue( class_exists( 'Otter_Pro_Second_Dir_Fixture', false ) );
	}

	/**
	 * The autoloader stays usable for other classes after a failed lookup.
	 */
	public function test_loading_continues_after_a_missing_file() {
		$this->write_class_file( 'plugins/class-after-miss-fixture.php', 'Otter_Pro_After_Miss_Fixture' );

		$autoloader = new \ThemeIsle\OtterPro\Autoloader();
		$autoloader->add_namespace( '\ThemeIsle\OtterProTest', $this->base_dir );

		$autoloader->load_class( 'ThemeIsle\OtterProTest\Plugins\Definitely_Missing_Class' );

		$this->assertNotFalse( $autoloader->load_class( 'ThemeIsle\OtterProTest\Plugins\After_Miss_Fixture' ) );
	}

	/**
	 * Write a fixture class file below a base directory.
	 *
	 * @param string $relative_path Path relative to the base directory.
	 * @param string $classname Class declared by the file.
	 * @param string $base_dir Base directory, defaults to the test one.
	 * @return void
	 */
	private function write_class_file( $relative_path, $classname, $base_dir = '' ) {
		$base_dir = '' === $base_dir ? $this->base_dir : $base_dir;

		file_put_contents( $base_dir . '/' . $relative_path, '<?php class ' . $classname . ' {}' );
	}

	/**
	 * Recursively delete a directory created by the test.
	 *
	 * @param string $dir Directory to remove.
	 * @return void
	 */
	private function remove_dir( $dir ) {
		if ( '' === $dir || ! is_dir( $dir ) ) {
			return;
		}

		foreach ( array_diff( scandir( $dir ), array( '.', '..' ) ) as $item ) {
			$path = $dir . '/' . $item;

			if ( is_dir( $path ) ) {
				$this->remove_dir( $path );
			} else {
				unlink( $path );
			}
		}

		rmdir( $dir );
	}
}
