<?php
/**
 * Class Test_Blocks_Animation
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Blocks_Animation;

/**
 * Blocks Animation frontend loading test case.
 */
class Test_Blocks_Animation extends WP_UnitTestCase {

	/**
	 * The animation instance.
	 *
	 * @var Blocks_Animation
	 */
	protected $animation;

	/**
	 * Set up: fresh static state and no leftover registered assets.
	 */
	public function set_up() {
		parent::set_up();

		$this->animation = new Blocks_Animation();
		$this->animation->init();

		Blocks_Animation::$scripts_loaded = array(
			'animation' => false,
			'count'     => false,
			'typing'    => false,
		);

		Blocks_Animation::$can_load_frontend = true;

		foreach ( array( 'otter-animation-frontend', 'otter-count', 'otter-typing' ) as $handle ) {
			wp_dequeue_script( $handle );
			wp_deregister_script( $handle );
		}

		wp_dequeue_style( 'otter-animation' );
		wp_deregister_style( 'otter-animation' );
	}

	/**
	 * Content without animation markers should pass through untouched and enqueue nothing.
	 */
	public function test_frontend_load_without_markers_enqueues_nothing() {
		$content = '<p>plain content</p>';

		$this->assertSame( $content, $this->animation->frontend_load( $content, array() ) );
		$this->assertFalse( wp_script_is( 'otter-animation-frontend', 'enqueued' ) );
		$this->assertFalse( wp_script_is( 'otter-count', 'enqueued' ) );
		$this->assertFalse( wp_script_is( 'otter-typing', 'enqueued' ) );
		$this->assertTrue( wp_style_is( 'otter-animation', 'registered' ), 'The style should still be registered for later use' );
	}

	/**
	 * Animated content should enqueue the frontend script (async) and hook the hide-css fallback.
	 */
	public function test_frontend_load_enqueues_animation_script_for_animated_content() {
		$content = '<div class="animated fadeIn">x</div>';

		$this->assertSame( $content, $this->animation->frontend_load( $content, array() ) );
		$this->assertTrue( wp_script_is( 'otter-animation-frontend', 'enqueued' ) );
		$this->assertSame( true, wp_scripts()->get_data( 'otter-animation-frontend', 'async' ) );
		$this->assertNotFalse( has_action( 'wp_footer', array( $this->animation, 'add_frontend_anim_inline_style' ) ) );
		$this->assertTrue( Blocks_Animation::$scripts_loaded['animation'], 'The loaded flag should prevent duplicate enqueues' );
	}

	/**
	 * With the optimize-animations-css option on (default), the stylesheet is not enqueued;
	 * turning it off enqueues the stylesheet alongside the script.
	 */
	public function test_frontend_load_style_respects_optimize_option() {
		$content = '<div class="animated">x</div>';

		update_option( 'themeisle_blocks_settings_optimize_animations_css', true );
		$this->animation->frontend_load( $content, array() );
		$this->assertFalse( wp_style_is( 'otter-animation', 'enqueued' ), 'Optimized CSS should skip the full stylesheet' );

		Blocks_Animation::$scripts_loaded['animation'] = false;
		update_option( 'themeisle_blocks_settings_optimize_animations_css', false );
		$this->animation->frontend_load( $content, array() );
		$this->assertTrue( wp_style_is( 'otter-animation', 'enqueued' ), 'Without optimization the full stylesheet should load' );
	}

	/**
	 * Count and typing markers should enqueue their dedicated deferred scripts.
	 */
	public function test_frontend_load_enqueues_count_and_typing_scripts() {
		$this->animation->frontend_load( '<span class="o-anim-count">42</span>', array() );
		$this->assertTrue( wp_script_is( 'otter-count', 'enqueued' ) );
		$this->assertSame( true, wp_scripts()->get_data( 'otter-count', 'defer' ) );
		$this->assertFalse( wp_script_is( 'otter-typing', 'enqueued' ) );

		$this->animation->frontend_load( '<span class="o-anim-typing">hi</span>', array() );
		$this->assertTrue( wp_script_is( 'otter-typing', 'enqueued' ) );
		$this->assertSame( true, wp_scripts()->get_data( 'otter-typing', 'defer' ) );
	}

	/**
	 * When frontend loading is disabled (e.g. AMP requests), nothing is enqueued.
	 */
	public function test_frontend_load_skips_when_frontend_loading_disabled() {
		Blocks_Animation::$can_load_frontend = false;

		$content = '<div class="animated o-anim-count o-anim-typing">x</div>';

		$this->assertSame( $content, $this->animation->frontend_load( $content, array() ) );
		$this->assertFalse( wp_script_is( 'otter-animation-frontend', 'enqueued' ) );
		$this->assertFalse( wp_script_is( 'otter-count', 'enqueued' ) );
		$this->assertFalse( wp_script_is( 'otter-typing', 'enqueued' ) );
	}

	/**
	 * The footer fallback should hide unstarted animations and undo that without JS.
	 */
	public function test_add_frontend_anim_inline_style_outputs_hide_css_and_noscript() {
		ob_start();
		Blocks_Animation::add_frontend_anim_inline_style();
		$output = ob_get_clean();

		$this->assertStringContainsString( 'o-anim-hide-inline-css', $output );
		$this->assertStringContainsString( '.animated:not(.o-anim-ready)', $output );
		$this->assertStringContainsString( '<noscript>', $output );
	}
}
