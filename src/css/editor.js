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

const CSSEditor = ({
	attributes,
	setAttributes,
	clientId
}) => {

	const editorRef = useRef( null );
	const customCSSRef = useRef( null );
	const classArRef = useRef( null );
	const [ errors, setErrors ] = useState([]);

	useEffect( () => {
		if ( attributes.customCSS ) {
			if ( attributes.className ) {
				const classes = attributes.className;

				if ( classes.includes( 'ticss-' ) ) {
					classArRef.current = classes.split( ' ' );
					classArRef.current = classArRef.current.find( i => i.includes( 'ticss' ) );
				}
			}

			const regex = new RegExp( '.' + classArRef.current, 'g' );
			const generatedCSS = ( attributes.customCSS ).replace( regex, 'selector' );
			customCSSRef.current = generatedCSS;
		} else {
			customCSSRef.current = 'selector {\n}\n';
		}

		editorRef.current = wp.CodeMirror( document.getElementById( 'otter-css-editor' ), {
			value: customCSSRef.current,
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

		editorRef.current.on( 'change', ( editor ) => {
			const regex = new RegExp( 'selector', 'g' );
			const generatedCSS = editorRef.current.getValue().replace( regex, `.${classArRef.current}` );

			const errors = editor?.state?.lint?.marked?.filter( ({ __annotation }) => 'error' === __annotation?.severity )?.map( ({ __annotation }) => __annotation?.message );

			if ( 0 < errors?.length ) {
				setErrors( errors );
				return;
			}

			customCSSRef.current = generatedCSS;

			if ( ( 'selector {\n}\n' ).replace( /\s+/g, '' ) === customCSSRef.current.replace( /\s+/g, '' ) ) {
				return setAttributes({ customCSS: null });
			}

			setAttributes({ customCSS: customCSSRef.current });
		});
	}, []);

	useEffect( () => {
		let classes = getClassName();

		setAttributes({
			hasCustomCSS: true,
			className: classes
		});
	}, [ attributes ]);

	const getClassName = () => {
		let classes;

		const uniqueId = clientId.substr( 0, 8 );

		if ( null !== customCSSRef.current && ( 'selector {\n}\n' ).replace( /\s+/g, '' ) === customCSSRef.current.replace( /\s+/g, '' ) ) {
			return attributes.className;
		}

		if ( attributes.className ) {
			classes = attributes.className;

			if ( ! classes.includes( 'ticss-' ) ) {
				classes = classes.split( ' ' );
				classes.push( `ticss-${uniqueId}` );
				classes = classes.join( ' ' );
			}

			classArRef.current = classes.split( ' ' );
			classArRef.current = classArRef.current.find( i => i.includes( 'ticss' ) );
		} else {
			classes = `ticss-${uniqueId}`;
			classArRef.current = classes;
		}

		return classes;
	};


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
