<?php
/**
 * Class TestStripeCheckoutBlock
 *
 * @package otter-blocks
 */

use ThemeIsle\GutenbergBlocks\Render\Stripe_Checkout_Block;
use ThemeIsle\GutenbergBlocks\Tests\StripeHttpClientMock;

/**
 * Stripe Checkout block test case.
 */
class TestStripeCheckoutBlock extends WP_UnitTestCase {

	/**
	 * The block instance.
	 *
	 * @var Stripe_Checkout_Block
	 */
	private $block;

	/**
	 * ID of the post holding the checkout block.
	 *
	 * @var int
	 */
	private $post_id;

	/**
	 * Value of the Stripe API key option before the test.
	 *
	 * @var mixed
	 */
	private $previous_api_key;

	/**
	 * Set up the test.
	 */
	public function set_up() {
		parent::set_up();

		$this->previous_api_key = get_option( 'themeisle_stripe_api_key' );

		update_option( 'themeisle_stripe_api_key', 'sk_test' );
		\Stripe\ApiRequestor::setHttpClient( new StripeHttpClientMock() );

		$this->block = new Stripe_Checkout_Block();

		$this->post_id = $this->factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:themeisle-blocks/stripe-checkout {"product":"prod_1","price":"price_1"} /-->',
			)
		);

		// wp_safe_redirect() would end the request, so turn the redirect into an exception.
		add_filter( 'wp_redirect', array( $this, 'throw_on_redirect' ) );
	}

	/**
	 * Tear down the test.
	 */
	public function tear_down() {
		remove_filter( 'wp_redirect', array( $this, 'throw_on_redirect' ) );
		unset( $_GET['action'], $_GET['product_id'], $_GET['price_id'], $_GET['url'], $_GET['token'] );

		delete_transient( Stripe_Checkout_Block::PRICE_MODE_CACHE_PREFIX . md5( 'price_1' ) );

		if ( false === $this->previous_api_key ) {
			delete_option( 'themeisle_stripe_api_key' );
		} else {
			update_option( 'themeisle_stripe_api_key', $this->previous_api_key );
		}

		// The library falls back to this client when none is set, so it is the default to restore.
		\Stripe\ApiRequestor::setHttpClient( \Stripe\HttpClient\CurlClient::instance() );

		parent::tear_down();
	}

	/**
	 * Turn a redirect into an exception carrying the location.
	 *
	 * @param string $location Redirect location.
	 * @throws Exception Always.
	 */
	public function throw_on_redirect( $location ) {
		throw new Exception( $location );
	}

	/**
	 * Build the request parameters a rendered block would produce, with overrides applied.
	 *
	 * @param array $overrides Parameters to override.
	 * @return array
	 */
	private function checkout_params( $overrides = array() ) {
		return array_merge(
			array(
				'product_id' => 'prod_1',
				'price_id'   => 'price_1',
				'url'        => get_permalink( $this->post_id ),
				'token'      => Stripe_Checkout_Block::get_checkout_token( 'prod_1', 'price_1' ),
			),
			$overrides
		);
	}

	/**
	 * Run the checkout watcher with the given request parameters.
	 *
	 * @param array $params Request parameters.
	 * @return string Redirect location, or '' when no session was created.
	 */
	private function run_checkout( $params ) {
		$_GET = array_merge( array( 'action' => 'buy_stripe' ), $params );

		try {
			$this->block->watch_checkout();
		} catch ( Exception $e ) {
			return $e->getMessage();
		}

		return '';
	}

	/**
	 * A pair signed by a rendered block creates a session.
	 */
	public function test_signed_pair_creates_session() {
		$location = $this->run_checkout( $this->checkout_params() );

		$this->assertStringContainsString( 'checkout.stripe.com', $location );
	}

	/**
	 * The token emitted by the rendered block is accepted as-is.
	 */
	public function test_token_from_rendered_block_is_accepted() {
		$markup = $this->block->render(
			array(
				'product' => 'prod_1',
				'price'   => 'price_1',
			)
		);

		preg_match( '/token=([a-f0-9]+)/', html_entity_decode( $markup ), $matches );

		$this->assertNotEmpty( $matches, 'The buy link should carry a token.' );

		$location = $this->run_checkout( $this->checkout_params( array( 'token' => $matches[1] ) ) );

		$this->assertStringContainsString( 'checkout.stripe.com', $location );
	}

	/**
	 * A block outside post content still works, because the token does not depend on placement.
	 */
	public function test_widget_placement_is_accepted() {
		$widget_only_id = $this->factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => 'The checkout block lives in a widget area, not here.',
			)
		);

		$location = $this->run_checkout( $this->checkout_params( array( 'url' => get_permalink( $widget_only_id ) ) ) );

		$this->assertStringContainsString( 'checkout.stripe.com', $location );
	}

	/**
	 * A non-singular URL that resolves to no post is still a valid return URL.
	 */
	public function test_archive_url_is_accepted() {
		$location = $this->run_checkout( $this->checkout_params( array( 'url' => home_url( '/2026/08/' ) ) ) );

		$this->assertStringContainsString( 'checkout.stripe.com', $location );
	}

	/**
	 * A request without a token is rejected.
	 */
	public function test_missing_token_is_rejected() {
		$location = $this->run_checkout( $this->checkout_params( array( 'token' => '' ) ) );

		$this->assertSame( '', $location );
	}

	/**
	 * A price swapped in while keeping the token of another pair is rejected.
	 */
	public function test_substituted_price_is_rejected() {
		$location = $this->run_checkout( $this->checkout_params( array( 'price_id' => 'price_cheap' ) ) );

		$this->assertSame( '', $location );
	}

	/**
	 * A product swapped in while keeping the token of another pair is rejected.
	 */
	public function test_substituted_product_is_rejected() {
		$location = $this->run_checkout( $this->checkout_params( array( 'product_id' => 'prod_2' ) ) );

		$this->assertSame( '', $location );
	}

	/**
	 * A token that was not derived from the site salt is rejected.
	 */
	public function test_forged_token_is_rejected() {
		$forged = hash_hmac( 'sha256', 'prod_1|price_cheap', 'guessed-salt' );

		$location = $this->run_checkout(
			$this->checkout_params(
				array(
					'price_id' => 'price_cheap',
					'token'    => $forged,
				)
			)
		);

		$this->assertSame( '', $location );
	}

	/**
	 * An off-site return URL is replaced with this site's home URL.
	 */
	public function test_offsite_return_url_is_replaced() {
		StripeHttpClientMock::reset_request_params();

		$this->run_checkout( $this->checkout_params( array( 'url' => 'https://evil.example.net/collect' ) ) );

		$params = StripeHttpClientMock::get_params_for( '/v1/checkout/sessions' );

		$this->assertNotEmpty( $params );
		$this->assertStringStartsWith( home_url(), $params['success_url'] );
		$this->assertStringStartsWith( home_url(), $params['cancel_url'] );
	}

	/**
	 * The checkout mode is derived from the price and then served from cache.
	 */
	public function test_price_mode_is_cached() {
		$params = $this->checkout_params();

		StripeHttpClientMock::reset_request_paths();
		$this->run_checkout( $params );

		$this->assertContains( '/v1/prices/price_1', StripeHttpClientMock::$request_paths );
		$this->assertSame( 'payment', get_transient( Stripe_Checkout_Block::PRICE_MODE_CACHE_PREFIX . md5( 'price_1' ) ) );

		StripeHttpClientMock::reset_request_paths();
		$location = $this->run_checkout( $params );

		$this->assertNotContains( '/v1/prices/price_1', StripeHttpClientMock::$request_paths );
		$this->assertStringContainsString( 'checkout.stripe.com', $location );
	}
}
