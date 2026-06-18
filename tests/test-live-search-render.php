<?php
/**
 * Class Live Search Render
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\OtterPro\Plugins\Live_Search;

/**
 * Live Search render_blocks test case.
 */
class TestLiveSearchRender extends WP_UnitTestCase {

	/**
	 * Set up a valid license so render_blocks runs past the gate.
	 */
	public function set_up() {
		parent::set_up();

		update_option(
			'otter_pro_license_data',
			(object) array(
				'license'  => 'valid',
				'price_id' => 2,
				'otter_pro' => true,
			)
		);
	}

	/**
	 * Tear down.
	 */
	public function tear_down() {
		delete_option( 'otter_pro_license_data' );
		parent::tear_down();
	}

	/**
	 * A live search core/search block restricted to posts but without a category
	 * selected must not raise an "Undefined array key" warning on PHP 8.
	 */
	public function test_render_blocks_post_without_category() {
		$live_search = new Live_Search();

		$block = array(
			'blockName' => 'core/search',
			'attrs'     => array(
				'otterIsLive'     => true,
				'otterSearchQuery' => array(
					'post_type' => array( 'post' ),
				),
			),
		);

		$content = $live_search->render_blocks( '<form></form>', $block );

		$this->assertStringContainsString( 'data-cat=""', $content );
	}
}
