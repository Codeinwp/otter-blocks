<?php
/**
 * Class Dashboard
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Dashboard;

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
	 * Clean up test environment.
	 */
	public function tear_down() {
		parent::tear_down();
	}
}
