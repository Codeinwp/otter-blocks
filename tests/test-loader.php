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
	 * Some call sites run per block, so the same bad entry must be reported once per request
	 * rather than once per attempt.
	 */
	public function test_repeated_skips_are_logged_once() {
		Loader::reset_reported();

		$log = get_temp_dir() . 'otter-loader-log-' . wp_generate_password( 8, false ) . '.txt';
		$old = ini_set( 'error_log', $log );

		for ( $i = 0; $i < 5; $i++ ) {
			Loader::instantiate( 'Otter_Loader_Definitely_Missing' );
		}

		ini_set( 'error_log', false === $old ? '' : $old );

		$lines = file_exists( $log ) ? substr_count( file_get_contents( $log ), 'Otter_Loader_Definitely_Missing' ) : 0;

		if ( file_exists( $log ) ) {
			unlink( $log );
		}

		$this->assertSame( 1, $lines, 'A repeated skip must not be logged more than once.' );

		Loader::reset_reported();
	}

	/**
	 * Distinct reasons for the same class are still reported separately.
	 */
	public function test_distinct_skip_reasons_are_both_logged() {
		Loader::reset_reported();

		$log = get_temp_dir() . 'otter-loader-log-' . wp_generate_password( 8, false ) . '.txt';
		$old = ini_set( 'error_log', $log );

		Loader::log_skipped( 'Otter_Loader_Plain', 'first reason' );
		Loader::log_skipped( 'Otter_Loader_Plain', 'second reason' );
		Loader::log_skipped( 'Otter_Loader_Plain', 'first reason' );

		ini_set( 'error_log', false === $old ? '' : $old );

		$contents = file_exists( $log ) ? file_get_contents( $log ) : '';

		if ( file_exists( $log ) ) {
			unlink( $log );
		}

		$this->assertSame( 1, substr_count( $contents, 'first reason' ) );
		$this->assertSame( 1, substr_count( $contents, 'second reason' ) );

		Loader::reset_reported();
	}

	/**
	 * A missing loader file is reported, and the plugin stays inert instead of fataling.
	 */
	public function test_bootstrap_reports_a_missing_loader_file() {
		$result = $this->run_bootstrap( 'missing' );

		$this->assertSame( 0, $result['status'], $result['output'] );
		$this->assertStringContainsString( 'is missing.', $result['log'] );
		$this->assertStringContainsString( 'LOADER:no', $result['output'] );
	}

	/**
	 * An unreadable loader file is reported distinctly from a missing one.
	 */
	public function test_bootstrap_reports_an_unreadable_loader_file() {
		$result = $this->run_bootstrap( 'unreadable' );

		if ( null === $result ) {
			$this->markTestSkipped( 'The test user can read a 0000 file, so this branch cannot be reached here.' );
		}

		$this->assertSame( 0, $result['status'], $result['output'] );
		$this->assertStringContainsString( 'is not readable.', $result['log'] );
		$this->assertStringContainsString( 'LOADER:no', $result['output'] );
	}

	/**
	 * A readable file that does not declare the class is reported too, rather than falling
	 * through to a fatal at the first call site.
	 */
	public function test_bootstrap_reports_a_loader_file_that_declares_nothing() {
		$result = $this->run_bootstrap( 'empty' );

		$this->assertSame( 0, $result['status'], $result['output'] );
		$this->assertStringContainsString( 'does not declare', $result['log'] );
		$this->assertStringContainsString( 'LOADER:no', $result['output'] );
	}

	/**
	 * The healthy path stays quiet and leaves Loader available.
	 */
	public function test_bootstrap_loads_the_real_loader_without_composer() {
		$result = $this->run_bootstrap( 'real' );

		$this->assertSame( 0, $result['status'], $result['output'] );
		$this->assertStringNotContainsString( 'Not starting', $result['log'] );
		$this->assertStringContainsString( 'LOADER:yes', $result['output'] );
	}

	/**
	 * Run otter-blocks.php in a bare PHP process against a fixture plugin directory.
	 *
	 * The fixture ships no vendor/ so the Composer classmap cannot resolve Loader, which is
	 * the stale-install case the fallback exists for.
	 *
	 * @param string $scenario One of missing, unreadable, empty, real.
	 * @return array<string, mixed>|null Status, stdout and error log, or null when the
	 *                                   unreadable scenario cannot be set up.
	 */
	private function run_bootstrap( $scenario ) {
		$dir = get_temp_dir() . 'otter-bootstrap-' . $scenario . '-' . wp_generate_password( 8, false );

		mkdir( $dir . '/inc', 0777, true );
		copy( OTTER_BLOCKS_PATH . '/otter-blocks.php', $dir . '/otter-blocks.php' );

		$loader_file = $dir . '/inc/class-loader.php';

		if ( 'real' === $scenario ) {
			copy( OTTER_BLOCKS_PATH . '/inc/class-loader.php', $loader_file );
		} elseif ( 'empty' === $scenario ) {
			file_put_contents( $loader_file, '<?php // Declares nothing.' );
		} elseif ( 'unreadable' === $scenario ) {
			copy( OTTER_BLOCKS_PATH . '/inc/class-loader.php', $loader_file );
			chmod( $loader_file, 0000 );
			clearstatcache( true, $loader_file );

			if ( is_readable( $loader_file ) ) {
				// Running as root: a 0000 file is still readable, so the branch is unreachable.
				$this->remove_dir( $dir );

				return null;
			}
		}

		$log     = $dir . '/error.log';
		$harness = $dir . '/harness.php';

		file_put_contents(
			$harness,
			'<?php' . "\n"
			. 'define( "WPINC", "wp-includes" );' . "\n"
			. 'function plugins_url( $path = "", $plugin = "" ) { return "http://example.org/"; }' . "\n"
			. 'function add_filter() { return true; }' . "\n"
			. 'function add_action() { return true; }' . "\n"
			. 'function plugin_basename( $file ) { return basename( dirname( $file ) ) . "/" . basename( $file ); }' . "\n"
			. 'function __( $text, $domain = null ) { return $text; }' . "\n"
			. 'require ' . var_export( $dir . '/otter-blocks.php', true ) . ';' . "\n"
			. 'echo class_exists( "ThemeIsle\\\\GutenbergBlocks\\\\Loader" ) ? "LOADER:yes" : "LOADER:no";' . "\n"
		);

		$output = array();
		$status = 0;

		exec(
			escapeshellarg( PHP_BINARY )
			. ' -d log_errors=1 -d ' . escapeshellarg( 'error_log=' . $log )
			. ' ' . escapeshellarg( $harness ) . ' 2>&1',
			$output,
			$status
		);

		$result = array(
			'status' => $status,
			'output' => implode( "\n", $output ),
			'log'    => file_exists( $log ) ? file_get_contents( $log ) : '',
		);

		if ( 'unreadable' === $scenario ) {
			chmod( $loader_file, 0644 );
		}

		$this->remove_dir( $dir );

		return $result;
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
