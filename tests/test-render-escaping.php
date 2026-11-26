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
	 * Feed renderers: the RSS block and an RSS widget in a Legacy Widget block, standalone or nested.
	 *
	 * @return array<string, array{0: string, 1: bool}>
	 */
	public function feed_renderers(): array {
		return array(
			'rss block'              => array( 'core/rss', false ),
			'rss block in group'     => array( 'core/rss', true ),
			'rss legacy widget'      => array( 'core/legacy-widget', false ),
			'rss widget in group'    => array( 'core/legacy-widget', true ),
		);
	}

	/**
	 * @dataProvider feed_renderers
	 */
	public function test_feed_text_markers_stay_literal( string $block_name, bool $nested ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag  = '{otterDynamic?type=loggedInUserEmail}';
		$feed = 'https://feed.example/' . wp_generate_password( 8, false ) . '.xml';
		$xml  = '<?xml version="1.0"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>Feed</title><link>https://feed.example/</link><description>Feed</description>'
			. '<item><title>' . $tag . '</title><link>https://feed.example/1</link><description>' . $tag . '</description><dc:creator>' . $tag . '</dc:creator></item>'
			. '</channel></rss>';
		$stub = static function ( $response, array $args, string $url ) use ( $feed, $xml ) {
			if ( $url !== $feed ) {
				return $response;
			}

			return array(
				'headers'  => array( 'content-type' => 'application/rss+xml' ),
				'body'     => $xml,
				'response' => array(
					'code'    => 200,
					'message' => 'OK',
				),
				'cookies'  => array(),
				'filename' => null,
			);
		};
		add_filter( 'pre_http_request', $stub, 10, 3 );

		$instance = serialize(
			array(
				'title'        => 'News',
				'url'          => $feed,
				'items'        => 5,
				'show_summary' => 1,
				'show_author'  => 1,
			)
		);
		$attrs    = 'core/rss' === $block_name
			? array(
				'feedURL'        => $feed,
				'displayExcerpt' => true,
				'displayAuthor'  => true,
			)
			: array(
				'idBase'   => 'rss',
				'instance' => array(
					'encoded' => base64_encode( $instance ),
					'hash'    => wp_hash( $instance ),
				),
			);
		$block = array(
			'blockName'    => $block_name,
			'attrs'        => $attrs,
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);
		if ( $nested ) {
			$block = array(
				'blockName'    => 'core/group',
				'attrs'        => array(),
				'innerBlocks'  => array( $block ),
				'innerHTML'    => '<div class="wp-block-group"></div>',
				'innerContent' => array( '<div class="wp-block-group">', null, '</div>' ),
			);
		}

		$output = render_block( $block );

		$this->assertStringContainsString( 'https://feed.example/1', $output );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertSame( 3, substr_count( html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $tag ), $output );
	}

	/**
	 * Page List renders: standalone, in Navigation inner blocks, and in a saved Navigation menu.
	 *
	 * @return array<string, array{0: string}>
	 */
	public function page_list_renders(): array {
		return array(
			'standalone'      => array( 'standalone' ),
			'navigation'      => array( 'navigation' ),
			'navigation menu' => array( 'navigation menu' ),
		);
	}

	/**
	 * @dataProvider page_list_renders
	 */
	public function test_page_list_title_markers_stay_literal( string $render ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag    = '{otterDynamic?type=loggedInUserEmail}';
		$parent = $this->factory()->post->create(
			array(
				'post_type'  => 'page',
				'post_title' => $tag,
			)
		);
		$this->factory()->post->create(
			array(
				'post_type'   => 'page',
				'post_title'  => 'Child',
				'post_parent' => $parent,
			)
		);

		$page_list = '<!-- wp:page-list /-->';
		if ( 'standalone' === $render ) {
			$markup = $page_list;
		} elseif ( 'navigation' === $render ) {
			$markup = '<!-- wp:navigation -->' . $page_list . '<!-- /wp:navigation -->';
		} else {
			$menu   = $this->factory()->post->create(
				array(
					'post_type'    => 'wp_navigation',
					'post_status'  => 'publish',
					'post_content' => $page_list,
				)
			);
			$markup = '<!-- wp:navigation {"ref":' . $menu . '} /-->';
		}

		$output = do_blocks( $markup );

		$this->assertStringContainsString( 'Child', $output );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertStringContainsString( $tag, html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $output );
	}

	/**
	 * A block printing data beside an authored marker, rendered from content or directly.
	 *
	 * @return array<string, array{0: bool, 1: string, 2: string}>
	 */
	public function authored_and_data_markers(): array {
		return array(
			'rendered from content'           => array( true, '{otterDynamic?type=siteTitle}', 'Test Blog' ),
			'rendered directly'               => array( false, '{otterDynamic?type=siteTitle}', 'Test Blog' ),
			'equal markers from content'      => array( true, '{otterDynamic?type=loggedInUserEmail}', 'viewer@example.org' ),
			'equal markers rendered directly' => array( false, '{otterDynamic?type=loggedInUserEmail}', 'viewer@example.org' ),
		);
	}

	/**
	 * @dataProvider authored_and_data_markers
	 */
	public function test_only_authored_markers_resolve_beside_printed_data( bool $from_content, string $authored, string $resolved ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$data = '{otterDynamic?type=loggedInUserEmail}';
		register_block_type(
			'otter-test/marker-echo',
			array(
				'attributes'      => array( 'text' => array( 'type' => 'string' ), 'element' => array( 'type' => 'string' ) ),
				'render_callback' => static function ( array $attributes ) use ( $data ): string {
					return '<p data-authored="' . esc_attr( $attributes['text'] ) . '" data-element="' . esc_attr( $attributes['element'] ) . '">' . esc_html( $data ) . '</p>';
				},
			)
		);

		try {
			$markup = '<!-- wp:otter-test/marker-echo ' . wp_json_encode( array( 'text' => $authored, 'element' => '<o-dynamic data-type="siteTitle">Site</o-dynamic>' ) ) . ' /-->';
			$output = $from_content ? do_blocks( $markup ) : ( new WP_Block( parse_blocks( $markup )[0] ) )->render();
		} finally {
			unregister_block_type( 'otter-test/marker-echo' );
		}

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertTrue( $processor->next_tag( 'p' ), $output );
		$this->assertSame( $resolved, $processor->get_attribute( 'data-authored' ) );
		$this->assertSame( '<o-dynamic data-type="siteTitle">Site</o-dynamic>', $processor->get_attribute( 'data-element' ) );
		$this->assertSame( $data, html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ) );
	}

	/**
	 * Markers in classic (freeform) content: a Magic Tag and a dynamic element.
	 *
	 * @return array<string, array{0: string}>
	 */
	public function freeform_markers(): array {
		return array(
			'magic tag'       => array( '<p>{otterDynamic?type=siteTitle}</p>' ),
			'dynamic element' => array( '<p><o-dynamic data-type="siteTitle">Site</o-dynamic></p>' ),
		);
	}

	/**
	 * @dataProvider freeform_markers
	 */
	public function test_freeform_content_markers_still_resolve( string $content ): void {
		$output = do_blocks( $content );

		$this->assertSame( '<p>Test Blog</p>', $output );
	}

	public function test_dynamic_background_image_renders_as_without_the_gate(): void {
		$url    = get_rest_url( null, 'otter/v1' ) . '/dynamic/?type=featuredImage';
		$attrs  = array( 'style' => array( 'background' => array( 'backgroundImage' => array( 'url' => $url ) ) ) );
		$markup = '<!-- wp:group ' . wp_json_encode( $attrs ) . ' --><div class="wp-block-group"></div><!-- /wp:group -->';

		$dynamic_content = Dynamic_Content::instance();
		remove_filter( 'render_block', array( $dynamic_content, 'escape_visitor_block_magic_tags' ), 9 );
		$expected = do_blocks( $markup );
		add_filter( 'render_block', array( $dynamic_content, 'escape_visitor_block_magic_tags' ), 9, 3 );
		$output = do_blocks( $markup );

		$this->assertStringContainsString( 'background-image', $output );
		$this->assertStringNotContainsString( 'otterauthored', $output );
		$this->assertSame( $expected, $output );
	}

	/**
	 * Magic Tag openers written with character references, which attribute decoding turns into live ones.
	 *
	 * @return array<string, array{0: string}>
	 */
	public function encoded_openers(): array {
		return array(
			'hex brace'          => array( '&#x7b;otterDynamic?' ),
			'upper hex brace'    => array( '&#X7B;otterDynamic?' ),
			'decimal brace'      => array( '&#123;otterDynamic?' ),
			'zero padded brace'  => array( '&#0123;otterDynamic?' ),
			'no semicolon brace' => array( '&#123otterDynamic?' ),
			'lbrace'             => array( '&lbrace;otterDynamic?' ),
			'lcub'               => array( '&lcub;otterDynamic?' ),
			'decimal question'   => array( '{otterDynamic&#63;' ),
			'hex question'       => array( '{otterDynamic&#x3f;' ),
			'named question'     => array( '{otterDynamic&quest;' ),
			'encoded letter'     => array( '{&#111;tterDynamic?' ),
			'mixed'              => array( '&#x7b;otter&#68;ynamic?' ),
		);
	}

	/**
	 * @dataProvider encoded_openers
	 */
	public function test_encoded_magic_tag_openers_stay_literal_beside_authored_attribute( string $opener ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$output = do_blocks( '<!-- wp:html --><img src="https://example.org/a.jpg" title="{otterDynamic?type=siteTitle}" alt="' . $opener . 'type=loggedInUserEmail}" /><!-- /wp:html -->' );

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertTrue( $processor->next_tag( 'img' ), $output );
		$this->assertSame( 'Test Blog', $processor->get_attribute( 'title' ) );
		$this->assertSame( '{otterDynamic?type=loggedInUserEmail}', $processor->get_attribute( 'alt' ) );
	}

	public function test_attached_media_gallery_caption_stays_literal(): void {
		global $post;

		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag     = '{otterDynamic?type=loggedInUserEmail}';
		$post_id = $this->factory()->post->create();
		$image   = $this->factory()->attachment->create_upload_object( DIR_TESTDATA . '/images/canola.jpg', $post_id );
		wp_update_post(
			array(
				'ID'           => $image,
				'post_excerpt' => $tag,
			)
		);

		$post = get_post( $post_id );
		setup_postdata( $post );
		$output = do_blocks( '<!-- wp:gallery {"dynamicContent":{"source":"core/attached-media"}} /-->' );
		wp_reset_postdata();

		$this->assertStringContainsString( 'wp-element-caption', $output );
		$this->assertStringNotContainsString( 'viewer@example.org', $output );
		$this->assertStringContainsString( $tag, html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $output );
	}

	public function test_saved_navigation_menu_label_markers_still_resolve(): void {
		$menu = $this->factory()->post->create(
			array(
				'post_type'    => 'wp_navigation',
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:navigation-link {"label":"{otterDynamic?type=siteTitle}","url":"https://example.org/","kind":"custom"} /-->',
			)
		);

		$output = do_blocks( '<!-- wp:navigation {"ref":' . $menu . '} /-->' );

		$this->assertStringContainsString( '>Test Blog<', $output );
	}

	/**
	 * Blocks bound to post meta, with or without the same marker written into the block, the binding value filter
	 * (missing before WordPress 6.7), or a carriage return the HTML API normalizes.
	 *
	 * @return array<string, array{0: string, 1: string, 2: bool}>
	 */
	public function meta_bound_blocks(): array {
		$bindings  = static function ( string $attribute ): string {
			return wp_json_encode( array( 'metadata' => array( 'bindings' => array( $attribute => array( 'source' => 'core/post-meta', 'args' => array( 'key' => 'otter_test_bound' ) ) ) ) ) );
		};
		$tag       = '{otterDynamic?type=loggedInUserEmail}';
		$paragraph = '<!-- wp:paragraph ' . $bindings( 'content' ) . ' --><p>%s</p><!-- /wp:paragraph -->';
		$image     = '<!-- wp:image ' . $bindings( 'alt' ) . ' --><figure class="wp-block-image"><img src="https://example.org/a.jpg" alt="" title="%s"/></figure><!-- /wp:image -->';

		return array(
			'paragraph'                                 => array( sprintf( $paragraph, 'Fallback' ), $tag, false ),
			'paragraph with the authored tag'           => array( sprintf( $paragraph, $tag ), $tag, false ),
			'paragraph with the authored tag, no filter' => array( sprintf( $paragraph, $tag ), $tag, true ),
			'image alt'                                 => array( sprintf( $image, '{otterDynamic?type=siteTitle}' ), $tag, false ),
			'image alt with the authored tag'           => array( sprintf( $image, $tag ), $tag, false ),
			'image alt with the authored tag, no filter' => array( sprintf( $image, $tag ), $tag, true ),
			'image alt ending in a carriage return'     => array( sprintf( $image, $tag ), $tag . "\r", false ),
			'image alt ending in a CRLF'                => array( sprintf( $image, $tag ), $tag . "\r\n", false ),
		);
	}

	/**
	 * @dataProvider meta_bound_blocks
	 */
	public function test_meta_bound_markers_stay_literal( string $markup, string $meta, bool $without_filter ): void {
		global $post;

		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag = '{otterDynamic?type=loggedInUserEmail}';
		register_post_meta(
			'post',
			'otter_test_bound',
			array(
				'show_in_rest' => true,
				'single'       => true,
				'type'         => 'string',
			)
		);
		if ( $without_filter ) {
			remove_all_filters( 'block_bindings_source_value' );
		}

		try {
			$post_id = $this->factory()->post->create();
			update_post_meta( $post_id, 'otter_test_bound', $meta );
			$post = get_post( $post_id );
			setup_postdata( $post );
			$output = do_blocks( $markup );
			wp_reset_postdata();
		} finally {
			unregister_post_meta( 'post', 'otter_test_bound' );
		}

		$this->assertStringNotContainsString( 'viewer@example.org', str_replace( 'title="viewer@example.org"', '', $output ), $output );
		$processor = new WP_HTML_Tag_Processor( $output );
		if ( $processor->next_tag( 'img' ) ) {
			$this->assertSame( str_replace( array( "\r\n", "\r" ), "\n", $meta ), $processor->get_attribute( 'alt' ), $output );
			$this->assertNotSame( $tag, $processor->get_attribute( 'title' ), $output );
		} else {
			$this->assertSame( $meta, html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $output );
		}
	}

	/**
	 * RSS feed item titles keep data markers literal even when the block's attributes hold the same marker.
	 */
	public function test_rss_feed_markers_stay_literal_with_authored_attribute(): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag  = '{otterDynamic?type=loggedInUserEmail}';
		$feed = 'https://feed.example/' . wp_generate_password( 8, false ) . '.xml';
		$xml  = '<?xml version="1.0"?><rss version="2.0"><channel><title>Feed</title><link>https://feed.example/</link><description>Feed</description>'
			. '<item><title>' . $tag . '</title><link>https://feed.example/1</link></item>'
			. '</channel></rss>';
		$stub = static function ( $response, array $args, string $url ) use ( $feed, $xml ) {
			if ( $url !== $feed ) {
				return $response;
			}

			return array(
				'headers'  => array( 'content-type' => 'application/rss+xml' ),
				'body'     => $xml,
				'response' => array(
					'code'    => 200,
					'message' => 'OK',
				),
				'cookies'  => array(),
				'filename' => null,
			);
		};
		add_filter( 'pre_http_request', $stub, 10, 3 );

		try {
			$block = array(
				'blockName'    => 'core/rss',
				'attrs'        => array(
					'feedURL'   => $feed,
					'className' => 'marker-' . $tag,
					'metadata'  => array( 'name' => $tag ),
				),
				'innerBlocks'  => array(),
				'innerHTML'    => '',
				'innerContent' => array(),
			);
			$group = array(
				'blockName'    => 'core/group',
				'attrs'        => array(),
				'innerBlocks'  => array( $block ),
				'innerHTML'    => '<div class="wp-block-group"></div>',
				'innerContent' => array( '<div class="wp-block-group">', null, '</div>' ),
			);

			$output = render_block( $group );
		} finally {
			remove_filter( 'pre_http_request', $stub, 10 );
		}

		$this->assertStringContainsString( 'marker-viewer@example.org', $output, $output );
		$this->assertStringContainsString( '>' . $tag . '</a>', html_entity_decode( $output, ENT_QUOTES ), $output );
	}

	/**
	 * Product Meta tag names keep data markers literal even when the block's attributes hold the same marker.
	 */
	public function test_product_meta_tag_markers_stay_literal_with_authored_attribute(): void {
		global $post, $product;

		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$tag  = '{otterDynamic?type=loggedInUserEmail}';
		$term = wp_insert_term( $tag, 'product_tag' );
		$this->assertNotWPError( $term );

		$item = new WC_Product_Simple();
		$item->set_name( 'Widget' );
		$item->set_regular_price( '10' );
		$item->set_tag_ids( array( $term['term_id'] ) );
		$product_id = $item->save();

		$post    = get_post( $product_id );
		$product = wc_get_product( $product_id );
		setup_postdata( $post );

		$block = array(
			'blockName'    => 'themeisle-blocks/product-meta',
			'attrs'        => array(
				'className' => 'marker-' . $tag,
				'metadata'  => array( 'name' => $tag ),
			),
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);
		$html  = ( new \ThemeIsle\OtterPro\Render\WooCommerce\Product_Meta_Block() )->render( $block['attrs'] );

		$html   = apply_filters( 'render_block', $html, $block, new WP_Block( $block ) );
		$group  = parse_blocks( '<!-- wp:group /-->' )[0];
		$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );

		wp_reset_postdata();

		$this->assertStringNotContainsString( 'viewer@example.org', $output, $output );
		$this->assertStringContainsString( $tag, html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ), $output );
	}

	/**
	 * Review external-product URLs keep data markers literal even when the block's attributes hold the same marker.
	 */
	public function test_review_external_product_url_stays_literal_with_authored_attribute(): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );

		$link = 'https://example.org/buy#otterDynamicLink?type=siteURL';
		$item = new WC_Product_External();
		$item->set_name( 'External Widget' );
		$item->set_product_url( $link );
		$item->set_regular_price( '10' );
		$product_id = $item->save();

		$block = array(
			'blockName'    => 'themeisle-blocks/review',
			'attrs'        => array(
				'id'       => 'wp-block-themeisle-blocks-review-external-marker',
				'product'  => $product_id,
				'metadata' => array( 'name' => $link ),
				'pros'     => array( $link ),
				'features' => array(
					array(
						'title'  => 'Quality',
						'rating' => 8,
					),
				),
			),
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);
		$attrs = ( new \ThemeIsle\OtterPro\Plugins\Review_Woo_Integration() )->apply_woo_data( $block['attrs'] );
		$html  = ( new \ThemeIsle\GutenbergBlocks\Render\Review_Block() )->render( $attrs );

		$html   = apply_filters( 'render_block', $html, $block, new WP_Block( $block ) );
		$group  = parse_blocks( '<!-- wp:group /-->' )[0];
		$output = apply_filters( 'render_block', '<div>' . $html . '</div>', $group, new WP_Block( $group ) );

		$processor = new WP_HTML_Tag_Processor( $output );
		$this->assertTrue( $processor->next_tag( 'a' ), $output );
		$this->assertSame( $link, $processor->get_attribute( 'href' ), $output );
	}

	/**
	 * Stored site options are data even when a block attribute contains the same marker.
	 *
	 * @dataProvider site_option_blocks
	 */
	public function test_site_option_markers_stay_literal_with_authored_attribute( string $block, string $option ): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );
		$tag      = '{otterDynamic?type=loggedInUserEmail}';
		$previous = get_option( $option );
		update_option( $option, $tag );
		$output = do_blocks( '<!-- wp:' . $block . ' ' . wp_json_encode( array( 'className' => 'marker-' . $tag ) ) . ' /-->' );
		update_option( $option, $previous );
		$this->assertStringContainsString( 'marker-viewer@example.org', $output );
		$this->assertSame( $tag, html_entity_decode( wp_strip_all_tags( $output ), ENT_QUOTES ) );
	}

	public function site_option_blocks(): array {
		return array(
			'title'   => array( 'site-title', 'blogname' ),
			'tagline' => array( 'site-tagline', 'blogdescription' ),
		);
	}

	public function test_legacy_rss_feed_title_stays_literal_with_authored_attribute(): void {
		wp_set_current_user( $this->factory()->user->create( array( 'user_email' => 'viewer@example.org' ) ) );
		$tag      = '{otterDynamic?type=loggedInUserEmail}';
		$feed     = 'https://feed.example/' . wp_generate_password( 8, false ) . '.xml';
		$xml      = '<?xml version="1.0"?><rss version="2.0"><channel><title>' . $tag . '</title><link>https://feed.example/</link><description>Feed</description><item><title>Item</title><link>https://feed.example/1</link></item></channel></rss>';
		$stub     = static function ( $response, array $args, string $url ) use ( $feed, $xml ) {
			return $url === $feed ? array(
				'headers'  => array( 'content-type' => 'application/rss+xml' ),
				'body'     => $xml,
				'response' => array(
					'code'    => 200,
					'message' => 'OK',
				),
				'cookies'  => array(),
				'filename' => null,
			) : $response;
		};
		$instance = serialize(
			array(
				'title' => '',
				'url'   => $feed,
				'items' => 1,
			)
		);
		$attrs    = array(
			'idBase'    => 'rss',
			'className' => 'marker-' . $tag,
			'instance'  => array(
				'encoded' => base64_encode( $instance ),
				'hash'    => wp_hash( $instance ),
			),
		);
		add_filter( 'pre_http_request', $stub, 10, 3 );
		try {
			$output = do_blocks( '<!-- wp:legacy-widget ' . wp_json_encode( $attrs ) . ' /-->' );
		} finally {
			remove_filter( 'pre_http_request', $stub, 10 );
		}
		$this->assertStringContainsString( 'Item', $output );
		$this->assertStringNotContainsString( '>viewer@example.org</a>', $output );
		$this->assertStringContainsString( '>' . $tag . '</a>', html_entity_decode( $output, ENT_QUOTES ) );
	}

	/**
	 * @dataProvider authored_review_media
	 */
	public function test_attribute_only_review_markers_resolve( string $state, bool $with_image ): void {
		if ( ! defined( 'OTTER_PRO_BASEFILE' ) ) {
			require_once dirname( __DIR__ ) . '/plugins/otter-pro/otter-pro.php';
		}
		$attrs = array(
			'id'       => 'wp-block-themeisle-blocks-review-authored',
			'title'    => 'Review',
			'features' => array(
				array(
					'title'  => 'Quality',
					'rating' => 8,
				),
			),
			'links'    => array(
				array(
					'label' => 'Visit',
					'href'  => '#otterDynamicLink?type=siteURL',
				),
			),
			'image'    => array(
				'url' => get_rest_url( null, 'otter/v1' ) . '/dynamic/?type=featuredImage',
				'alt' => 'Preview',
			),
		);
		if ( ! $with_image ) {
			unset( $attrs['image'] );
		}
		$integration = new \ThemeIsle\OtterPro\Plugins\Review_Woo_Integration();
		if ( 'deleted product' === $state ) {
			$attrs['product'] = $this->factory()->post->create( array( 'post_type' => 'product' ) );
			wp_delete_post( $attrs['product'], true );
			add_filter( 'otter_blocks_review_block_woocommerce', array( $integration, 'apply_woo_data' ), 1 );
		} elseif ( 'inactive license' === $state ) {
			$item = new WC_Product_Simple();
			$item->set_name( 'Product' );
			$attrs['product'] = $item->save();
			remove_all_filters( 'otter_blocks_review_block_woocommerce' );
			$option = str_replace( '-', '_', basename( dirname( OTTER_PRO_BASEFILE ) ) ) . '_license_data';
			update_option( $option, (object) array( 'license' => 'expired' ) );
			$integration->init();
			$this->assertFalse( has_filter( 'otter_blocks_review_block_woocommerce' ) );
		}
		try {
			$output = do_blocks( '<!-- wp:themeisle-blocks/review ' . wp_json_encode( $attrs ) . ' /-->' );
		} finally {
			remove_filter( 'otter_blocks_review_block_woocommerce', array( $integration, 'apply_woo_data' ), 1 );
		}
		$processor = new WP_HTML_Tag_Processor( $output );
		if ( $with_image ) {
			$this->assertTrue( $processor->next_tag( 'img' ), $output );
			$this->assertSame( OTTER_BLOCKS_URL . 'assets/images/placeholder.jpg', $processor->get_attribute( 'src' ), $output );
		}
		$this->assertTrue( $processor->next_tag( 'a' ), $output );
		$this->assertSame( get_site_url(), $processor->get_attribute( 'href' ), $output );
	}

	public function authored_review_media(): array {
		return array(
			'authored link'    => array( 'authored', false ),
			'authored image'   => array( 'authored', true ),
			'deleted product'  => array( 'deleted product', false ),
			'inactive license' => array( 'inactive license', false ),
		);
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
