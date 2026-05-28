<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */


/**
 * Dynamic Content Test Case.
 */
class Test_SVG_Upload extends WP_UnitTestCase {

	private function handle_upload( $file ) {
		$filename        = basename( $file );
		$temp_filename   = 'svg_tmp';
		$tmp_path        = str_replace( $filename, $temp_filename, $file );

		/** Create a temporary copy of the original file, since it will be moved during the upload process */
		copy( $file, $tmp_path );

		if ( file_exists( $tmp_path ) ) {
			return [
				'name'     => $filename,
				'type'     => 'image/svg+xml',
				'tmp_name' => $tmp_path,
				'error'    => 0,
				'size'     => filesize( $file ),
			];
		} else {
			throw new RuntimeException( 'Could not copy test file from ' . $file . ' to ' . $tmp_path );
		}
	}

	public function test_svg_upload_sanitization() {
		// Set the user as the current user.
		wp_set_current_user( 1 );

		$main = new ThemeIsle\GutenbergBlocks\Main();
		$main->init();
		$file = $this->handle_upload( __DIR__ . '/assets/xss.svg' );
		$response = $main->check_svg_and_sanitize( $file );

		// We check that no error was attached.
		$this->assertTrue( empty( $response['error'] ) );

		// Check if the filename has been changed.
		$this->assertNotEquals( $file['name'], $response['name'] );

		$contents = file_get_contents( $response['tmp_name'] );

		// We check that the SVG was sanitized.
		$this->assertTrue( strpos( $contents, '<script>' ) === false );
	}

	public function test_non_svg_upload_sanitization() {
		// Set the user as the current user.
		wp_set_current_user( 1 );

		$main = new ThemeIsle\GutenbergBlocks\Main();
		$main->init();
		
		$file = $this->handle_upload( __DIR__ . '/assets/test-img.png' );
		$response = $main->check_svg_and_sanitize( $file );

		// We check that no error was attached.
		$this->assertTrue( empty( $response['error'] ) );

		// The filter should not change non-svg file names.
		$this->assertEquals( $file['name'], $response['name'] );
	}

	/**
	 * Ensure default mime types are added by helper.
	 */
	public function test_allow_meme_types_adds_expected_defaults() {
		$main  = new ThemeIsle\GutenbergBlocks\Main();
		$mimes = $main->allow_meme_types( array() );

		$this->assertSame( 'application/json', $mimes['json'] );
		$this->assertSame( 'application/zip', $mimes['lottie'] );
		$this->assertSame( 'image/svg+xml', $mimes['svg'] );
		$this->assertSame( 'image/svg+xml', $mimes['svgz'] );
	}

	/**
	 * Ensure mime helper infers JSON type from filename extension.
	 */
	public function test_fix_mime_type_json_svg_sets_json_type_from_filename() {
		$main = new ThemeIsle\GutenbergBlocks\Main();
		$data = $main->fix_mime_type_json_svg(
			array(
				'ext'  => '',
				'type' => '',
			),
			'/tmp/animation.json',
			'animation.json'
		);

		$this->assertSame( 'json', $data['ext'] );
		$this->assertSame( 'application/json', $data['type'] );
	}

	/**
	 * Ensure mime helper infers SVG type from filename extension.
	 */
	public function test_fix_mime_type_json_svg_sets_svg_type_from_filename() {
		$main = new ThemeIsle\GutenbergBlocks\Main();
		$data = $main->fix_mime_type_json_svg(
			array(
				'ext'  => '',
				'type' => '',
			),
			'/tmp/icon.svg',
			'icon.svg'
		);

		$this->assertSame( 'svg', $data['ext'] );
		$this->assertSame( 'image/svg+xml', $data['type'] );
	}

	/**
	 * Ensure REST orderby params are extended with rand.
	 */
	public function test_add_random_orderby_param_adds_rand_value() {
		$main   = new ThemeIsle\GutenbergBlocks\Main();
		$params = array(
			'orderby' => array(
				'enum' => array( 'date', 'title' ),
			),
		);
		$result = $main->add_random_orderby_param( $params );

		$this->assertContains( 'rand', $result['orderby']['enum'] );
	}

	/**
	 * Ensure used_html_properties keeps input untouched for non-post context.
	 */
	public function test_used_html_properties_returns_input_for_non_post_context() {
		$main = new ThemeIsle\GutenbergBlocks\Main();
		$tags = array(
			'div' => array(
				'class' => true,
			),
		);

		$this->assertSame( $tags, $main->used_html_properties( $tags, 'data' ) );
	}

	/**
	 * Ensure used_css_properties falls back to defaults for non-array input.
	 */
	public function test_used_css_properties_returns_default_when_input_is_not_array() {
		$main   = new ThemeIsle\GutenbergBlocks\Main();
		$result = $main->used_css_properties( 'invalid' );

		$this->assertIsArray( $result );
		$this->assertContains( 'border-radius', $result );
		$this->assertContains( 'transform', $result );
	}
}
