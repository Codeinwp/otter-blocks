## Creating your first block in Otter

### Disclaimer

This chapter will focus only on creating a block in Otter. For a barebone block, check this source: [https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/](https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/).

**We also recommend following that tutorial first.**

## Introduction

Blocks are the bread and butter for building sites using the Gutenberg interface. Therefore, offering people some free blocks to develop their website is the primary purpose of Otter. This chapter will explain how we can register a block and its components, what we can do with them and how. 

## Registration

To register a block we need to the `registerBlockType` function from the `'@wordpress/blocks'` package. But first, let's create a folder where we can store our code and an index file. If you are on a unix environment (MarOs, Linux, WSL for Windows) and on the root folder of the project, you can run this command:
```bash
touch src/blocks/tutorial-1/index.js
```

Open the `index.js` file and paste this code:

```javascript
// Import the function that register the block
import { registerBlockType } from '@wordpress/block-editor';
// Import the translation function, see: https://developer.wordpress.org/themes/functionality/internationalization/
// If your WordPress use a different language, you will probably see the below strings translated (where is the case)
import { __ } from '@wordpress/i18n';

// Register the block under the internal name as 'themeisle-blocks/tutorial-1' with the fallowing options
registerBlockType( 'themeisle-blocks/tutorial-1', {
	title: __( 'My first Block - Tutorial 1' ), // The title of the block that the user will see in the menu
	description: __( 'Small Example' ), // Description of the block
	icon: 'universal-access-alt', // The icon. WordPress has a built-in icon that can be used by specifying their names
	category: 'themeisle-blocks', // Category, used for WordPress internals
	keywords: [], // Keyword, used by the searching bar in the menu
	attributes: {}, // Attributes, they act like a database, used for storing the setting of the block
	edit: () => (<p>Hello World</p>), // A react component that the user can see in the Editor
	save: () => null // A pure React component that will render the final look of the block used on the published page
});
```

**The block internal name that is used as a first argument in the `registerBlockType` has two parts: the domain (themeisle-blocks) and the name of block (tutorial-1)**. If you want to create a block that shows a progress bar, do not name just `progress-bar`; you need to add a domain so that it can differentiate from others. Gutenberg (aka the `core`) has the `core/` prefix on all its block. You see all the block registered by opening a WordPress page in the Edit mode and going to the console of the Inspector of the browser (`CTRL+SHIT+I` for Chrome and Firefox), and run this code:

```
wp.data.select( 'core/blocks' ).getBlockTypes()
```

And the result you see is something like this:
```
100: {name: "themeisle-blocks/review", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
101: {name: "themeisle-blocks/advanced-column", icon: {…}, keywords: Array(0), attributes: {…}, providesContext: {…}, …}
102: {name: "themeisle-blocks/advanced-columns", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
103: {name: "themeisle-blocks/sharing-icons", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
104: {name: "themeisle-blocks/slider", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
105: {name: "themeisle-blocks/pricing", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
106: {name: "themeisle-blocks/service", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
107: {name: "themeisle-blocks/testimonials", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
108: {name: "core/paragraph", icon: {…}, keywords: Array(1), attributes: {…}, providesContext: {…}, …}
109: {name: "core/image", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}
110: {name: "core/heading", icon: {…}, keywords: Array(2), attributes: {…}, providesContext: {…}, …}
111: {name: "core/gallery", icon: {…}, keywords: Array(2), attributes: {…}, providesContext: {…}, …}
112: {name: "core/list", icon: {…}, keywords: Array(3), attributes: {…}, providesConte
```

Also, you can explore their structure to see their attributes (the saved settings), icons, categories, etc. Also, you use this to check if Gutenberg has registered your block.
> A small script for this is: `wp.data.select( 'core/blocks' ).getBlockTypes().filter( ({ name }) => name === your-name-block)` (example `wp.data.select( 'core/blocks' ).getBlockTypes().filter( ({ name }) => name === "themeisle-blocks/slider")` with the result `0: {name: "themeisle-blocks/slider", icon: {…}, keywords: Array(3), attributes: {…}, providesContext: {…}, …}`)

## Principal components

Options like titles, keywords, or categories are usually a one-time thing. Most of your time, you will dedicate it to attributes (which is a small database), the edit function (the block and its menus used for editing in the Edit mode), and the save function (what the viewers will see on the published/previewed page)

If you succeed in registering the block (check if you can insert it on the page and its show `Hello-World`), change the code with this:
```javascript
registerBlockType( 'themeisle-blocks/tutorial-1', {
	title: __( 'My first Block - Tutorial 1' ),
	description: __( 'Small Example' ),
	icon: 'universal-access-alt',
	category: 'themeisle-blocks', 
	keywords: [],
	attributes: {},
	edit: (props) => { 
		console.log(props)
		return (<p>Hello World</p>)
	}, 
	save: () => null 
});
```

Gutenberg will offer us an object that contains some utility function for block manipulation in the `edit` function. If you refresh the page and insert again the block (if its the case) and go to Inpesctor, you will see the content of the object. The most important are:
- `attributes` which contains our stored values, the structure is described by the `attributes` property from the register function
- `setAttributes` used for changing the values of the `attributes` object
- `isSelected` a boolean value (`true` or `false`) which signals if the block is selected in the Editor.

`Attributes` and `setAttributes` act a like a React state (ex: `const [state, setState] = useState({})`) - with some small difference.

Let's declare an attribute.

```javascript
registerBlockType( 'themeisle-blocks/tutorial-1', {
	title: __( 'My first Block - Tutorial 1' ),
	description: __( 'Small Example' ),
	icon: 'universal-access-alt',
	category: 'themeisle-blocks', 
	keywords: [],
	attributes: { 
		text: {
			type: 'string',
			default: 'Hello'
		},
		num: {
			type: 'number',
		}
	},
	edit: (props) => { 
		console.log(props)
		return (<p>{props.attributes.text} World! {props.attributes.num}</p>)
	}, 
	save: () => null 
});
```

Save it and go the page -> refresh -> Insert a block if is the case -> see Inspector. In the code, you observe that the `attributes` has an interesting structure: you need to define the data type that you want to save (`string`, `array`, `object`, etc) and a default value (if not provided, it will consider it as `undefined` - *Be careful when working with undefined values*). As mentioned earlier, it mimics a database contruected using React hooks.

**Edit and Save are `React components`. In Edit you can use `useState`, `useEffect`. etc. Save must be a pure component - it's not allowed to use a function that produces side-effects.**


Since those function are pretty big and we want some management, we put them in separate file: `edit.js`, `attributes.js` and `save.js`. The code become something like this:

```javascript
import edit from 'edit.js';
import save from 'save.js';
import attributes from 'attirbutes.js';

registerBlockType( 'themeisle-blocks/tutorial-1', {
	title: __( 'My first Block - Tutorial 1' ),
	description: __( 'Small Example' ),
	icon: 'universal-access-alt',
	category: 'themeisle-blocks', 
	keywords: [],
	attributes,
	edit, 
	save 
});
```

You can check the `index` file of the block in the `src/block` and see that they follow this pattern.

The `attributes.js` fallow this tructure:
```javascript
const attributes = {
	text: {
		type: 'string',
		default: 'Hello'
	},
	num: {
		type: 'number',
	}
};

export default attributes;
```

`edit.js` is:
```javascript
const Edit = ({ attributes, setAttributes }) {
	console.log(attributes)
	return (<p>{attributes.text} World! {attributes.num}</p>)
};

export default Edit;
```

You can that we deconstructed the `props` parameter in `attributes` and `setAttributes`. This is a nice shortcut since we do not need all the properties most of the time.

`save.js` is 
```javascript
const Save = ({ attributes }) {
	return (<p>{attributes.text} World! {attributes.num}</p>)
};

export default Save;
```

*The Save component is a special one (not in the good sense), because it has some restriction on what it can do and how to change it*.

In the `edit` function we have all the freedom to do what we want.
> In the edit function, you can even create Netflix - Hardi, circa 2020

Changing the save function will have a particular topic: `Deprecation`. The Save function is the one that can break the page on changing. When the user updates the plugin, it must not break his page and destroy all his work. That is why changing the Save function has some restrictions and why we use PHP hacks to avoid some of them (～￣▽￣)～.

### [Go to Attributes & Edit](editor.md)
