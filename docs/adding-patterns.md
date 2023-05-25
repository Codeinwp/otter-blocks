# Patterns

Patterns are big part of Gutenberg ecosystem. In the old days, plugin developer made their own mechanism to add them, but things are now more organized.

Adding a new pattern for Otter is straight forward.

- All the patterns are located in `./src/patterns` folder.
- Every pattern is just an array with keys described by the [Gutenberg documentation](https://developer.wordpress.org/block-editor/developers/block-api/block-patterns/).
- After creating a file for it, register it on `./inc/patterns.php` file in `$block_patterns` array.

## Mentions

- The pattern name should be unique.
- Do not use specific theme CSS vars as values for attributes. Like `"color": "var(--neve-custom-color)"`. This will make the pattern unusable on other themes. Patterns should be theme agnostic. Exceptions can be made, but only if it is intended.
- Pay attention to image links. The images should the accessible from internet. If use the image that are in a private network, they can not used by users.
- Always test the pattern. There is chance that you might have doing a small modification without thinking it will affect the code.
- Pay attention to the blocks that you use. You accidentally might use a block that is not available in Otter or Gutenberg. Of course, you can add any block, but if it is external, it must intended.


