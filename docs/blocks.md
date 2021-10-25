# Blocks

Blocks are the fundamental element of the editor. They are the primary way in which plugins and themes can register their own functionality and extend the capabilities of the editor.

## Registration

For each block, you create a new folder in the `blocks` directory. If the block is a structural block, like Testimonial, Service or Pricing, then you can keep them in `blocks/structural` folder instead.

You need to have an index.js file for the block registration, and rest of the registration process is simple. You can find more info on Block API on [Gutenberg Handbook](https://wordpress.org/gutenberg/handbook/designers-developers/developers/block-api/).

For styles, you can have two files:

- style.scss
- editor.scss

Styles that are put in `style.scss` will only be loaded on the front-end, while `editor.scss` styles will only be loaded on the backend.

## Server-side Rendering

If your block requires server-side rendering, you can extend `Base_Block` class in the block's folder. The file name should be `class-(block-name)-block.php`.

```
<?php
namespace ThemeIsle\GutenbergBlocks;

/**
 * Class My_Custom_Block
 */
class My_Custom_Block extends Base_Block {

	/**
	 * Constructor function for the module.
	 *
	 * @method __construct
	 */
	public function __construct() {
		parent::__construct();
	}

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	function set_block_slug() {
		$this->block_slug = 'my-block';
	}

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	function set_attributes() {
		$this->attributes = array(
			'location'	=> array(
				'type'    => 'string',
				'default' => '',
			),
		);
	}

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @return mixed|string
	 */
	function render( $attributes ) {
		// Return the output
	}
}
```

## Custom CSS & Google Fonts

If your block needs to add any dynamic CSS that can't be added inline, such as pseudo-elements or media queries, you can use `cycle_through_blocks` method of [`GutenbergBlocks`](https://github.com/Codeinwp/gutenberg-blocks/blob/master/class-gutenberg-blocks.php) class.

Similarly, if your block loads Google Fonts then you can use `get_google_fonts` method. Your Google Fonts attributes should be `fontFamily` and `fontVariant`.