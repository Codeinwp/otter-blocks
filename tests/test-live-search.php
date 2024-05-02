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
    }
}