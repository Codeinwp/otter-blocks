# Color Slug Resolution in Otter Blocks

## Problem

WordPress themes define color palettes in `theme.json` using color slugs (e.g., "primary", "base", "contrast"). Core WordPress blocks can reference these colors by slug, and they automatically update when theme colors change.

Otter Blocks were not properly handling color slugs - they were converting slugs to hex values at render time, which broke the connection to theme.json. When theme colors changed, blocks didn't update.

## Solution

We've implemented the same approach as WordPress core blocks: **using CSS variables to preserve the connection to theme.json**.

### How It Works

WordPress automatically generates CSS variables from `theme.json` color palette:
```css
/* WordPress generates these automatically */
:root {
  --wp--preset--color--primary: #0073aa;
  --wp--preset--color--base: #000000;
  --wp--preset--color--contrast: #ffffff;
}
```

When you use a color slug in Otter blocks, it's converted to a CSS variable reference:
```javascript
// Input: slug "primary"
// Output: "var(--wp--preset--color--primary)"
```

**Key Benefit:** When theme.json changes, the CSS variable value updates automatically, and all blocks using that slug instantly reflect the new color - no block re-save needed!

### JavaScript Solution

#### Option 1: Use the `useColorResolver` Hook (Recommended)

```javascript
import { useColorResolver } from '../../helpers/utility-hooks.js';

const Edit = ({ attributes, setAttributes }) => {
    // Get the color resolver function
    const resolveColor = useColorResolver();
    
    // Converts slugs to CSS variables
    // "primary" → "var(--wp--preset--color--primary)"
    // "#ff0000" → "#ff0000" (hex values passed through)
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

#### Option 2: Use `getColorCSSVariable` Directly (Recommended for New Code)

```javascript
import { getColorCSSVariable } from '../../helpers/helper-functions';

const Edit = ({ attributes, setAttributes }) => {
    // Direct conversion of slug to CSS variable
    const colorVar = getColorCSSVariable(attributes.backgroundColor);
    
    // "primary" → "var(--wp--preset--color--primary)"
    // "#ff0000" → "#ff0000"
    
    return <div style={{ backgroundColor: colorVar }}>...</div>;
};
```

**Note:** `resolveColorValue()` is also available as a wrapper for backward compatibility, but `getColorCSSVariable()` is recommended for new code as it's more explicit about its purpose.

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

**Result:**
- Input slug: `"primary"`
- Output CSS: `background-color: var(--wp--preset--color--primary);`
- Input hex: `"#ff0000"`
- Output CSS: `background-color: #ff0000;`

## How It Works

### Color Resolution Logic

The resolver converts color slugs to CSS variables:
1. Checks if the value is already a color (starts with `#`, `rgb`, `hsl`, or `var(`)
2. If it's a hex/rgb/hsl value, returns it unchanged
3. If it's a slug (anything else), converts to CSS variable: `var(--wp--preset--color--{slug})`

**No palette lookup needed!** WordPress handles the CSS variable definitions automatically.

### WordPress CSS Variable Generation

WordPress reads `theme.json` and automatically generates CSS variables:

```json
// theme.json
{
  "settings": {
    "color": {
      "palette": [
        { "slug": "primary", "color": "#0073aa", "name": "Primary" },
        { "slug": "base", "color": "#000000", "name": "Base" }
      ]
    }
  }
}
```

WordPress outputs:
```css
:root {
  --wp--preset--color--primary: #0073aa;
  --wp--preset--color--base: #000000;
}
```

When you change colors in `theme.json`, WordPress updates the CSS variables, and all blocks automatically reflect the change!

## Example: Advanced Heading Block

The advanced-heading block has been updated as a reference implementation. See:
- JavaScript: `/src/blocks/blocks/advanced-heading/edit.js`
- PHP: `/inc/css/blocks/class-advanced-heading-css.php`

## Blocks Updated

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
