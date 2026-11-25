<?php
/**
 * Output-escaping regression tests for block render callbacks.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Render\Plugin_Card_Block;
use ThemeIsle\OtterPro\Render\Review_Comparison_Block;
use ThemeIsle\OtterPro\Render\Form_Stripe_Block;

/**
 * Render escaping test case.
 */
class Test_Render_Escaping extends WP_UnitTestCase {

	/**
	 * Provide a block-render context so get_block_wrapper_attributes() works when
	 * render callbacks are invoked directly.
	 */
	public function set_up() {
		parent::set_up();
		\WP_Block_Supports::$block_to_render = array(
			'blockName' => '',
			'attrs'     => array(),
		);
	}

	/**
	 * Tear down the test.
	 */
	public function tear_down() {
		\WP_Block_Supports::$block_to_render = null;
		parent::tear_down();
	}

	/**
	 * Review comparison must escape values pulled from the referenced review block.
	 */
	public function test_review_comparison_escapes_referenced_block_attributes() {
		$block_markup = '<!-- wp:themeisle-blocks/review {"id":"aaaaaaaabbbb1234","title":"<script>alert(1)</script>","price":"9.99","description":"<img src=x onerror=alert(2)>","features":[{"title":"<script>alert(3)</script>","rating":8}]} /-->';

		// Store the block markup raw (bypass save-time kses) so the test exercises the
		// render-layer escaping, not WordPress's save-time sanitization.
		kses_remove_filters();
		$post_id = $this->factory()->post->create(
			array(
				'post_content' => $block_markup,
				'post_status'  => 'publish',
			)
		);
		kses_init_filters();

		$html = ( new Review_Comparison_Block() )->render(
			array( 'reviews' => array( $post_id . '-bbbb1234' ) )
		);

		$this->assertStringNotContainsString( '<script>alert(1)</script>', $html );
		$this->assertStringNotContainsString( '<script>alert(3)</script>', $html );
		$this->assertStringNotContainsString( 'onerror=', $html );
	}

	/**
	 * Product image alt text, set or empty so the comparison falls back to the product name.
	 *
	 * @return array<string, array{0: bool}>
	 */
	public function product_image_alts(): array {
		return array(
			'image alt'      => array( true ),
			'title fallback' => array( false ),
		);
	}

	/**
	 * @dataProvider product_image_alts
	 */
	public function test_review_comparison_keeps_product_markers_literal( bool $has_alt ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag   = '{otterDynamic?type=loggedInUserEmail}';
		$link  = 'https://example.org/buy#otterDynamicLink?type=siteURL';
		$image = $this->factory()->attachment->create_upload_object( DIR_TESTDATA . '/images/canola.jpg' );
		if ( $has_alt ) {
			update_post_meta( $image, '_wp_attachment_image_alt', $tag );
		}

		$product = new WC_Product_External();
		$product->set_name( $tag );
		$product->set_short_description( $tag );
		$product->set_regular_price( '10' );
		$product->set_product_url( $link );
		$product->set_image_id( $image );
		$product_id = $product->save();

		$post_id = $this->factory()->post->create(
			array(
				'post_content' => '<!-- wp:themeisle-blocks/review {"id":"aaaaaaaabbbb1234","product":' . $product_id . '} /-->',
				'post_status'  => 'publish',
			)
		);

		$html = ( new Review_Comparison_Block() )->render( array( 'reviews' => array( $post_id . '-bbbb1234' ) ) );

		$group  = parse_blocks( '<!-- wp:group /-->' )[0];
		$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertTrue( $processor->next_tag( 'img' ), $output );
		$this->assertSame( $tag, $processor->get_attribute( 'alt' ) );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertSame( 2, substr_count( html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $tag ), $output );
		$this->assertStringContainsString( 'buy#otterDynamicLink?type=siteURL', html_entity_decode( $output, ENT_QUOTES ), $output );
	}

	/**
	 * The plugin card must escape the author field from the wordpress.org API.
	 */
	public function test_plugin_card_escapes_author() {
		$slug = 'otter-blocks';

		$results               = new stdClass();
		$results->name         = 'Otter';
		$results->author       = '<script>alert(1)</script>';
		$results->version      = '1.0';
		$results->rating       = 90;
		$results->num_ratings  = 10;
		$results->active_installs = 1000;
		$results->requires     = '6.0';
		$results->tested       = '6.4';
		$results->homepage     = 'https://example.com';
		$results->download_link = 'https://example.com/plugin.zip';
		$results->short_description = 'A plugin.';
		$results->icons        = array( 'default' => 'https://example.com/icon.png' );

		set_transient( 'otter_plugin_card_' . sanitize_key( $slug ), $results, HOUR_IN_SECONDS );

		$html = ( new Plugin_Card_Block() )->render( array( 'slug' => $slug ) );

		delete_transient( 'otter_plugin_card_' . sanitize_key( $slug ) );

		$this->assertStringNotContainsString( '<script>alert(1)</script>', $html );
	}

	/**
	 * The Stripe field block must escape id/name/option-name block attributes.
	 */
	public function test_form_stripe_field_attributes_are_escaped() {
		$out = ( new Form_Stripe_Block() )->get_field_attributes(
			array(
				'id'              => 'x"><script>alert(1)</script>',
				'mappedName'      => 'n"><script>alert(2)</script>',
				'fieldOptionName' => 'f"><script>alert(3)</script>',
			)
		);

		$this->assertStringNotContainsString( '<script>', $out );
	}
}
