# Dynamic Block Conditions and Content

One of the most powerful feature of Otter is the ability to dynamically change the content of page with blocks using conditions. This is a very powerful feature that allows you to create a single page that can be used for multiple purposes.

E.g.: Showing a different content for logged in users and for guests.

Dynamic content allow the user to easy change the content of the page without the need to update page for each case.

E.g.: Switching images, switching links (imagine manually updating affiliate links for 100 posts).

## Structure

They are split into two parts: Free and Pro.

The Pro part acts like an extension to the Free part.

| Feature | Editor | Backend |
| :-- | :-- | :-- |
| Dynamic Block Conditions | `./src/blocks/plugins/conditions` | `./inc/plugins/class-block-conditions.php` |
| Dynamic Content | `./src/blocks/plugins/dynamic-content` | `./inc/plugins/class-dynamic-content.php` |

Extensions (Pro)

| Feature | Editor | Backend |
| :-- | :-- | :-- |
| Dynamic Block Conditions | `./src/blocks/plugins/conditions` | `./plugins/otter-pro/class-block-conditions.php` |
| Dynamic Content | `./src/blocks/pro/plugins/conditions` | `./plugins/otter-pro/class-dynamic-content.php` |


## How it works

### Dynamic Block Conditions

Block Condition can be added via `Block Tools` in Inspector. It allows you to add conditions for the block to be displayed. There many options available, like: author, post type, logged in status, user role, etc. And even fancy integration with Stripe and WooCommerce.

Once you set a condition, they are saved in the block attributes and are used to check if the block should be displayed or not using PHP.

When the blocks are rendered, we parse the condition from the attribute `'otterConditions'`, then we check if their rule is true. You can check `render_blocks` function in `./inc/plugins/class-block-conditions.php` to see the workflow.

The concept and workflow is simplistic. The hard part of this is making the evaluation function for each condition. When making a condition you need to have in sight:
- performance. This function is called for each block on the page with the given condition, so it needs to be as fast as possible.
- stability. You need to handle the errors and do not let the page crash.

To add a new condition outside Otter context (e.g.: making a custom plugin for extending functionality), you need to add a new function to filter `otter_blocks_evaluate_condition`. You can see an example in `./plugins/otter-pro/class-block-conditions.php`.

### Dynamic Content

Dynamic Content is a feature that allows you to change the content of the block using conditions. It works similar to Dynamic Block Conditions, but instead of hiding the block, it changes the content of the block.

In a page, you can active this by inserting the trigger `%` and then select what content you want to add.

The workflow is similar with Block Conditions, but instead of checking if the block has an established attribute, we look for a _magic tag_ like `<o-dynamic`. The idea is: in the page we put a marker (or _magic tag_) indicating the place we want to add the content, when a user request the page, we replace the marker with the wanted content.

This work like a small template engine. You can view this as [ACF](https://www.advancedcustomfields.com) on steroids integrated with Gutenberg.

Since it act like a template engine, it inherit the challenges of a template engine. The biggest one is parsing the content and extract the _magic tags_. You can have a look at this beautiful function `parse_dynamic_content` in `./inc/plugins/class-dynamic-content.php` which its regex can _be longer than the available space in the universe_ accord to its author.

The requirements from Dynamic Block Conditions are also valid for Dynamic Content.