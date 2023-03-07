/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Notice
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useRef,
	memo,
	useState
} from '@wordpress/element';

let inputTimeout = null;

window.otterCSSLintIgnored = [];

const CSSEditor = ({
	attributes,
	setAttributes,
	clientId
}) => {

	const editorRef = useRef( null );
	const [ errors, setErrors ] = useState([]);
	const [ editorValue, setEditorValue ] = useState( null );

	const getClassName = () => {
		const uniqueId = clientId.substring( 0, 8 );

		// remove the ticss class if custom CSS is empty.
		if ( editorValue?.replace( /\s+/g, '' ) === ( 'selector {\n}\n' ).replace( /\s+/g, '' ) ) {
			return attributes.className ?
				attributes.className.split( ' ' ).filter( className => ! className.includes( 'ticss-' ) ).join( ' ' ) :
				attributes.className;
		}

		const { className } = attributes;

		return className ?
			( ! className.includes( 'ticss-' ) ?
				[ ...className.trim().split( ' ' ), `ticss-${ uniqueId }` ].join( ' ' ) :
				className
			) :
			`ticss-${ uniqueId }`;
	};

	const checkInput = ( editor, ignoreErrors = false ) => {
		let editorErrors = editor?.state?.lint?.marked?.filter( ({ __annotation }) => 'error' === __annotation?.severity )?.map( ({ __annotation }) => __annotation?.message );

		if ( ignoreErrors && 0 < editorErrors?.length ) {
			window.otterCSSLintIgnored = editorErrors;
		}

		editorErrors = editorErrors?.filter( error => ! window.otterCSSLintIgnored.includes( error ) );
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

		editorRef.current = wp.CodeMirror( document.getElementById( 'o-css-editor' ), {
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

		const onChange = () => {
			clearTimeout( inputTimeout );
			inputTimeout = setTimeout( () => {
				checkInput( editorRef.current );
			}, 500 );
		};

		editorRef.current.on( 'change', onChange );

		return () => {
			editorRef.current.off( 'change', onChange );
		};
	}, []);

	useEffect( () => {
		const regex = new RegExp( 'selector', 'g' );
		const className = getClassName();
		const customCSS = className ? editorValue?.replace( regex, `.${ className.split( ' ' ).find( i => i.includes( 'ticss' ) ) }` ) : editorValue;

		if ( ( 'selector {\n}\n' ).replace( /\s+/g, '' ) === customCSS?.replace( /\s+/g, '' ) ) {
			setAttributes({ customCSS: null });
			return;
		}

		if ( customCSS ) {
			setAttributes({
				customCSS,
				hasCustomCSS: true,
				className: getClassName()
			});
		}
	}, [ editorValue ]);

	return (
		<Fragment>
			<p>{__( 'Add your custom CSS.', 'otter-blocks' )}</p>

			<div id="o-css-editor" className="o-css-editor" />

			{ 0 < errors?.length && (
				<div className='o-css-errors'>
					<Notice
						status="error"
						isDismissible={ false }
					>
						{ __( 'Attention needed! We found following errors with your code:', 'otter-blocks' ) }
					</Notice>

					<pre>
						<ul>
							{
								errors.map( ( e, i ) => {
									return (
										<li key={ i } >{ e }</li>
									);
								})
							}
						</ul>
					</pre>

					<Button
						variant='secondary'
						onClick={() => checkInput( editorRef.current, true )}
						style={{ width: 'max-content', marginBottom: '20px' }}
					>
						{ __( 'Override', 'otter-blocks' ) }
					</Button>
				</div>
			) }

			<p>{__( 'Use', 'otter-blocks' )} <code>selector</code> {__( 'to target block wrapper.', 'otter-blocks' )}</p>
			<br />
			<p>{__( 'Example:', 'otter-blocks' )}</p>

			<pre className="o-css-editor-help">
				{'selector {\n    background: #000;\n}\n\nselector img {\n    border-radius: 100%;\n}'}
			</pre>

			<p>{__( 'You can also use other CSS syntax here, such as media queries.', 'otter-blocks' )}</p>
		</Fragment>
	);
};

export default memo( CSSEditor );
