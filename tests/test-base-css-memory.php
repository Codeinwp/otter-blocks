<?php
/**
 * Tests that CSS traversal memory does not scale with the block count (#2961).
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Base_CSS;

/**
 * Renderer that counts how many times it is constructed.
 */
class Otter_CSS_Counting_Probe extends Base_CSS {
	/**
	 * Block suffix matched against the block name.
	 *
	 * @var string
	 */
	public $block_prefix = 'counting-probe';

	/**
	 * Constructions made during the request.
	 *
	 * @var int
	 */
	public static $constructed = 0;

	/**
	 * Count the construction.
	 */
	public function __construct() {
		parent::__construct();

		++self::$constructed;
	}

	/**
	 * Render the block CSS.
	 *
	 * @param array $block Block data.
	 * @return string
	 */
	public function render_css( $block ) {
		return '.counting-probe{color:red}';
	}
}

/**
 * Second renderer answering to the same block name as the first one.
 */
class Otter_CSS_Counting_Probe_Twin extends Otter_CSS_Counting_Probe {
	/**
	 * Render the block CSS.
	 *
	 * @param array $block Block data.
	 * @return string
	 */
	public function render_css( $block ) {
		return '.counting-probe-twin{color:blue}';
	}
}

/**
 * Class Test_Base_CSS_Memory
 */
class Test_Base_CSS_Memory extends WP_UnitTestCase {

	/**
	 * Base_CSS instance under test.
	 *
	 * @var Base_CSS
	 */
	private $css;

	/**
	 * Filter callbacks this test registered, so only those are removed again.
	 *
	 * @var array<int, callable>
	 */
	private $registered_filters = array();

	/**
	 * Set up each test.
	 */
	public function set_up() {
		parent::set_up();

		$this->css = new Base_CSS();

		Otter_CSS_Counting_Probe::$constructed = 0;
	}

	/**
	 * Tear down each test.
	 */
	public function tear_down() {
		$this->remove_registered_filters();

		// Restore the shipped list for any later test in the suite.
		$this->css->autoload_block_classes();

		parent::tear_down();
	}

	/**
	 * Replace the CSS class list with the given entries.
	 *
	 * @param array<int, mixed> $classnames Entries to register.
	 * @return void
	 */
	private function set_classes( $classnames ) {
		$callback = function () use ( $classnames ) {
			return $classnames;
		};

		$this->registered_filters[] = $callback;

		add_filter( 'otter_blocks_register_css', $callback );

		$this->css->autoload_block_classes();
	}

	/**
	 * Remove only the callbacks this test added, leaving integration ones (Otter Pro) in place.
	 *
	 * @return void
	 */
	private function remove_registered_filters() {
		foreach ( $this->registered_filters as $callback ) {
			remove_filter( 'otter_blocks_register_css', $callback );
		}

		$this->registered_filters = array();
	}

	/**
	 * Build a nested tree of the probe block.
	 *
	 * @param int $count Blocks per level.
	 * @param int $depth Nesting depth.
	 * @return array<int, array>
	 */
	private function block_tree( $count, $depth ) {
		$blocks = array();

		for ( $i = 0; $i < $count; $i++ ) {
			$blocks[] = array(
				'blockName'   => 'themeisle-blocks/counting-probe',
				'attrs'       => array(),
				'innerBlocks' => $depth > 1 ? $this->block_tree( $count, $depth - 1 ) : array(),
			);
		}

		return $blocks;
	}

	/**
	 * Count the callbacks registered on the init hook.
	 *
	 * @return int
	 */
	private function init_callback_count() {
		global $wp_filter;

		if ( ! isset( $wp_filter['init'] ) ) {
			return 0;
		}

		$count = 0;

		foreach ( $wp_filter['init']->callbacks as $callbacks ) {
			$count += count( $callbacks );
		}

		return $count;
	}

	/**
	 * Traversing many blocks must not register a callback per block (#2961).
	 */
	public function test_static_blocks_do_not_grow_the_init_hook() {
		$this->set_classes( array( 'Otter_CSS_Counting_Probe' ) );

		$before = $this->init_callback_count();

		$this->css->cycle_through_static_blocks( $this->block_tree( 5, 3 ), false );

		$this->assertSame( $before, $this->init_callback_count() );
	}

	/**
	 * Renderers must be built once per request, not once per block (#2961).
	 */
	public function test_renderers_are_built_once_per_request() {
		$this->set_classes( array( 'Otter_CSS_Counting_Probe' ) );

		$this->css->cycle_through_static_blocks( $this->block_tree( 5, 3 ), false );

		$this->assertSame( 1, Otter_CSS_Counting_Probe::$constructed );
	}

	/**
	 * A deeper tree must not cost more renderer instances than a shallow one (#2961).
	 */
	public function test_instance_count_is_independent_of_block_count() {
		$this->set_classes( array( 'Otter_CSS_Counting_Probe' ) );

		$this->css->cycle_through_static_blocks( $this->block_tree( 1, 1 ), false );
		$small = Otter_CSS_Counting_Probe::$constructed;

		$this->css->cycle_through_static_blocks( $this->block_tree( 6, 3 ), false );

		$this->assertSame( $small, Otter_CSS_Counting_Probe::$constructed );
	}

	/**
	 * Every renderer answering to a block name still contributes its CSS.
	 */
	public function test_all_renderers_for_a_block_name_still_render() {
		$this->set_classes( array( 'Otter_CSS_Counting_Probe', 'Otter_CSS_Counting_Probe_Twin' ) );

		$style = $this->css->cycle_through_static_blocks(
			array(
				array(
					'blockName'   => 'themeisle-blocks/counting-probe',
					'attrs'       => array(),
					'innerBlocks' => array(),
				),
			),
			false
		);

		$this->assertStringContainsString( '.counting-probe{', $style );
		$this->assertStringContainsString( '.counting-probe-twin{', $style );
	}

	/**
	 * A block with no matching renderer, or no name at all, renders nothing and does not fatal.
	 */
	public function test_unmatched_blocks_render_nothing() {
		$this->set_classes( array( 'Otter_CSS_Counting_Probe' ) );

		$style = $this->css->cycle_through_static_blocks(
			array(
				array(
					'blockName'   => 'core/paragraph',
					'attrs'       => array(),
					'innerBlocks' => array(),
				),
				array(
					'blockName'   => null,
					'attrs'       => array(),
					'innerBlocks' => array(),
				),
			),
			false
		);

		$this->assertSame( '', $style );
	}

	/**
	 * A class list changed through the filter must be picked up, not served from the cache.
	 */
	public function test_cached_instances_follow_the_filtered_class_list() {
		$this->set_classes( array( 'Otter_CSS_Counting_Probe' ) );

		$blocks = array(
			array(
				'blockName'   => 'themeisle-blocks/counting-probe',
				'attrs'       => array(),
				'innerBlocks' => array(),
			),
		);

		$this->assertStringContainsString( '.counting-probe{', $this->css->cycle_through_static_blocks( $blocks, false ) );

		$this->remove_registered_filters();
		$this->set_classes( array( 'Otter_CSS_Counting_Probe_Twin' ) );

		$style = $this->css->cycle_through_static_blocks( $blocks, false );

		$this->assertStringContainsString( '.counting-probe-twin{', $style );
		$this->assertStringNotContainsString( '.counting-probe{', $style );
	}
}
