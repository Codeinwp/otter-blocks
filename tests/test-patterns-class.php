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
				'cache'      => time(),
			),
			ThemeIsle\OtterPro\Plugins\Patterns::PATTERNS_ENDPOINT
		);

		$response = wp_remote_get( $url );
		$response = wp_remote_retrieve_body( $response );

		$this->assertTrue( 2000 < strlen( $response ) );

		$response = json_decode( $response, true );

		$this->assertIsArray( $response );

		$this->assertArrayHasKey( 'slug', $response[0] );
	}

	public function test_prepare_block_pattern() {
		$patterns_instance = new ThemeIsle\OtterPro\Plugins\Patterns();

		$block_pattern = array(
			'slug' => 'test-pattern',
			'title' => 'Default Title',
			'title_es' => 'Título en Español',
			'title_fr' => 'Titre en Français',
			'title_de' => 'Titel auf Deutsch',
			'content' => '<!-- wp:paragraph --><p>Test content</p><!-- /wp:paragraph -->',
			'categories' => array( 'test-category' ),
			'minimum' => '5.0',
		);

		// Test with German locale
		$prepared_pattern = $patterns_instance->prepare_block_pattern( $block_pattern, 'de_DE' );
		$this->assertEquals( 'Titel auf Deutsch', $prepared_pattern['title'] );
		$this->assertArrayNotHasKey( 'title_es', $prepared_pattern );
		$this->assertArrayNotHasKey( 'title_fr', $prepared_pattern );
		$this->assertArrayNotHasKey( 'title_de', $prepared_pattern );

		// Test with default locale (no translation)
		$prepared_pattern = $patterns_instance->prepare_block_pattern( $block_pattern, 'en_US' );
		$this->assertEquals( 'Default Title', $prepared_pattern['title'] );
		$this->assertArrayNotHasKey( 'title_es', $prepared_pattern );
		$this->assertArrayNotHasKey( 'title_fr', $prepared_pattern );
		$this->assertArrayNotHasKey( 'title_de', $prepared_pattern );
	}
}
