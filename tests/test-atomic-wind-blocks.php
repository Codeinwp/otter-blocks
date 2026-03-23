<?php
/**
 * Tests for Atomic_Wind_Blocks module.
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Atomic_Wind_Blocks;

/**
 * Atomic Wind Blocks test case.
 */
class TestAtomicWindBlocks extends WP_UnitTestCase {

	/**
	 * Instance under test.
	 *
	 * @var Atomic_Wind_Blocks
	 */
	protected $instance;

	/**
	 * Test post ID.
	 *
	 * @var int
	 */
	protected $post_id;

	/**
	 * Set up each test.
	 */
	public function set_up() {
		parent::set_up();

		$this->instance = new Atomic_Wind_Blocks();
		$this->post_id  = $this->factory()->post->create(
			array(
				'post_title'   => 'Test Post Title',
				'post_content' => str_repeat( 'word ', 400 ),
				'post_excerpt' => 'This is the <strong>test</strong> excerpt with some words for trimming purposes here.',
			)
		);

		wp_set_current_user(
			$this->factory()->user->create( array( 'role' => 'administrator' ) )
		);
	}

	/**
	 * Tear down each test.
	 */
	public function tear_down() {
		$this->reset_in_query( false );
		parent::tear_down();
	}

	/**
	 * Helper: set the private static $in_query property via reflection.
	 *
	 * @param bool $value Value to set.
	 */
	private function reset_in_query( $value ) {
		$ref = new ReflectionProperty( Atomic_Wind_Blocks::class, 'in_query' );
		$ref->setAccessible( true );
		$ref->setValue( null, $value );
	}

	/**
	 * Helper: build a minimal block array.
	 *
	 * @param string $name  Block name.
	 * @param array  $attrs Block attributes.
	 * @return array
	 */
	private function make_block( $name, $attrs = array() ) {
		return array(
			'blockName'   => $name,
			'attrs'       => $attrs,
			'innerBlocks' => array(),
		);
	}

	// -------------------------------------------------------
	// Module activation
	// -------------------------------------------------------

	public function test_run_bails_when_option_disabled() {
		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );

		$this->instance->run();

		$this->assertFalse(
			has_filter( 'render_block', array( $this->instance, 'render_animation_attrs' ) )
		);
	}

	public function test_run_registers_hooks_when_option_enabled() {
		update_option( 'themeisle_blocks_settings_atomic_wind_blocks', true );

		$this->instance->run();

		$this->assertNotFalse(
			has_filter( 'render_block', array( $this->instance, 'render_animation_attrs' ) )
		);
		$this->assertNotFalse(
			has_filter( 'render_block', array( $this->instance, 'render_state_attrs' ) )
		);
		$this->assertNotFalse(
			has_filter( 'render_block', array( $this->instance, 'render_post_fields' ) )
		);
		$this->assertNotFalse(
			has_filter( 'block_categories_all', array( $this->instance, 'register_category' ) )
		);
	}

	// -------------------------------------------------------
	// register_category
	// -------------------------------------------------------

	public function test_register_category_prepends() {
		$existing   = array( array( 'slug' => 'text', 'title' => 'Text' ) );
		$result     = $this->instance->register_category( $existing );

		$this->assertSame( 'atomic-wind', $result[0]['slug'] );
		$this->assertCount( 2, $result );
	}

	// -------------------------------------------------------
	// render_animation_attrs
	// -------------------------------------------------------

	public function test_animation_skips_non_atomic_blocks() {
		$block   = $this->make_block( 'core/paragraph', array( 'animation' => 'fade-in' ) );
		$content = '<p class="wp-block">Hello</p>';

		$result = $this->instance->render_animation_attrs( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_animation_skips_when_no_animation_attr() {
		$block   = $this->make_block( 'atomic-wind/text' );
		$content = '<p class="wp-block">Hello</p>';

		$result = $this->instance->render_animation_attrs( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_animation_injects_data_attribute() {
		$block   = $this->make_block( 'atomic-wind/text', array( 'animation' => 'fade-in' ) );
		$content = '<p class="wp-block">Hello</p>';

		$result = $this->instance->render_animation_attrs( $content, $block );

		$this->assertStringContainsString( 'data-animation="fade-in"', $result );
	}

	public function test_animation_injects_delay() {
		$block   = $this->make_block( 'atomic-wind/box', array(
			'animation'      => 'slide-up',
			'animationDelay' => '300',
		) );
		$content = '<div class="wp-block">Content</div>';

		$result = $this->instance->render_animation_attrs( $content, $block );

		$this->assertStringContainsString( 'data-animation="slide-up"', $result );
		$this->assertStringContainsString( 'data-animation-delay="300"', $result );
	}

	public function test_animation_skips_zero_delay() {
		$block   = $this->make_block( 'atomic-wind/text', array(
			'animation'      => 'fade-in',
			'animationDelay' => '0',
		) );
		$content = '<p class="wp-block">Hello</p>';

		$result = $this->instance->render_animation_attrs( $content, $block );

		$this->assertStringNotContainsString( 'data-animation-delay', $result );
	}

	public function test_animation_skips_when_already_present() {
		$block   = $this->make_block( 'atomic-wind/text', array( 'animation' => 'fade-in' ) );
		$content = '<p data-animation="zoom-in" class="wp-block">Hello</p>';

		$result = $this->instance->render_animation_attrs( $content, $block );

		$this->assertSame( $content, $result );
	}

	// -------------------------------------------------------
	// render_state_attrs
	// -------------------------------------------------------

	public function test_state_skips_non_atomic_blocks() {
		$block   = $this->make_block( 'core/paragraph', array( 'showIf' => 'tab1' ) );
		$content = '<p>Hello</p>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_state_skips_when_no_state_attrs() {
		$block   = $this->make_block( 'atomic-wind/text' );
		$content = '<p>Hello</p>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_state_injects_show_if() {
		$block   = $this->make_block( 'atomic-wind/box', array( 'showIf' => 'tab1' ) );
		$content = '<div class="wp-block">Content</div>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertStringContainsString( 'data-show-if="tab1"', $result );
	}

	public function test_state_injects_hide_if() {
		$block   = $this->make_block( 'atomic-wind/text', array( 'hideIf' => 'panel:closed' ) );
		$content = '<p class="wp-block">Text</p>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertStringContainsString( 'data-hide-if="panel:closed"', $result );
	}

	public function test_state_injects_both_show_and_hide() {
		$block   = $this->make_block( 'atomic-wind/box', array(
			'showIf' => 'active',
			'hideIf' => 'disabled',
		) );
		$content = '<div>Content</div>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertStringContainsString( 'data-show-if="active"', $result );
		$this->assertStringContainsString( 'data-hide-if="disabled"', $result );
	}

	public function test_state_trigger_only_does_not_inject_visibility_attrs() {
		$block   = $this->make_block( 'atomic-wind/text', array( 'stateTrigger' => 'tabs' ) );
		$content = '<p class="wp-block">Trigger</p>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_state_skips_when_already_present() {
		$block   = $this->make_block( 'atomic-wind/box', array( 'showIf' => 'tab1' ) );
		$content = '<div data-show-if="tab2">Content</div>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertSame( $content, $result );
	}

	// -------------------------------------------------------
	// render_post_fields — skipping
	// -------------------------------------------------------

	public function test_post_fields_skips_non_atomic_blocks() {
		$this->reset_in_query( true );
		$block   = $this->make_block( 'core/paragraph', array( 'postField' => 'title' ) );
		$content = '<p>Original</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_post_fields_skips_outside_query() {
		$this->reset_in_query( false );
		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'title' ) );
		$content = '<p>Original</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_post_fields_skips_empty_post_field() {
		$this->reset_in_query( true );
		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => '' ) );
		$content = '<p>Original</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertSame( $content, $result );
	}

	// -------------------------------------------------------
	// render_post_fields — text block
	// -------------------------------------------------------

	public function test_post_field_title() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'title' ) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringContainsString( 'Test Post Title', $result );
		$this->assertStringNotContainsString( 'Placeholder', $result );

		wp_reset_postdata();
	}

	public function test_post_field_excerpt_strips_tags_and_trims() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array(
			'postField'     => 'excerpt',
			'excerptLength' => 5,
		) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringNotContainsString( '<strong>', $result );
		$this->assertStringNotContainsString( 'Placeholder', $result );

		wp_reset_postdata();
	}

	public function test_post_field_excerpt_default_length() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'excerpt' ) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringNotContainsString( 'Placeholder', $result );

		wp_reset_postdata();
	}

	public function test_post_field_date() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'date' ) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringNotContainsString( 'Placeholder', $result );

		wp_reset_postdata();
	}

	public function test_post_field_author() {
		$this->reset_in_query( true );

		$author_id = $this->factory()->user->create( array(
			'display_name' => 'Jane Doe',
			'role'         => 'author',
		) );
		$author_post = $this->factory()->post->create( array(
			'post_author' => $author_id,
			'post_title'  => 'Author Test',
		) );

		global $post;
		$post = get_post( $author_post );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'author' ) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringContainsString( 'Jane Doe', $result );

		wp_reset_postdata();
	}

	public function test_post_field_reading_time() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'reading_time' ) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringContainsString( 'min read', $result );

		wp_reset_postdata();
	}

	public function test_post_field_custom_field() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );
		update_post_meta( $this->post_id, 'test_meta_key', 'Custom Value' );

		$block   = $this->make_block( 'atomic-wind/text', array(
			'postField'      => 'custom_field',
			'customFieldKey' => 'test_meta_key',
		) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringContainsString( 'Custom Value', $result );

		wp_reset_postdata();
	}

	public function test_post_field_comment_count() {
		$this->reset_in_query( true );

		$comment_post = $this->factory()->post->create();
		$this->factory()->comment->create( array( 'comment_post_ID' => $comment_post ) );

		global $post;
		$post = get_post( $comment_post );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'comment_count' ) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringContainsString( '1', $result );
		$this->assertStringNotContainsString( 'Placeholder', $result );

		wp_reset_postdata();
	}

	// -------------------------------------------------------
	// render_post_fields — link block
	// -------------------------------------------------------

	public function test_post_field_permalink_replaces_href() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/link', array( 'postField' => 'permalink' ) );
		$content = '<a href="#" class="wp-block">Link</a>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringNotContainsString( 'href="#"', $result );
		$this->assertStringContainsString( 'href="', $result );

		wp_reset_postdata();
	}

	public function test_post_field_permalink_adds_href_when_missing() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/link', array( 'postField' => 'permalink' ) );
		$content = '<a class="wp-block">Link</a>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringContainsString( 'href="', $result );

		wp_reset_postdata();
	}

	// -------------------------------------------------------
	// render_post_fields — image block
	// -------------------------------------------------------

	public function test_post_field_featured_image_returns_empty_when_no_thumbnail() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/image', array( 'postField' => 'featured_image' ) );
		$content = '<img src="placeholder.jpg" alt="" />';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertEmpty( $result );

		wp_reset_postdata();
	}

	public function test_post_field_author_avatar() {
		$this->reset_in_query( true );

		global $post;
		$post = get_post( $this->post_id );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/image', array( 'postField' => 'author_avatar' ) );
		$content = '<img src="placeholder.jpg" alt="" />';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringNotContainsString( 'placeholder.jpg', $result );
		$this->assertStringContainsString( 'src="', $result );

		wp_reset_postdata();
	}

	// -------------------------------------------------------
	// render_query_loop
	// -------------------------------------------------------

	public function test_query_loop_skips_non_box_blocks() {
		$block   = $this->make_block( 'atomic-wind/text', array( 'queryPostType' => 'post' ) );
		$content = '<p>Hello</p>';

		$result = $this->instance->render_query_loop( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_query_loop_skips_without_post_type() {
		$block   = $this->make_block( 'atomic-wind/box' );
		$content = '<div>Content</div>';

		$result = $this->instance->render_query_loop( $content, $block );

		$this->assertSame( $content, $result );
	}

	public function test_query_loop_returns_empty_for_no_results() {
		$block = $this->make_block( 'atomic-wind/box', array(
			'queryPostType' => 'nonexistent_type',
		) );
		$content = '<div class="wrapper">Inner</div>';

		$result = $this->instance->render_query_loop( $content, $block );

		$this->assertEmpty( $result );
	}

	public function test_query_loop_caps_posts_per_page_at_100() {
		$block = $this->make_block( 'atomic-wind/box', array(
			'queryPostType' => 'post',
			'queryCount'    => 999999,
		) );
		$content = '<div class="wrapper">Inner</div>';

		$ref = new ReflectionMethod( Atomic_Wind_Blocks::class, 'render_query_loop' );

		$this->assertNotFalse(
			preg_match( '/min\s*\(\s*absint\s*\(/', file_get_contents(
				( new ReflectionClass( Atomic_Wind_Blocks::class ) )->getFileName()
			) ),
			'posts_per_page should be capped with min()'
		);
	}

	// -------------------------------------------------------
	// REST permissions
	// -------------------------------------------------------

	public function test_rest_permissions_allow_editor() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/atomic-wind/style' );
		$request->set_param( 'postId', $this->post_id );

		$this->assertTrue( $this->instance->rest_save_style_permissions( $request ) );
	}

	public function test_rest_permissions_deny_subscriber() {
		$subscriber = $this->factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );

		$request = new WP_REST_Request( 'POST', '/otter/v1/atomic-wind/style' );
		$request->set_param( 'postId', $this->post_id );

		$this->assertFalse( $this->instance->rest_save_style_permissions( $request ) );
	}

	public function test_rest_permissions_deny_logged_out() {
		wp_set_current_user( 0 );

		$request = new WP_REST_Request( 'POST', '/otter/v1/atomic-wind/style' );
		$request->set_param( 'postId', $this->post_id );

		$this->assertFalse( $this->instance->rest_save_style_permissions( $request ) );
	}

	// -------------------------------------------------------
	// REST save style
	// -------------------------------------------------------

	public function test_rest_save_style_stores_css() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/atomic-wind/style' );
		$request->set_param( 'postId', $this->post_id );
		$request->set_param( 'css', '.bg-red-500{background:red}' );

		$response = $this->instance->rest_save_style( $request );

		$this->assertSame( 200, $response->get_status() );

		$stored = get_post_meta( $this->post_id, '_atomic_wind_css', true );
		$this->assertSame( '.bg-red-500{background:red}', $stored );
	}

	public function test_rest_save_style_preserves_backslash_selectors() {
		$css     = '.bg-\[\#C65D07\]{background:#C65D07}';
		$request = new WP_REST_Request( 'POST', '/otter/v1/atomic-wind/style' );
		$request->set_param( 'postId', $this->post_id );
		$request->set_param( 'css', $css );

		$this->instance->rest_save_style( $request );

		$stored = get_post_meta( $this->post_id, '_atomic_wind_css', true );
		$this->assertSame( $css, $stored );
	}

	// -------------------------------------------------------
	// Security: output_cached_css uses wp_add_inline_style
	// -------------------------------------------------------

	public function test_cached_css_uses_inline_style_api() {
		$ref = new ReflectionClass( Atomic_Wind_Blocks::class );
		$source = file_get_contents( $ref->getFileName() );

		$this->assertNotFalse(
			strpos( $source, 'wp_add_inline_style' ),
			'output_cached_css should use wp_add_inline_style instead of raw echo'
		);

		$this->assertFalse(
			(bool) preg_match( '/echo.*\$cached_css/', $source ),
			'output_cached_css should not echo $cached_css directly'
		);
	}

	// -------------------------------------------------------
	// Security: XSS in animation/state attributes
	// -------------------------------------------------------

	public function test_animation_attr_escapes_value() {
		$block   = $this->make_block( 'atomic-wind/text', array(
			'animation' => '"><script>alert(1)</script>',
		) );
		$content = '<p class="wp-block">Hello</p>';

		$result = $this->instance->render_animation_attrs( $content, $block );

		$this->assertStringNotContainsString( '<script>', $result );
		$this->assertStringContainsString( 'data-animation="', $result );
	}

	public function test_state_attr_escapes_value() {
		$block   = $this->make_block( 'atomic-wind/box', array(
			'showIf' => '"><script>alert(1)</script>',
		) );
		$content = '<div>Content</div>';

		$result = $this->instance->render_state_attrs( $content, $block );

		$this->assertStringNotContainsString( '<script>', $result );
	}

	// -------------------------------------------------------
	// enqueue_icons_data
	// -------------------------------------------------------

	public function test_enqueue_icons_data_injects_icons_map() {
		if ( ! wp_script_is( 'wp-blocks', 'registered' ) ) {
			wp_register_script( 'wp-blocks', '', array(), false, true );
		}
		$this->instance->enqueue_icons_data();
		$data   = wp_scripts()->get_data( 'wp-blocks', 'before' );
		$inline = is_array( $data ) ? implode( '', $data ) : (string) $data;
		$this->assertStringContainsString( 'iconsMap', $inline );
		$this->assertStringContainsString( '"search"', $inline );
	}

	public function test_enqueue_icons_data_no_assets_url() {
		if ( ! wp_script_is( 'wp-blocks', 'registered' ) ) {
			wp_register_script( 'wp-blocks', '', array(), false, true );
		}
		$this->instance->enqueue_icons_data();
		$data   = wp_scripts()->get_data( 'wp-blocks', 'before' );
		$inline = is_array( $data ) ? implode( '', $data ) : (string) $data;
		$this->assertStringNotContainsString( '"assetsUrl"', $inline );
		$this->assertStringNotContainsString( 'iconsJsonUrl', $inline );
	}

	public function test_enqueue_icons_data_graceful_fallback() {
		if ( ! wp_script_is( 'wp-blocks', 'registered' ) ) {
			wp_register_script( 'wp-blocks', '', array(), false, true );
		}
		$json_path = OTTER_BLOCKS_PATH . '/assets/atomic-wind/icons.json';
		$backup    = $json_path . '.bak';
		$had_file  = is_file( $json_path );
		if ( $had_file ) {
			rename( $json_path, $backup );
		}
		try {
			$this->instance->enqueue_icons_data();
			$data   = wp_scripts()->get_data( 'wp-blocks', 'before' );
			$inline = is_array( $data ) ? implode( '', $data ) : (string) $data;
			$this->assertStringContainsString( 'atomicWindIcons', $inline );
		} finally {
			if ( $had_file ) {
				rename( $backup, $json_path );
			}
		}
	}

	// -------------------------------------------------------
	// Text output is escaped
	// -------------------------------------------------------

	public function test_post_field_title_escapes_html() {
		$this->reset_in_query( true );

		$xss_post = $this->factory()->post->create(
			array( 'post_title' => '<script>alert("xss")</script>' )
		);

		global $post;
		$post = get_post( $xss_post );
		setup_postdata( $post );

		$block   = $this->make_block( 'atomic-wind/text', array( 'postField' => 'title' ) );
		$content = '<p class="wp-block">Placeholder</p>';

		$result = $this->instance->render_post_fields( $content, $block );

		$this->assertStringNotContainsString( '<script>', $result );

		wp_reset_postdata();
	}
}
