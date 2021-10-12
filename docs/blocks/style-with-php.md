> The titles will contain some music to spice things up.

## [Enter PHP](https://www.youtube.com/watch?v=CD-E-LDc384)


In the previous [chapter](save.md), we showed what the `save` functions do and how it works. Also, we mentioned the problem when we want to make some changes.

Changing the HTML structure is a big step, so creating a migration scheme with `deprecated` is a common way. What about the styling? If we want to remove some `colors` and some `font-size` to a component? Did we need to write a migration scheme for every little change?

We borrow the idea from the [dynamic blocks](https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/creating-dynamic-blocks/) and try to render the CSS with PHP. Gutenberg can be very picky when working with JS, but for PHP has no words to say. Practically, PHP is *capo di tutti i capi* in WordPress.


This steps are similar with the registration of the block.

- Create class that acces the block data and render the CSS (see `inc/css/blocks` folder)
- Register the class in the Otter class loader, check `inc\class-base-css` file with the function `autoload_block_classes()` (1)!!


:warning: (1) *We need to remember that the Gutenber Blocks is a part of the Otter Blocks. When it comes to manipulate PHP file we need to pay attention to the Ottter's settings.*

## [Creating the render class](https://www.youtube.com/watch?v=lt-udg9zQSE)

When you create a class, just duplicated another PHP file and change it. I will choose the `inc/css/blocks/class-accordion-css` since it has a small code and I can delete it faster. 

:warning: *When it comes to naming things we want to fallow the same convention*. For this part the name blueprint is `class-{block name in kebab case [1]}-css.php`

So, the name of the file will be: `class-tutorial-2-css.php`

The code is: 

```php
<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Tutorial_2_CSS
 */
class Tutorial_2_CSS extends Base_CSS { // <------- The name is a mix between snake case and camel case [1]

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'tutorial-2'; // <--- very important to mention for what block we apply this class

	/**
	 * Generate Tutorial 2 CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block ); // <---- initiate the CSS renderer [2]


		$style = $css->generate();

		return $style;
	}
}
```

Let add the color property to our block:

```php
public function render_css( $block ) {
	$css = new CSS_Utility( $block );

	$css->add_item(
		array(
			'selector'   => ' .tutorial p', // <-- normal css selector [3]
			'properties' => array( // Array with the CSS setting
				array(
					'property' => 'color', // Name of the setting
					'value'    => 'color', // Value of the setting given by referencing the name of the block attribute
				),
			),
		)
	);


	$style = $css->generate();

	return $style;
}
```

To see the result, we need to register the class. Go to `inc\class-base-css` and add `'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Tutorial_2_CSS',` to `autoload_block_classes()` function. E.g:

```php
public function autoload_block_classes() {
	self::$blocks_classes = array(
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Accordion_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Column_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Columns_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Heading_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Button_Group_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Button_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Circle_Counter_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Font_Awesome_Icons_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Icon_List_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Icon_List_Item_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Progress_Bar_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Review_CSS',
		'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Tutorial_2_CSS',
	);
}
```

:warning: If you come back to your page and refresh an PHP error will rise (check the preview page). We made Gutenberg Blocks to know about the existance of this class, but Otter Blocks still does not who is this.

We need to register the class in two more files: `autoload_classmap.php` and `autoload_static.php` in `otter-blocks/vendor/composer`. Fallow the same pattern as the ones in the file for writing the path to the class. Or, you can run `composer dumpautoload -o` in the Otter root folder (`otter-blocks/`) to auto detect the class. It will give you a message like this:
```
Generating optimized autoload files
Generated optimized autoload files containing 55 classes
```

## [Dream on for the working code](https://www.youtube.com/watch?v=89dGC8de0CA)

The PHP is error is gone, so there will be nothing to stop us. Except some exception. If you preview the page you will see that nothing is happening, because the `color` has no value assigned. Go back to Editor and check the  `Code editor`. You will have something like this. As you can see, the default value from the `attributes` scheme are not saved. 

```HTML
<!-- wp:themeisle-blocks/tutorial-2 -->
<div class="wp-block-themeisle-blocks-tutorial-2 tutorial"><p>The text is: Hello</p></div>
<!-- /wp:themeisle-blocks/tutorial-2 -->
```

Exercise: [fix the PHP code ಥ_ಥ](https://www.youtube.com/watch?v=p47fEXGabaY) if is not working for you

References:
1. https://winnercrespo.com/naming-conventions/
2. https://github.com/Codeinwp/gutenberg-blocks/pull/554
3. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors





