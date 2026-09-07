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
 * Abstract entry: class_exists() is true for it, but `new` raises an Error.
 */
abstract class Otter_Autoload_Abstract_Probe {}

/**
 * Entry whose constructor raises an Error, standing in for a constructor that
 * reaches for a class from a plugin that is no longer loaded.
 */
class Otter_Autoload_Throwing_Probe {
	/**
	 * Constructor.
	 */
	public function __construct() {
		throw new \Error( 'Class "Gone_Away" not found' );
	}
}

/**
 * Entry whose constructor requires an argument, so it cannot be built from a bare class name.
 */
class Otter_Autoload_Required_Arg_Probe {
	/**
	 * Constructor.
	 *
	 * @param string $required A required argument.
	 */
	public function __construct( $required ) {
		unset( $required );
	}
}

/**
 * Entry whose instance() raises an Error after the constructor succeeded.
 */
class Otter_Autoload_Throwing_Instance_Probe {
	/**
	 * Boot the module.
	 *
	 * @return void
	 */
	public function instance() {
		throw new \Error( 'Class "Gone_Away" not found' );
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
	 * An abstract class passes class_exists() but cannot be instantiated; it must not fatal the request.
	 */
	public function test_autoload_classes_skips_abstract_class() {
		add_filter(
			'otter_blocks_autoloader',
			function () {
				return array( 'Otter_Autoload_Abstract_Probe', 'Otter_Autoload_Probe' );
			}
		);

		( new Main() )->autoload_classes();

		$this->assertTrue( Otter_Autoload_Probe::$instantiated, 'Classes listed after an abstract one should still be instantiated.' );
	}

	/**
	 * A constructor that raises an Error must be contained, not fatal the request.
	 */
	public function test_autoload_classes_survives_a_throwing_constructor() {
		add_filter(
			'otter_blocks_autoloader',
			function () {
				return array( 'Otter_Autoload_Throwing_Probe', 'Otter_Autoload_Probe' );
			}
		);

		( new Main() )->autoload_classes();

		$this->assertTrue( Otter_Autoload_Probe::$instantiated, 'Classes listed after a throwing constructor should still be instantiated.' );
	}

	/**
	 * An instance() call that raises an Error must be contained too.
	 */
	public function test_autoload_classes_survives_a_throwing_instance_call() {
		add_filter(
			'otter_blocks_autoloader',
			function () {
				return array( 'Otter_Autoload_Throwing_Instance_Probe', 'Otter_Autoload_Probe' );
			}
		);

		( new Main() )->autoload_classes();

		$this->assertTrue( Otter_Autoload_Probe::$instantiated, 'Classes listed after a throwing instance() should still be instantiated.' );
	}

	/**
	 * A class needing constructor arguments cannot be built from a bare name; it must not fatal the request.
	 */
	public function test_autoload_classes_skips_class_requiring_constructor_arguments() {
		add_filter(
			'otter_blocks_autoloader',
			function () {
				return array( 'Otter_Autoload_Required_Arg_Probe', 'Otter_Autoload_Probe' );
			}
		);

		( new Main() )->autoload_classes();

		$this->assertTrue( Otter_Autoload_Probe::$instantiated, 'Classes listed after one requiring constructor arguments should still be instantiated.' );
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
