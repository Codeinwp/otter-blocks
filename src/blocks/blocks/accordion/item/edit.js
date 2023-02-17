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
	Fragment, useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import { select } from '@wordpress/data';

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

	useEffect( () => {
		if ( attributes.title === undefined ) {
			const parentClientId = select( 'core/block-editor' ).getBlockParents( clientId ).at( -1 );
			const parentBlock = select( 'core/block-editor' ).getBlock( parentClientId );

			setAttributes({ title: __( 'Accordion item ', 'otter-blocks' ) + parentBlock.innerBlocks.length });
		}
	}, []);

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
							template={ [[ 'core/paragraph', {
								content: __( 'This is a placeholder tab content. It is important to have the necessary information in the block, but at this stage, it is just a placeholder to help you visualise how the content is displayed. Feel free to edit this with your actual content.', 'otter-blocks' )
							}]] }
						/>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
