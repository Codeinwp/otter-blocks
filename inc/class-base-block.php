<?php
/**
 * Common logic for a block.
 *
 * @package ThemeIsle\GutenbergBlocks
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Base_Block
 */
abstract class Base_Block {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	protected $block_prefix = 'themeisle-blocks';

	/**
	 * The slug of the block.
	 *
	 * @var null
	 */
	protected $block_slug = null;

	/**
	 * Block attributes handled on the server side.
	 *
	 * @var null
	 */
	protected $attributes = array();

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	abstract protected function set_block_slug();

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	abstract protected function set_attributes();

	/**
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed
	 */
	abstract protected function render( $attributes );

	/**
	 * Base_Block constructor.
	 */
	public function __construct() {
		$this->set_block_slug();
		$this->set_attributes();
	}

	/**
	 * Returns the block slug.
	 *
	 * @return null
	 */
	public function get_block_slug() {
		return $this->block_slug;
	}

	/**
	 * Returns the block attributes.
	 * The result is also filtered via `otter_block_attributes_for_{$this->block_slug}` filter.
	 *
	 * @return array
	 */
	public function get_attributes() {
		return apply_filters( 'themeisle_gutenberg_attributes_for_' . $this->block_slug, $this->attributes );
	}

	/**
	 * Based on the given arguments given on construction we'll build a Gutenberg Block.
	 */
	public function register_block() {
		\register_block_type(
			$this->block_prefix . '/' . $this->block_slug,
			array(
				'render_callback' => array( $this, 'render_callback' ),
				'attributes'      => $this->get_attributes(),
			)
		);
	}

	/**
	 * The render callback passed to the `register_block_type` function.
	 *
	 * @param array $attributes Block attrs.
	 * @return string
	 */
	public function render_callback( $attributes ) {
		// give a chance to our themes to overwrite the template of blocks.
		return apply_filters( 'themeisle_gutenberg_template_' . $this->block_slug, $this->render( $attributes ) );
	}
}
