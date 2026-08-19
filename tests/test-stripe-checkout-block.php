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
	 * Set up the test.
	 */
	public function set_up() {
		parent::set_up();

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
		unset( $_GET['action'], $_GET['product_id'], $_GET['price_id'], $_GET['url'] );

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
	 * A price configured in the block on the page creates a session.
	 */
	public function test_configured_price_creates_session() {
		$location = $this->run_checkout(
			array(
				'product_id' => 'prod_1',
				'price_id'   => 'price_1',
				'url'        => get_permalink( $this->post_id ),
			)
		);

		$this->assertStringContainsString( 'checkout.stripe.com', $location );
	}

	/**
	 * A price that is not configured in the block is rejected.
	 */
	public function test_arbitrary_price_is_rejected() {
		$location = $this->run_checkout(
			array(
				'product_id' => 'prod_1',
				'price_id'   => 'price_cheap',
				'url'        => get_permalink( $this->post_id ),
			)
		);

		$this->assertSame( '', $location );
	}

	/**
	 * A product that is not configured in the block is rejected.
	 */
	public function test_arbitrary_product_is_rejected() {
		$location = $this->run_checkout(
			array(
				'product_id' => 'prod_2',
				'price_id'   => 'price_1',
				'url'        => get_permalink( $this->post_id ),
			)
		);

		$this->assertSame( '', $location );
	}

	/**
	 * A page without a checkout block for the pair is rejected.
	 */
	public function test_unrelated_page_is_rejected() {
		$other_id = $this->factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => 'Nothing to buy here.',
			)
		);

		$location = $this->run_checkout(
			array(
				'product_id' => 'prod_1',
				'price_id'   => 'price_1',
				'url'        => get_permalink( $other_id ),
			)
		);

		$this->assertSame( '', $location );
	}

	/**
	 * A draft page is not a valid checkout source for visitors.
	 */
	public function test_draft_page_is_rejected_for_visitors() {
		wp_update_post(
			array(
				'ID'          => $this->post_id,
				'post_status' => 'draft',
			)
		);

		$location = $this->run_checkout(
			array(
				'product_id' => 'prod_1',
				'price_id'   => 'price_1',
				'url'        => add_query_arg( 'p', $this->post_id, home_url( '/' ) ),
			)
		);

		$this->assertSame( '', $location );
	}

	/**
	 * A block nested inside a container is still a valid checkout source.
	 */
	public function test_nested_block_is_accepted() {
		$nested_id = $this->factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:group --><div class="wp-block-group"><!-- wp:themeisle-blocks/stripe-checkout {"product":"prod_1","price":"price_1"} /--></div><!-- /wp:group -->',
			)
		);

		$location = $this->run_checkout(
			array(
				'product_id' => 'prod_1',
				'price_id'   => 'price_1',
				'url'        => get_permalink( $nested_id ),
			)
		);

		$this->assertStringContainsString( 'checkout.stripe.com', $location );
	}
}
