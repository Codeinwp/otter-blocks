<?php
/**
 * Output-escaping regression tests for block render callbacks.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Dynamic_Content;
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
	 * Otter Pro renderers that print WooCommerce product fields.
	 *
	 * @return array<string, array{0: string}>
	 */
	public function woo_product_renderers(): array {
		return array(
			'review'            => array( 'review' ),
			'short description' => array( 'short-description' ),
			'product meta'      => array( 'meta' ),
		);
	}

	/**
	 * @dataProvider woo_product_renderers
	 */
	public function test_woo_product_field_markers_stay_literal( string $renderer ): void {
		global $post, $product;

		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag  = '{otterDynamic?type=loggedInUserEmail}';
		$item = new WC_Product_Simple();
		$item->set_name( $tag );
		$item->set_short_description( $tag );
		$item->set_sku( $tag );
		$item->set_regular_price( '10' );
		$product_id = $item->save();

		$post    = get_post( $product_id );
		$product = wc_get_product( $product_id );
		setup_postdata( $post );

		if ( 'review' === $renderer ) {
			// The Review block applies this filter only when the Pro plugin constant is defined.
			$attributes = ( new \ThemeIsle\OtterPro\Plugins\Review_Woo_Integration() )->apply_woo_data(
				array(
					'id'       => 'wp-block-themeisle-blocks-review-marker',
					'product'  => $product_id,
					'features' => array(
						array(
							'title'  => 'Quality',
							'rating' => 8,
						),
					),
				)
			);

			$html     = ( new \ThemeIsle\GutenbergBlocks\Render\Review_Block() )->render( $attributes );
			$expected = 2;
		} elseif ( 'short-description' === $renderer ) {
			$html     = ( new \ThemeIsle\OtterPro\Render\WooCommerce\Product_Short_Description_Block() )->render( array() );
			$expected = 1;
		} else {
			$html     = ( new \ThemeIsle\OtterPro\Render\WooCommerce\Product_Meta_Block() )->render( array() );
			$expected = 1;
		}

		$group  = parse_blocks( '<!-- wp:group /-->' )[0];
		$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );

		wp_reset_postdata();

		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertSame( $expected, substr_count( html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $tag ), $output );
	}

	/**
	 * Otter WooCommerce outputs that print product attributes, variation options or image data.
	 *
	 * @return array<string, array{0: string}>
	 */
	public function woo_block_outputs(): array {
		return array(
			'product tabs attributes'     => array( 'product-tabs' ),
			'add to cart variation'       => array( 'product-add-to-cart' ),
			'product images caption, alt' => array( 'product-images' ),
			'review image alt'            => array( 'review' ),
		);
	}

	/**
	 * @dataProvider woo_block_outputs
	 */
	public function test_woo_block_output_markers_stay_literal( string $block_name ): void {
		global $post, $product;

		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag   = '{otterDynamic?type=loggedInUserEmail}';
		$image = $this->factory()->attachment->create_upload_object( DIR_TESTDATA . '/images/canola.jpg' );
		update_post_meta( $image, '_wp_attachment_image_alt', $tag );
		wp_update_post(
			array(
				'ID'           => $image,
				'post_excerpt' => $tag,
			)
		);

		$attribute = new WC_Product_Attribute();
		$attribute->set_name( $tag );
		$attribute->set_options( array( $tag, 'Blue' ) );
		$attribute->set_visible( true );
		$attribute->set_variation( true );

		$item = new WC_Product_Variable();
		$item->set_name( 'Shirt' );
		$item->set_image_id( $image );
		$item->set_attributes( array( $attribute ) );
		$product_id = $item->save();

		$variation = new WC_Product_Variation();
		$variation->set_parent_id( $product_id );
		$variation->set_attributes( array( sanitize_title( $tag ) => 'Blue' ) );
		$variation->set_regular_price( '10' );
		$variation->save();
		WC_Product_Variable::sync( $product_id );

		$post    = get_post( $product_id );
		$product = wc_get_product( $product_id );
		setup_postdata( $post );

		$block = array(
			'blockName'    => 'themeisle-blocks/' . $block_name,
			'attrs'        => array(),
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);

		if ( 'review' === $block_name ) {
			$block['attrs'] = array(
				'id'       => 'wp-block-themeisle-blocks-review-marker',
				'product'  => $product_id,
				'features' => array(
					array(
						'title'  => 'Quality',
						'rating' => 8,
					),
				),
			);

			// The Review block applies this filter only when the Pro plugin constant is defined.
			$html = ( new \ThemeIsle\GutenbergBlocks\Render\Review_Block() )->render( ( new \ThemeIsle\OtterPro\Plugins\Review_Woo_Integration() )->apply_woo_data( $block['attrs'] ) );
		} else {
			$classes = array(
				'product-tabs'        => \ThemeIsle\OtterPro\Render\WooCommerce\Product_Tabs_Block::class,
				'product-add-to-cart' => \ThemeIsle\OtterPro\Render\WooCommerce\Product_Add_To_Cart_Block::class,
				'product-images'      => \ThemeIsle\OtterPro\Render\WooCommerce\Product_Images_Block::class,
			);
			$html    = ( new $classes[ $block_name ]() )->render( array() );
		}

		// The block's own render pass, then its parent's.
		$html   = apply_filters( 'render_block', $html, $block, new WP_Block( $block ) );
		$group  = parse_blocks( '<!-- wp:group /-->' )[0];
		$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );

		wp_reset_postdata();

		$this->assertStringContainsString( $tag, html_entity_decode( $output, ENT_QUOTES ), $output );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
	}

	/**
	 * Add to Cart Button labels: none, so the product text shows, or the author's own.
	 *
	 * @return array<string, array{0: array<string, string>}>
	 */
	public function add_to_cart_button_labels(): array {
		return array(
			'product text' => array( array() ),
			'block label'  => array( array( 'label' => 'Buy now' ) ),
		);
	}

	/**
	 * @dataProvider add_to_cart_button_labels
	 *
	 * @param array<string, string> $label Block label attribute.
	 */
	public function test_add_to_cart_button_product_markers_stay_literal( array $label ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag  = '{otterDynamic?type=loggedInUserEmail}';
		$link = 'https://example.org/buy#otterDynamicLink?type=siteURL';
		$item = new WC_Product_External();
		$item->set_name( 'Lamp' );
		$item->set_button_text( $tag );
		$item->set_product_url( $link );
		$item->set_regular_price( '10' );
		$product_id = $item->save();

		$block = array(
			'blockName'    => 'themeisle-blocks/add-to-cart-button',
			'attrs'        => array( 'product' => $product_id ) + $label,
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);
		$html  = ( new \ThemeIsle\OtterPro\Render\Add_To_Cart_Button_Block() )->render( $block['attrs'] );

		// The block's own render pass, then its parent's.
		$html   = apply_filters( 'render_block', $html, $block, new WP_Block( $block ) );
		$group  = parse_blocks( '<!-- wp:group /-->' )[0];
		$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertTrue( $processor->next_tag( 'a' ), $output );
		$this->assertSame( $tag, $processor->get_attribute( 'aria-label' ) );
		$this->assertSame( $link, $processor->get_attribute( 'href' ) );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertSame( isset( $label['label'] ) ? 'Buy now' : $tag, html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ) );
	}

	/**
	 * Blocks that print a Stripe product, with a marker or an empty description.
	 *
	 * @return array<string, array{0: string, 1: bool}>
	 */
	public function stripe_product_blocks(): array {
		return array(
			'stripe checkout'                    => array( 'stripe-checkout', true ),
			'stripe field'                       => array( 'form-stripe-field', true ),
			'stripe checkout, empty description' => array( 'stripe-checkout', false ),
			'stripe field, empty description'    => array( 'form-stripe-field', false ),
		);
	}

	/**
	 * @dataProvider stripe_product_blocks
	 */
	public function test_stripe_product_markers_stay_literal( string $block_name, bool $has_description ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		if ( ! defined( 'OTTER_PRO_BASEFILE' ) ) {
			require_once dirname( __DIR__ ) . '/plugins/otter-pro/otter-pro.php';
		}

		$tag         = '{otterDynamic?type=loggedInUserEmail}';
		$description = $has_description ? $tag : '';
		$image       = get_rest_url( null, 'otter/v1' ) . '/dynamic/?type=loggedInUser';
		$license     = str_replace( '-', '_', strtolower( trim( basename( dirname( OTTER_PRO_BASEFILE ) ) ) ) ) . '_license_data';
		$api_key = get_option( 'themeisle_stripe_api_key' );
		update_option( 'themeisle_stripe_api_key', 'sk_test' );
		update_option( $license, (object) array( 'license' => 'valid' ) );
		\Stripe\ApiRequestor::setHttpClient(
			new class( $tag, $description, $image ) extends \ThemeIsle\GutenbergBlocks\Tests\StripeHttpClientMock {
				/**
				 * Product name, description and image URL.
				 *
				 * @var array{0: string, 1: string, 2: string}
				 */
				private $product;

				public function __construct( string $name, string $description, string $image ) {
					$this->product = array( $name, $description, $image );
				}

				public function request( $method, $absUrl, $headers, $params, $hasFile ) {
					if ( preg_match( '#^/v1/products/\w+$#', (string) wp_parse_url( $absUrl, PHP_URL_PATH ) ) ) {
						$product = array(
							'id'          => 'prod_1',
							'object'      => 'product',
							'name'        => $this->product[0],
							'description' => $this->product[1],
							'images'      => array( $this->product[2] ),
						);

						return array( wp_json_encode( $product ), 200, null );
					}

					return parent::request( $method, $absUrl, $headers, $params, $hasFile );
				}
			}
		);

		try {
			$block = array(
				'blockName'    => 'themeisle-blocks/' . $block_name,
				'attrs'        => array(
					'id'      => 'wp-block-themeisle-blocks-stripe-marker',
					'product' => 'prod_1',
					'price'   => 'price_1',
				),
				'innerBlocks'  => array(),
				'innerHTML'    => '',
				'innerContent' => array(),
			);
			$html  = 'stripe-checkout' === $block_name
				? ( new \ThemeIsle\GutenbergBlocks\Render\Stripe_Checkout_Block() )->render( $block['attrs'] )
				: ( new Form_Stripe_Block() )->render( $block['attrs'] );

			// The block's own render pass, then its parent's.
			$html   = apply_filters( 'render_block', $html, $block, new WP_Block( $block ) );
			$group  = parse_blocks( '<!-- wp:group /-->' )[0];
			$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );
		} finally {
			\Stripe\ApiRequestor::setHttpClient( \Stripe\HttpClient\CurlClient::instance() );
			delete_option( $license );
			update_option( 'themeisle_stripe_api_key', $api_key );
		}

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertTrue( $processor->next_tag( 'img' ), $output );
		$this->assertSame( $image, $processor->get_attribute( 'src' ) );
		$this->assertSame( 'stripe-checkout' === $block_name ? $tag : $description, $processor->get_attribute( 'alt' ) );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertStringContainsString( '<h3>' . esc_html( Dynamic_Content::instance()->escape_comment_magic_tags( $tag ) ) . '</h3>', $output );
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
	 * Plugin Card text written by the plugin's author keeps dynamic markers literal.
	 */
	public function test_plugin_card_keeps_api_markers_literal(): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$slug = 'otter-blocks';
		$tag  = '{otterDynamic?type=loggedInUserEmail}';

		$results                    = new stdClass();
		$results->name              = $tag;
		$results->author            = '<a href="https://profiles.wordpress.org/otter/">' . $tag . '</a>';
		$results->version           = '1.0';
		$results->rating            = 90;
		$results->num_ratings       = 10;
		$results->active_installs   = 1000;
		$results->requires          = '6.0';
		$results->tested            = '6.4';
		$results->homepage          = 'https://example.com';
		$results->download_link     = 'https://example.com/plugin.zip';
		$results->short_description = $tag;
		$results->icons             = array( 'default' => 'https://example.com/icon.png' );

		set_transient( 'otter_plugin_card_' . sanitize_key( $slug ), $results, HOUR_IN_SECONDS );

		$block = array(
			'blockName'    => 'themeisle-blocks/plugin-cards',
			'attrs'        => array( 'slug' => $slug ),
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);
		$html  = ( new Plugin_Card_Block() )->render( $block['attrs'] );

		delete_transient( 'otter_plugin_card_' . sanitize_key( $slug ) );

		// The block's own render pass, then its parent's.
		$html   = apply_filters( 'render_block', $html, $block, new WP_Block( $block ) );
		$group  = parse_blocks( '<!-- wp:group /-->' )[0];
		$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertTrue( $processor->next_tag( 'img' ), $output );
		$this->assertSame( $tag, $processor->get_attribute( 'alt' ) );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertSame( 3, substr_count( html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $tag ), $output );
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
