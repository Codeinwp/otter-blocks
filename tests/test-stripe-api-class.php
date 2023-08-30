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

		// Set the mock HTTP client for Stripe
		\Stripe\ApiRequestor::setHttpClient(new StripeHttpClientMock());

		$this->stripe_api = new Stripe_API();
	}


	/**
	 * Test Stripe product retrieval.
	 */
	public function test_retrieve_products() {
		// Replace with the actual method name and logic to test.
		$products = $this->stripe_api->create_request(
			'products',
			array(
				'active' => true,
				'limit'  => 50,
			)
		);

		$this->assertIsArray( $products );
	}

	// Add more test methods to cover each method in your Stripe_API class.
}
