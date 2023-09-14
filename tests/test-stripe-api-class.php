<?php
/**
 * Class TestStripeAPI
 *
 * @package Your_Plugin_Name
 */

use ThemeIsle\GutenbergBlocks\Plugins\Stripe_API;
use ThemeIsle\GutenbergBlocks\Tests\StripeHttpClientMock;

// Replace with the correct namespace from your uploaded file.


/**
 * Stripe API test case.
 */
class TestStripeAPI extends WP_UnitTestCase {

	/**
	 * The Stripe_API instance.
	 *
	 * @var Stripe_API
	 */
	private $stripe_api;

	/**
	 * Set up the test.
	 */
	public function set_up() {
		parent::set_up();

		if ( ! defined( 'OTTER_BLOCKS_VERSION' ) ) {
			define('OTTER_BLOCKS_VERSION', '1.0.0');
		}
		update_option( 'themeisle_stripe_api_key', 'sk_test' );

		// Set the mock HTTP client for Stripe
		\Stripe\ApiRequestor::setHttpClient(new StripeHttpClientMock());

		$this->stripe_api = new Stripe_API();
	}


	/**
	 * Test Stripe products retrieval.
	 */
	public function test_retrieve_products() {
		$products = $this->stripe_api->create_request(
			'products',
			array(
				'active' => true,
				'limit'  => 50,
			)
		);

		$this->assertIsArray( $products->data );
	}

	/**
	 * Test Stripe prices retrieval.
	 */
	public function test_retrieve_prices() {
		$prices = $this->stripe_api->create_request(
			'prices',
			array(
				'active' => true,
				'limit'  => 50,
			)
		);

		$this->assertIsArray( $prices->data );
	}

	/**
	 * Test Stripe product retrieval.
	 */
	public function test_retrieve_product() {
		$product = $this->stripe_api->create_request('product', 'prod_1' );

		$this->assertTrue( 'prod_1' === $product['id'] );
	}

	/**
	 * Test Stripe price retrieval.
	 */
	public function test_retrieve_price() {
		$price = $this->stripe_api->create_request('price', 'price_1' );

		$this->assertTrue( 'price_1' === $price['id'] );
	}

	/**
	 * Test get customer email from session.
	 */
	public function test_retrieve_session_email() {
		$this->assertTrue( 'test@test.com' === $this->stripe_api->get_session_email( 'sess_1' ) );
	}

	/**
	 * Test user purchase.
	 */
	public function test_user_purchase() {
		wp_set_current_user( 1 );
		$this->stripe_api->save_customer_data( 'sess_1' );
		$data = $this->stripe_api->get_customer_data();

		$this->assertFalse( empty( $data[0]['id'] ) );
	}

	/**
	 * Test status for price id.
	 */
	public function test_status_for_price_id() {
		$status = $this->stripe_api->get_status_for_price_id( 'sess_1','price_1' );

		$this->assertTrue( 'success' === $status );
	}
}
