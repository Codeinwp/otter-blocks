<?php
/**
 * Class Test_Plugin_Card_Block
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Render\Plugin_Card_Block;

/**
 * Plugin Card block tests: the plugins_api transient cache.
 */
class Test_Plugin_Card_Block extends WP_UnitTestCase {

	/**
	 * Number of plugins_api calls observed.
	 *
	 * @var int
	 */
	private $api_calls = 0;

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		delete_transient( 'otter_plugin_card_otter-blocks' );

		parent::tear_down();
	}

	/**
	 * Short-circuit plugins_api with a stub result and count the calls.
	 *
	 * @return object
	 */
	public function stub_plugins_api() {
		$this->api_calls++;

		return (object) array(
			'name' => 'Otter Blocks',
			'slug' => 'otter-blocks',
		);
	}

	/**
	 * Expose the protected search() method.
	 *
	 * @return Plugin_Card_Block
	 */
	private function get_block() {
		return new class() extends Plugin_Card_Block {
			public function search_public( $slug ) {
				return $this->search( $slug );
			}
		};
	}

	/**
	 * Ensure a second lookup for the same slug is served from the transient
	 * without a second plugins_api call.
	 */
	public function test_search_caches_plugins_api_result() {
		add_filter( 'plugins_api', array( $this, 'stub_plugins_api' ) );

		$block = $this->get_block();

		$first = $block->search_public( 'otter-blocks' );

		$this->assertSame( 1, $this->api_calls );
		$this->assertTrue( $first['success'] );
		$this->assertSame( 'Otter Blocks', $first['data']->name );
		$this->assertNotFalse( get_transient( 'otter_plugin_card_otter-blocks' ) );

		$second = $block->search_public( 'otter-blocks' );

		$this->assertSame( 1, $this->api_calls, 'The cached result must be used instead of a second plugins_api call.' );
		$this->assertSame( 'Otter Blocks', $second['data']->name );
	}

	/**
	 * Ensure a failed lookup is not cached, so a later retry can succeed.
	 */
	public function test_search_does_not_cache_errors() {
		add_filter(
			'plugins_api',
			function () {
				$this->api_calls++;
				return new WP_Error( 'plugins_api_failed', 'down' );
			}
		);

		$block  = $this->get_block();
		$result = $block->search_public( 'otter-blocks' );

		$this->assertFalse( $result['success'] );
		$this->assertFalse( get_transient( 'otter_plugin_card_otter-blocks' ) );
	}
}
