<?php
/**
 * Class Test_Stripe_Server
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Server\Stripe_Server;
use ThemeIsle\GutenbergBlocks\Tests\StripeHttpClientMock;

/**
 * Stripe server tests.
 */
class Test_Stripe_Server extends WP_UnitTestCase {
	/**
	 * @var Stripe_Server
	 */
	private $stripe_server;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();
		update_option( 'themeisle_stripe_api_key', 'sk_test' );
		\Stripe\ApiRequestor::setHttpClient( new StripeHttpClientMock() );
		$this->stripe_server = new Stripe_Server();
	}

	/**
	 * Ensure products endpoint returns a list payload from Stripe API.
	 */
	public function test_get_products_returns_list_response() {
		$request  = new WP_REST_Request( 'GET', '/otter/v1/stripe/products' );
		$response = $this->stripe_server->get_products( $request );

		$this->assertSame( 'list', $response->object );
		$this->assertIsArray( $response->data );
		$this->assertNotEmpty( $response->data );
		$this->assertTrue( isset( $response->data[0]['id'] ) || isset( $response->data[0]->id ) );
	}

	/**
	 * Ensure price endpoint returns a list payload for a product request.
	 */
	public function test_get_price_returns_prices_list_for_product() {
		$request = new WP_REST_Request( 'GET', '/otter/v1/stripe/prices/prod_1' );
		$request->set_param( 'id', 'prod_1' );
		$response = $this->stripe_server->get_price( $request );

		$this->assertSame( 'list', $response->object );
		$this->assertIsArray( $response->data );
		$this->assertNotEmpty( $response->data );
		$this->assertTrue( isset( $response->data[0]['product'] ) || isset( $response->data[0]->product ) );
	}
}
