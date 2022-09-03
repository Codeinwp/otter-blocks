# Testing Cheatsheet

## Dynamic Values

### Dynamic Text & Link

- Post: Should get text/link based on the post being viewed.
- Reusable Block: Should get text/link based on the post being viewed.
- Query: It will show text/link based on the post of the query.
- Custom Layout in Neve: It will get the text/link based on the page being viewed.
- In Index/Archive Pages: Custom Layouts will fetch text/link from itself (not of index) while Query will just show the placeholder (no solution here for now because it’s loop within a loop). Things start to not working properly when it's a loop inside of a loop but I suppose at that far we can't do much.

### Dynamic Images

- Post: Should get image based on the post being edited or viewed, in both ends.
- Reusable Block: Should get image based on the post being edited or viewed, in both ends.
- Query: In the backend, it will show Placeholder while in the front, it will show image based on the post of the query.
- Custom Layout in Neve: While editing, it will get the image in the context of the Custom Layout being edited, while in the front it will get the image based on the page being viewed.
- In Index/Archive Pages: Custom Layouts will fetch image from itself (not of index) while Query will just show the placeholder (no solution here for now because it’s loop within a loop)

---

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

### Insert all blocks, save and reload the page

```javascript
(() => {
	const blocksAdded = wp.data.select( 'core/blocks' ).getBlockTypes()
		.filter( ({ name }) => name.includes( 'themeisle-blocks/' ))
		.map( ({name}) => wp.blocks.createBlock(name, {}))
		.map( (block, idx) => {
			// use delay to easy monitor in inspector if a problem appear during a block insertion
			const delay = 0; // seconds
			return new Promise( (resolve, reject) => {
				setTimeout(() => { 
					wp.data.dispatch( 'core/block-editor' ).insertBlock(block);
					resolve(block.name);
				}, delay * idx * 1000);

			});
		})
	Promise.all(blocksAdded).then( () => {
		setTimeout( () => {
			wp.data.dispatch( 'core/editor' ).savePost();
			setTimeout( () => {
				location.reload()
			}, 1000);
		}, 1000);
	})
})()
```
