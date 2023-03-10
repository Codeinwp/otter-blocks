# Creating a new block for Otter

A list of steps to follow so that your block is added correctly. This offer a general guideline on what to do and check when creating a new block. Usually you will copy the settings from an existing block and change the values.

## Registration

Suppose you want to create a new block called `my-card`.

So, you make a new folder in `./src/blocks/blocks/` called `my-card`.

Every block needs a `block.json`. This file contains the block's metadata, such as its name, description, category, icon, and other attributes definition.
Then you create `index.js` and where you call the registration function `registerBlockType`.

You need to import the `index.js` in the `./src/blocks/blocks/index.js` file (this file is one that make the initiation, you can check this on the `webpack.config.js` entry)(The block will not be registered if you don't do this.)

In the root folder, at `./blocks.json`, add another entry with the name of your block and the location of the `block.json` file. (You can also have the option for pro block and their assets, add them based on your needs).

Back to the `./src/blocks/blocks/my-card`. You can create the other files like: `edit.js`, `save.js`, `inspector.js`, `style.scss`, `editor.scss`.

If your block has functionality for end user (aka frontend), you need to add the script in new folder at `./src/blocks/frontend/`. Then you need to add as an entry point in `./webpack.config.json` file. Then building the project, you will that the script is added independently in `./build/blocks/` (you need to run `npm run build` or `npm run start` if you do not see the folder `./build`). Then register that independent script in `./inc/class-registration.php` on `enqueue_dependencies` function (this function load the script for the end user if the block is present in page). (Tip: Add a `console.log('Loaded')` at the beginning of your script to check if it is loaded).

## Adding content

To add content you will usually have those files:
- `edit.js` - This file contains the code for the Editor. What user see in the editor.
- `save.js` - This file contains the code for the Frontend. What the end user see in the final page.
- `inspector.js` - This file contains the code for the Inspector. What user see in the right sidebar. This is imported in `edit.js` file. Make sure to consult [Gutenberg Component Story Book](https://wordpress.github.io/gutenberg/?path=%2Fstory%2Fdocs-introduction--page) to see what components are available.
- `style.scss` - The styling on what the end user see in the final page.
- `editor.scss` - The styling on see in the editor. You can inherit the content from `style.scss` file. Thus this file will contains only changes for the Editor quirks (extra padding on some elements, different nesting on core components, etc.).
- `controls.js` - This file will contains the controls component for the block (The bar that appears in the writing area when you select a block). This is imported in `edit.js` file.

`save.js` can be omitted if the block is rendered dynamically on the frontend. This is usually when the block is very complex or its specification are not standard it will require changes in the future. You need to a create a PHP rendering class in `./inc/render/`, then register the class in `./inc/class-registration.php` on `register_blocks` function in `$dynamic_blocks` array.

> Do not forget to run `composer dumpautoload -o` after you create a new PHP class.

## Pro

Pro feature need to be separated from the free version if it is possible. This is to make sure that the free version is not bloated with unnecessary code. The pro version will be loaded only if the user has the pro version of the plugin.

Pro block are added in `./src/blocks/pro/`. The folder structure is the same as the free version.