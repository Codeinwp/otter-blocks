<?php
/**
 * Dynamic content REST permission tests.
 *
 * @package gutenberg-blocks
 */

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
	 * Visitors cannot read password-protected or non-viewable published posts.
	 */
	public function test_visitor_cannot_preview_protected_or_non_viewable_posts(): void {
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
		$this->assertTrue( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postTitle', 'context' => $public ) ) );
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
	 * Editors still preview what they can edit, and a visitor who entered the post password passes.
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
			$this->assertTrue( $this->can_request( '/otter/v1/dynamic/preview', array( 'type' => 'postExcerpt', 'context' => $protected ) ) );
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
}
