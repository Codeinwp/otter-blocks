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
	 * Without a widgets stylesheet file, stored widgets CSS is printed inline with closing style tags escaped.
	 */
	public function test_widgets_css_fallback_print_escapes_style_tag(): void {
		global $wp_registered_sidebars;

		$widget_used = Registration::$widget_used;
		$sidebars    = $wp_registered_sidebars;

		register_sidebar( array( 'id' => 'otter-test-sidebar' ) );
		update_option( 'sidebars_widgets', array( 'otter-test-sidebar' => array( 'block-7' ) ) );
		update_option( 'themeisle_blocks_widgets_css', '.a{}</style><script>x</script>' );
		delete_option( 'themeisle_blocks_widgets_css_file' );
		Registration::$widget_used = array();

		try {
			ob_start();
			Block_Frontend::instance()->enqueue_widgets_css();
			$output = (string) ob_get_clean();
		} finally {
			Registration::$widget_used = $widget_used;
			$wp_registered_sidebars    = $sidebars;
		}

		$this->assertSame( 1, preg_match_all( '~</style~i', $output ), $output );
		$this->assertStringContainsString( '\\3c\\2fstyle', $output );
	}

	/**
	 * Font loading stops at a nested reference back to an earlier pattern and goes on with later references.
	 */
	public function test_synced_pattern_cycle_fonts_stop_at_the_cycle(): void {
		list( $first_id, $second_id, $third_id ) = $this->create_pattern_cycle();
		foreach ( array( $first_id, $second_id, $third_id ) as $pattern_id ) {
			update_post_meta( $pattern_id, '_themeisle_gutenberg_block_fonts', array( array( 'fontfamily' => 'Roboto', 'fontvariant' => array( '400' ) ) ) );
		}

		Block_Frontend::instance()->enqueue_reusable_fonts( parse_blocks( '<!-- wp:block {"ref":' . $first_id . '} /-->' ) );

		$this->assertTrue( wp_style_is( 'otter-google-fonts-' . $first_id, 'enqueued' ) );
		$this->assertTrue( wp_style_is( 'otter-google-fonts-' . $second_id, 'enqueued' ) );
		$this->assertTrue( wp_style_is( 'otter-google-fonts-' . $third_id, 'enqueued' ) );
	}

	/**
	 * Style loading stops at a nested reference back to an earlier pattern and goes on with later references.
	 */
	public function test_synced_pattern_cycle_styles_stop_at_the_cycle(): void {
		list( $first_id, $second_id, $third_id ) = $this->create_pattern_cycle();
		$file_paths                              = array(
			$this->seed_post_stylesheet( $first_id, '.ticss-first{color:red}' ),
			$this->seed_post_stylesheet( $second_id, '.ticss-second{color:blue}' ),
			$this->seed_post_stylesheet( $third_id, '.ticss-third{color:green}' ),
		);

		remove_all_actions( 'wp_footer' );

		try {
			Block_Frontend::instance()->enqueue_reusable_styles( parse_blocks( '<!-- wp:block {"ref":' . $first_id . '} /-->' ) );

			ob_start();
			do_action( 'wp_footer' );
			$output = (string) ob_get_clean();
		} finally {
			array_map( 'unlink', $file_paths );
		}

		$this->assertStringContainsString( '.ticss-first{color:red}', $output );
		// Once from the third pattern's own loader, once from the second pattern's saved-CSS read, which does not expand references.
		$this->assertSame( 2, substr_count( $output, '.ticss-third{color:green}' ), $output );
	}

	/**
	 * A pattern whose fonts are loading can still have its styles loaded.
	 */
	public function test_style_loading_is_not_blocked_by_font_loading_of_the_same_pattern(): void {
		$pattern_id = $this->create_pattern( '<!-- wp:paragraph --><p>Pattern</p><!-- /wp:paragraph -->' );
		$reference  = parse_blocks( '<!-- wp:block {"ref":' . $pattern_id . '} /-->' );
		$file_path  = $this->seed_post_stylesheet( $pattern_id, '.ticss-nested{color:red}' );
		update_post_meta( $pattern_id, '_themeisle_gutenberg_block_fonts', array( array( 'fontfamily' => 'Roboto', 'fontvariant' => array( '400' ) ) ) );

		remove_all_actions( 'wp_footer' );
		add_filter(
			'otter_blocks_google_fonts_url',
			function ( $url ) use ( $reference ) {
				Block_Frontend::instance()->enqueue_reusable_styles( $reference );

				return $url;
			}
		);

		try {
			Block_Frontend::instance()->enqueue_reusable_fonts( $reference );

			ob_start();
			do_action( 'wp_footer' );
			$output = (string) ob_get_clean();
		} finally {
			unlink( $file_path );
		}

		$this->assertStringContainsString( '.ticss-nested{color:red}', $output );
	}

	/**
	 * A font load that throws does not leave the pattern marked as being expanded.
	 */
	public function test_failed_font_load_does_not_skip_the_pattern_later(): void {
		$pattern_id = $this->create_pattern( '<!-- wp:paragraph --><p>Pattern</p><!-- /wp:paragraph -->' );
		$reference  = parse_blocks( '<!-- wp:block {"ref":' . $pattern_id . '} /-->' );
		$throw      = true;
		update_post_meta( $pattern_id, '_themeisle_gutenberg_block_fonts', array( array( 'fontfamily' => 'Roboto', 'fontvariant' => array( '400' ) ) ) );

		add_filter(
			'otter_blocks_google_fonts_url',
			function ( $url ) use ( &$throw ) {
				if ( $throw ) {
					$throw = false;
					throw new RuntimeException( 'Font URL failed.' );
				}

				return $url;
			}
		);

		try {
			Block_Frontend::instance()->enqueue_reusable_fonts( $reference );
		} catch ( RuntimeException $exception ) {
			$this->assertSame( 'Font URL failed.', $exception->getMessage() );
		}

		$this->assertFalse( $throw, 'The first font load must reach the throwing filter.' );

		Block_Frontend::instance()->enqueue_reusable_fonts( $reference );

		$this->assertTrue( wp_style_is( 'otter-google-fonts-' . $pattern_id, 'enqueued' ) );
	}

	/**
	 * A negative reference does not load the fonts of the pattern with the matching positive ID.
	 */
	public function test_negative_synced_pattern_reference_loads_no_fonts(): void {
		$pattern_id = $this->create_pattern( '<!-- wp:paragraph --><p>Pattern</p><!-- /wp:paragraph -->' );
		update_post_meta( $pattern_id, '_themeisle_gutenberg_block_fonts', array( array( 'fontfamily' => 'Roboto', 'fontvariant' => array( '400' ) ) ) );

		Block_Frontend::instance()->enqueue_reusable_fonts( parse_blocks( '<!-- wp:block {"ref":-' . $pattern_id . '} /-->' ) );

		$this->assertFalse( wp_style_is( 'otter-google-fonts-' . $pattern_id, 'enqueued' ) );
		$this->assertFalse( wp_style_is( 'otter-google-fonts--' . $pattern_id, 'enqueued' ) );
	}

	/**
	 * Separate references to one synced pattern each load its styles.
	 */
	public function test_repeated_synced_pattern_styles_are_loaded_per_reference(): void {
		$pattern_id = $this->create_pattern( '<!-- wp:paragraph --><p>Pattern</p><!-- /wp:paragraph -->' );
		$file_path  = $this->seed_post_stylesheet( $pattern_id, '.ticss-repeat{color:blue}' );
		$reference  = '<!-- wp:block {"ref":' . $pattern_id . '} /-->';

		remove_all_actions( 'wp_footer' );

		try {
			Block_Frontend::instance()->enqueue_reusable_styles( parse_blocks( $reference . $reference ) );

			ob_start();
			do_action( 'wp_footer' );
			$output = (string) ob_get_clean();
		} finally {
			unlink( $file_path );
		}

		$this->assertSame( 2, substr_count( $output, '.ticss-repeat{color:blue}' ), $output );
	}

	/**
	 * Create a published synced pattern.
	 *
	 * @param string $content Pattern content.
	 * @return int Pattern ID.
	 */
	private function create_pattern( string $content = '' ): int {
		return self::factory()->post->create(
			array(
				'post_type'    => 'wp_block',
				'post_status'  => 'publish',
				'post_content' => $content,
			)
		);
	}

	/**
	 * Create patterns first -> second -> first, where the second also references a third pattern after the cycle.
	 * Both references of the second pattern sit inside one Group block, the reference back to the first one first.
	 *
	 * @return int[] First, second and third pattern IDs.
	 */
	private function create_pattern_cycle(): array {
		$paragraph = '<!-- wp:paragraph --><p>Pattern</p><!-- /wp:paragraph -->';
		$first_id  = $this->create_pattern();
		$third_id  = $this->create_pattern( $paragraph );
		$second_id = $this->create_pattern( '<!-- wp:group --><div class="wp-block-group"><!-- wp:block {"ref":' . $first_id . '} /--><!-- wp:block {"ref":' . $third_id . '} /--></div><!-- /wp:group -->' );

		wp_update_post(
			array(
				'ID'           => $first_id,
				'post_content' => $paragraph . '<!-- wp:block {"ref":' . $second_id . '} /-->',
			)
		);

		return array( $first_id, $second_id, $third_id );
	}

	/**
	 * Give a post the saved CSS and stylesheet file a previous save would have left.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $css     Saved CSS.
	 * @return string The stylesheet path.
	 */
	private function seed_post_stylesheet( int $post_id, string $css ): string {
		$file_name = 'post-v2-' . $post_id . '-test';
		$dir       = wp_upload_dir( null, false )['basedir'] . '/themeisle-gutenberg/';

		update_post_meta( $post_id, '_themeisle_gutenberg_block_styles', $css );
		update_post_meta( $post_id, '_themeisle_gutenberg_block_stylesheet', $file_name );
		wp_mkdir_p( $dir );
		file_put_contents( $dir . $file_name . '.css', $css );

		return $dir . $file_name . '.css';
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
