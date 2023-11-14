<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

/**
 * Dynamic Content Test Case.
 */
class TestPatterns extends WP_UnitTestCase {

	/**
	 * Test the fetching of patterns.
	 */
	 public function test_fetch_patterns() {

		 $json_data = file_get_contents( dirname( dirname( __FILE__ ) ) . '/license.json' );
		 $array_data = json_decode( $json_data, true );

		 $url = add_query_arg(
			 array(
				 'site_url'   => get_site_url(),
				 'license_id' => $array_data['key'],
				 'cache'      => gmdate( 'u' ),
			 ),
			 'https://api.themeisle.com/templates-cloud/otter-patterns'
		 );

		 $response = wp_remote_get( $url );
		 $response = wp_remote_retrieve_body( $response );

		 $this->assertTrue( 2000 < strlen( $response ) );

		 $response = json_decode( $response, true );

		 $this->assertIsArray( $response );

		 $this->assertArrayHasKey( 'slug', $response[0] );
	 }
}
