<?php
/**
 * Class Test_Animation_CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Base_CSS;
use ThemeIsle\GutenbergBlocks\Plugins\Dashboard;
use ThemeIsle\GutenbergBlocks\Server\Dashboard_Server;

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
	 * Animation assets remain available with older Otter and parser fallbacks.
	 */
	public function test_frontend_assets_support_mixed_otter_versions() {
		$sandbox = __DIR__ . '/php/animation-compatibility-sandbox.php';

		foreach ( array( 'legacy', 'owned', 'foreign', 'standalone', 'disabled' ) as $scenario ) {
			$command = escapeshellarg( PHP_BINARY ) . ' -d display_errors=1 ' . escapeshellarg( $sandbox ) . ' ' . escapeshellarg( $scenario ) . ' 2>&1';
			$output  = array();
			exec( $command, $output, $exit_code ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.system_calls_exec
			$output = implode( "\n", $output );

			$this->assertSame( 0, $exit_code, $scenario . ': ' . $output );
			$this->assertStringContainsString( 'REQUEST COMPLETED WITHOUT FATAL', $output );
		}
	}

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
		$output = $this->run_sandbox( 'commentable' );

		$this->assertStringContainsString( 'CSS_LENGTH:0', $output, 'The optimization should be skipped when a foreign parser is loaded: ' . $output );
		$this->assertStringNotContainsString( 'must be compatible', $output );
	}

	/**
	 * The guard must reject any preloaded foreign `Sabberworm\CSS` symbol, not
	 * only its sentinel entry points — here a foreign `OutputFormat` class.
	 */
	public function test_get_animation_css_falls_back_when_foreign_non_sentinel_class_is_loaded() {
		$output = $this->run_sandbox( 'outputformat' );

		$this->assertStringContainsString( 'CSS_LENGTH:0', $output, 'The optimization should be skipped when any foreign Sabberworm class is loaded: ' . $output );
	}

	/**
	 * Run the collision sandbox in a separate PHP process and assert it completes.
	 *
	 * @param string $scenario Sandbox scenario name.
	 * @return string Combined process output.
	 */
	private function run_sandbox( $scenario ) {
		$sandbox = __DIR__ . '/php/foreign-sabberworm-sandbox.php';

		$command = escapeshellarg( PHP_BINARY ) . ' -d display_errors=1 ' . escapeshellarg( $sandbox ) . ' ' . escapeshellarg( $scenario ) . ' 2>&1';

		exec( $command, $output, $exit_code ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.system_calls_exec

		$output = implode( "\n", $output );

		$this->assertSame( 0, $exit_code, 'The sandbox request fataled instead of degrading gracefully: ' . $output );
		$this->assertStringContainsString( 'REQUEST COMPLETED WITHOUT FATAL', $output );

		return $output;
	}

	/**
	 * Sanity check: with only the bundled parser present, the guard passes and the
	 * optimized subset is produced.
	 */
	public function test_get_animation_css_parses_with_bundled_parser() {
		$this->assertTrue( Base_CSS::has_own_css_parser() );

		delete_transient( Base_CSS::ANIMATION_RULES_TRANSIENT );

		$css = ( new Base_CSS() )->get_animation_css( $this->animated_blocks() );

		$this->assertStringContainsString( 'fadeIn', $css );
		$this->assertStringContainsString( '@keyframes', $css );
	}

	/**
	 * Reading a cached parser object graph loads the bundled parser classes
	 * outside has_own_css_parser(), which fatals in `RuleSet` while a foreign
	 * parser is loaded. The cache must hold plain data only.
	 */
	public function test_animation_cache_holds_no_parser_objects_issue_3098(): void {
		/** @var array<string, mixed> $cached */
		$cached = array();

		add_action(
			'set_transient',
			function ( string $transient, $value ) use ( &$cached ): void {
				$cached[ $transient ] = $value;
			},
			10,
			2
		);

		$css = ( new Base_CSS() )->get_animation_css( $this->animated_blocks() );

		$this->assertStringContainsString( '@keyframes fadeIn', $css );
		$this->assertNotEmpty( $cached, 'The parsed animation rules should be cached.' );

		foreach ( $cached as $transient => $value ) {
			$this->assertIsArray( $value, $transient );
			array_walk_recursive(
				$value,
				function ( $item ) use ( $transient ): void {
					$this->assertIsNotObject( $item, $transient . ' caches parser objects.' );
				}
			);
		}
	}

	/**
	 * Older releases cached parser objects under `otter_animations_parsed`; the
	 * dashboard and style regeneration must drop that value without reading it.
	 */
	public function test_legacy_animation_cache_is_deleted_unread_issue_3098(): void {
		set_transient( 'otter_animations_parsed', array( 'legacy' ), MONTH_IN_SECONDS );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		$reads = 0;
		add_filter(
			'pre_transient_otter_animations_parsed',
			function ( $pre ) use ( &$reads ) {
				++$reads;
				return $pre;
			}
		);

		if ( ! function_exists( 'tsdk_translate_link' ) ) {
			function tsdk_translate_link( string $link ): string {
				return $link;
			}
		}

		if ( ! function_exists( 'tsdk_utmify' ) ) {
			function tsdk_utmify( string $link ): string {
				return $link;
			}
		}

		add_filter( 'pre_http_request', fn() => new WP_Error( 'http_request_blocked', 'External HTTP requests are blocked in tests.' ) );

		Dashboard::instance()->get_dashboard_data();
		Dashboard_Server::regenerate_styles();

		$this->assertSame( 0, $reads, 'The legacy parser-object cache was read.' );
		$this->assertFalse( get_option( '_transient_otter_animations_parsed' ) );
	}
}
