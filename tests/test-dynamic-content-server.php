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
	/**
	 * Post meta values that are not image attachments return the placeholder.
	 */
	public function test_media_server_returns_placeholder_for_non_attachment_meta(): void {
		$outside = trailingslashit( WP_CONTENT_DIR ) . 'otter-media-outside.png';
		copy( __DIR__ . '/assets/test-img.png', $outside );

		$uploads   = wp_get_upload_dir();
		$text_file = trailingslashit( $uploads['basedir'] ) . 'otter-media-text.txt';
		file_put_contents( $text_file, 'not an image' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$placeholder = file_get_contents( OTTER_BLOCKS_PATH . '/assets/images/placeholder.jpg' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$values      = array(
			$text_file,
			$outside,
			ABSPATH . 'wp-load.php',
			'http://127.0.0.1/',
			'php://filter/resource=' . $text_file,
			'phar://' . $text_file . '/x',
		);

		try {
			foreach ( $values as $value ) {
				$this->assertSame( $placeholder, $this->get_post_meta_image( $value ), $value );
			}
		} finally {
			unlink( $outside );
			unlink( $text_file );
		}
	}

	/**
	 * An attachment URL stored in post meta returns the attachment image.
	 */
	public function test_media_server_returns_attachment_from_meta_url(): void {
		$attachment = self::factory()->attachment->create_upload_object( __DIR__ . '/assets/test-img.png' );

		$output = $this->get_post_meta_image( wp_get_attachment_url( $attachment ) );

		$this->assertSame( file_get_contents( wp_get_original_image_path( $attachment ) ), $output ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	}

	/**
	 * Request the dynamic image for a post meta value, with the Pro media filter active.
	 *
	 * @param string $value Meta value.
	 * @return string
	 */
	private function get_post_meta_image( string $value ): string {
		$post_id = self::factory()->post->create();
		update_post_meta( $post_id, 'img', $value );

		$request = new WP_REST_Request( 'GET', '/otter/v1/dynamic' );
		$request->set_param( 'type', 'postMeta' );
		$request->set_param( 'meta', 'img' );
		$request->set_param( 'context', $post_id );

		$pro = new \ThemeIsle\OtterPro\Plugins\Dynamic_Content();
		add_filter( 'otter_blocks_evaluate_dynamic_content_media_server', array( $pro, 'evaluate_content_media_server' ), 10, 2 );

		$level = ob_get_level();

		try {
			return (string) \ThemeIsle\GutenbergBlocks\Server\Dynamic_Content_Server::instance()->get( $request );
		} finally {
			// The route leaves its buffer open to deliver the image.
			while ( ob_get_level() > $level ) {
				ob_end_clean();
			}
			remove_filter( 'otter_blocks_evaluate_dynamic_content_media_server', array( $pro, 'evaluate_content_media_server' ), 10 );
		}
	}
}
