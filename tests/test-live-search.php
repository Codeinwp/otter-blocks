<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\OtterPro\Server\Live_Search_Server;
use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

/**
 * Live Search Test Case.
 */
class TestLiveSearch extends WP_UnitTestCase
{
    /**
	 * Set up the test.
	 */
	public function set_up() {
		parent::set_up();
        
        register_post_type( 'otter_shop_coupon', array(
            'public' => false,
            'label'  => 'Shop Coupon',
        ) );

        register_post_type( 'otter_shop_product', array(
            'public' => true,
            'label'  => 'Shop Product',
        ) );

        register_post_type( 'otter_page', array(
            'public' => true,
            'exclude_from_search' => true,
            'label'  => 'Otter Page',
        ) );
	}

	/**
	 * Tear down the test.
	 */
	public function tear_dow() {
        unregister_post_type( 'otter_shop_coupon' );
        unregister_post_type( 'otter_shop_product' );
        unregister_post_type( 'otter_page' );
		parent::tear_down();
	}

    /**
     * Test live search prepare query function.
     */
    public function test_live_search_prepare_query() {
        $live_search = new Live_Search_Server();

        $search_query = $live_search->prepare_search_query( 'test', '' );
        $this->assertEquals( 'test', $search_query['s'] );
        $this->assertEquals( '', $search_query['post_type'] );

        $search_query = $live_search->prepare_search_query( 'test', 'otter_shop_product' );
        $this->assertEquals( 'test', $search_query['s'] );
        $this->assertEquals( array('otter_shop_product'), $search_query['post_type'] );

        $search_query = $live_search->prepare_search_query( 'test', 'otter_shop_coupon' );
        $this->assertEquals( 'test', $search_query['s'] );
        $this->assertEquals( array(), $search_query['post_type'] ); // Non-public post type are filtered out.

        $search_query = $live_search->prepare_search_query( 'test', 'otter_page' );
        $this->assertEquals( 'test', $search_query['s'] );
        $this->assertEquals( array(), $search_query['post_type'] ); // Exclude from search post type are filtered out.

        $search_query = $live_search->prepare_search_query( 'test', array('otter_shop_product', 'otter_shop_coupon', 'otter_page') );
        $this->assertEquals( 'test', $search_query['s'] );
        $this->assertEquals( array('otter_shop_product'), $search_query['post_type'] ); // Keep only the public post type.

        $search_query = $live_search->prepare_search_query( 'test', 'post', 'uncategorized' );
        $this->assertEquals( 'uncategorized', $search_query['category_name'] );
    }

    /**
     * Test live search render_blocks handles missing cat key gracefully.
     */
    public function test_live_search_render_blocks_without_cat() {
        $live_search = \ThemeIsle\OtterPro\Plugins\Live_Search::instance();

        // Mock block content and block data without 'cat' key
        $block_content = '<form><input type="text" name="s" /></form>';
        $block = array(
            'blockName' => 'core/search',
            'attrs' => array(
                'otterIsLive' => true,
                'otterSearchQuery' => array(
                    'post_type' => array( 'post' ),
                    // Note: 'cat' key is intentionally missing
                ),
            ),
        );

        // This should not produce a PHP warning about undefined array key 'cat'
        $result = $live_search->render_blocks( $block_content, $block );

        // Verify the result contains the expected data-cat attribute with empty value
        $this->assertStringContainsString( 'data-cat=""', $result );
        $this->assertStringContainsString( 'o-live-search', $result );
    }
}