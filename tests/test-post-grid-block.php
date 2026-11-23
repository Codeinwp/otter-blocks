<?php
/**
 * Test Post Grid Block.
 *
 * @package otter-blocks
 * @copyright   Copyright (c) 2024, Bogdan Preda
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @since 2.6.6
 */

use ThemeIsle\GutenbergBlocks\Render\Posts_Grid_Block;

/**
 * Class Test Post Grid Block.
 */
class Test_Post_Grid_Block extends WP_UnitTestCase {

	/**
	 * Post Grid Block.
	 *
	 * @var Posts_Grid_Block
	 */
	private $post_grid_block;


	private $attributes = array(
		'id' => 'wp-block-themeisle-blocks-posts-grid-a94bab18',
		'columns' => 2,
		'className' => '',
		'style' => 'grid',
		'postTypes' => array(),
		'template' => array(
			0 => 'category',
			1 => 'title',
			2 => 'meta',
			3 => 'description',
		),
		'postsToShow' => 5,
		'order' => 'desc',
		'orderBy' => 'date',
		'offset' => 0,
		'imageSize' => 'full',
		'displayFeaturedImage' => true,
		'displayCategory' => true,
		'displayTitle' => true,
		'titleTag' => 'h5',
		'displayMeta' => true,
		'displayDescription' => true,
		'excerptLength' => 100,
		'displayDate' => true,
		'displayUpdatedDate' => false,
		'displayAuthor' => true,
		'displayComments' => true,
		'displayPostCategory' => false,
		'displayReadMoreLink' => false,
		'boxShadow' => array(
			'active' => false,
			'colorOpacity' => 50,
			'blur' => 5,
			'spread' => 1,
			'horizontal' => 0,
			'vertical' => 0,
		),
		'imageBoxShadow' => array(
			'active' => false,
			'colorOpacity' => 50,
			'blur' => 5,
			'spread' => 1,
			'horizontal' => 0,
			'vertical' => 0,
		),
		'hasPagination' => false,
		'hasCustomCSS' => false,
		'customCSS' => '',
		'otterConditions' => array(),
	);

	/**
	 * Test the rendering of the block.
	 */
	public function test_render() {
		$this->post_grid_block = new Posts_Grid_Block();
		WP_Block_Supports::init();
		WP_Block_Supports::$block_to_render = array( 'blockName' => 'themeisle-blocks/posts-grid' );

		$base_attributes = unserialize(serialize($this->attributes));

		$output = $this->post_grid_block->render( $base_attributes );
		$expected = '<div class="wp-block-themeisle-blocks-posts-grid" id="wp-block-themeisle-blocks-posts-grid-a94bab18"><div class="is-grid o-posts-grid-columns-2"></div> </div>';
		$this->assertEquals( $expected, $output );
	}

	/**
	 * Test the rendering of the item post title.
	 */
	public function test_render_post_title() {
		$this->post_grid_block = new Posts_Grid_Block();

		$output = $this->post_grid_block->render_post_title( 'h3', 'www.example.com', 'Title' );
		$expected = '<h3 class="o-posts-grid-post-title"><a href="http://www.example.com">Title</a></h3>';
		$this->assertEquals( $expected, $output );
	}

	/**
	 * Test render sanitization.
	 */
	public function test_render_sanitization() {
		$this->post_grid_block = new Posts_Grid_Block();
		WP_Block_Supports::init();
		WP_Block_Supports::$block_to_render = array( 'blockName' => 'themeisle-blocks/posts-grid' );
		
		$malformed_attributes = unserialize(serialize($this->attributes));
		$malformed_attributes['id'] = 'wp-block-themeisle-blocks-posts-grid-12345\\"onmouseover=alert(123) b=';
		$malformed_attributes['titleTag'] = 'h3 onmouseover=alert(456)';

		// We expect the id to be sanitized.
		$expected = '<div class="wp-block-themeisle-blocks-posts-grid" id="wp-block-themeisle-blocks-posts-grid-12345\&quot;onmouseover=alert(123) b="><div class="is-grid o-posts-grid-columns-2"></div> </div>';
		$output = $this->post_grid_block->render( $malformed_attributes );

		$this->assertEquals( $expected, $output );

		// We expect the titleTag to be sanitized.
		$expected = '<h4 class="o-posts-grid-post-title"><a href="http://www.example.com">Title</a></h4>';
		$output = $this->post_grid_block->render_post_title( $malformed_attributes['titleTag'], 'www.example.com', 'Title' );

		$this->assertEquals( $expected, $output );
	}

	/**
	 * Render the block for the given post types and return its HTML.
	 *
	 * @param string[] $post_types Post types to query.
	 * @return string
	 */
	private function render_for_post_types( $post_types ) {
		$this->post_grid_block = new Posts_Grid_Block();
		WP_Block_Supports::init();
		WP_Block_Supports::$block_to_render = array( 'blockName' => 'themeisle-blocks/posts-grid' );

		$attributes              = unserialize( serialize( $this->attributes ) );
		$attributes['postTypes'] = $post_types;

		return $this->post_grid_block->render( $attributes );
	}

	/**
	 * A non-public post type is never queried, so its records cannot be exposed
	 * through the block (otter-internals#319).
	 */
	public function test_render_skips_non_public_post_types() {
		register_post_type(
			'otter_secret',
			array(
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
			)
		);
		$this->factory()->post->create(
			array(
				'post_type'   => 'otter_secret',
				'post_status' => 'publish',
				'post_title'  => 'Secret Record Title',
			)
		);
		$this->factory()->post->create(
			array(
				'post_type'   => 'post',
				'post_status' => 'publish',
				'post_title'  => 'Public Blog Title',
			)
		);

		$only_secret = $this->render_for_post_types( array( 'otter_secret' ) );
		$this->assertStringNotContainsString( 'Secret Record Title', $only_secret );
		// The early return shows nothing for an all-non-viewable list, rather than falling back to posts.
		$this->assertStringNotContainsString( 'Public Blog Title', $only_secret );

		$mixed = $this->render_for_post_types( array( 'otter_secret', 'post' ) );
		$this->assertStringNotContainsString( 'Secret Record Title', $mixed );
		$this->assertStringContainsString( 'Public Blog Title', $mixed );

		unregister_post_type( 'otter_secret' );
	}

	/**
	 * A public post type still renders, so the filter does not block normal use.
	 */
	public function test_render_keeps_public_post_types() {
		$this->factory()->post->create(
			array(
				'post_type'   => 'post',
				'post_status' => 'publish',
				'post_title'  => 'Public Blog Title',
			)
		);

		$this->assertStringContainsString( 'Public Blog Title', $this->render_for_post_types( array( 'post' ) ) );
	}
}
