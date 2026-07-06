<?php
/**
 * Class Test_Review_Block
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Render\Review_Block;

/**
 * Review block render and JSON-LD schema test case.
 */
class Test_Review_Block extends WP_UnitTestCase {

	/**
	 * The review block instance.
	 *
	 * @var Review_Block
	 */
	protected $block;

	/**
	 * Set up: fresh instance and a clean schema-dedupe registry.
	 */
	public function set_up() {
		parent::set_up();
		$this->block = new Review_Block();

		$added_schemas = new ReflectionProperty( Review_Block::class, 'added_schemas' );
		$added_schemas->setAccessible( true );
		$added_schemas->setValue( null, array() );

		// get_block_wrapper_attributes() reads the block being rendered from here.
		WP_Block_Supports::$block_to_render = array(
			'blockName' => 'themeisle-blocks/review',
			'attrs'     => array(),
		);
	}

	/**
	 * Tear down: clear the render context.
	 */
	public function tear_down() {
		WP_Block_Supports::$block_to_render = null;
		parent::tear_down();
	}

	/**
	 * Overall rating averages the features, clamps at a minimum of 1 and honors the scale.
	 */
	public function test_get_overall_ratings() {
		$this->assertSame( 0, $this->block->get_overall_ratings( array() ) );

		$features = array(
			array( 'rating' => 8 ),
			array( 'rating' => 9 ),
		);
		$this->assertEquals( 8.5, $this->block->get_overall_ratings( $features ) );
		$this->assertEquals( 4.3, $this->block->get_overall_ratings( $features, 2 ), 'Scale 2 should halve the average' );

		$this->assertEquals( 1, $this->block->get_overall_ratings( array( array( 'rating' => 0.5 ) ) ), 'Ratings should clamp at a minimum of 1' );
	}

	/**
	 * Star markup renders 10 stars on the 1-10 scale, 5 on the 1-5 scale, filled per rating.
	 */
	public function test_get_overall_stars() {
		$stars = $this->block->get_overall_stars( 7 );
		$this->assertSame( 10, substr_count( $stars, '<svg' ) );
		$this->assertSame( 7, substr_count( $stars, 'class="filled"' ) );

		$stars = $this->block->get_overall_stars( 7, 2 );
		$this->assertSame( 5, substr_count( $stars, '<svg' ) );
		$this->assertSame( 4, substr_count( $stars, 'class="filled"' ), '7/2 rounds to 4 filled stars on the 5 scale' );
	}

	/**
	 * The JSON-LD schema exposes the product, a 5-scale rating, author, pros/cons and offers.
	 */
	public function test_get_json_ld_full_shape() {
		$author_id = self::factory()->user->create( array( 'display_name' => 'Jane Reviewer' ) );
		$post_id   = self::factory()->post->create( array( 'post_author' => $author_id ) );

		$json = $this->block->get_json_ld(
			array(
				'title'       => 'Great <Product>',
				'description' => 'A solid pick',
				'image'       => array( 'url' => 'http://example.org/p.png' ),
				'features'    => array( array( 'rating' => 8 ), array( 'rating' => 10 ) ),
				'pros'        => array( 'Fast', 'Cheap' ),
				'cons'        => array( 'Loud' ),
				'price'       => '9.99',
				'currency'    => 'EUR',
				'links'       => array(
					array( 'href' => 'http://example.org/buy' ),
				),
			),
			$post_id
		);

		$this->assertSame( 'Product', $json['@type'] );
		$this->assertStringNotContainsString( '<', $json['name'] );
		$this->assertSame( 'http://example.org/p.png', $json['image'] );
		$this->assertEquals( 4.5, $json['review']['reviewRating']['ratingValue'], 'Rating should be on the 5 scale' );
		$this->assertSame( 5, $json['review']['reviewRating']['bestRating'] );
		$this->assertSame( 'Jane Reviewer', $json['review']['author']['name'] );

		$this->assertCount( 2, $json['review']['positiveNotes']['itemListElement'] );
		$this->assertSame( 'Fast', $json['review']['positiveNotes']['itemListElement'][0]['name'] );
		$this->assertSame( 2, $json['review']['positiveNotes']['itemListElement'][1]['position'] );
		$this->assertCount( 1, $json['review']['negativeNotes']['itemListElement'] );

		$this->assertSame( 'Offer', $json['offers']['@type'], 'A single link should produce a single offer object' );
		$this->assertSame( 'EUR', $json['offers']['priceCurrency'] );
		$this->assertSame( '9.99', $json['offers']['price'] );
	}

	/**
	 * Multiple links produce an offers array; links without href or price produce none.
	 */
	public function test_get_json_ld_offers_variants() {
		$base = array(
			'title'    => 'Product',
			'features' => array( array( 'rating' => 8 ) ),
			'price'    => '5',
		);

		$json = $this->block->get_json_ld(
			$base + array(
				'links' => array(
					array( 'href' => 'http://example.org/a' ),
					array( 'href' => 'http://example.org/b' ),
					array( 'href' => '' ),
				),
			),
			0
		);
		$this->assertCount( 2, $json['offers'], 'Two valid links should produce an offers array; the empty href is skipped' );

		$json = $this->block->get_json_ld(
			array(
				'title'    => 'Product',
				'features' => array( array( 'rating' => 8 ) ),
				'links'    => array( array( 'href' => 'http://example.org/a' ) ),
			),
			0
		);
		$this->assertArrayNotHasKey( 'offers', $json, 'Links without a price should not produce offers' );
	}

	/**
	 * Currency symbols resolve for known codes and fall back to the dollar sign.
	 */
	public function test_get_currency() {
		$this->assertSame( '&euro;', Review_Block::get_currency( 'EUR' ) );
		$this->assertSame( '&#36;', Review_Block::get_currency( 'USD' ) );
		$this->assertSame( '&#36;', Review_Block::get_currency( 'NOT_A_CODE' ) );
	}

	/**
	 * Render outputs the pros/cons columns, sponsored/nofollow links and layout classes.
	 */
	public function test_render_pros_cons_and_links() {
		$output = $this->block->render(
			array(
				'title'    => 'My Product',
				'features' => array( array( 'title' => 'Speed', 'rating' => 8 ) ),
				'pros'     => array( 'Fast' ),
				'cons'     => array( 'Loud' ),
				'links'    => array(
					array(
						'href'        => 'http://example.org/buy',
						'label'       => 'Buy now',
						'isSponsored' => true,
					),
					array(
						'href'  => 'http://example.org/info',
						'label' => 'Learn more',
					),
				),
			)
		);

		$this->assertStringContainsString( 'My Product', $output );
		$this->assertStringContainsString( 'o-review__left_feature_title', $output );
		$this->assertStringContainsString( 'Fast', $output );
		$this->assertStringContainsString( 'Loud', $output );
		$this->assertStringContainsString( 'rel="sponsored"', $output );
		$this->assertStringContainsString( 'rel="nofollow"', $output );
		$this->assertStringContainsString( 'target="_blank"', $output, 'Links default to a blank target' );
		$this->assertStringNotContainsString( 'no-pros-cons', $output );
	}

	/**
	 * Without pros/cons and links, the layout classes reflect the missing sections.
	 */
	public function test_render_layout_classes_without_sections() {
		$output = $this->block->render(
			array(
				'title'    => 'My Product',
				'features' => array( array( 'rating' => 8 ) ),
			)
		);

		$this->assertStringContainsString( 'no-pros-cons', $output );
		$this->assertStringContainsString( 'no-footer', $output );
	}

	/**
	 * The JSON-LD schema is printed once per post in the footer, and not at all
	 * when the schema option is disabled.
	 */
	public function test_render_schema_footer_dedupe_and_option() {
		remove_all_actions( 'wp_footer' );

		$attributes = array(
			'title'    => 'My Product',
			'features' => array( array( 'rating' => 8 ) ),
		);

		$this->block->render( $attributes );
		$this->block->render( $attributes );

		ob_start();
		do_action( 'wp_footer' );
		$footer = ob_get_clean();

		$this->assertSame( 1, substr_count( $footer, 'application/ld+json' ), 'The schema should be printed once per post' );

		remove_all_actions( 'wp_footer' );
		update_option( 'themeisle_blocks_settings_disable_review_schema', false );

		$this->block->render( $attributes );

		ob_start();
		do_action( 'wp_footer' );
		$footer = ob_get_clean();

		$this->assertStringNotContainsString( 'application/ld+json', $footer, 'No schema expected when the option is disabled' );
	}
}
