<?php
/**
 * Test Blocks CSS frontend rendering.
 *
 * @package otter-blocks
 */

use ThemeIsle\GutenbergBlocks\Blocks_CSS;
use ThemeIsle\GutenbergBlocks\CSS\Block_Frontend;

/**
 * Blocks CSS running as the standalone plugin (without Otter).
 */
class Blocks_CSS_Standalone_Stub extends Blocks_CSS {

	/**
	 * Force the standalone path, since the test bootstrap loads Otter.
	 *
	 * @return bool
	 */
	protected function is_standalone() {
		return true;
	}
}

/**
 * Class Test_Blocks_CSS.
 */
class Test_Blocks_CSS extends WP_UnitTestCase {

	/**
	 * Category holding the archive posts.
	 *
	 * @var int
	 */
	private $category_id;

	/**
	 * Set up.
	 */
	public function set_up() {
		parent::set_up();

		// Otter's pipeline would generate stylesheets on visit.
		remove_action( 'wp', array( Block_Frontend::instance(), 'render_post_css' ), 10 );

		$this->category_id = self::factory()->category->create( array( 'name' => 'Blocks CSS Archive' ) );
	}

	/**
	 * Tear down.
	 */
	public function tear_down() {
		wp_delete_term( $this->category_id, 'category' );

		add_action( 'wp', array( Block_Frontend::instance(), 'render_post_css' ), 10 );

		parent::tear_down();
	}

	/**
	 * Build a paragraph block carrying custom CSS.
	 *
	 * @param string $css Custom CSS.
	 *
	 * @return string
	 */
	private function block_with_css( $css ) {
		return '<!-- wp:paragraph ' . wp_json_encode(
			array(
				'hasCustomCSS' => true,
				'customCSS'    => $css,
			)
		) . ' --><p>Text</p><!-- /wp:paragraph -->';
	}

	/**
	 * Create a post in the archive category.
	 *
	 * @param string $content Post content.
	 * @param int    $age     Days in the past, to control archive order.
	 * @param array  $args    Extra post args.
	 *
	 * @return int
	 */
	private function create_archive_post( $content, $age, $args = array() ) {
		return self::factory()->post->create(
			array_merge(
				array(
					'post_content'  => $content,
					'post_category' => array( $this->category_id ),
					'post_date'     => gmdate( 'Y-m-d H:i:s', time() - $age * DAY_IN_SECONDS ),
				),
				$args
			)
		);
	}

	/**
	 * Capture the CSS printed in wp_head.
	 *
	 * @param Blocks_CSS $blocks_css Instance to render with.
	 *
	 * @return string
	 */
	private function render( $blocks_css ) {
		ob_start();
		$blocks_css->render_server_side_css();
		return ob_get_clean();
	}

	/**
	 * Every post in an archive contributes its custom CSS.
	 */
	public function test_archive_renders_css_of_all_posts() {
		$this->create_archive_post( $this->block_with_css( '.ticss-first{color:red}' ), 1 );
		$this->create_archive_post( $this->block_with_css( '.ticss-second{color:blue}' ), 2 );
		$this->create_archive_post( $this->block_with_css( '.ticss-third{color:green}' ), 3 );

		$this->go_to( get_category_link( $this->category_id ) );

		$output = $this->render( new Blocks_CSS_Standalone_Stub() );

		$this->assertStringContainsString( '.ticss-first{color:red}', $output );
		$this->assertStringContainsString( '.ticss-second{color:blue}', $output );
		$this->assertStringContainsString( '.ticss-third{color:green}', $output );
		$this->assertSame( 1, substr_count( $output, '.ticss-first{color:red}' ) );
		$this->assertSame( 1, substr_count( $output, '<style' ) );
	}

	/**
	 * A first archive post without blocks does not hide the others' CSS.
	 */
	public function test_archive_first_post_without_blocks() {
		$this->create_archive_post( '<p>Classic content</p>', 1 );
		$this->create_archive_post( $this->block_with_css( '.ticss-second{color:blue}' ), 2 );

		$this->go_to( get_category_link( $this->category_id ) );

		$this->assertStringContainsString( '.ticss-second{color:blue}', $this->render( new Blocks_CSS_Standalone_Stub() ) );
	}

	/**
	 * Password protected archive posts are skipped.
	 */
	public function test_archive_skips_password_protected_posts() {
		$this->create_archive_post( $this->block_with_css( '.ticss-public{color:red}' ), 1 );
		$this->create_archive_post( $this->block_with_css( '.ticss-locked{color:blue}' ), 2, array( 'post_password' => 'secret' ) );

		$this->go_to( get_category_link( $this->category_id ) );

		$output = $this->render( new Blocks_CSS_Standalone_Stub() );

		$this->assertStringContainsString( '.ticss-public{color:red}', $output );
		$this->assertStringNotContainsString( '.ticss-locked{color:blue}', $output );
	}

	/**
	 * Posts covered by Otter's stylesheet do not get inline CSS.
	 */
	public function test_archive_skips_posts_with_otter_stylesheet() {
		$this->create_archive_post( $this->block_with_css( '.ticss-inline{color:red}' ), 1 );
		$covered = $this->create_archive_post( $this->block_with_css( '.ticss-covered{color:blue}' ), 2 );
		update_post_meta( $covered, '_themeisle_gutenberg_block_stylesheet', 'post-v2-' . $covered );

		$this->go_to( get_category_link( $this->category_id ) );

		$output = $this->render( new Blocks_CSS_Standalone_Stub() );

		$this->assertStringContainsString( '.ticss-inline{color:red}', $output );
		$this->assertStringNotContainsString( '.ticss-covered{color:blue}', $output );
	}

	/**
	 * A single post still renders only its own CSS.
	 */
	public function test_singular_renders_only_own_css() {
		$post_id = $this->create_archive_post( $this->block_with_css( '.ticss-own{color:red}' ), 1 );
		$this->create_archive_post( $this->block_with_css( '.ticss-other{color:blue}' ), 2 );

		$this->go_to( get_permalink( $post_id ) );

		$output = $this->render( new Blocks_CSS_Standalone_Stub() );

		$this->assertStringContainsString( '.ticss-own{color:red}', $output );
		$this->assertStringNotContainsString( '.ticss-other{color:blue}', $output );
	}

	/**
	 * With Otter active, archives are left to Otter's own pipeline.
	 */
	public function test_archive_left_to_otter_when_active() {
		$this->create_archive_post( $this->block_with_css( '.ticss-first{color:red}' ), 1 );
		$this->create_archive_post( $this->block_with_css( '.ticss-second{color:blue}' ), 2 );

		$this->go_to( get_category_link( $this->category_id ) );

		$this->assertStringNotContainsString( '.ticss-second{color:blue}', $this->render( new Blocks_CSS() ) );
	}
}
