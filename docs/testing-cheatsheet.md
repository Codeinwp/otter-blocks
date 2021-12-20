# Testing Cheatsheet

## Console Snippets

### Insert all blocks

```javascript
wp.data.select( 'core/blocks' ).getBlockTypes()
	.filter( ({ name }) => name.includes( 'themeisle-blocks/' ))
	.map( ({name}) => wp.blocks.createBlock(name, {}))
	.forEach( (block, idx) => {
		// use delay to easy monitor in inspector if a problem appear during a block insertion
		const delay = 0; // seconds
		setTimeout(() => wp.data.dispatch( 'core/block-editor' ).insertBlock(block), delay * idx * 1000);
	})
```

### Insert blocks that don't need Neve or Neve Pro to work
```javascript
wp.data.select( 'core/blocks' ).getBlockTypes()
	.filter( ({ name }) => {
		const neveBlocks = [
			'themeisle-blocks/add-to-cart-button',
			'themeisle-blocks/business-hours',
			'themeisle-blocks/review-comparison',
			'themeisle-blocks/woo-comparison'
		];
		return name.includes( 'themeisle-blocks/' ) && !neveBlocks.includes(name);	
	})
	.map( ({name}) => wp.blocks.createBlock(name, {}))
	.forEach( (block, idx) => {
		// use delay to easy monitor in inspector if a problem appear during a block insertion
		const delay = 0; // seconds
		setTimeout(() => wp.data.dispatch( 'core/block-editor' ).insertBlock(block), delay * idx * 1000);
	})
```

### Insert blocks that use Neve or Neve Pro to work or to enable some features 

```javascript
wp.data.select( 'core/blocks' ).getBlockTypes()
	.filter( ({ name }) => {
		const neveBlocks = [
			'themeisle-blocks/add-to-cart-button',
			'themeisle-blocks/business-hours',
			'themeisle-blocks/review-comparison',
			'themeisle-blocks/woo-comparison',
			'themeisle-blocks/popup'
		];
		return neveBlocks.includes(name);	
	})
	.map( ({name}) => wp.blocks.createBlock(name, {}))
	.forEach( (block, idx) => {
		// use delay to easy monitor in inspector if a problem appear during a block insertion
		const delay = 0; // seconds
		setTimeout(() => wp.data.dispatch( 'core/block-editor' ).insertBlock(block), delay * idx * 1000);
	})
```
