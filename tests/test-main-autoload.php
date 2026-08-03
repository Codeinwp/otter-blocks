<?php
/**
 * Tests for Main::autoload_classes().
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Autoloader;
use ThemeIsle\GutenbergBlocks\Main;

/**
 * Probe class instantiated through the `otter_blocks_autoloader` filter.
 */
class Otter_Autoload_Probe {
	/**
	 * Set when the autoloader instantiates this class.
	 *
	 * @var bool
	 */
	public static $instantiated = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		self::$instantiated = true;
	}
}

/**
 * Main autoloader test case.
 */
class TestMainAutoload extends WP_UnitTestCase {

	/**
	 * Tear down each test.
	 */
	public function tear_down() {
		remove_all_filters( 'otter_blocks_autoloader' );
		Otter_Autoload_Probe::$instantiated = false;
		parent::tear_down();
	}

	/**
	 * A listed class that cannot be loaded must not fatal the request, and must not stop the rest of the list.
	 */
	public function test_autoload_classes_skips_unavailable_class() {
		add_filter(
			'otter_blocks_autoloader',
			function () {
				return array(
					'\ThemeIsle\GutenbergBlocks\Plugins\Definitely_Missing_Class',
					'Otter_Autoload_Probe',
				);
			}
		);

		( new Main() )->autoload_classes();

		$this->assertTrue( Otter_Autoload_Probe::$instantiated, 'Classes listed after an unavailable one should still be instantiated.' );
	}

	/**
	 * Non-string entries injected by a third-party filter must not fatal either.
	 */
	public function test_autoload_classes_skips_non_string_entries() {
		add_filter(
			'otter_blocks_autoloader',
			function () {
				return array( null, array( 'nope' ), 'Otter_Autoload_Probe' );
			}
		);

		( new Main() )->autoload_classes();

		$this->assertTrue( Otter_Autoload_Probe::$instantiated );
	}

	/**
	 * Every class the plugin ships in the autoload list must be loadable, so a stale classmap is caught here instead of on a live site.
	 */
	public function test_bundled_classnames_are_loadable() {
		$listed = $this->get_listed_classnames();

		$this->assertNotEmpty( $listed );

		foreach ( $listed as $classname ) {
			$this->assertTrue( class_exists( $classname ), $classname . ' is listed for autoloading but cannot be loaded.' );
		}
	}

	/**
	 * The fallback loader must cover the whole autoload list, so a class stays reachable when Composer's generated classmap does not match the files on disk.
	 */
	public function test_fallback_autoloader_resolves_every_listed_classname() {
		foreach ( $this->get_listed_classnames() as $classname ) {
			$this->assertNotFalse(
				Autoloader::path_for( ltrim( $classname, '\\' ) ),
				$classname . ' cannot be resolved from its file name; the fallback autoloader no longer covers the autoload list.'
			);
		}
	}

	/**
	 * File name mapping, including the Integration namespace that lives in inc/integrations/.
	 */
	public function test_path_for_maps_class_names_to_files() {
		$this->assertSame(
			OTTER_BLOCKS_PATH . '/inc/plugins/class-atomic-wind-blocks.php',
			Autoloader::path_for( 'ThemeIsle\GutenbergBlocks\Plugins\Atomic_Wind_Blocks' )
		);

		$this->assertSame(
			OTTER_BLOCKS_PATH . '/inc/integrations/class-form-providers.php',
			Autoloader::path_for( 'ThemeIsle\GutenbergBlocks\Integration\Form_Providers' )
		);

		$this->assertSame(
			OTTER_BLOCKS_PATH . '/inc/class-main.php',
			Autoloader::path_for( 'ThemeIsle\GutenbergBlocks\Main' )
		);
	}

	/**
	 * Classes outside the plugin namespace, and names with no file, are left to the other loaders.
	 */
	public function test_path_for_ignores_foreign_and_missing_classes() {
		$this->assertFalse( Autoloader::path_for( 'WP_Query' ) );
		$this->assertFalse( Autoloader::path_for( 'ThemeIsle\OtterPro\Plugins\License' ) );
		$this->assertFalse( Autoloader::path_for( 'ThemeIsle\GutenbergBlocks\Plugins\Definitely_Missing_Class' ) );
	}

	/**
	 * The class list the plugin passes through the `otter_blocks_autoloader` filter.
	 *
	 * @return array<int, string>
	 */
	private function get_listed_classnames() {
		$listed = array();

		add_filter(
			'otter_blocks_autoloader',
			function ( $classnames ) use ( &$listed ) {
				$listed = $classnames;

				return array(); // Nothing to instantiate; the list itself is what is under test.
			},
			0
		);

		( new Main() )->autoload_classes();

		return $listed;
	}
}
