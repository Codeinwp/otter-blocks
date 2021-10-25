/**
 * External dependencies
 */
import { chevronDown, chevronUp } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText
} from '@wordpress/block-editor';

import { Icon } from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';

const Edit = ({
	attributes,
	className,
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
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div className={ className } >
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
						tagName="span"
					/>

					<Icon icon={ isOpen ? chevronUp : chevronDown } size={ 24 }/>
				</div>

				{ isOpen && (
					<div className="wp-block-themeisle-blocks-accordion-item__content">
						<InnerBlocks
							template={ [ [ 'core/paragraph' ] ] }
						/>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
