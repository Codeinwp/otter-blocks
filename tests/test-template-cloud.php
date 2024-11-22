<?php


use ThemeIsle\GutenbergBlocks\Server\Template_Cloud_Server;
use ThemeIsle\GutenbergBlocks\Template_Cloud;

class Test_Template_Cloud extends WP_UnitTestCase {
	private $template_cloud;
	private $server;

	public function set_up(): void {
		parent::set_up();
		/** @var \WP_REST_Server $wp_rest_server */
		global $wp_rest_server;
		$wp_rest_server = new \Spy_REST_Server;

		$this->template_cloud = new Template_Cloud();
		$this->server         = new Template_Cloud_Server();
		$this->server->instance();

		do_action( 'rest_api_init', $wp_rest_server );
	}

	public function tear_down(): void {
		delete_option( Template_Cloud::SOURCES_SETTING_KEY );
		parent::tear_down();
	}

	public function test_save_and_get_pattern_sources() {
		$test_sources = [
			[
				'key'  => 'test-key-1',
				'url'  => 'https://example.com',
				'name' => 'Test Source 1'
			]
		];

		$result = Template_Cloud::save_pattern_sources( $test_sources );
		$this->assertTrue( $result );

		$saved_sources = Template_Cloud::get_pattern_sources();
		$this->assertEquals( $test_sources, $saved_sources );
	}

	public function test_delete_patterns_by_key() {
		$key      = 'test-key';
		$patterns = [ 'test-pattern' ];

		Template_Cloud::save_patterns_for_key( $key, $patterns );
		$result = Template_Cloud::delete_patterns_by_key( $key );

		$this->assertTrue( $result );
		$this->assertFalse( get_transient( Template_Cloud::get_cache_key( $key ) ) );
	}

	public function test_update_source_name() {
		$sources = [
			[
				'key'  => 'test-key',
				'url'  => 'https://example.com',
				'name' => 'Old Name'
			]
		];

		Template_Cloud::save_pattern_sources( $sources );
		Template_Cloud::update_source_name( 'test-key', 'New Name' );

		$updated_sources = Template_Cloud::get_pattern_sources();
		$this->assertEquals( 'New Name', $updated_sources[0]['name'] );
	}

	public function test_add_source_invalid_source() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/template-cloud/add-source' );
		$request->set_param( 'key', 'test-key' );
		$request->set_param( 'url', 'https://invalid-url.com' );

		$response = $this->server->add_source( $request );

		$this->assertEquals( 400, $response->get_status() );
		$this->assertArrayHasKey( 'message', $response->get_data() );
	}

	public function test_add_valid_source() {
		// Mock the WP_REST_Request
		$request = new WP_REST_Request( 'POST', '/otter/v1/template-cloud/add-source' );
		$request->set_param( 'key', 'test-key' );
		$request->set_param( 'url', 'https://example.com' );

		// Use reflection to access private method
		$reflection = new ReflectionClass( $this->server );
		$method     = $reflection->getMethod( 'validate_source_and_get_name' );
		$method->setAccessible( true );

		// Mock wp_remote_get response
		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) {
			return [
				'response' => [ 'code' => 200 ],
				'body'     => json_encode( [
					'success'  => true,
					'key_name' => 'Test Source Name'
				] )
			];
		}, 10, 3 );

		// Test the method
		$result = $method->invoke( $this->server, 'https://example.com', 'test-key' );
		$this->assertEquals( 'Test Source Name', $result );

		// Test invalid response
		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) {
			return [
				'response' => [ 'code' => 400 ],
				'body'     => ''
			];
		}, 10, 3 );

		$result = $method->invoke( $this->server, 'https://example.com', 'test-key' );
		$this->assertFalse( $result );
	}

	public function test_remove_source() {
		$sources = [
			[
				'key'  => 'test-key',
				'url'  => 'https://example.com',
				'name' => 'Test Source'
			]
		];
		Template_Cloud::save_pattern_sources( $sources );

		$request = new WP_REST_Request( 'DELETE', '/otter/v1/template-cloud/delete-source/test-key' );
		$request->set_param( 'key', 'test-key' );

		$response = $this->server->remove_source( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( $response->get_data()['success'] );
		$this->assertEmpty( $response->get_data()['sources'] );
	}

	public function test_sync_sources_empty() {
		$response = $this->server->sync_sources();

		$this->assertEquals( 400, $response->get_status() );
		$this->assertArrayHasKey( 'message', $response->get_data() );
	}

	public function test_sanitize_template_cloud_sources() {
		$input = [
			[
				'key'         => 'test-key',
				'url'         => 'https://example.com',
				'name'        => 'Test Source',
				'invalid_key' => 'should be removed'
			]
		];

		$sanitized = Template_Cloud_Server::sanitize_template_cloud_sources( $input );

		$this->assertArrayNotHasKey( 'invalid_key', $sanitized[0] );
		$this->assertCount( 3, array_keys( $sanitized[0] ) );
	}

	public function test_register_cloud_resources() {
		$sources = [
			[
				'key'  => 'test-key',
				'url'  => 'https://example.com',
				'name' => 'Test Source'
			]
		];
		Template_Cloud::save_pattern_sources( $sources );

		$patterns = [
			[
				'id' => 1,
				'title'   => 'Test Pattern',
				'slug'	=> 'test-pattern',
				'content' => '<!-- wp:paragraph --><p>Test</p><!-- /wp:paragraph -->'
			],
			[
				'id' => 2,
				'title'   => 'Test Pattern 2',
				'slug'    => 'test-pattern-2',
				'content' => '<!-- wp:paragraph --><p>Test</p><!-- /wp:paragraph -->'
			],
		];

		Template_Cloud::save_patterns_for_key( 'test-key', $patterns );

		$this->template_cloud->register_cloud_resources();

		$this->assertTrue(
			\WP_Block_Patterns_Registry::get_instance()->is_registered( 'otter-blocks/test-pattern' )
		);


		$this->assertTrue(
			\WP_Block_Pattern_Categories_Registry::get_instance()->is_registered( 'ti-tc-test-source' )
		);
	}
}
