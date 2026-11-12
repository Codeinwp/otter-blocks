<?php
/**
 * Tests for the metadata Otter hands to the Themeisle SDK Support Hub.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Pro;

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
	 * Messages are tagged as Pro only while the Pro license is valid.
	 */
	public function test_is_pro_needs_a_valid_license() {
		add_filter( 'product_otter_license_status', array( $this, 'expired_license' ) );
		$this->assertFalse( apply_filters( 'otter_blocks_support_hub_metadata', array() )['is_pro'] );
		remove_filter( 'product_otter_license_status', array( $this, 'expired_license' ) );

		add_filter( 'product_otter_license_status', array( $this, 'valid_license' ) );
		$this->assertSame( Pro::is_pro_installed(), apply_filters( 'otter_blocks_support_hub_metadata', array() )['is_pro'] );
		remove_filter( 'product_otter_license_status', array( $this, 'valid_license' ) );
	}

	/**
	 * The Help button stays off the block editors, which also count as Otter screens.
	 *
	 * @dataProvider editor_screens
	 *
	 * @param string $pagenow Admin page file.
	 */
	public function test_hub_is_hidden_in_block_editors( $pagenow ) {
		$GLOBALS['pagenow'] = $pagenow; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		$this->assertTrue( apply_filters( 'otter_blocks_hide_support_hub', false ) );
	}

	/**
	 * Block editor admin pages.
	 *
	 * @return array<string, array<int, string>>
	 */
	public function editor_screens() {
		return array(
			'post editor'   => array( 'post.php' ),
			'new post'      => array( 'post-new.php' ),
			'site editor'   => array( 'site-editor.php' ),
			'widget editor' => array( 'widgets.php' ),
		);
	}

	/**
	 * The Help button shows on Otter's own screens, and a site can still hide it.
	 */
	public function test_hub_is_shown_on_otter_screens() {
		$GLOBALS['pagenow'] = 'admin.php'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		$this->assertFalse( apply_filters( 'otter_blocks_hide_support_hub', false ) );
		$this->assertTrue( apply_filters( 'otter_blocks_hide_support_hub', true ) );
	}

	/**
	 * A license status the SDK reports for an expired key.
	 *
	 * @return string
	 */
	public function expired_license() {
		return 'expired';
	}

	/**
	 * A license status the SDK reports for a valid key.
	 *
	 * @return string
	 */
	public function valid_license() {
		return 'valid';
	}
}
