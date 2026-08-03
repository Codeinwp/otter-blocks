<?php
/**
 * Class Test_Animation_CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Base_CSS;

/**
 * Animation-CSS parser collision tests.
 *
 * Regression coverage for https://github.com/Codeinwp/otter-blocks/issues/2942 —
 * a frontend request fataled with a declaration-compatibility error when another
 * plugin had loaded a different php-css-parser release before Otter parsed the
 * animation stylesheet.
 */
class Test_Animation_CSS extends WP_UnitTestCase {

	/**
	 * A single animated block, as parse_blocks() would shape it.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function animated_blocks() {
		return array(
			array(
				'blockName' => 'core/paragraph',
				'attrs'     => array( 'className' => 'animated fadeIn' ),
			),
		);
	}

	/**
	 * With a foreign typed `Commentable` interface already loaded, parsing must be
	 * skipped in favor of the stock stylesheet — not fatal at class-link time.
	 *
	 * The collision poisons every later Sabberworm use in the process, so the
	 * scenario runs in a separate PHP process against a predefined 9.x interface.
	 */
	public function test_get_animation_css_falls_back_when_foreign_parser_is_loaded() {
		$sandbox = __DIR__ . '/php/foreign-sabberworm-sandbox.php';

		$command = escapeshellarg( PHP_BINARY ) . ' -d display_errors=1 ' . escapeshellarg( $sandbox ) . ' 2>&1';

		exec( $command, $output, $exit_code ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.system_calls_exec

		$output = implode( "\n", $output );

		$this->assertSame( 0, $exit_code, 'The sandbox request fataled instead of degrading gracefully: ' . $output );
		$this->assertStringContainsString( 'CSS_LENGTH:0', $output, 'The optimization should be skipped when a foreign parser is loaded: ' . $output );
		$this->assertStringContainsString( 'REQUEST COMPLETED WITHOUT FATAL', $output );
		$this->assertStringNotContainsString( 'must be compatible', $output );
	}

	/**
	 * Sanity check: with only the bundled parser present, the guard passes and the
	 * optimized subset is produced.
	 */
	public function test_get_animation_css_parses_with_bundled_parser() {
		$this->assertTrue( Base_CSS::has_own_css_parser() );

		delete_transient( 'otter_animations_parsed' );

		$css = ( new Base_CSS() )->get_animation_css( $this->animated_blocks() );

		$this->assertStringContainsString( 'fadeIn', $css );
		$this->assertStringContainsString( '@keyframes', $css );
	}
}
