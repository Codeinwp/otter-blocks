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

import { select } from '@wordpress/data';

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
		
		// remove the ticss class if custom CSS is empty.
		if ( editorValue?.replace( /\s+/g, '' ) === ( 'selector {\n}\n' ).replace( /\s+/g, '' ) ) {
			return attributes.className ?
				attributes.className.split( ' ' ).filter( className => ! className.includes( 'ticss-' ) ).join( ' ' ) :
				attributes.className;
		}
		
		const uniqueId = clientId.substring( 0, 8 );
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
			window?.oTrk?.add({ feature: 'custom-css', featureComponent: 'used' });
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

		const customClass = className?.split( ' ' ).find( i => i.includes( 'ticss' ) );
		const customCSS = customClass ? editorValue?.replace( regex, `.${ customClass }` ) : editorValue;

		if ( ( 'selector {\n}\n' ).replace( /\s+/g, '' ) === customCSS?.replace( /\s+/g, '' ) ) {
			setAttributes({
				customCSS: undefined,
				className
			});
		} else if ( customCSS ) {
			setAttributes({
				customCSS,
				hasCustomCSS: true,
				className
			});
		}
	}, [ editorValue ]);

	return (
		<Fragment>
			{ ( ! Boolean( window?.blocksCSS?.hasOtter ) && !! select( 'core/edit-site' ) ) && (
				<Notice
					status="info"
					isDismissible={ false }
				>
					{ __( 'Blocks CSS is not fully compatible with the Site Editor. We recommend installing Otter for Site Builder compatibility.', 'blocks-css' ) }

					<br/><br/>

					<Button
						variant="primary"
						href={ window?.blocksCSS?.installOtter }
						target="_blank"
					>
						{ __( 'Install Otter', 'blocks-css' ) }
					</Button>
				</Notice>
			) }

			<p>{__( 'Add your custom CSS.', 'blocks-css' )}</p>

			<div id="o-css-editor" className="o-css-editor" />

			{ 0 < errors?.length && (
				<div className='o-css-errors'>
					<Notice
						status="error"
						isDismissible={ false }
					>
						{ __( 'Attention needed! We found following errors with your code:', 'blocks-css' ) }
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
						{ __( 'Override', 'blocks-css' ) }
					</Button>
				</div>
			) }

			<p>{__( 'Use', 'blocks-css' )} <code>selector</code> {__( 'to target block wrapper.', 'blocks-css' )}</p>
			<br />
			<p>{__( 'Example:', 'blocks-css' )}</p>

			<pre className="o-css-editor-help">
				{'selector {\n    background: #000;\n}\n\nselector img {\n    border-radius: 100%;\n}'}
			</pre>

			<p>{__( 'You can also use other CSS syntax here, such as media queries.', 'blocks-css' )}</p>
		</Fragment>
	);
};

export default memo( CSSEditor );
