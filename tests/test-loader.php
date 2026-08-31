<?php
/**
 * Tests for the fatal-safe Loader helpers.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Loader;

/**
 * Plain class the loader can build and boot.
 */
class Otter_Loader_Bootable {
	/**
	 * Set when instance() runs.
	 *
	 * @var bool
	 */
	public static $booted = false;

	/**
	 * Boot the module.
	 *
	 * @return void
	 */
	public function instance() {
		self::$booted = true;
	}
}

/**
 * Class with no instance() method.
 */
class Otter_Loader_Plain {}

/**
 * Class with a private constructor, exposing a static singleton accessor instead.
 */
class Otter_Loader_Singleton {
	/**
	 * Set when instance() runs.
	 *
	 * @var bool
	 */
	public static $booted = false;

	/**
	 * Private constructor.
	 */
	private function __construct() {}

	/**
	 * Boot the singleton.
	 *
	 * @return void
	 */
	public static function instance() {
		self::$booted = true;
	}
}

/**
 * Singleton whose static accessor raises an Error.
 */
class Otter_Loader_Throwing_Singleton {
	/**
	 * Boot the singleton.
	 *
	 * @return void
	 */
	public static function instance() {
		throw new \Error( 'Class "Gone_Away" not found' );
	}
}

/**
 * Loader test case.
 */
class TestLoader extends WP_UnitTestCase {

	/**
	 * Tear down each test.
	 */
	public function tear_down() {
		Otter_Loader_Bootable::$booted  = false;
		Otter_Loader_Singleton::$booted = false;

		parent::tear_down();
	}

	/**
	 * A loadable class is instantiated and returned.
	 */
	public function test_instantiate_returns_an_instance() {
		$this->assertInstanceOf( 'Otter_Loader_Plain', Loader::instantiate( 'Otter_Loader_Plain' ) );
	}

	/**
	 * Entries that are not class names are rejected rather than passed to `new`.
	 *
	 * @dataProvider provide_non_class_names
	 *
	 * @param mixed $entry Entry to reject.
	 */
	public function test_instantiate_rejects_non_class_names( $entry ) {
		$this->assertNull( Loader::instantiate( $entry ) );
	}

	/**
	 * Entries that cannot name a class.
	 *
	 * @return array<string, array<int, mixed>>
	 */
	public function provide_non_class_names() {
		return array(
			'null'         => array( null ),
			'array'        => array( array( 'nope' ) ),
			'empty string' => array( '' ),
			'whitespace'   => array( '   ' ),
			'unknown name' => array( 'Otter_Loader_Definitely_Missing' ),
		);
	}

	/**
	 * boot() runs instance() when the class has one.
	 */
	public function test_boot_runs_instance() {
		$this->assertInstanceOf( 'Otter_Loader_Bootable', Loader::boot( 'Otter_Loader_Bootable' ) );
		$this->assertTrue( Otter_Loader_Bootable::$booted );
	}

	/**
	 * boot() is a no-op beyond construction when the class has no instance().
	 */
	public function test_boot_tolerates_a_missing_instance_method() {
		$this->assertInstanceOf( 'Otter_Loader_Plain', Loader::boot( 'Otter_Loader_Plain' ) );
	}

	/**
	 * A private constructor cannot be reached through instantiate(), but boot_singleton() still boots it.
	 */
	public function test_boot_singleton_boots_a_private_constructor_class() {
		$this->assertNull( Loader::instantiate( 'Otter_Loader_Singleton' ) );

		$this->assertTrue( Loader::boot_singleton( 'Otter_Loader_Singleton' ) );
		$this->assertTrue( Otter_Loader_Singleton::$booted );
	}

	/**
	 * An absent optional module is reported as not booted, without fataling.
	 */
	public function test_boot_singleton_reports_a_missing_class() {
		$this->assertFalse( Loader::boot_singleton( 'Otter_Loader_Definitely_Missing' ) );
	}

	/**
	 * A class with no instance() accessor is not a bootable singleton.
	 */
	public function test_boot_singleton_reports_a_missing_accessor() {
		$this->assertFalse( Loader::boot_singleton( 'Otter_Loader_Plain' ) );
	}

	/**
	 * A singleton accessor that raises an Error is contained.
	 */
	public function test_boot_singleton_contains_a_throwing_accessor() {
		$this->assertFalse( Loader::boot_singleton( 'Otter_Loader_Throwing_Singleton' ) );
	}

	/**
	 * The plugin bootstrap loads Loader from a hard-coded path so a stale Composer classmap
	 * cannot fatal the very helper that exists to prevent fatals. Renaming the file without
	 * updating otter-blocks.php would silently reintroduce that dependency.
	 */
	public function test_bootstrap_fallback_path_still_points_at_the_loader() {
		$bootstrap = file_get_contents( OTTER_BLOCKS_PATH . '/otter-blocks.php' );

		$this->assertStringContainsString(
			"OTTER_BLOCKS_PATH . '/inc/class-loader.php'",
			$bootstrap,
			'otter-blocks.php must require the loader from disk.'
		);

		$this->assertFileIsReadable( OTTER_BLOCKS_PATH . '/inc/class-loader.php' );
	}

	/**
	 * That fallback only works if the file declares the class on its own, with no autoloader
	 * and no other include behind it. Checked in a bare PHP process, since the class is
	 * already loaded in this one.
	 */
	public function test_loader_file_declares_the_class_without_an_autoloader() {
		$script = 'require ' . var_export( OTTER_BLOCKS_PATH . '/inc/class-loader.php', true )
			. '; echo class_exists(' . var_export( 'ThemeIsle\\GutenbergBlocks\\Loader', true ) . ') ? "yes" : "no";';

		$output = array();
		$status = 0;

		exec( escapeshellarg( PHP_BINARY ) . ' -r ' . escapeshellarg( $script ) . ' 2>&1', $output, $status );

		$this->assertSame( 0, $status, 'Loading the file on its own must not error: ' . implode( "\n", $output ) );
		$this->assertSame( 'yes', end( $output ) );
	}

	/**
	 * Main is only booted when Loader is available, so a corrupt loader file degrades to an
	 * inert plugin instead of a fatal at the first call site.
	 */
	public function test_bootstrap_gates_main_on_the_loader() {
		$bootstrap = file_get_contents( OTTER_BLOCKS_PATH . '/otter-blocks.php' );

		$this->assertMatchesRegularExpression(
			'/if \(\s*class_exists\(\s*\x27\\\\ThemeIsle\\\\GutenbergBlocks\\\\Loader\x27\s*\)\s*&&\s*class_exists\(\s*\x27\\\\ThemeIsle\\\\GutenbergBlocks\\\\Main\x27\s*\)\s*\)/',
			$bootstrap,
			'Main::instance() must be gated on Loader being loadable.'
		);
	}
}
