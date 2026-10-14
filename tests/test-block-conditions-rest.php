<?php
/**
 * Block Conditions outside regular page renders.
 *
 * @package gutenberg-blocks
 */

/**
 * Conditions must apply to REST and admin-ajax renders, except editor previews.
 */
class Test_Block_Conditions_Rest extends WP_UnitTestCase {

	/**
	 * Paragraph only administrators may see, followed by a public one.
	 */
	const CONTENT = '<!-- wp:paragraph {"otterConditions":[[{"type":"userRoles","roles":["administrator"]}]]} --><p>SECRET</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>PUBLIC</p><!-- /wp:paragraph -->';

	/**
	 * Only an editor's edit-context REST request skips conditions; view-context renders apply them.
	 */
	public function test_rest_render_applies_conditions_outside_edit_context(): void {
		$previous_user = get_current_user_id();
		$post_id       = self::factory()->post->create( array( 'post_content' => self::CONTENT ) );
		$editor_id     = self::factory()->user->create( array( 'role' => 'editor' ) );

		try {
			wp_set_current_user( 0 );
			$visitor = $this->get_post_over_rest( $post_id, 'view' );

			wp_set_current_user( $editor_id );
			$editor_view = $this->get_post_over_rest( $post_id, 'view' );
			$editor_edit = $this->get_post_over_rest( $post_id, 'edit' );
		} finally {
			wp_set_current_user( $previous_user );
			$GLOBALS['wp_rest_server'] = null;
		}

		$this->assertStringNotContainsString( 'SECRET', $visitor['content']['rendered'] );
		$this->assertStringNotContainsString( 'SECRET', $visitor['excerpt']['rendered'] );
		$this->assertStringContainsString( 'PUBLIC', $visitor['content']['rendered'] );
		$this->assertStringNotContainsString( 'SECRET', $editor_view['content']['rendered'] );
		$this->assertStringContainsString( 'SECRET', $editor_edit['content']['rendered'] );
	}

	/**
	 * Admin-ajax serves front-end requests too, so it gets no bypass.
	 */
	public function test_admin_ajax_render_applies_conditions(): void {
		$previous_user = get_current_user_id();
		wp_set_current_user( 0 );
		add_filter( 'wp_doing_ajax', '__return_true' );
		set_current_screen( 'dashboard' );

		try {
			$output = do_blocks( self::CONTENT );
		} finally {
			$GLOBALS['current_screen'] = null;
			wp_set_current_user( $previous_user );
		}

		$this->assertStringNotContainsString( 'SECRET', $output );
		$this->assertStringContainsString( 'PUBLIC', $output );
	}

	/**
	 * Fetch a post from the posts endpoint as the current user.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $context REST context, 'view' or 'edit'.
	 * @return array{content: array{rendered: string}, excerpt: array{rendered: string}}
	 */
	private function get_post_over_rest( int $post_id, string $context ): array {
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', $context );

		return rest_get_server()->dispatch( $request )->get_data();
	}
}
