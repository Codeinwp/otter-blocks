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
				'name'     => $file,
				'type'     => 'image/svg+xml',
				'tmp_name' => $tmp_path,
				'error'    => 0,
				'size'     => filesize( $file ),
			];
		} else {
			throw new RuntimeException( 'Could not copy test file from ' . $file . ' to ' . $tmp_path );
		}
	}

	public function test_svg_upload() {
		// Set the user as the current user.
		wp_set_current_user( 1 );

		$main = new ThemeIsle\GutenbergBlocks\Main();
		$main->init();
		$file = $this->handle_upload( __DIR__ . '/assets/xss.svg' );
		$response = $main->check_svg_and_sanitize( $file );

		// We check that no error was attached.
		$this->assertTrue( empty( $response['error'] ) );

		$contents = file_get_contents( $response['tmp_name'] );

		// We check that the SVG was sanitized.
		$this->assertTrue( strpos( $contents, '<script>' ) === false );
	}
}
