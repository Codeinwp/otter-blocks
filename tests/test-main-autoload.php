<?php
/**
 * Tests for Main::autoload_classes().
 *
 * @package gutenberg-blocks
 */

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

		$this->assertNotEmpty( $listed );

		foreach ( $listed as $classname ) {
			$this->assertTrue( class_exists( $classname ), $classname . ' is listed for autoloading but cannot be loaded.' );
		}
	}
}
