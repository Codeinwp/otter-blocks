# CSS Magic with PHP

As you know, we do not save CSS values with the Save function. The Styling values (color, font-size, etc.) are loaded with PHP via inline style or CSS file. This trick allow us to avoid the deprecation mechanism for Blocks.

Most of the bugs are related to CSS, so it is natural to have a way in which we can change the CSS values dynamically without _breaking_ the block.

In a nutshell: before serving the page, we scan for Otter blocks, parse their JSON serialization, extract the styling values and generate a CSS file with the values.

This pipeline allow us to have great flexibility in terms of styling, but it also introduce a lot of complexity. This complexity bites us back when WP change some functions or introduce new ones. Since it is once at some months, it is not a big deal, but it is still a problem.

### How it works

Suppose you have the following SCSS for a Block:

```scss

.themeisle-block-test {
    --color: #000;
    --font-size: 16px;

    color: var(--color);

    .text-wrapper {
        font-size: var(--font-size);
    }
}

```

with the attributes:

```json
{
    "color": "#ffffff",
    "fontSizeText": "20px"
}
```

When using the dynamic CSS, a new declaration with values will be added in the page:

```scss
#wp-block-themeisle-blocks-test-324239 {
    --color: #ffffff;
    --font-size: 20px;
}
```

`#wp-block-themeisle-blocks-test-324239` is the ID of the Otter block. This ID is used for targeting the block in the page.

You can also use a more specific selector with different properties:

```scss
#wp-block-themeisle-blocks-test-324239 .text-wrapper {
    font-size: 20px;
    border: 1px solid #000;
}
```

What about Global Style? The trick behind Global Style is to make pool of values from which the Block can inherit.

```scss
.themeisle-block-test {
    --global-color: #aaa;
    --global-font-size: 12px;
}

```

And the block will inherit the values:

```scss
#wp-block-themeisle-blocks-test-324239 {
    --color: var(--global-color);
    --font-size: var(--global-font-size);
}
```

As you can see, it is just a redirection.

## How to use it

In ancient times, we created those declarations using manual concatenation of strings. This was not ideal, because it was hard to maintain and it was error prone. Also, it was hard to debug.

You can see this [old code](https://github.com/Codeinwp/gutenberg-blocks/blob/fb0826169648c9f79f2c9b24771941bcc7ecba06/inc/css/blocks/class-advanced-columns-css.php) to better understand how it was done.

Now, we use a in-house CSS builder to do it.

The magic is in `./inc/css` folder. When you write a new file for generating CSS, you will add it as PHP class in `./inc/css/blocks` folder. The class must extend `Base_CSS` and implement the `render_css` method. You also need to specify a `$block_prefix` for identifying the block.

The `render_css` is called with the Block metadata. The metadata is parsed by the use of class `CSS_Utility`. Also, in some global you will notice the use of `render_global_css`, this is used for generating CSS for the global styles.

The use of `CSS_Utility` can be summarized in the following example:

```php
$css = new CSS_Utility( $block_metadata );

$css->add_item(
    array(
        'properties' => array(
            array(
                'property'  => '--width',
                'value'     => 'width',
                'unit'      => 'px',
            ),
        )
    )
);

$css->add_item(
    array(
        'selector'   => ' .wp-block-button__link:not(:hover)',
        'properties' => array(
            array(
                'property' => 'border-color',
                'value'    => 'border',
                'hasSync'  => 'gr-btn-border-color',
            ),
            array(
                'property'  => 'border-width',
                'value'     => 'borderSize',
                'format'    => function( $value, $attrs ) {
                    return CSS_Utility::box_values(
                        $value,
                        array(
                            'left'   => '1px',
                            'right'  => '1px',
                            'top'    => '1px',
                            'bottom' => '1px',
                        )
                    );
                },
                'condition' => function( $attrs ) {
                    return isset( $attrs['borderSize'] ) && is_array( $attrs['borderSize'] );
                },
                'hasSync'   => 'gr-btn-border-size',
            ),
            array(
                'property'       => 'box-shadow',
                'pattern'        => 'horizontal vertical blur spread color',
                'pattern_values' => array(
                    'horizontal' => array(
                        'value'   => 'boxShadowHorizontal',
                        'unit'    => 'px',
                        'default' => 0,
                    ),
                    'vertical'   => array(
                        'value'   => 'boxShadowVertical',
                        'unit'    => 'px',
                        'default' => 0,
                    ),
                    'blur'       => array(
                        'value'   => 'boxShadowBlur',
                        'unit'    => 'px',
                        'default' => 5,
                    ),
                    'spread'     => array(
                        'value'   => 'boxShadowSpread',
                        'unit'    => 'px',
                        'default' => 1,
                    ),
                    'color'      => array(
                        'value'   => 'boxShadowColor',
                        'default' => '#000',
                        'format'  => function( $value, $attrs ) {
                            $opacity = ( isset( $attrs['boxShadowColorOpacity'] ) ? $attrs['boxShadowColorOpacity'] : 50 ) / 100;
                            return Base_CSS::hex2rgba( $value, $opacity );
                        },
                    ),
                ),
                'condition'      => function( $attrs ) {
                    return isset( $attrs['boxShadow'] ) && true === $attrs['boxShadow'];
                },
                'hasSync'        => 'gr-btn-shadow',
            ),
        ),
    )
);
```

Let's break it down:

- `$css= new CSS_Utility( $block_metadata );` - we create a new instance of `CSS_Utility` with the block metadata.
- `$css->add_item` - add a new CSS declaration to the CSS file. A CSS declaration has a selector and some properties. The selector is used to identify the HTML element in the page. The properties are the CSS properties that we want to set. Those two are packed in an array as argument. *At the beginning of each declaration, the id of the block is appended, if you don't any selector, by default the CSS properties will be attributed to the whole block.* -- Global Style don't have an ID, so no ID will be appended making the selector to act in a more general way. We use selector for targeting specific elements in the block. Since we use CSS vars, most of the declaration do not need a selector since we want to set the vars at the block level.
- `properties` - is an array that include a list of CSS properties. Each property has a `property` key, which is the CSS property name, and a `value` key, which is the name of the attribute in the block metadata. The `value` key is the name of the block attribute from which we want to extract the value. `unit` is appending a unit string to the value (`px, rem, %`) - use this the value is has no unit by itself. `default` is used to set a default value, `format` is a function that is used to transform the value to the desired output (sometime is the value an attribute is a complex type like `array`, or `object` in which you need to convert them to a `string`), `condition` is a function that is used to check if the property should be added to the CSS file. `hasSync` is used to identify the attribute that is used for syncing the Global Styles (it must have the same name with the one declared in `render_global_css` but without `--` prefix).
- `pattern` and `pattern_values` is mechanism for creating complex CSS values like `box-shadow`. In `pattern` you put a list of tokens name, and in `pattern_values` you specify what values should be used for each token. The form is similar to the `properties` array.

*When you are working with this, it is good to take inspiration from the existing code, and remember that at the end of day this is just a string with CSS declarations*. At the end of each `render_css` & `render_global_css` function, the `$style = $css->generate();` is present. This will generate the CSS string.

You can always put any string in `$style` and it will be added to the CSS file; like the old days.

Also, some code for the example at the begging:

```php

// For `render_css`

$css->add_item(
    array(
        'properties' => array(
            array(
                'property'  => '--color',
                'value'     => 'color',
                'hasSync'   => 'global-color',
            ),
            array(
                'property'  => '--font-size',
                'value'     => 'fontSizeText',
                'hasSync'   => 'global-font-size',
            ),
        )
    )
);

// For `render_global_css`
// We assume the value keys are the same as the one in block metadata since the same structure is used. You can think Global Style as being a block globally available from which you can inherit the values.

$css->add_item(
    array(
        'selector'   => ' .themeisle-block-test',
        'properties' => array(
            array(
                'property'  => '--global-color',
                'value'     => 'color',
            ),
            array(
                'property'  => '--global-font-size',
                'value'     => 'fontSizeText',
            ),
        )
    )
);
```