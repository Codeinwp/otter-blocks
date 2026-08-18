<?php
/**
 * Class Test_CSS_Handler
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\CSS\CSS_Handler;

/**
 * CSS_Handler filesystem tests.
 *
 * Regression coverage for https://github.com/Codeinwp/otter-blocks/issues/2937 —
 * a frontend request fataled with "Call to undefined function WP_Filesystem()"
 * because is_writable() called WP_Filesystem() before checking it exists.
 */
class Test_CSS_Handler extends WP_UnitTestCase {

	/**
	 * is_writable() must not fatal when WP_Filesystem() stays undefined after
	 * including wp-admin/includes/file.php; it must fall back to `false` so the
	 * frontend can use the inline CSS fallback.
	 *
	 * The scenario is impossible to create inside the loaded test environment
	 * (WP_Filesystem() already exists), so the class is exercised in a separate
	 * PHP process against a fake ABSPATH whose file.php defines nothing.
	 */
	public function test_is_writable_returns_false_when_wp_filesystem_is_unavailable() {
		$sandbox = __DIR__ . '/php/is-writable-sandbox.php';

		$command = escapeshellarg( PHP_BINARY ) . ' -d display_errors=1 ' . escapeshellarg( $sandbox ) . ' 2>&1';

		exec( $command, $output, $exit_code ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.system_calls_exec

		$output = implode( "\n", $output );

		$this->assertSame( 0, $exit_code, 'The sandbox request fataled instead of degrading gracefully: ' . $output );
		$this->assertStringContainsString( 'RESULT:false', $output, 'is_writable() should return false when WP_Filesystem() is unavailable: ' . $output );
		$this->assertStringContainsString( 'REQUEST COMPLETED WITHOUT FATAL', $output );
		$this->assertStringNotContainsString( 'Call to undefined function', $output );
	}

	/**
	 * Sanity check: in a normal environment with a direct filesystem,
	 * is_writable() still reports the upload dir as writable.
	 */
	public function test_is_writable_returns_true_in_normal_environment() {
		$this->assertTrue( CSS_Handler::is_writable() );
	}
}
