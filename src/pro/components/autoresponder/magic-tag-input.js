import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef
} from '@wordpress/element';

/**
 * A lightweight contentEditable prompt input that renders magic tags as inline,
 * atomic chips while storing a plain `%fieldId%` token string. It deliberately
 * avoids the block-editor RichText component (and its formats/toolbar/hook
 * machinery) — it only needs text plus non-editable token chips.
 */

/**
 * Build a non-editable chip element for a magic tag.
 *
 * @param {string} token The `%fieldId%` token.
 * @param {string} label The human-readable field label.
 * @return {HTMLElement} The chip element.
 */
const createChip = ( token, label ) => {
	const chip = document.createElement( 'span' );
	chip.className = 'o-ar-chip';
	chip.setAttribute( 'contenteditable', 'false' );
	chip.setAttribute( 'data-token', token );
	chip.textContent = label;
	return chip;
};

/**
 * Render a stored prompt string into the editor element as text nodes and chips.
 *
 * @param {HTMLElement}            element The contentEditable element.
 * @param {string}                 value   The stored prompt (`%fieldId%` tokens).
 * @param {Record<string, string>} labels  Map of token to field label.
 * @return {void}
 */
const renderValue = ( element, value, labels ) => {
	element.innerHTML = '';

	const text = value ?? '';
	const matcher = /%[^%\s]+%/g;
	let last = 0;
	let match;

	const appendText = chunk => {
		const lines = chunk.split( '\n' );
		lines.forEach( ( line, index ) => {
			if ( 0 < index ) {
				element.appendChild( document.createElement( 'br' ) );
			}
			if ( '' !== line ) {
				element.appendChild( document.createTextNode( line ) );
			}
		});
	};

	while ( ( match = matcher.exec( text ) ) ) {
		appendText( text.slice( last, match.index ) );

		const token = match[ 0 ];

		if ( undefined !== labels[ token ] ) {
			element.appendChild( createChip( token, labels[ token ] ) );
		} else {
			element.appendChild( document.createTextNode( token ) );
		}

		last = match.index + token.length;
	}

	appendText( text.slice( last ) );
};

/**
 * Serialize the editor DOM back into a stored prompt string, replacing each chip
 * with its `%fieldId%` token and block boundaries with newlines.
 *
 * @param {Node} node The root node to serialize.
 * @return {string} The prompt string.
 */
const serialize = node => {
	let out = '';

	node.childNodes.forEach( child => {
		if ( child.nodeType === window.Node.TEXT_NODE ) {
			out += child.textContent;
		} else if ( 'BR' === child.nodeName ) {
			out += '\n';
		} else if ( child.nodeType === window.Node.ELEMENT_NODE ) {
			const token = child.getAttribute( 'data-token' );

			if ( token ) {
				out += token;
			} else {
				// Treat block-level wrappers the browser may inject as line breaks.
				if ( '' !== out && ! out.endsWith( '\n' ) && /^(DIV|P)$/.test( child.nodeName ) ) {
					out += '\n';
				}
				out += serialize( child );
			}
		}
	});

	return out;
};

/**
 * Magic-tag prompt input.
 *
 * @param {Object}                                                                     props
 * @param {string|undefined}                                                           props.value       The stored prompt string.
 * @param {(value: string) => void}                                                    props.onChange    Change handler receiving the prompt string.
 * @param {Array<{token: string, label: string}>}                                      props.tags        The available magic tags.
 * @param {string|undefined}                                                           props.placeholder The placeholder text.
 * @param {boolean}                                                                    props.disabled    Whether editing is disabled (Pro preview).
 * @param {import('react').Ref<{insertToken: (token: string, label: string) => void}>} ref               Imperative handle exposing insertToken.
 * @return {JSX.Element} The input element.
 */
const MagicTagInput = ( { value, onChange, tags = [], placeholder, disabled = false }, ref ) => {
	const editorRef = useRef( null );
	const lastValue = useRef( null );

	const labels = useMemo( () => {
		const map = {};
		tags.forEach( tag => {
			map[ tag.token ] = tag.label;
		});
		return map;
	}, [ tags ] );

	// Sync the DOM from the stored value, but only when the value changed
	// externally — never in response to our own onChange (which would reset the
	// caret on every keystroke).
	useEffect( () => {
		if ( editorRef.current && value !== lastValue.current ) {
			renderValue( editorRef.current, value, labels );
			lastValue.current = value ?? '';
		}
	}, [ value, labels ] );

	const emit = () => {
		const next = serialize( editorRef.current );
		lastValue.current = next;
		onChange( next );
	};

	const insertToken = ( token, label ) => {
		const element = editorRef.current;

		if ( ! element ) {
			return;
		}

		element.focus();

		const selection = element.ownerDocument.defaultView.getSelection();
		const chip = createChip( token, label );
		const trailing = document.createTextNode( ' ' );

		if ( selection && selection.rangeCount && element.contains( selection.anchorNode ) ) {
			const range = selection.getRangeAt( 0 );
			range.deleteContents();
			range.insertNode( trailing );
			range.insertNode( chip );
			range.setStartAfter( trailing );
			range.collapse( true );
			selection.removeAllRanges();
			selection.addRange( range );
		} else {
			element.appendChild( chip );
			element.appendChild( trailing );
		}

		emit();
	};

	useImperativeHandle( ref, () => ({ insertToken }), [ labels ] );

	// Keep typed content as plain text: strip pasted markup.
	const onPaste = event => {
		event.preventDefault();
		const text = event.clipboardData.getData( 'text/plain' );
		const selection = editorRef.current?.ownerDocument.defaultView.getSelection();

		if ( selection && selection.rangeCount ) {
			const range = selection.getRangeAt( 0 );
			range.deleteContents();
			const node = document.createTextNode( text );
			range.insertNode( node );
			range.setStartAfter( node );
			range.collapse( true );
			selection.removeAllRanges();
			selection.addRange( range );
		}

		emit();
	};

	return (
		<div
			ref={ editorRef }
			className="o-ar-input"
			contentEditable={ ! disabled }
			role="textbox"
			aria-multiline="true"
			aria-label={ placeholder }
			aria-disabled={ disabled || undefined }
			data-placeholder={ placeholder }
			suppressContentEditableWarning
			onInput={ emit }
			onPaste={ onPaste }
		/>
	);
};

export default forwardRef( MagicTagInput );
