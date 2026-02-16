# Color Slug Resolution in Otter Blocks

## Problem

WordPress themes define color palettes in `theme.json` using color slugs (e.g., "primary", "base", "contrast"). Core WordPress blocks can reference these colors by slug, and they are automatically resolved to the actual color values.

However, Otter Blocks were not resolving these color slugs, causing them to revert to defaults when a slug was used instead of a hex/rgb value.

## Solution

We've added color slug resolution utilities that work on both the JavaScript (editor) and PHP (frontend) sides.

### JavaScript Solution

#### Option 1: Use the `useColorResolver` Hook (Recommended)

```javascript
import { useColorResolver } from '../../helpers/utility-hooks.js';

const Edit = ({ attributes, setAttributes }) => {
    // Get the color resolver function
    const resolveColor = useColorResolver();
    
    // Use it to resolve any color attribute
    const resolvedBackgroundColor = resolveColor(attributes.backgroundColor);
    const resolvedTextColor = resolveColor(attributes.textColor);
    
    // Apply to styles
    const style = {
        backgroundColor: resolvedBackgroundColor,
        color: resolvedTextColor
    };
    
    return <div style={style}>...</div>;
};
```

#### Option 2: Use `resolveColorValue` Directly

```javascript
import { useSetting } from '@wordpress/block-editor';
import { resolveColorValue } from '../../helpers/helper-functions';

const Edit = ({ attributes, setAttributes }) => {
    // Get the color palette
    const colorPalette = useSetting('color.palette') || [];
    
    // Resolve colors
    const resolvedColor = resolveColorValue(attributes.backgroundColor, colorPalette);
    
    return <div style={{ backgroundColor: resolvedColor }}>...</div>;
};
```

### PHP Solution

In your block's CSS class (e.g., `class-my-block-css.php`), use the `Base_CSS::resolve_color_value()` method:

```php
$css->add_item(
    array(
        'properties' => array(
            array(
                'property' => 'background-color',
                'value'    => 'backgroundColor',
                'format'   => function ( $value, $attrs ) {
                    return Base_CSS::resolve_color_value( $value );
                },
            ),
            array(
                'property' => 'color',
                'value'    => 'textColor',
                'format'   => function ( $value, $attrs ) {
                    return Base_CSS::resolve_color_value( $value );
                },
            ),
        ),
    )
);
```

## How It Works

### Color Resolution Logic

The resolver:
1. Checks if the value is already a color (starts with `#`, `rgb`, `hsl`, or `var(`)
2. If not, looks up the slug in the theme color palette
3. Returns the resolved color value, or the original value if not found

### Theme Palette Sources

The resolver checks colors from:
- Theme palette (`theme.json` colors)
- Default WordPress colors
- Custom colors added by the user

## Example: Advanced Heading Block

The advanced-heading block has been updated as a reference implementation. See:
- JavaScript: `/src/blocks/blocks/advanced-heading/edit.js`
- PHP: `/inc/css/blocks/class-advanced-heading-css.php`

## Blocks That Need This Fix

Based on analysis, these blocks have color attributes and should be updated:

**High Priority:**
1. Posts Block (multiple color attributes)
2. Section/Column Blocks (backgroundColor, borderColor)
3. Font Awesome Icons Block (textColor, backgroundColor, hover colors)
4. Button Block (color, background, border colors)
5. Review Block (multiple color attributes)

**Medium Priority:**
6. Popup Block
7. Progress Bar Block
8. Circle Counter Block
9. Countdown Block
10. Sharing Icons Block

## Testing

To test color slug resolution:

1. Create a theme with custom colors in `theme.json`:
```json
{
  "version": 2,
  "settings": {
    "color": {
      "palette": [
        {
          "slug": "base",
          "color": "#000000",
          "name": "Base"
        },
        {
          "slug": "primary",
          "color": "#0073aa",
          "name": "Primary"
        }
      ]
    }
  }
}
```

2. Create a block programmatically with a color slug:
```javascript
wp.data.dispatch('core/block-editor').insertBlocks(
    wp.blocks.createBlock('themeisle-blocks/advanced-heading', {
        headingColor: "base",
        content: "Test"
    })
);
```

3. Verify that the correct color is applied both in the editor and on the frontend.

## Notes

- This fix is backward compatible - hex, rgb, and other color formats still work
- The resolver only activates when a value looks like a slug (no `#`, `rgb`, etc.)
- The PHP resolver uses `wp_get_global_settings()` which requires WordPress 5.9+
