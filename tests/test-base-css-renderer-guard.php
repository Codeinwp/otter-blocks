<?php
/**
 * Tests that a failing CSS renderer is skipped instead of fataling the request.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Base_CSS;
use ThemeIsle\GutenbergBlocks\CSS\CSS_Handler;
use ThemeIsle\GutenbergBlocks\Loader;
use ThemeIsle\GutenbergBlocks\Registration;

/**
 * Core Image renderer whose dependency cannot be autoloaded, as with a stale classmap.
 */
class Otter_Missing_Dependency_CSS extends Base_CSS {
	/**
	 * Library matched against the block name.
	 *
	 * @var string
	 */
	public $library_prefix = 'core';

	/**
	 * Block suffix matched against the block name.
	 *
	 * @var string
	 */
	public $block_prefix = 'image';

	/**
	 * Render the block CSS.
	 *
	 * @param array<string, mixed> $block Block data.
	 * @return string
	 */
	public function render_css( $block ): string {
		// Same Error an unmapped CSS_Utility raises.
		new \ThemeIsle\GutenbergBlocks\CSS\Otter_Missing_Utility( $block );

		return '.never-reached{color:red}';
	}

	/**
	 * Render the global CSS.
	 *
	 * @return string
	 */
	public function render_global_css(): string {
		new \ThemeIsle\GutenbergBlocks\CSS\Otter_Missing_Utility();

		return '.never-reached-global{color:red}';
	}
}

/**
 * Healthy renderer for the same Core Image block.
 */
class Otter_Image_CSS extends Base_CSS {
	/**
	 * Library matched against the block name.
	 *
	 * @var string
	 */
	public $library_prefix = 'core';

	/**
	 * Block suffix matched against the block name.
	 *
	 * @var string
	 */
	public $block_prefix = 'image';

	/**
	 * Render the block CSS.
	 *
	 * @param array<string, mixed> $block Block data.
	 * @return string
	 */
	public function render_css( $block ): string {
		return '.otter-image{color:blue}';
	}
}

/**
 * Healthy renderer for an unrelated Otter block.
 */
class Otter_Heading_CSS extends Base_CSS {
	/**
	 * Block suffix matched against the block name.
	 *
	 * @var string
	 */
	public $block_prefix = 'otter-heading';

	/**
	 * Render the block CSS.
	 *
	 * @param array<string, mixed> $block Block data.
	 * @return string
	 */
	public function render_css( $block ): string {
		return '.otter-heading{color:green}';
	}

	/**
	 * Render the global CSS.
	 *
	 * @return string
	 */
	public function render_global_css(): string {
		return '.otter-heading-global{color:green}';
	}
}

/**
 * Class Test_Base_CSS_Renderer_Guard
 */
class Test_Base_CSS_Renderer_Guard extends WP_UnitTestCase {

	private const IMAGE_BLOCK   = '<!-- wp:image --><figure class="wp-block-image"><img src="x.jpg"/></figure><!-- /wp:image -->';
	private const HEADING_BLOCK = '<!-- wp:themeisle-blocks/otter-heading /-->';
	private const WIDGET_ID     = 2991;

	/**
	 * Base_CSS instance under test.
	 *
	 * @var Base_CSS
	 */
	private $css;

	/**
	 * Filter callbacks this test registered, so only those are removed again.
	 *
	 * @var array<int, callable>
	 */
	private $registered_filters = array();

	/**
	 * Widgets marked as used before the test.
	 *
	 * @var array<int, string>
	 */
	private $widget_used = array();

	/**
	 * Set up each test.
	 */
	public function set_up(): void {
		parent::set_up();

		$this->css         = new Base_CSS();
		$this->widget_used = Registration::$widget_used;

		Loader::reset_reported();
	}

	/**
	 * Tear down each test.
	 */
	public function tear_down(): void {
		foreach ( $this->registered_filters as $callback ) {
			remove_filter( 'otter_blocks_register_css', $callback );
		}

		$this->registered_filters = array();

		// Restore the shipped list for any later test in the suite.
		$this->css->autoload_block_classes();

		$this->delete_widgets_css_file();

		Registration::$widget_used = $this->widget_used;

		Loader::reset_reported();

		parent::tear_down();
	}

	/**
	 * Replace the CSS class list with the given entries.
	 *
	 * @param array<int, string> $classnames Entries to register.
	 * @return void
	 */
	private function set_classes( array $classnames ): void {
		$callback = function () use ( $classnames ): array {
			return $classnames;
		};

		$this->registered_filters[] = $callback;

		add_filter( 'otter_blocks_register_css', $callback );

		$this->css->autoload_block_classes();
	}

	/**
	 * Make the given markup the only active widget content.
	 *
	 * @param string $content Widget block markup.
	 * @return void
	 */
	private function set_widget_content( string $content ): void {
		update_option( 'widget_block', array( self::WIDGET_ID => array( 'content' => $content ) ) );

		Registration::$widget_used = array( 'block-' . self::WIDGET_ID );
	}

	/**
	 * Remove a widgets stylesheet a test wrote to uploads.
	 *
	 * @return void
	 */
	private function delete_widgets_css_file(): void {
		$file_name = get_option( 'themeisle_blocks_widgets_css_file' );

		if ( ! is_string( $file_name ) || '' === $file_name ) {
			return;
		}

		$wp_upload_dir = wp_upload_dir( null, false );
		$file_path     = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/' . $file_name . '.css';

		if ( is_file( $file_path ) ) {
			unlink( $file_path );
		}
	}

	/**
	 * A renderer that throws must not abort the traversal or drop other blocks' CSS.
	 */
	public function test_throwing_renderer_does_not_abort_traversal(): void {
		$this->set_classes( array( '\Otter_Missing_Dependency_CSS', '\Otter_Image_CSS', '\Otter_Heading_CSS' ) );

		$style = $this->css->cycle_through_static_blocks( parse_blocks( self::IMAGE_BLOCK . self::HEADING_BLOCK ), false );

		$this->assertStringContainsString( '.otter-image{color:blue}', $style, 'A healthy renderer for the same block must still contribute.' );
		$this->assertStringContainsString( '.otter-heading{color:green}', $style, 'Later blocks must still be rendered.' );
		$this->assertStringNotContainsString( 'never-reached', $style );
	}

	/**
	 * Each failure is counted, so callers can tell the CSS is partial.
	 */
	public function test_render_failures_are_counted(): void {
		$this->set_classes( array( '\Otter_Missing_Dependency_CSS', '\Otter_Heading_CSS' ) );

		$before = Base_CSS::get_render_failures();

		$this->css->cycle_through_static_blocks( parse_blocks( self::IMAGE_BLOCK . self::IMAGE_BLOCK . self::HEADING_BLOCK ), false );

		$this->assertSame( 2, Base_CSS::get_render_failures() - $before );
	}

	/**
	 * A clean traversal leaves the failure count untouched.
	 */
	public function test_clean_traversal_counts_no_failures(): void {
		$this->set_classes( array( '\Otter_Image_CSS', '\Otter_Heading_CSS' ) );

		$before = Base_CSS::get_render_failures();

		$this->css->cycle_through_static_blocks( parse_blocks( self::IMAGE_BLOCK . self::HEADING_BLOCK ), false );

		$this->assertSame( $before, Base_CSS::get_render_failures() );
	}

	/**
	 * Global styles get the same guard.
	 */
	public function test_throwing_global_renderer_is_skipped(): void {
		$this->set_classes( array( '\Otter_Missing_Dependency_CSS', '\Otter_Heading_CSS' ) );

		$style = $this->css->cycle_through_global_styles();

		$this->assertStringContainsString( '.otter-heading-global{color:green}', $style );
		$this->assertStringNotContainsString( 'never-reached', $style );
	}

	/**
	 * The failure runs per block, so it must be logged once per request, naming the renderer.
	 */
	public function test_failure_is_logged_once(): void {
		$this->set_classes( array( '\Otter_Missing_Dependency_CSS' ) );

		$log = get_temp_dir() . 'otter-log-' . wp_generate_password( 8, false ) . '.txt';
		$old = ini_set( 'error_log', $log );

		$this->css->cycle_through_static_blocks( parse_blocks( str_repeat( self::IMAGE_BLOCK, 5 ) ), false );

		ini_set( 'error_log', false === $old ? '' : $old );

		$contents = file_exists( $log ) ? (string) file_get_contents( $log ) : '';

		if ( file_exists( $log ) ) {
			unlink( $log );
		}

		$this->assertSame( 1, substr_count( $contents, 'Otter_Missing_Dependency_CSS: threw while rendering CSS' ) );
		$this->assertStringContainsString( 'Otter_Missing_Utility', $contents, 'The log must name the missing class.' );
	}

	/**
	 * Partial widget CSS must neither overwrite nor delete the saved stylesheet.
	 */
	public function test_partial_widget_css_is_not_persisted(): void {
		$this->set_classes( array( '\Otter_Missing_Dependency_CSS' ) );
		$this->set_widget_content( self::IMAGE_BLOCK );

		update_option( 'themeisle_blocks_widgets_css', '.previous{color:black}' );
		update_option( 'themeisle_blocks_widgets_css_file', 'widgets-previous' );

		$this->assertFalse( CSS_Handler::save_widgets_styles() );
		$this->assertSame( '.previous{color:black}', get_option( 'themeisle_blocks_widgets_css' ) );
		$this->assertSame( 'widgets-previous', get_option( 'themeisle_blocks_widgets_css_file' ) );
	}

	/**
	 * Partial post CSS must not be saved, so the page keeps rendering inline styles.
	 */
	public function test_partial_post_css_is_not_persisted(): void {
		$this->set_classes( array( '\Otter_Missing_Dependency_CSS', '\Otter_Heading_CSS' ) );

		$post_id = self::factory()->post->create( array( 'post_content' => self::IMAGE_BLOCK . self::HEADING_BLOCK ) );

		CSS_Handler::generate_css_file( $post_id );

		$this->assertSame( '', get_post_meta( $post_id, '_themeisle_gutenberg_block_styles', true ) );
		$this->assertSame( '', get_post_meta( $post_id, '_themeisle_gutenberg_block_stylesheet', true ) );
	}
}
