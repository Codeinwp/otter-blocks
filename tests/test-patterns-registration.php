<?php
/**
 * Tests for bundled pattern file loading.
 *
 * Covers the guards around the `require` in Patterns::register_patterns():
 * a bundled pattern whose file is missing or unreadable must be skipped
 * instead of terminating the request.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Patterns;

/**
 * Bundled pattern registration test case.
 */
class TestPatternsRegistration extends WP_UnitTestCase {

	/**
	 * Temporary pattern files created by a test, removed in tear_down().
	 *
	 * @var array<int, string>
	 */
	private $temp_patterns = array();

	/**
	 * Bundled pattern file moved aside by a test, restored in tear_down().
	 *
	 * @var array<int, string> Original path and backup path, or empty.
	 */
	private $moved_pattern = array();

	/**
	 * Start each test from a clean pattern registry.
	 */
	public function set_up(): void {
		parent::set_up();

		$this->unregister_otter_patterns();
	}

	/**
	 * Restore the filesystem and the registry the bootstrap left behind.
	 */
	public function tear_down(): void {
		foreach ( $this->temp_patterns as $file ) {
			if ( file_exists( $file ) ) {
				chmod( $file, 0644 );
				unlink( $file );
			}
		}

		$this->temp_patterns = array();

		if ( ! empty( $this->moved_pattern ) ) {
			list( $original, $backup ) = $this->moved_pattern;

			if ( file_exists( $backup ) ) {
				rename( $backup, $original );
			}

			$this->moved_pattern = array();
		}

		$this->unregister_otter_patterns();
		( new Patterns() )->register_patterns();

		parent::tear_down();
	}

	public function test_register_pattern_file_registers_a_bundled_pattern() {
		$this->assertTrue( $this->register_pattern_file( 'cafe-about' ) );
		$this->assertTrue( $this->is_registered( 'cafe-about' ) );
	}

	public function test_register_pattern_file_skips_missing_file() {
		$this->assertFalse( $this->register_pattern_file( 'otter-missing' ) );
		$this->assertFalse( $this->is_registered( 'otter-missing' ) );
	}

	public function test_register_pattern_file_skips_unreadable_file() {
		$slug = 'otter-unreadable';
		$file = $this->write_temp_pattern( $slug, "<?php\nreturn array( 'title' => 'Unreadable', 'content' => '<p>x</p>' );\n" );

		chmod( $file, 0000 );
		clearstatcache( true, $file );

		if ( is_readable( $file ) ) {
			$this->markTestSkipped( 'File permissions are not enforced for the current user.' );
		}

		$this->assertFalse( $this->register_pattern_file( $slug ) );
		$this->assertFalse( $this->is_registered( $slug ) );
	}

	public function test_register_patterns_continues_past_a_missing_pattern() {
		$original = OTTER_BLOCKS_PATH . '/inc/patterns/cafe-about.php';
		$backup   = $original . '.bak';

		$this->assertTrue( rename( $original, $backup ) );
		$this->moved_pattern = array( $original, $backup );

		( new Patterns() )->register_patterns();

		$this->assertFalse( $this->is_registered( 'cafe-about' ), 'The unavailable pattern should be skipped.' );
		$this->assertTrue( $this->is_registered( 'cafe-homepage' ), 'Later patterns should still register.' );
		$this->assertTrue( $this->is_registered( 'aw-cta-banner' ), 'Earlier patterns should still register.' );
	}

	/**
	 * Invoke the protected loader for a single pattern slug.
	 *
	 * @param string $slug Pattern slug.
	 * @return bool
	 */
	private function register_pattern_file( $slug ) {
		$method = new ReflectionMethod( Patterns::class, 'register_pattern_file' );
		$method->setAccessible( true );

		return $method->invoke( new Patterns(), $slug );
	}

	/**
	 * Whether a slug is present in the pattern registry.
	 *
	 * @param string $slug Pattern slug.
	 * @return bool
	 */
	private function is_registered( $slug ) {
		return WP_Block_Patterns_Registry::get_instance()->is_registered( 'otter-blocks/' . $slug );
	}

	/**
	 * Create a throwaway file inside the bundled patterns directory.
	 *
	 * @param string $slug     Pattern slug.
	 * @param string $contents File contents.
	 * @return string Full path.
	 */
	private function write_temp_pattern( $slug, $contents ) {
		$file = OTTER_BLOCKS_PATH . '/inc/patterns/' . $slug . '.php';

		file_put_contents( $file, $contents );
		$this->temp_patterns[] = $file;

		return $file;
	}

	/**
	 * Drop every Otter pattern from the registry.
	 */
	private function unregister_otter_patterns() {
		$registry = WP_Block_Patterns_Registry::get_instance();

		foreach ( $registry->get_all_registered() as $pattern ) {
			if ( 0 === strpos( $pattern['name'], 'otter-blocks/' ) ) {
				$registry->unregister( $pattern['name'] );
			}
		}
	}
}
