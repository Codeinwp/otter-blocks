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
		'cropImage' => false,
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
	 * Test the fetching of patterns.
	 */
	public function test_render_sanitization() {
		$this->post_grid_block = new Posts_Grid_Block();
		WP_Block_Supports::init();
		WP_Block_Supports::$block_to_render = array( 'blockName' => 'themeisle-blocks/posts-grid' );

		$base_attributes = $this->attributes;

		$output = $this->post_grid_block->render( $base_attributes );
		$expected = '<div class="wp-block-themeisle-blocks-posts-grid" id="wp-block-themeisle-blocks-posts-grid-a94bab18"><div class="is-grid o-posts-grid-columns-2"></div> </div>';
		$this->assertEquals( $expected, $output );

		$malformed_attributes = $base_attributes;
		$malformed_attributes['id'] = 'wp-block-themeisle-blocks-posts-grid-12345\\"onmouseover=alert(123) b=';

		// We expect the id to be sanitized.
		$expected = '<div class="wp-block-themeisle-blocks-posts-grid" id="wp-block-themeisle-blocks-posts-grid-12345\&quot;onmouseover=alert(123) b="><div class="is-grid o-posts-grid-columns-2"></div> </div>';
		$output = $this->post_grid_block->render( $malformed_attributes );

		$this->assertEquals( $expected, $output );
	}
}
