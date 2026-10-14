<?php
/**
 * Class Test_CSS_Handler
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\CSS\Block_Frontend;
use ThemeIsle\GutenbergBlocks\CSS\CSS_Handler;
use ThemeIsle\GutenbergBlocks\Registration;

/**
 * CSS_Handler filesystem and stored stylesheet tests.
 *
 * Filesystem coverage is for https://github.com/Codeinwp/otter-blocks/issues/2937 —
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

	/**
	 * Entity-encoded tags in block style values must not become a closing style tag once
	 * the stored stylesheet is decoded.
	 */
	public function test_stored_block_css_cannot_close_style_element(): void {
		$payload = 'a&lt;/style&gt;&lt;script&gt;alert(/xss/)&lt;/script&gt;&lt;style&gt;b';
		$post_id = self::factory()->post->create(
			array(
				'post_content' => '<!-- wp:themeisle-blocks/advanced-heading {"id":"wp-block-themeisle-blocks-advanced-heading","fontFamily":"' . $payload . '","headingColor":"rgb(1,2,3)' . $payload . '"} --><h2 id="wp-block-themeisle-blocks-advanced-heading" class="wp-block-themeisle-blocks-advanced-heading">Hi</h2><!-- /wp:themeisle-blocks/advanced-heading -->',
			)
		);

		try {
			CSS_Handler::generate_css_file( $post_id );

			ob_start();
			Block_Frontend::instance()->get_post_css( $post_id );
			$output = (string) ob_get_clean();
		} finally {
			$this->delete_post_css_file( $post_id );
		}

		$this->assertStringContainsString( 'font-family', (string) get_post_meta( $post_id, '_themeisle_gutenberg_block_styles', true ) );
		$this->assertStringContainsString( 'font-family:a\\3c\\2fstyle>', $output );
		$this->assertSame( 1, preg_match_all( '~</style~i', $output ), $output );

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertFalse( $processor->next_tag( 'script' ), $output );

		// Decoding must still restore the CSS characters kses encodes.
		$css = CSS_Handler::compress( wp_filter_nohtml_kses( '.a > .b{background:url(x.png?a=1&b=2)}@media (width < 600px){.c{color:red}}' ) );
		$this->assertStringContainsString( '.a>.b', $css );
		$this->assertStringContainsString( 'url(x.png?a=1&b=2)', $css );
		$this->assertStringContainsString( 'width < 600px', $css );
	}

	/**
	 * CSS stored before the fix is neutralized when printed.
	 */
	public function test_stored_poisoned_css_is_neutralized_on_output(): void {
		$post_id = self::factory()->post->create(
			array( 'post_content' => '<!-- wp:paragraph --><p>Hi</p><!-- /wp:paragraph -->' )
		);
		update_post_meta( $post_id, '_themeisle_gutenberg_block_styles', '.a{color:red}</StYlE><script>alert(1)</script>' );

		ob_start();
		Block_Frontend::instance()->get_post_css( $post_id );
		$output = (string) ob_get_clean();

		$this->assertSame( 1, preg_match_all( '~</style~i', $output ), $output );
		$this->assertStringContainsString( '.a{color:red}', $output );
	}

	/**
	 * The widgets stylesheet, which core may inline in a style tag, keeps the exact CSS escape.
	 */
	public function test_widgets_css_file_keeps_style_escape(): void {
		$widget_used = Registration::$widget_used;
		$payload     = 'a&lt;/style&gt;&lt;script&gt;alert(/xss/)&lt;/script&gt;&lt;style&gt;b';

		update_option(
			'widget_block',
			array( 7 => array( 'content' => '<!-- wp:themeisle-blocks/advanced-heading {"id":"wp-block-themeisle-blocks-advanced-heading","fontFamily":"' . $payload . '"} --><h2 id="wp-block-themeisle-blocks-advanced-heading" class="wp-block-themeisle-blocks-advanced-heading">Hi</h2><!-- /wp:themeisle-blocks/advanced-heading -->' ) )
		);
		Registration::$widget_used = array( 'block-7' );

		try {
			CSS_Handler::save_widgets_styles();

			$file_path = wp_upload_dir( null, false )['basedir'] . '/themeisle-gutenberg/' . get_option( 'themeisle_blocks_widgets_css_file' ) . '.css';
			$css       = (string) file_get_contents( $file_path );
		} finally {
			Registration::$widget_used = $widget_used;

			if ( isset( $file_path ) && is_file( $file_path ) ) {
				unlink( $file_path );
			}
		}

		$this->assertStringContainsString( 'font-family:a\\3c\\2fstyle>', $css );
		$this->assertDoesNotMatchRegularExpression( '~</style~i', $css );
	}

	/**
	 * Remove the stylesheet and meta generate_css_file() wrote for a post.
	 *
	 * @param int $post_id Post ID.
	 */
	private function delete_post_css_file( int $post_id ): void {
		$file_name = get_post_meta( $post_id, '_themeisle_gutenberg_block_stylesheet', true );

		if ( is_string( $file_name ) && '' !== $file_name ) {
			$file_path = wp_upload_dir( null, false )['basedir'] . '/themeisle-gutenberg/' . $file_name . '.css';

			if ( is_file( $file_path ) ) {
				unlink( $file_path );
			}
		}
	}
}
