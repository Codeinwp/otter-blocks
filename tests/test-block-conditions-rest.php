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

	/**
	 * The Post Content preview passes the post ID as `context`; editing that post skips conditions, visitors stay filtered.
	 */
	public function test_dynamic_preview_skips_conditions_only_for_post_editors(): void {
		$previous_user = get_current_user_id();
		$post_id       = self::factory()->post->create( array( 'post_content' => self::CONTENT ) );
		$editor_id     = self::factory()->user->create( array( 'role' => 'editor' ) );
		$this->go_to( get_permalink( $post_id ) );

		try {
			wp_set_current_user( $editor_id );
			$editor = $this->preview_post_content( $post_id );

			wp_set_current_user( 0 );
			$visitor = $this->preview_post_content( $post_id );
		} finally {
			wp_set_current_user( $previous_user );
			$GLOBALS['wp_rest_server'] = null;
		}

		$this->assertStringContainsString( 'SECRET', $editor );
		$this->assertStringNotContainsString( 'SECRET', $visitor );
		$this->assertStringContainsString( 'PUBLIC', $visitor );
	}

	/**
	 * A visitor's `context=edit` on a route that does not validate it still gets conditions applied.
	 */
	public function test_visitor_edit_context_request_applies_conditions(): void {
		$previous_user = get_current_user_id();
		$this->register_render_routes();

		try {
			wp_set_current_user( 0 );
			$request = new WP_REST_Request( 'GET', '/otter-test/v1/render' );
			$request->set_param( 'context', 'edit' );
			$output = (string) rest_get_server()->dispatch( $request )->get_data();
		} finally {
			wp_set_current_user( $previous_user );
			$GLOBALS['wp_rest_server'] = null;
		}

		$this->assertStringNotContainsString( 'SECRET', $output );
		$this->assertStringContainsString( 'PUBLIC', $output );
	}

	/**
	 * A view-context request nested in an editor's edit-context request is filtered, and the outer render is not.
	 */
	public function test_nested_view_request_inside_edit_request_applies_conditions(): void {
		$previous_user = get_current_user_id();
		$this->register_render_routes();

		try {
			wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
			$request = new WP_REST_Request( 'GET', '/otter-test/v1/nested' );
			$request->set_param( 'context', 'edit' );
			$data = rest_get_server()->dispatch( $request )->get_data();
		} finally {
			wp_set_current_user( $previous_user );
			$GLOBALS['wp_rest_server'] = null;
		}

		$this->assertStringNotContainsString( 'SECRET', $data['inner'] );
		$this->assertStringContainsString( 'SECRET', $data['outer'] );
	}

	/**
	 * Preview a post's content through the dynamic content route as the current user.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	private function preview_post_content( int $post_id ): string {
		$request = new WP_REST_Request( 'GET', '/otter/v1/dynamic/preview' );
		$request->set_query_params(
			array(
				'type'    => 'postContent',
				'context' => $post_id,
			)
		);

		return (string) rest_get_server()->dispatch( $request )->get_data();
	}

	/**
	 * Register open routes that render the conditioned content, alone and around a nested view-context request.
	 */
	private function register_render_routes(): void {
		add_action(
			'rest_api_init',
			function (): void {
				register_rest_route(
					'otter-test/v1',
					'/render',
					array(
						'methods'             => 'GET',
						'permission_callback' => '__return_true',
						'callback'            => function (): string {
							return do_blocks( self::CONTENT );
						},
					)
				);
				register_rest_route(
					'otter-test/v1',
					'/nested',
					array(
						'methods'             => 'GET',
						'permission_callback' => '__return_true',
						'callback'            => function (): array {
							return array(
								'inner' => rest_do_request( new WP_REST_Request( 'GET', '/otter-test/v1/render' ) )->get_data(),
								'outer' => do_blocks( self::CONTENT ),
							);
						},
					)
				);
			}
		);
		$GLOBALS['wp_rest_server'] = null;
	}
}
