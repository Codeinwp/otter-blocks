<?php
/**
 * Tests for the free-plugin Patterns upsell manifest logic.
 *
 * Covers get_upsell_patterns(), sync_upsell_patterns() and
 * maybe_sync_upsell_patterns() added in the design-library rework. The remote
 * request is stubbed via the `pre_http_request` filter so nothing leaves the
 * test environment.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Patterns;

/**
 * Patterns upsell test case.
 */
class TestPatternsUpsell extends WP_UnitTestCase {

	/**
	 * Number of HTTP requests intercepted during a test.
	 *
	 * @var int
	 */
	private $http_calls = 0;

	/**
	 * Canned body returned by the stubbed HTTP layer.
	 *
	 * @var mixed
	 */
	private $http_body = null;

	/**
	 * Last URL intercepted by the stubbed HTTP layer.
	 *
	 * @var string
	 */
	private $http_last_url = '';

	public function set_up(): void {
		parent::set_up();

		$this->http_calls    = 0;
		$this->http_body     = null;
		$this->http_last_url = '';

		add_filter( 'pre_http_request', array( $this, 'stub_http' ), 10, 3 );

		// Keep the library setting enabled and Pro inactive for a deterministic baseline.
		update_option( 'themeisle_blocks_settings_patterns_library', true );
		add_filter( 'product_otter_license_status', '__return_false' );
	}

	public function tear_down(): void {
		remove_filter( 'pre_http_request', array( $this, 'stub_http' ), 10 );
		remove_filter( 'product_otter_license_status', '__return_false' );

		delete_transient( Patterns::UPSELLS_CACHE_KEY );
		delete_option( 'themeisle_blocks_settings_patterns_library' );

		parent::tear_down();
	}

	/**
	 * Intercept outbound HTTP and return the canned body.
	 *
	 * @param mixed  $preempt Short-circuit value.
	 * @param array  $args    Request args.
	 * @param string $url     Request URL.
	 * @return array Fake response.
	 */
	public function stub_http( $preempt, $args, $url ) {
		$this->http_calls++;
		$this->http_last_url = $url;

		return array(
			'body'     => is_string( $this->http_body ) ? $this->http_body : wp_json_encode( $this->http_body ),
			'response' => array(
				'code'    => 200,
				'message' => 'OK',
			),
		);
	}

	public function test_get_upsell_patterns_returns_empty_without_cache() {
		$this->assertSame( array(), Patterns::get_upsell_patterns() );
	}

	public function test_get_upsell_patterns_maps_cached_manifest() {
		set_transient(
			Patterns::UPSELLS_CACHE_KEY,
			array(
				array(
					'slug'  => 'pro-hero',
					'title' => 'Pro Hero',
				),
				array(
					'slug'  => 'pro-cta',
					'title' => 'Pro CTA',
				),
			),
			WEEK_IN_SECONDS
		);

		$patterns = Patterns::get_upsell_patterns();

		$this->assertCount( 2, $patterns );
		$this->assertSame( 'otter-blocks/pro-hero', $patterns[0]['name'] );
		$this->assertTrue( $patterns[0]['isPro'] );
		$this->assertSame( 'otter-blocks/pro-cta', $patterns[1]['name'] );
	}

	public function test_get_upsell_patterns_drops_non_array_entries() {
		set_transient(
			Patterns::UPSELLS_CACHE_KEY,
			array(
				'not-an-array',
				array(
					'slug'  => 'pro-pricing',
					'title' => 'Pro Pricing',
				),
			),
			WEEK_IN_SECONDS
		);

		$patterns = Patterns::get_upsell_patterns();

		// The string entry is removed by the is_array filter before mapping.
		$this->assertCount( 1, $patterns );
		$this->assertSame( 'otter-blocks/pro-pricing', $patterns[0]['name'] );
	}

	public function test_get_upsell_patterns_drops_slugless_entries() {
		set_transient(
			Patterns::UPSELLS_CACHE_KEY,
			array(
				array( 'title' => 'No slug here' ),
				array(
					'slug'  => 'pro-pricing',
					'title' => 'Pro Pricing',
				),
			),
			WEEK_IN_SECONDS
		);

		$patterns = Patterns::get_upsell_patterns();

		// Slugless entries map to null and are filtered out; array_values
		// reindexes, so the only valid entry lands at index 0.
		$this->assertCount( 1, $patterns );
		$this->assertSame( 'otter-blocks/pro-pricing', $patterns[0]['name'] );
	}

	public function test_get_upsell_patterns_empty_when_pro_active() {
		add_filter( 'product_otter_license_status', array( $this, 'force_valid_license' ) );

		set_transient(
			Patterns::UPSELLS_CACHE_KEY,
			array( array( 'slug' => 'pro-hero' ) ),
			WEEK_IN_SECONDS
		);

		// Pro is active only if the Pro plugin is installed; guard so the
		// assertion is meaningful in both setups.
		if ( \ThemeIsle\GutenbergBlocks\Pro::is_pro_active() ) {
			$this->assertSame( array(), Patterns::get_upsell_patterns() );
		} else {
			$this->assertNotEmpty( Patterns::get_upsell_patterns() );
		}

		remove_filter( 'product_otter_license_status', array( $this, 'force_valid_license' ) );
	}

	public function test_sync_caches_valid_manifest() {
		$this->http_body = array(
			array(
				'slug'  => 'pro-hero',
				'title' => 'Pro Hero',
			),
		);

		( new Patterns() )->sync_upsell_patterns();

		$cached = get_transient( Patterns::UPSELLS_CACHE_KEY );
		$this->assertIsArray( $cached );
		$this->assertSame( 'pro-hero', $cached[0]['slug'] );
		$this->assertSame( 1, $this->http_calls );
	}

	public function test_sync_ignores_error_message_response() {
		$this->http_body = array( 'message' => 'Invalid license.' );

		( new Patterns() )->sync_upsell_patterns();

		$this->assertFalse( get_transient( Patterns::UPSELLS_CACHE_KEY ) );
	}

	public function test_sync_ignores_empty_response() {
		$this->http_body = array();

		( new Patterns() )->sync_upsell_patterns();

		$this->assertFalse( get_transient( Patterns::UPSELLS_CACHE_KEY ) );
	}

	public function test_maybe_sync_skips_when_library_setting_disabled() {
		update_option( 'themeisle_blocks_settings_patterns_library', false );
		$this->http_body = array( array( 'slug' => 'pro-hero' ) );

		( new Patterns() )->maybe_sync_upsell_patterns();

		$this->assertSame( 0, $this->http_calls );
		$this->assertFalse( get_transient( Patterns::UPSELLS_CACHE_KEY ) );
	}

	public function test_maybe_sync_skips_when_already_cached() {
		set_transient(
			Patterns::UPSELLS_CACHE_KEY,
			array( array( 'slug' => 'cached' ) ),
			WEEK_IN_SECONDS
		);
		$this->http_body = array( array( 'slug' => 'fresh' ) );

		( new Patterns() )->maybe_sync_upsell_patterns();

		// Cold-cache guard means no request fires and the cache is untouched.
		$this->assertSame( 0, $this->http_calls );
		$cached = get_transient( Patterns::UPSELLS_CACHE_KEY );
		$this->assertSame( 'cached', $cached[0]['slug'] );
	}

	public function test_maybe_sync_fetches_when_cold() {
		$this->http_body = array( array( 'slug' => 'pro-hero' ) );

		( new Patterns() )->maybe_sync_upsell_patterns();

		$this->assertSame( 1, $this->http_calls );
		$this->assertIsArray( get_transient( Patterns::UPSELLS_CACHE_KEY ) );
	}

	public function test_register_patterns_registers_categories_and_patterns() {
		( new Patterns() )->register_patterns();

		$category_registry = WP_Block_Pattern_Categories_Registry::get_instance();

		foreach ( array( 'otter-blocks', 'call-to-action', 'testimonials', 'cafe-pack' ) as $slug ) {
			$this->assertTrue( $category_registry->is_registered( $slug ), "Category '{$slug}' should be registered." );
		}

		$this->assertTrue( WP_Block_Patterns_Registry::get_instance()->is_registered( 'otter-blocks/aw-cta-banner' ) );
	}

	public function test_register_patterns_category_filter_can_add_and_remove() {
		$category_registry = WP_Block_Pattern_Categories_Registry::get_instance();

		// The plugin bootstrap may have registered categories already; clear
		// the one we filter out so the assertion below is meaningful.
		if ( $category_registry->is_registered( 'waitlist' ) ) {
			$category_registry->unregister( 'waitlist' );
		}

		$filter = function ( $categories ) {
			unset( $categories['waitlist'] );
			$categories['otter-test-extra'] = array( 'label' => 'Test Extra' );

			return $categories;
		};

		add_filter( 'otter_blocks_block_pattern_categories', $filter );
		( new Patterns() )->register_patterns();
		remove_filter( 'otter_blocks_block_pattern_categories', $filter );

		$this->assertFalse( $category_registry->is_registered( 'waitlist' ) );
		$this->assertTrue( $category_registry->is_registered( 'otter-test-extra' ) );

		// Restore the shared registry state for the rest of the suite.
		$category_registry->unregister( 'otter-test-extra' );
		( new Patterns() )->register_patterns();
		$this->assertTrue( $category_registry->is_registered( 'waitlist' ) );
	}

	public function test_sync_requests_endpoint_with_site_and_license_args() {
		$this->http_body = array( array( 'slug' => 'pro-hero' ) );

		( new Patterns() )->sync_upsell_patterns();

		$this->assertSame( 1, $this->http_calls );
		$this->assertStringContainsString( 'api.themeisle.com/templates-cloud/otter-patterns-preview', $this->http_last_url );
		$this->assertStringContainsString( 'site_url=' . get_site_url(), $this->http_last_url );
		$this->assertStringContainsString( 'license_id=free', $this->http_last_url );
	}

	public function test_sync_ignores_non_array_json_response() {
		$this->http_body = '"just-a-string"';

		( new Patterns() )->sync_upsell_patterns();

		$this->assertFalse( get_transient( Patterns::UPSELLS_CACHE_KEY ) );

		// Invalid JSON decodes to null — same guard, same result.
		$this->http_body = 'not-json{';

		( new Patterns() )->sync_upsell_patterns();

		$this->assertFalse( get_transient( Patterns::UPSELLS_CACHE_KEY ) );
	}

	/**
	 * Force a valid license status.
	 *
	 * @return string
	 */
	public function force_valid_license() {
		return 'valid';
	}
}
