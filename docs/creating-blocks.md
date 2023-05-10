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

Some blocks are hybrid, free to use but with limited functionality (e.g.: Sticky, Popup). The pro features are added via JS WP hooks (in a style similar to the one from PHP). Learn more about them [here](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-hooks/).

You need to be careful with using `useSelect` or `useDispatch` hooks inside a function that is a part of the filter. As mentioned in [Handbook](./handbook.md), use `console.count` to check how many times the function is called. Sometime we had unpleasant surprise when we found out that the function is called multiple times: [#799](https://github.com/Codeinwp/otter-blocks/issues/799).

## Testing/Quality

A good block has the following qualities:
- It works as expected.
- It does not break the editor.
- It does not create performance issues.
- Works well with other blocks if it is the case.

To assert the quality of the block, have in sight those things:
- It works with the minimum supported version of WordPress. (Sometimes, the supported version will be raised just to enable some new approach for an easy implementation of a feature, make sure to talk with the manager about this to be sure, otherwise you will probably re-implement the block if you find it to late).
- It looks OK with other themes. We target Neve and WP default theme, but you should check with other popular themes since they may add some extra CSS property that might break the layout.
- It works on environments that it is supposed to work: Full Side Editing Editor, Site Editor, Widgets Editor, Custom Neve Layouts, etc.

Users want simple things from the block:
- It should be easy to use.
- It should be easy to understand.
- It should to the job that is supposed to do (this will be very subjective if the indent of the block is not crystal clear).
- It should not break their work. (Suppose you are a writer, you work 3 hours on a post and you add a block that breaks the layout the content is not saved, you will be very angry -- your are suppose to ease/add value to their work.).

## Future Proof Block

A future proof block is a block that will not break if the user updates the plugin. This is important because we want to make sure that the user will not lose the content if he updates the plugin. The same goes in reverse, if the user rolls back to an older version of the plugin, the block should not break.

The pain point of this is the definition of the attributes, if you have an attributes that is initially a string and later you need an array, you will need to migrate the data. But it will create a problem if the user rolls back to an older version of the plugin since the old version might delete the new format of the data.

For this to happen, you need to discuss with the manager about the attributes and how they will be used. If you are not sure, you can always ask for help. Sometime not even the team or manager can not be sure about it.

The following question can help you to decide if the block is future proof: If tomorrow I will add more on this attribute, that will be the least painful data structure to work with it?

Example: Suppose you have a simple boolean attribute called `save`. If true, the data will be saved on the database. But you think that data can be saved on multiple location: on disk, on cloud, etc. So instead of boolean, you can make it to a string that can have the following values: `database`, `disk`, `cloud`. You can also think that the data can be saved on multiple location at the same time. So you can make it to an array of strings. But this all can be done with a special string like `database,disk,cloud` or `database-disk-cloud`. You can propose those to the manager and team to decide which one is the best. But make sure that the decision is also best for you since you will be the one that will implement it and fix it if something goes wrong (some folks call this _ownership_).

In a nutshell, the block is nice to be (backward compatible)[https://en.wikipedia.org/wiki/Backward_compatibility] with as many version possible since its creation.