# The big four

As you can see, there are four other plugins besides Otter that are part of the family. They are:
- Block Animation: allow you to add animation to any block.
- Blocks CSS: allow you to add custom CSS to any block.
- Block Export & Import: allow you to export and import blocks as JSON files.

## Block Animation

This plugin offer the option to the user to animate the block via:
- `animate.css` library ([link](https://animate.style)): we just add this classes to `className` attribute of the block.
- Typing (text only). We use a format tag (`o-anim-typing`) to mark the text that should be animated. We use a custom script to animate the text.
- Counting: Same as Typing, but with the tag `o-anim-counting`.

When it come to upgrading, the `animate.css` library is sometime troublesome. We need to check if the new version is compatible with the old one. If not, we need to update the code to make it compatible.

For Typing and Counting, we have total control over the code (since their are made in-house). So, it is easier to upgrade.

## Blocks CSS

This plugin allow the user to add custom CSS to any block. The CSS is added to the block via a `style` tag. This is handy for edge cases where the user need to enhance a block with an option that is not available in Inspector.

Also, it allow us to provide quick hacks to the user until we fix the issue with styling in a Block.

## Block Export & Import

This is a utility plugin that allow the user to export and import blocks as JSON files. It is useful for the user to backup their blocks and for us to debug issues. Sometime we need to test a block with a specific configuration. This plugin allow us to do the sharing more easily.

For importing, the trick is simple: deserialize the JSON file and replace the block with the new one. For exporting, we need to serialize the block and save it to a JSON file.