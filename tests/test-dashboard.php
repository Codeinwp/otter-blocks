<?php
/**
 * Class Dashboard
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Dashboard;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Records_Post_Type;

/**
 * Dashboard Test Case.
 */
class Test_Dashboard extends WP_UnitTestCase {

	/**
	 * @var Dashboard
	 */
	private $dashboard;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();
		$this->dashboard = Dashboard::instance();

		// Block outgoing HTTP for every test in this class (e.g. the YouTube
		// feed fetch inside get_dashboard_data). The filter is removed by the
		// test framework's hook restoration in tear_down.
		add_filter(
			'pre_http_request',
			function () {
				return new WP_Error( 'http_request_blocked', 'External HTTP requests are blocked in tests.' );
			}
		);


		if ( ! function_exists( 'tsdk_translate_link' ) ) {
			function tsdk_translate_link( $link ) {
				return $link;
			}
		}

		if ( ! function_exists( 'tsdk_utmify' ) ) {
			function tsdk_utmify( $link ) {
				return $link;
			}
		}
	}

	/**
	 * Test get_dashboard_data returns expected structure
	 */
	public function test_get_dashboard_data() {
		$data = $this->dashboard->get_dashboard_data();

		// Test required keys exist
		$required_keys = array(
			'version',
			'assetsPath',
			'stylesExist',
			'hasPro',
			'upgradeLink',
			'docsLink',
			'showFeedbackNotice',
			'deal',
			'hasOnboarding',
			'days_since_install',
			'rootUrl',
			'neveThemePreviewUrl',
			'neveThemeActivationUrl',
			'neveDashboardUrl',
			'neveInstalled',
		);

		foreach ( $required_keys as $key ) {
			$this->assertArrayHasKey( $key, $data, "Dashboard data missing required key: {$key}" );
		}

		// Test specific value types
		$this->assertIsString( $data['version'], 'Version should be a string' );
		$this->assertIsString( $data['assetsPath'], 'AssetsPath should be a string' );
		$this->assertIsBool( $data['stylesExist'], 'StylesExist should be a boolean' );
		$this->assertIsBool( $data['hasPro'], 'HasPro should be a boolean' );
		$this->assertIsString( $data['upgradeLink'], 'UpgradeLink should be a string' );
		$this->assertIsString( $data['docsLink'], 'DocsLink should be a string' );
		$this->assertIsBool( $data['showFeedbackNotice'], 'ShowFeedbackNotice should be a boolean' );
		$this->assertIsArray( $data['deal'], 'Deal should be an array' );
		$this->assertIsBool( $data['hasOnboarding'], 'HasOnboarding should be a boolean' );
		$this->assertIsInt( $data['days_since_install'], 'DaysSinceInstall should be an integer' );
		$this->assertIsString( $data['rootUrl'], 'RootUrl should be a string' );
		$this->assertIsString( $data['neveThemePreviewUrl'], 'NeveThemePreviewUrl should be a string' );
		$this->assertIsString( $data['neveThemeActivationUrl'], 'NeveThemeActivationUrl should be a string' );
		$this->assertIsString( $data['neveDashboardUrl'], 'NeveDashboardUrl should be a string' );
		$this->assertIsBool( $data['neveInstalled'], 'NeveInstalled should be a boolean' );

		// Test version matches constant
		$this->assertEquals( OTTER_BLOCKS_VERSION, $data['version'], 'Version should match OTTER_BLOCKS_VERSION constant' );

		// Test assets path
		$this->assertStringContainsString( 'assets/', $data['assetsPath'], 'AssetsPath should contain "assets/" directory' );
	}

	/**
	 * Test get_dashboard_data exposes the AI client, connectors and YouTube playlist keys.
	 */
	public function test_get_dashboard_data_new_keys() {
		$data = $this->dashboard->get_dashboard_data();

		$this->assertIsBool( $data['aiClientAvailable'], 'AiClientAvailable should be a boolean' );
		$this->assertSame( function_exists( 'wp_ai_client_prompt' ), $data['aiClientSupported'], 'AiClientSupported should mirror function_exists( wp_ai_client_prompt )' );
		$this->assertIsString( $data['connectorsUrl'], 'ConnectorsUrl should be a string' );
		$this->assertStringContainsString( 'options-connectors.php', $data['connectorsUrl'], 'ConnectorsUrl should point to the connectors admin page' );
		$this->assertIsArray( $data['youtubePlaylistData'], 'YoutubePlaylistData should be an array' );

		foreach ( array( 'videoTitle', 'videoLink', 'thumbnail' ) as $key ) {
			$this->assertArrayHasKey( $key, $data['youtubePlaylistData'], "YoutubePlaylistData missing key: {$key}" );
		}
	}

	/**
	 * Test maybe_invalidate_pages_count_cache clears the transient only for marker meta keys.
	 */
	public function test_maybe_invalidate_pages_count_cache() {
		set_transient( Dashboard::PAGES_COUNT_CACHE_KEY, 5 );

		$this->dashboard->maybe_invalidate_pages_count_cache( 1, 1, '_edit_lock', 'x' );
		$this->assertEquals( 5, get_transient( Dashboard::PAGES_COUNT_CACHE_KEY ), 'Unrelated meta keys should not invalidate the cache' );

		foreach ( Dashboard::PAGES_COUNT_META_KEYS as $meta_key ) {
			set_transient( Dashboard::PAGES_COUNT_CACHE_KEY, 5 );
			$this->dashboard->maybe_invalidate_pages_count_cache( 1, 1, $meta_key, 'x' );
			$this->assertFalse( get_transient( Dashboard::PAGES_COUNT_CACHE_KEY ), "Marker meta key {$meta_key} should invalidate the cache" );
		}
	}

	/**
	 * Test the added_post_meta hook wiring invalidates the cache end-to-end.
	 */
	public function test_pages_count_cache_invalidated_via_added_post_meta_hook() {
		$post_id = self::factory()->post->create( array( 'post_type' => 'page' ) );

		set_transient( Dashboard::PAGES_COUNT_CACHE_KEY, 5 );
		add_post_meta( $post_id, '_atomic_wind_css', 'x' );

		$this->assertFalse( get_transient( Dashboard::PAGES_COUNT_CACHE_KEY ), 'Adding marker post meta should clear the cache via the added_post_meta hook' );
	}

	/**
	 * Test get_number_of_pages counts pages/posts with non-empty marker meta.
	 *
	 * Skips the >100 display cap case: creating 101 posts is too slow for the suite.
	 */
	public function test_get_number_of_pages_counts_marker_meta() {
		$page_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		add_post_meta( $page_id, '_themeisle_gutenberg_block_stylesheet', '.o-css {}' );

		$post_id = self::factory()->post->create();
		add_post_meta( $post_id, '_atomic_wind_css', '.aw {}' );

		// Excluded: empty meta value.
		$empty_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		add_post_meta( $empty_id, '_themeisle_gutenberg_block_styles', '' );

		// Excluded: trashed post.
		$trashed_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		add_post_meta( $trashed_id, '_atomic_wind_css', '.aw {}' );
		wp_trash_post( $trashed_id );

		// Excluded: not a page or post.
		$block_id = self::factory()->post->create( array( 'post_type' => 'wp_block' ) );
		add_post_meta( $block_id, '_atomic_wind_css', '.aw {}' );

		delete_transient( Dashboard::PAGES_COUNT_CACHE_KEY );

		$this->assertSame( 2, $this->call_private_method( 'get_number_of_pages' ), 'Only published pages/posts with non-empty marker meta should be counted' );
		$this->assertEquals( 2, get_transient( Dashboard::PAGES_COUNT_CACHE_KEY ), 'The count should be cached in the transient' );
	}

	/**
	 * Test get_number_of_pages returns the cached value on subsequent calls.
	 */
	public function test_get_number_of_pages_uses_cached_value() {
		global $wpdb;

		$page_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		add_post_meta( $page_id, '_atomic_wind_css', '.aw {}' );

		delete_transient( Dashboard::PAGES_COUNT_CACHE_KEY );
		$this->assertSame( 1, $this->call_private_method( 'get_number_of_pages' ) );

		// Add another marker page directly in the DB so the invalidation hooks
		// do not fire and the cache stays warm.
		$second_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		$wpdb->insert(
			$wpdb->postmeta,
			array(
				'post_id'    => $second_id,
				'meta_key'   => '_atomic_wind_css',
				'meta_value' => '.aw {}',
			)
		);

		$this->assertSame( 1, $this->call_private_method( 'get_number_of_pages' ), 'Second call should return the cached count, not re-query' );

		delete_transient( Dashboard::PAGES_COUNT_CACHE_KEY );
		$this->assertSame( 2, $this->call_private_method( 'get_number_of_pages' ), 'A fresh query should see the new marker page' );
	}

	/**
	 * Test get_youtube_playlist_data falls back to defaults when the feed request fails.
	 */
	public function test_get_youtube_playlist_data_defaults_on_http_error() {
		// HTTP is blocked in set_up, so fetch_feed returns a WP_Error.
		$data = $this->call_private_method( 'get_youtube_playlist_data' );

		$this->assertSame( 'Otter Tutorials', $data['videoTitle'], 'VideoTitle should fall back to the default' );
		$this->assertNull( $data['thumbnail'], 'Thumbnail should fall back to null' );
		$this->assertNotEmpty( $data['videoLink'], 'VideoLink should fall back to the playlist URL' );
	}

	/**
	 * Test uninstall_feedback_popup_after_heading output for zero and non-zero page counts.
	 *
	 * The <style> block is behind a static guard that persists across tests in
	 * one process, so no assertions are made about its presence.
	 */
	public function test_uninstall_feedback_popup_after_heading() {
		delete_transient( Dashboard::PAGES_COUNT_CACHE_KEY );

		ob_start();
		$this->dashboard->uninstall_feedback_popup_after_heading();
		$this->assertSame( '', ob_get_clean(), 'No output expected when no pages use Otter blocks' );

		$page_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		add_post_meta( $page_id, '_atomic_wind_css', '.aw {}' );
		delete_transient( Dashboard::PAGES_COUNT_CACHE_KEY );

		ob_start();
		$this->dashboard->uninstall_feedback_popup_after_heading();
		$output = ob_get_clean();

		$this->assertStringContainsString( '<strong>1 page</strong>', $output, 'The page count should be rendered in a strong tag' );
		$this->assertStringContainsString( 'otter-uninstall-header', $output );
	}

	/**
	 * Test form_submissions_widget_content renders the active branch when the CPT exists.
	 *
	 * The otter_form_record CPT is registered at bootstrap and post types are not
	 * reset between tests (WP_RUN_CORE_TESTS is not defined), so active is the default.
	 */
	public function test_form_submissions_widget_content_active() {
		$this->assertTrue( post_type_exists( 'otter_form_record' ), 'The form record CPT should be registered in the test suite' );

		ob_start();
		$this->dashboard->form_submissions_widget_content();
		$output = ob_get_clean();

		$this->assertStringContainsString( 'class="otter-form-submissions-widget "', $output, 'The widget wrapper should not carry the inactive class' );
		$this->assertStringNotContainsString( 'class="otter-form-submissions-widget inactive"', $output );
		$this->assertStringContainsString( 'Total Entries', $output );
	}

	/**
	 * Test form_submissions_widget_content renders the inactive branch when the CPT is absent.
	 */
	public function test_form_submissions_widget_content_inactive() {
		unregister_post_type( 'otter_form_record' );

		try {
			ob_start();
			$this->dashboard->form_submissions_widget_content();
			$output = ob_get_clean();
		} finally {
			// Post types are not reset between tests: restore the CPT for the rest of the suite.
			( new Form_Records_Post_Type() )->create_form_records_type();
		}

		$this->assertStringContainsString( 'class="otter-form-submissions-widget inactive"', $output, 'The widget wrapper should carry the inactive class' );
		$this->assertStringContainsString( 'disabled', $output, 'The filter select should be disabled when inactive' );
	}

	/**
	 * Invoke a private method on the Dashboard instance.
	 *
	 * @param string $method  Method name.
	 * @param mixed  ...$args Method arguments.
	 *
	 * @return mixed
	 */
	private function call_private_method( $method, ...$args ) {
		$reflection = new ReflectionMethod( Dashboard::class, $method );
		$reflection->setAccessible( true );

		return $reflection->invoke( $this->dashboard, ...$args );
	}

	/**
	 * Clean up test environment.
	 */
	public function tear_down() {
		delete_transient( Dashboard::PAGES_COUNT_CACHE_KEY );
		parent::tear_down();
	}
}
