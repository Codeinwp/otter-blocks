<?php
/**
 * Class Test_Block_Class_Name
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Base_CSS;
use ThemeIsle\GutenbergBlocks\Registration;
use ThemeIsle\GutenbergBlocks\Render\Posts_Grid_Block;

/**
 * An array `className` attribute must not fatal the render/asset paths that
 * search it with string functions.
 */
class Test_Block_Class_Name extends WP_UnitTestCase {

	/**
	 * Static asset flags mutated by the paths under test, restored in teardown.
	 *
	 * @var array<string, bool>
	 */
	private $saved_flags = array();

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();

		$this->saved_flags = array(
			'is_fa_loaded' => Registration::$is_fa_loaded,
			'sticky'       => Registration::$scripts_loaded['sticky'],
		);
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		Registration::$is_fa_loaded                = $this->saved_flags['is_fa_loaded'];
		Registration::$scripts_loaded['sticky']    = $this->saved_flags['sticky'];

		wp_dequeue_script( 'otter-sticky' );
		wp_deregister_script( 'otter-sticky' );

		parent::tear_down();
	}

	/**
	 * A string `className` is returned untouched.
	 */
	public function test_get_class_name_returns_string_attribute() {
		$this->assertSame( 'is-style-tiled o-sticky', Registration::get_class_name( array( 'className' => 'is-style-tiled o-sticky' ) ) );
	}

	/**
	 * An array `className` is flattened to a space separated list.
	 */
	public function test_get_class_name_flattens_array_attribute() {
		$this->assertSame(
			'fa-solid fa-star extra',
			Registration::get_class_name( array( 'className' => array( 'fa-solid', array( 'fa-star' ), 'extra' ) ) )
		);
	}

	/**
	 * Missing, empty and non-printable values fall back to an empty string.
	 */
	public function test_get_class_name_returns_empty_string_for_unusable_values() {
		$this->assertSame( '', Registration::get_class_name( array() ) );
		$this->assertSame( '', Registration::get_class_name( 'not-an-array' ) );
		$this->assertSame( '', Registration::get_class_name( array( 'className' => array() ) ) );
		$this->assertSame( '', Registration::get_class_name( array( 'className' => new stdClass() ) ) );
		$this->assertSame( '', Registration::get_class_name( array( 'className' => array( new stdClass() ) ) ) );
	}

	/**
	 * The Font Awesome subscriber must read an array `className` without fataling.
	 */
	public function test_subscribe_fa_handles_array_class_name() {
		Registration::$is_fa_loaded = false;

		$block = array(
			'blockName' => 'core/navigation-link',
			'attrs'     => array( 'className' => array( 'fa-solid', 'fa-star' ) ),
		);

		$this->assertSame( 'content', Registration::instance()->subscribe_fa( 'content', $block ) );

		if ( \WP_Block_Type_Registry::get_instance()->is_registered( 'core/navigation' ) ) {
			$this->assertTrue( Registration::$is_fa_loaded, 'The array class list contains fa-, so FA must be flagged as needed.' );
		}
	}

	/**
	 * The sticky subscriber must read an array `className` without fataling.
	 */
	public function test_load_sticky_handles_array_class_name() {
		Registration::$scripts_loaded['sticky'] = false;

		$block = array(
			'blockName' => 'core/group',
			'attrs'     => array( 'className' => array( 'o-sticky', 'o-sticky-pos-top' ) ),
		);

		$this->assertSame( 'content', Registration::instance()->load_sticky( 'content', $block ) );
		$this->assertTrue( wp_script_is( 'otter-sticky', 'enqueued' ) );
	}

	/**
	 * Animation class collection must read an array `className` without fataling.
	 */
	public function test_get_animation_classes_handles_array_class_name() {
		$base_css = new Base_CSS();

		$blocks = array(
			array(
				'blockName' => 'core/paragraph',
				'attrs'     => array( 'className' => array( 'animated', 'fadeIn' ) ),
			),
		);

		$this->assertSame( array( 'animated', 'fadeIn' ), array_values( $base_css->get_animation_classes( $blocks ) ) );
	}

	/**
	 * The posts block must render with an array `className` instead of fataling.
	 */
	public function test_posts_grid_block_renders_with_array_class_name() {
		$this->factory()->post->create( array( 'post_title' => 'Otter array className' ) );

		WP_Block_Supports::init();
		WP_Block_Supports::$block_to_render = array( 'blockName' => 'themeisle-blocks/posts-grid' );

		$render = new Posts_Grid_Block();
		$output = $render->render(
			array(
				'id'           => 'wp-block-themeisle-blocks-posts-grid-a94bab18',
				'className'    => array( 'is-style-tiled', 'custom' ),
				'columns'      => 2,
				'style'        => 'grid',
				'postTypes'    => array(),
				'template'     => array( 'title' ),
				'postsToShow'  => 1,
				'order'        => 'desc',
				'orderBy'      => 'date',
				'offset'       => 0,
				'displayTitle' => true,
				'titleTag'     => 'h5',
			)
		);

		$this->assertStringContainsString( 'Otter array className', $output );
	}
}
