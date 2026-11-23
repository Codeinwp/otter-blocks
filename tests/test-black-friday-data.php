<?php
/**
 * Tests for Main::add_black_friday_data().
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Main;

/**
 * Black Friday SDK data test case.
 */
class TestBlackFridayData extends WP_UnitTestCase {

	/**
	 * Set up each test.
	 */
	public function set_up(): void {
		parent::set_up();

		// The test bootstrap loads Composer before WordPress, so the SDK's load.php skips its helpers.
		if ( ! function_exists( 'tsdk_translate_link' ) ) {
			function tsdk_translate_link( string $link ): string {
				return $link;
			}
		}

		if ( ! function_exists( 'tsdk_utmify' ) ) {
			function tsdk_utmify( string $link ): string {
				return $link;
			}
		}
	}

	/**
	 * An earlier filter returning an empty array opts out of the promotion, so it must stay empty.
	 */
	public function test_empty_configs_are_returned_unchanged(): void {
		$this->assertSame( array(), ( new Main() )->add_black_friday_data( array() ) );
	}

	/**
	 * Configs whose default entry was removed upstream are passed through untouched.
	 */
	public function test_configs_without_default_are_returned_unchanged(): void {
		$configs = array(
			'other-plugin' => array( 'message' => 'Other plugin sale' ),
		);

		$this->assertSame( $configs, ( new Main() )->add_black_friday_data( $configs ) );
	}

	/**
	 * The SDK default entry is extended into an Otter entry.
	 */
	public function test_default_config_adds_otter_entry(): void {
		$default = array(
			'title'   => 'Default title',
			'message' => 'Default message',
		);

		$configs = ( new Main() )->add_black_friday_data( array( 'default' => $default ) );

		$this->assertSame( $default, $configs['default'] );
		$this->assertArrayHasKey( OTTER_PRODUCT_SLUG, $configs );
		$this->assertStringContainsString( 'otter-bf', $configs[ OTTER_PRODUCT_SLUG ]['sale_url'] );
		$this->assertNotSame( $default['message'], $configs[ OTTER_PRODUCT_SLUG ]['message'] );
	}
}
