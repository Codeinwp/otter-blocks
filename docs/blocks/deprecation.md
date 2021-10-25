> We recommend to read this article before: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/

## [When the big change is comming](https://www.youtube.com/watch?v=enuOArEfqGo)

In the previous chapters we removed the `color` property so that we can add with PHP. Let's add it back and make the migration scheme. **Remember to save the current block (Update or Save draft)**.

```jsx
registerBlockType( 'themeisle-blocks/tutorial-2', {
	title: __( 'My first Block - Tutorial 2' ),
	description: __( 'Small Example 2' ),
	icon: 'universal-access-alt',
	category: 'themeisle-blocks',
	keywords: [ 'tutorial' ],
	attributes: {
		text: {
			type: 'string',
			default: 'Hello'
		},
		color: {
			type: 'string',
			default: 'green'
		}
	},
	edit: ( props ) => {
		console.log( props );
		const [ wordsNum, setWordsNum ] = useState( 0 );
		const onTextChange = ( value ) => props.setAttributes({ text: value.target.value });

		useEffect( () => {
			setWordsNum( props.attributes?.text?.split( ' ' ).length || 0 );
		}, [ props.attributes.text ]);

		return (
			<div className="tutorial">
				<input value={props.attributes?.text} onChange={onTextChange} type="text" />
				<p style={{ color: props.attributes?.color }}>The text is: {props.attributes.text}</p>
				<p>Words Number: {wordsNum}</p>
			</div>
		);
	},
	save: ( props ) => {
		return (
			<div className="tutorial">
				<p style={{ color: props.attributes?.color }} >The text is: {props.attributes.text}</p>
			</div>
		);
	},
	deprecated: [ {
		attributes: {
			text: {
				type: 'string',
				default: 'Hello'
			},
			color: {
				type: 'string',
				default: 'green'
			}
		},
		save: ( props ) => {
			return (
				<div className="tutorial">
					<p >The text is: {props.attributes.text}</p>
				</div>
			);
		}
	} ]
});
```

If we refesh the page, the transition will be made and no error will appear.

```html
<!-- wp:themeisle-blocks/tutorial-2 -->
<div class="wp-block-themeisle-blocks-tutorial-2 tutorial"><p style="color:green">The text is: Hello</p></div>
<!-- /wp:themeisle-blocks/tutorial-2 -->
```

Blocks for reference:

- Section Block: `src/blocks/section/column/deprecated.js` | `src/blocks/section/columns/deprecated.js`
- Posts: `src/blocks/posts/deprecated.js`
- Font Awesome Icons: `src/blocks/font-awesome-icons/deprecated.js`
- Advanced Heading: `src/blocks/advanced-heading/deprecated.js`

We do not have many blocks with the `deprecated` feature; we try as much as possible to avoid this.


