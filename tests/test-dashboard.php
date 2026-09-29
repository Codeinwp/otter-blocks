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

		wp_set_current_user( $this->create_records_user() );

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
		wp_set_current_user( $this->create_records_user() );
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
	 * The widget is registered only for users who can open the Submissions list.
	 */
	public function test_form_submissions_widget_registration_requires_records_cap(): void {
		$this->assertFalse( $this->is_widget_registered_for( self::factory()->user->create( array( 'role' => 'subscriber' ) ) ), 'Subscribers must not get the widget' );
		$this->assertFalse( $this->is_widget_registered_for( self::factory()->user->create( array( 'role' => 'editor' ) ) ), 'Editors cannot open the Submissions list, so they must not get the widget' );
		$this->assertTrue( $this->is_widget_registered_for( $this->create_records_user( 'editor' ) ), 'An editor granted the records cap must get the widget without manage_options' );
		$this->assertTrue( $this->is_widget_registered_for( $this->create_records_user() ), 'Administrators must still get the widget' );
	}

	/**
	 * The widget renders submission data only for users who can open the Submissions list.
	 */
	public function test_form_submissions_widget_content_requires_records_cap(): void {
		$this->create_form_record( 'leak-test@example.com' );

		foreach ( array( 'subscriber', 'editor' ) as $role ) {
			$output = $this->render_widget_as( self::factory()->user->create( array( 'role' => $role ) ) );

			$this->assertStringNotContainsString( 'leak-test@example.com', $output, "A {$role} must not see submitter emails" );
			$this->assertStringNotContainsString( 'Total Entries', $output, "A {$role} must not see the submissions count" );
			$this->assertStringNotContainsString( 'otter_nonce', $output, "A {$role} must not receive the filter nonce" );
		}

		foreach ( array( 'editor', 'administrator' ) as $role ) {
			$output = $this->render_widget_as( $this->create_records_user( $role ) );

			$this->assertStringContainsString( 'leak-test@example.com', $output, "A {$role} with the records cap must see submitter emails" );
			$this->assertStringContainsString( 'otter-form-submissions-widget__total-entries', $output );
		}
	}

	/**
	 * The status filter accepts only the widget's own options; anything else falls back to "all".
	 */
	public function test_form_submissions_widget_filter_rejects_unlisted_status(): void {
		$this->create_form_record( 'is-read@example.com', 'read' );
		$this->create_form_record( 'not-read@example.com', 'unread' );
		$this->create_form_record( 'trashed@example.com', 'trash' );
		$this->create_form_record( 'pending@example.com', 'draft' );

		foreach ( array( 'trash', 'draft', 'any' ) as $status ) {
			$output = $this->render_widget_as( $this->create_records_user(), $status );

			$this->assertStringNotContainsString( 'trashed@example.com', $output, "Filter '{$status}' must not reach trashed records" );
			$this->assertStringContainsString( 'not-read@example.com', $output, "Filter '{$status}' must fall back to all" );
			$this->assertStringContainsString( 'value="all" selected', $output );
		}

		$output = $this->render_widget_as( $this->create_records_user(), 'read' );

		$this->assertStringContainsString( 'is-read@example.com', $output );
		$this->assertStringNotContainsString( 'not-read@example.com', $output, 'The read filter must keep working' );
		$this->assertStringContainsString( 'value="read" selected', $output );
	}

	/**
	 * "All" lists only the read/unread records it counts, so drafts never displace them.
	 */
	public function test_form_submissions_widget_all_excludes_drafts(): void {
		foreach ( range( 1, 5 ) as $day ) {
			$this->create_form_record( "eligible-{$day}@example.com", 0 === $day % 2 ? 'read' : 'unread', "2026-01-0{$day} 10:00:00" );
		}
		$this->create_form_record( 'pending@example.com', 'draft', '2026-01-09 10:00:00' );

		foreach ( array( null, 'all', 'draft', 'any' ) as $filter ) {
			$label  = null === $filter ? 'no filter' : "filter '{$filter}'";
			$output = $this->render_widget_as( $this->create_records_user(), $filter );

			$this->assertStringNotContainsString( 'pending@example.com', $output, "Drafts must not be listed under {$label}" );
			foreach ( range( 1, 5 ) as $day ) {
				$this->assertStringContainsString( "eligible-{$day}@example.com", $output, "All five counted records must be listed under {$label}" );
			}
			$this->assertMatchesRegularExpression( '/total-entries">\s*5\s*</', $output );
		}
	}

	/**
	 * Create a user holding the form record capabilities.
	 *
	 * @param string $role User role.
	 *
	 * @return int
	 */
	private function create_records_user( string $role = 'administrator' ): int {
		$user_id = self::factory()->user->create( array( 'role' => $role ) );

		// The role caps are granted on admin_init, which the suite never fires.
		get_userdata( $user_id )->add_cap( 'edit_otter_form_records' );

		return $user_id;
	}

	/**
	 * Create a form record whose first email field is the given address.
	 *
	 * @param string $email  Submitter email.
	 * @param string $status Record status.
	 * @param string $date   Record date, now when empty.
	 *
	 * @return int
	 */
	private function create_form_record( string $email, string $status = 'unread', string $date = '' ): int {
		$record_id = self::factory()->post->create(
			array_filter(
				array(
					'post_type'   => 'otter_form_record',
					'post_status' => $status,
					'post_date'   => $date,
				)
			)
		);

		update_post_meta(
			$record_id,
			'otter_form_record_meta',
			array(
				'inputs' => array(
					array(
						'type'  => 'email',
						'value' => $email,
					),
				),
			)
		);

		return $record_id;
	}

	/**
	 * Render the widget as the given user, optionally with a nonce-verified status filter.
	 *
	 * @param int         $user_id User ID.
	 * @param string|null $filter  Status filter.
	 *
	 * @return string
	 */
	private function render_widget_as( int $user_id, ?string $filter = null ): string {
		global $current_screen;

		$previous_screen = $current_screen;

		wp_set_current_user( $user_id );
		// Render in wp-admin, as the Dashboard does.
		set_current_screen( 'dashboard' );

		if ( null !== $filter ) {
			$_GET['otter_nonce']              = wp_create_nonce( 'otter_widget_nonce' );
			$_GET['otter_form_widget_filter'] = $filter;
		}

		try {
			ob_start();
			$this->dashboard->form_submissions_widget_content();

			return (string) ob_get_clean();
		} finally {
			unset( $_GET['otter_nonce'], $_GET['otter_form_widget_filter'] );
			$current_screen = $previous_screen; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		}
	}

	/**
	 * Whether the widget gets registered on the dashboard for the given user.
	 *
	 * @param int $user_id User ID.
	 *
	 * @return bool
	 */
	private function is_widget_registered_for( int $user_id ): bool {
		global $wp_meta_boxes, $current_screen;

		require_once ABSPATH . 'wp-admin/includes/dashboard.php';

		$previous_boxes  = $wp_meta_boxes;
		$previous_screen = $current_screen;

		wp_set_current_user( $user_id );
		set_current_screen( 'dashboard' );

		try {
			$this->dashboard->form_submissions_widget();

			return isset( $wp_meta_boxes['dashboard']['normal']['core']['otter_form_submissions_widget'] );
		} finally {
			$wp_meta_boxes  = $previous_boxes;
			$current_screen = $previous_screen;
		}
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
