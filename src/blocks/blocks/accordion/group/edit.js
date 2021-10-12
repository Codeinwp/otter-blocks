/** @jsx jsx */

/**
 * External dependencies
 */
import classnames from 'classnames';

import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies.
 */
import { InnerBlocks } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';

import Inspector from './inspector.js';
import { blockInit } from '../../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId,
	isSelected
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const styles = css`
		&.wp-block-themeisle-blocks-accordion .wp-block-themeisle-blocks-accordion-item .wp-block-themeisle-blocks-accordion-item__title {
			color: ${ attributes.titleColor };
			background: ${ attributes.titleBackground };
			border-color: ${ attributes.borderColor };
		}

		&.wp-block-themeisle-blocks-accordion .wp-block-themeisle-blocks-accordion-item .wp-block-themeisle-blocks-accordion-item__title svg {
			fill: ${ attributes.titleColor };
		}

		&.wp-block-themeisle-blocks-accordion .wp-block-themeisle-blocks-accordion-item .wp-block-themeisle-blocks-accordion-item__content {
			background: ${ attributes.contentBackground };
			border-color: ${ attributes.borderColor };
		}
	`;

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				id={ attributes.id }
				className={ classnames(
					className,
					{
						[`is-${ attributes.gap }-gap`]: attributes.gap
					}
				) }
				css={ styles }
			>
				<InnerBlocks
					allowedBlocks={ [ 'themeisle-blocks/accordion-item' ] }
					template={ [ [ 'themeisle-blocks/accordion-item' ] ] }
					renderAppender={ isSelected ? InnerBlocks.ButtonBlockAppender : '' }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
