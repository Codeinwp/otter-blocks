/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';

/**
 * Accordion Item component
 * @param {import('./types.js').AccordionItemProps} props
 * @returns
 */
const Edit = ({
	clientId,
	attributes,
	setAttributes
}) => {
	const [ isOpen, setOpen ] = useState( true );

	const toggle = e => {
		if ( 'string' === typeof e.target.className && e.target.className.includes( 'block-editor-rich-text__editable' ) ) {
			setOpen( true );
		} else {
			setOpen( ! isOpen );
		}
	};

	return (
		<Fragment>
			<Inspector
				clientId={ clientId }
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				{ ...useBlockProps({
					className: classnames({ 'is-open': isOpen })
				})}
			>
				<div
					className="wp-block-themeisle-blocks-accordion-item__title"
					onClick={ toggle }
				>
					<RichText
						placeholder={ __( 'Add text…', 'otter-blocks' ) }
						value={ attributes.title }
						onChange={ value => {
							if ( ! isOpen ) {
								setOpen( true );
							}

							setAttributes({ title: value });
						} }
						tagName={ attributes.tag || 'div' }
					/>
				</div>

				{ isOpen && (
					<div className="wp-block-themeisle-blocks-accordion-item__content">
						<InnerBlocks
							template={ [[ 'core/paragraph' ]] }
						/>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
