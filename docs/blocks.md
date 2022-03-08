# Blocks

Blocks are the fundamental element of the editor. They are the primary way in which plugins and themes can register their own functionality and extend the capabilities of the editor.

## Registration

For each block, you create a new folder in the `blocks` directory. If the block is a structural block, like Testimonial, Service or Pricing, then you can keep them in `blocks/structural` folder instead.

You need to have an index.js file for the block registration, and rest of the registration process is simple. You can find more info on Block API on [Gutenberg Handbook](https://wordpress.org/gutenberg/handbook/designers-developers/developers/block-api/).

For styles, you can have two files:

- style.scss
- editor.scss

Styles that are put in `style.scss` will only be loaded on the front-end, while `editor.scss` styles will only be loaded on the backend.

## Custom CSS & Google Fonts

If your block needs to add any dynamic CSS that can't be added inline, such as pseudo-elements or media queries, you can use `cycle_through_blocks` method of [`GutenbergBlocks`](https://github.com/Codeinwp/gutenberg-blocks/blob/master/class-gutenberg-blocks.php) class.

Similarly, if your block loads Google Fonts then you can use `get_google_fonts` method. Your Google Fonts attributes should be `fontFamily` and `fontVariant`.