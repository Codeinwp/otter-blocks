<?php
/**
 * Dynamic content REST permission tests.
 *
 * @package gutenberg-blocks
 */

if ( ! function_exists( 'acf_get_field' ) ) {
	require_once __DIR__ . '/php/acf-parent-cycle.php';
}

/**
 * Access rules of the otter/v1/dynamic routes for visitors and editors.
 */
class Test_Dynamic_Content_Server extends WP_UnitTestCase {

	/**
	 * User before the test.
	 *
	 * @var int
	 */
	private $previous_user = 0;

	/**
	 * Run each test as a visitor.
	 */
	public function set_up(): void {
		parent::set_up();

		$this->previous_user = get_current_user_id();
		wp_set_current_user( 0 );
	}

	/**
	 * Restore the user and drop the REST server built for the test.
	 */
	public function tear_down(): void {
		wp_set_current_user( $this->previous_user );
		$GLOBALS['wp_rest_server'] = null;

		parent::tear_down();
	}

	/**
	 * The preview route is for the editor only, so visitors cannot use it on any post.
	 */
	public function test_visitor_cannot_preview_any_post(): void {
		$protected = self::factory()->post->create(
			array(
				'post_excerpt'  => 'Secret excerpt',
				'post_password' => 'pass',
			)
		);
		$pattern   = self::factory()->post->create( array( 'post_type' => 'wp_block' ) );
		$public    = self::factory()->post->create();

		$this->assertFalse( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postExcerpt', 'context' => $protected ) ) );
		$this->assertFalse( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postContent', 'context' => $pattern ) ) );
		$this->assertFalse( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postTitle', 'context' => $public ) ) );

		$request = new WP_REST_Request( 'GET', '/otter/v1/dynamic/preview' );
		$request->set_query_params( array( 'type' => 'postTitle', 'context' => $public ) );
		$this->assertSame( 401, rest_do_request( $request )->get_status() );
	}

	/**
	 * Users who can edit the post keep the preview, a contributor included on an own draft.
	 */
	public function test_users_who_can_edit_the_post_can_preview(): void {
		$contributor = self::factory()->user->create( array( 'role' => 'contributor' ) );
		$own_draft   = self::factory()->post->create(
			array(
				'post_author' => $contributor,
				'post_status' => 'draft',
			)
		);
		$other_post  = self::factory()->post->create();

		wp_set_current_user( $contributor );
		$this->assertTrue( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postTitle', 'context' => $own_draft ) ) );
		$this->assertFalse( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postTitle', 'context' => $other_post ) ) );
	}

	/**
	 * The preview returns public author fields and never the author email.
	 */
	public function test_preview_author_meta_returns_only_public_fields(): void {
		$author  = self::factory()->user->create(
			array(
				'role'         => 'author',
				'display_name' => 'Public Name',
				'user_email'   => 'author-private@example.org',
			)
		);
		$post_id = self::factory()->post->create( array( 'post_author' => $author ) );
		$pro     = new \ThemeIsle\OtterPro\Plugins\Dynamic_Content();
		add_filter( 'otter_blocks_evaluate_dynamic_content_text', array( $pro, 'evaluate_content' ), 10, 2 );

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		// Tests do not define REST_REQUEST, so the context comes from the queried post.
		$this->go_to( get_permalink( $post_id ) );

		$this->assertSame( 'Public Name', $this->preview( array( 'type' => 'authorMeta', 'context' => $post_id, 'metaKey' => 'display_name', 'default' => '' ) ) );
		$this->assertStringNotContainsString( 'author-private@example.org', $this->preview( array( 'type' => 'authorMeta', 'context' => $post_id, 'metaKey' => 'user_email', 'default' => '' ) ) );

		remove_filter( 'otter_blocks_evaluate_dynamic_content_text', array( $pro, 'evaluate_content' ), 10 );
	}

	/**
	 * Dispatch a preview request and return its data.
	 *
	 * @param array<string, string|int> $params Query parameters.
	 * @return string
	 */
	private function preview( array $params ): string {
		$request = new WP_REST_Request( 'GET', '/otter/v1/dynamic/preview' );
		$request->set_query_params( $params );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );

		return (string) $response->get_data();
	}

	/**
	 * The image route shares the check, and its product ID is gated too.
	 */
	public function test_visitor_cannot_load_images_of_non_public_posts(): void {
		$protected = self::factory()->post->create( array( 'post_password' => 'pass' ) );
		$pattern   = self::factory()->post->create( array( 'post_type' => 'wp_block' ) );
		$public    = self::factory()->post->create();
		$draft     = self::factory()->post->create(
			array(
				'post_type'   => 'product',
				'post_status' => 'draft',
			)
		);

		$this->assertFalse( $this->can_request( '/otter/v1/dynamic', array( 'type' => 'featuredImage', 'context' => $protected ) ) );
		$this->assertFalse( $this->can_request( '/otter/v1/dynamic', array( 'type' => 'featuredImage', 'context' => $pattern ) ) );
		$this->assertFalse( $this->can_request( '/otter/v1/dynamic', array( 'type' => 'product', 'context' => $public, 'id' => $draft ) ) );
		$this->assertTrue( $this->can_request( '/otter/v1/dynamic', array( 'type' => 'featuredImage', 'context' => $public ) ) );
	}

	/**
	 * Editors still preview what they can edit, and a visitor who entered the post password can load its images.
	 */
	public function test_editors_and_unlocked_visitors_keep_access(): void {
		$protected = self::factory()->post->create( array( 'post_password' => 'pass' ) );
		$pattern   = self::factory()->post->create( array( 'post_type' => 'wp_block' ) );

		$this->assertFalse( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postTitle', 'context' => $pattern ) ) );

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		$this->assertTrue( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postContent', 'context' => $pattern ) ) );

		wp_set_current_user( 0 );
		require_once ABSPATH . WPINC . '/class-phpass.php';
		$_COOKIE[ 'wp-postpass_' . COOKIEHASH ] = ( new PasswordHash( 8, true ) )->HashPassword( 'pass' );
		try {
			$this->assertTrue( $this->can_request( '/otter/v1/dynamic', array( 'type' => 'featuredImage', 'context' => $protected ) ) );
		} finally {
			unset( $_COOKIE[ 'wp-postpass_' . COOKIEHASH ] );
		}
	}

	/**
	 * A product ID that is not a product falls back instead of fataling.
	 */
	public function test_product_image_ignores_non_product_id(): void {
		update_option( 'woocommerce_placeholder_image', 0 );

		$request = new WP_REST_Request( 'GET', '/otter/v1/dynamic' );
		$request->set_param( 'type', 'product' );
		$request->set_param( 'id', self::factory()->post->create() );

		$path = ( new \ThemeIsle\OtterPro\Plugins\Dynamic_Content() )->evaluate_content_media_server( 'fallback.jpg', $request );

		$this->assertSame( 'fallback.jpg', $path );
	}

	/**
	 * A rendered product image pointing to a deleted product falls back instead of fataling.
	 */
	public function test_rendered_product_image_ignores_missing_product(): void {
		update_option( 'woocommerce_placeholder_image', 0 );

		$product_id = self::factory()->post->create( array( 'post_type' => 'product' ) );
		wp_delete_post( $product_id, true );

		$value = ( new \ThemeIsle\OtterPro\Plugins\Dynamic_Content() )->evaluate_content_media_content(
			'fallback.jpg',
			array(
				'type' => 'product',
				'id'   => $product_id,
			)
		);

		$this->assertSame( 'fallback.jpg', $value );
	}

	/**
	 * Run the route's permission callback for the given query.
	 *
	 * @param string                    $route  Route path.
	 * @param array<string, string|int> $params Query parameters.
	 * @return bool
	 */
	private function can_request( string $route, array $params ): bool {
		$request = new WP_REST_Request( 'GET', $route );
		$request->set_query_params( $params );

		$handler = rest_get_server()->get_routes()[ $route ][0];

		return true === call_user_func( $handler['permission_callback'], $request );
	}

	/**
	 * The dynamic image does not put a protected post meta value into the path (otter-internals#320).
	 */
	public function test_media_server_blocks_protected_post_meta(): void {
		$post_id = self::factory()->post->create();
		update_post_meta( $post_id, '_img', 'https://evil.example/x.png' );

		$request = new WP_REST_Request( 'GET', '/otter/v1/dynamic' );
		$request->set_param( 'type', 'postMeta' );
		$request->set_param( 'meta', '_img' );
		$request->set_param( 'context', $post_id );

		$path = ( new \ThemeIsle\OtterPro\Plugins\Dynamic_Content() )->evaluate_content_media_server( 'fallback.jpg', $request );

		$this->assertSame( 'fallback.jpg', $path );
	}

	/**
	 * The dynamic image ACF branch does not put a protected field value into the path (otter-internals#320).
	 */
	public function test_media_server_blocks_protected_acf_field(): void {
		$GLOBALS['otter_test_acf_fields'] = array( 'field_secret' => array( 'name' => '_secret', 'value' => 'https://evil.example/x.png' ) );

		$request = new WP_REST_Request( 'GET', '/otter/v1/dynamic' );
		$request->set_param( 'type', 'acf' );
		$request->set_param( 'meta', 'field_secret' );
		$request->set_param( 'context', self::factory()->post->create() );

		$path = ( new \ThemeIsle\OtterPro\Plugins\Dynamic_Content() )->evaluate_content_media_server( 'fallback.jpg', $request );

		$this->assertStringNotContainsString( 'evil.example', $path );

		unset( $GLOBALS['otter_test_acf_fields'] );
	}
}
