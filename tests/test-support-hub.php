<?php
/**
 * Tests for the metadata Otter hands to the Themeisle SDK Support Hub.
 *
 * @package gutenberg-blocks
 */

/**
 * Support Hub opt-in tests.
 */
class Test_Support_Hub extends WP_UnitTestCase {

	/**
	 * The filter returns the keys Otter opts into, and nothing else.
	 */
	public function test_metadata_has_the_agreed_keys() {
		$data = apply_filters( 'otter_blocks_support_hub_metadata', array() );

		$this->assertIsArray( $data );
		$this->assertSame( array( 'is_pro', 'links' ), array_keys( $data ) );
	}

	/**
	 * The footer links point to Otter's docs and wordpress.org forum.
	 */
	public function test_links_point_to_otter() {
		$links = apply_filters( 'otter_blocks_support_hub_metadata', array() )['links'];

		$this->assertSame(
			array(
				'https://docs.themeisle.com/otter-page-builder-blocks-extensions/otter-blocks-documentation',
				'https://wordpress.org/support/plugin/otter-blocks/',
			),
			wp_list_pluck( $links, 'url' )
		);
		foreach ( $links as $link ) {
			$this->assertNotEmpty( $link['icon'] );
			$this->assertNotEmpty( $link['text'] );
		}
	}

	/**
	 * Messages are tagged as Pro only while the stored Pro license is valid, whatever
	 * the order in which the SDK loads Otter and Otter Pro.
	 */
	public function test_is_pro_reads_the_stored_pro_license() {
		if ( ! defined( 'OTTER_PRO_BASEFILE' ) ) {
			define( 'OTTER_PRO_BASEFILE', dirname( __DIR__ ) . '/plugins/otter-pro/otter-pro.php' );
		}
		// The test bootstrap loads Composer before WordPress, so the SDK's load.php skips itself.
		$sdk = dirname( __DIR__ ) . '/vendor/codeinwp/themeisle-sdk/src/';
		foreach ( array( 'Loader.php', 'Product.php', 'Common/Abstract_module.php', 'Modules/Licenser.php' ) as $file ) {
			require_once $sdk . $file;
		}
		// No Licenser filter is registered, as when Otter loads before Otter Pro.
		remove_all_filters( 'product_otter_license_status' );

		update_option( 'otter_pro_license_data', (object) array( 'license' => 'expired' ) );
		$this->assertFalse( apply_filters( 'otter_blocks_support_hub_metadata', array() )['is_pro'] );

		update_option( 'otter_pro_license_data', (object) array( 'license' => 'valid' ) );
		$this->assertTrue( apply_filters( 'otter_blocks_support_hub_metadata', array() )['is_pro'] );
	}

	/**
	 * The Help button stays off the block editors, which also count as Otter screens, and shows on Otter's own screens.
	 *
	 * @dataProvider admin_screens
	 *
	 * @param string $pagenow Admin page file.
	 * @param bool   $hidden  Whether the Help button is hidden there.
	 */
	public function test_hub_is_hidden_only_in_block_editors( $pagenow, $hidden ) {
		$GLOBALS['pagenow'] = $pagenow; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		$this->assertSame( $hidden, apply_filters( 'otter_blocks_hide_support_hub', false ) );
	}

	/**
	 * Admin pages and whether the Help button is hidden on them.
	 *
	 * @return array<string, array{0: string, 1: bool}>
	 */
	public function admin_screens() {
		return array(
			'post editor'   => array( 'post.php', true ),
			'new post'      => array( 'post-new.php', true ),
			'site editor'   => array( 'site-editor.php', true ),
			'widget editor' => array( 'widgets.php', true ),
			'Otter screen'  => array( 'admin.php', false ),
			'post list'     => array( 'edit.php', false ),
		);
	}
}
