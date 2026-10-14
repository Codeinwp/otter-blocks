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
	 * Visitors get no restricted block from the posts endpoint; editors still get it in edit context.
	 *
	 * REST_REQUEST cannot be undefined again, so this runs in its own process.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_rest_render_applies_conditions_outside_edit_context(): void {
		define( 'REST_REQUEST', true );

		$post_id = self::factory()->post->create( array( 'post_content' => self::CONTENT ) );

		wp_set_current_user( 0 );
		$data = rest_get_server()->dispatch( new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id ) )->get_data();

		$this->assertStringNotContainsString( 'SECRET', $data['content']['rendered'] );
		$this->assertStringNotContainsString( 'SECRET', $data['excerpt']['rendered'] );
		$this->assertStringContainsString( 'PUBLIC', $data['content']['rendered'] );

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$data = rest_get_server()->dispatch( $request )->get_data();

		$this->assertStringContainsString( 'SECRET', $data['content']['rendered'] );
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
}
