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

	public function tear_down(): void {
		delete_transient( ThemeIsle\OtterPro\Plugins\Patterns::PATTERNS_CACHE_KEY );
		delete_transient( 'otter_pro_patterns' );
		delete_transient( 'otter_pro_patterns_refetch' );

		parent::tear_down();
	}

	/**
	 * A minimal remote pattern payload that passes check_pattern_structure().
	 *
	 * @param string $slug Pattern slug.
	 * @return array
	 */
	private function valid_pattern( $slug = 'stub-pattern' ) {
		return array(
			'slug'       => $slug,
			'title'      => 'Stub Pattern',
			'content'    => '<!-- wp:paragraph --><p>Stub</p><!-- /wp:paragraph -->',
			'categories' => array( 'test-category' ),
			'minimum'    => '5.8',
		);
	}

	/**
	 * Test the fetching of patterns.
	 */
	 public function test_fetch_patterns() {
		$license_path = dirname( dirname( __FILE__ ) ) . '/license.json';
		if ( ! file_exists( $license_path ) ) {
			$this->markTestSkipped( 'Skipping pattern fetch test because license.json is not available.' );
		}

		$json_data = file_get_contents( $license_path );
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

	public function test_prepare_block_pattern_whitelists_registry_keys() {
		$patterns_instance = new ThemeIsle\OtterPro\Plugins\Patterns();

		$prepared = $patterns_instance->prepare_block_pattern( $this->valid_pattern( 'whitelist-check' ), 'en_US' );

		// Store-only keys are dropped.
		$this->assertArrayNotHasKey( 'slug', $prepared );
		$this->assertArrayNotHasKey( 'minimum', $prepared );

		// Registry-accepted keys pass through unchanged.
		$this->assertSame( '<!-- wp:paragraph --><p>Stub</p><!-- /wp:paragraph -->', $prepared['content'] );
		$this->assertSame( array( 'test-category' ), $prepared['categories'] );

		// Keys absent from the input are not injected.
		$minimal = $patterns_instance->prepare_block_pattern(
			array(
				'title'   => 'Minimal',
				'content' => '<!-- wp:paragraph --><p>Minimal</p><!-- /wp:paragraph -->',
			),
			'en_US'
		);
		$this->assertArrayNotHasKey( 'viewportWidth', $minimal );
		$this->assertArrayNotHasKey( 'keywords', $minimal );
		$this->assertSame( array( 'title', 'content' ), array_keys( $minimal ) );
	}

	public function test_maybe_sync_patterns_ignores_stale_v1_cache_key() {
		$calls = 0;
		$stub  = function ( $preempt, $args, $url ) use ( &$calls ) {
			$calls++;

			return array(
				'body'     => wp_json_encode( array( $this->valid_pattern() ) ),
				'response' => array(
					'code'    => 200,
					'message' => 'OK',
				),
			);
		};
		add_filter( 'pre_http_request', $stub, 10, 3 );

		$patterns_instance = new ThemeIsle\OtterPro\Plugins\Patterns();

		// A stale pre-migration cache must not suppress the sync.
		set_transient( 'otter_pro_patterns', array( $this->valid_pattern( 'stale' ) ), WEEK_IN_SECONDS );
		delete_transient( ThemeIsle\OtterPro\Plugins\Patterns::PATTERNS_CACHE_KEY );
		delete_transient( 'otter_pro_patterns_refetch' );

		$patterns_instance->maybe_sync_patterns();
		$this->assertSame( 1, $calls );
		$this->assertIsArray( get_transient( ThemeIsle\OtterPro\Plugins\Patterns::PATTERNS_CACHE_KEY ) );

		// A warm v2 cache suppresses the sync.
		$patterns_instance->maybe_sync_patterns();
		$this->assertSame( 1, $calls );

		// The refetch back-off suppresses the sync even when the cache is cold.
		delete_transient( ThemeIsle\OtterPro\Plugins\Patterns::PATTERNS_CACHE_KEY );
		set_transient( 'otter_pro_patterns_refetch', true, HOUR_IN_SECONDS );

		$patterns_instance->maybe_sync_patterns();
		$this->assertSame( 1, $calls );

		remove_filter( 'pre_http_request', $stub, 10 );
	}

	public function test_register_patterns_deletes_corrupt_cache() {
		set_transient(
			ThemeIsle\OtterPro\Plugins\Patterns::PATTERNS_CACHE_KEY,
			array(
				array(
					'slug'  => 'corrupt-pattern',
					'title' => 'Corrupt Pattern',
					// Missing content/categories/minimum — fails check_pattern_structure().
				),
			),
			WEEK_IN_SECONDS
		);

		( new ThemeIsle\OtterPro\Plugins\Patterns() )->register_patterns();

		$this->assertFalse( get_transient( ThemeIsle\OtterPro\Plugins\Patterns::PATTERNS_CACHE_KEY ) );
		$this->assertFalse( WP_Block_Patterns_Registry::get_instance()->is_registered( 'otter-pro/corrupt-pattern' ) );
	}
}
