/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Fragment,
	useEffect,
	useRef,
	memo,
	useState
} from '@wordpress/element';
import { Button } from '@wordpress/components';

let inputTimeout = null;

const CSSEditor = ({
	attributes,
	setAttributes,
	clientId
}) => {

	const editorRef = useRef( null );
	const [ errors, setErrors ] = useState([]);
	const [ customCSS, setCustomCSS ] = useState( null );
	const [ editorValue, setEditorValue ] = useState( null );

	const getClassName = () => {
		const uniqueId = clientId.substr( 0, 8 );

		if ( customCSS?.replace( /\s+/g, '' ) === ( 'selector {\n}\n' ).replace( /\s+/g, '' ) ) {
			return attributes.className;
		}

		return  attributes.className ?
			( ! attributes.className.includes( 'ticss-' ) ? [ ...attributes.className.split( ' ' ), `ticss-${uniqueId}` ].join( ' ' ) : attributes.className ) :
			`ticss-${uniqueId}`;
	};

	const checkInput = ( editor, ignoreErrors = false ) => {
		const editorErrors = editor?.state?.lint?.marked?.filter( ({ __annotation }) => 'error' === __annotation?.severity )?.map( ({ __annotation }) => __annotation?.message );

		setErrors( editorErrors );
		if ( ! ignoreErrors && 0 < editorErrors?.length ) {
			return;
		}
		setEditorValue( editor?.getValue() );
	};


	useEffect( () => {
		const classes = attributes.customCSS && attributes.className?.includes( 'ticss-' ) ? attributes.className.split( ' ' ).find( i => i.includes( 'ticss' ) ) : null;
		let initialValue = 'selector {\n}\n';

		if ( attributes.customCSS ) {
			const regex = new RegExp( '.' + classes, 'g' );
			initialValue = ( attributes.customCSS ).replace( regex, 'selector' );
		}

		editorRef.current = wp.CodeMirror( document.getElementById( 'otter-css-editor' ), {
			value: initialValue,
			autoCloseBrackets: true,
			continueComments: true,
			lineNumbers: true,
			lineWrapping: true,
			matchBrackets: true,
			lint: true,
			gutters: [ 'CodeMirror-lint-markers' ],
			styleActiveLine: true,
			styleActiveSelected: true,
			mode: 'css',
			extraKeys: {
				'Ctrl-Space': 'autocomplete',
				'Alt-F': 'findPersistent',
				'Cmd-F': 'findPersistent'
			}
		});

		editorRef.current.on( 'change', () => {
			clearTimeout( inputTimeout );
			inputTimeout = setTimeout( () => {
				console.count( 'timeout' ); // Remove after final review
				checkInput( editorRef.current );
			}, 500 );
		});
	}, []);

	useEffect( () => {
		const regex = new RegExp( 'selector', 'g' );
		setCustomCSS( editorValue?.replace( regex, `.${getClassName()}` ) );
	}, [ editorValue ]);

	useEffect( () => {
		if ( ( 'selector {\n}\n' ).replace( /\s+/g, '' ) === customCSS?.replace( /\s+/g, '' ) ) {
			setAttributes({ customCSS: null });
			return;
		}
		if ( customCSS ) {
			setAttributes({ customCSS });
		}
	}, [ customCSS ]);

	useEffect( () => {
		setAttributes({
			hasCustomCSS: true,
			className: getClassName()
		});
	}, [ attributes ]);


	return (
		<Fragment>
			<p>{__( 'Add your custom CSS.', 'otter-blocks' )}</p>

			<div id="otter-css-editor" className="otter-css-editor" />

			{
				0 < errors?.length && (
					<div className='o-css-errors'>
						<p>{__( 'Attention needed! There are some errors: ', 'otter-blocks' )}</p>
						<ul style={{ marginTop: '0px' }}>
							{
								errors.map( ( e, i ) => {
									return (
										<li key={i} style={{ color: 'red' }}> {e} </li>
									);
								})
							}
						</ul>
						<Button
							variant='primary'
							onClick={() => checkInput( editorRef, true )}
							style={{ width: 'max-content', marginBottom: '20px'}}
						>
							{__( 'Apply CSS', 'otter-blocks' )}
						</Button>
					</div>
				)
			}

			<p>{__( 'Use', 'otter-blocks' )} <code>selector</code> {__( 'to target block wrapper.', 'otter-blocks' )}</p>
			<br />
			<p>{__( 'Example:', 'otter-blocks' )}</p>

			<pre className="otter-css-editor-help">
				{'selector {\n    background: #000;\n}\n\nselector img {\n    border-radius: 100%;\n}'}
			</pre>

			<p>{__( 'You can also use other CSS syntax here, such as media queries.', 'otter-blocks' )}</p>
		</Fragment>
	);
};

export default memo( CSSEditor );
