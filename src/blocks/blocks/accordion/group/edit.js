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
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import {
	blockInit,
	getDefaultValueByField
} from '../../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Accordion Group component
 * @param {import('./types').AccordionGroupProps} props
 * @returns
 */
const Edit = ({
	name,
	attributes,
	setAttributes,
	clientId,
	isSelected
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const styles = css`
		--titleColor: ${ getValue( 'titleColor' ) };
		--titleBackground: ${ getValue( 'titleBackground' ) };
		--borderColor: ${ getValue( 'borderColor' ) };
		--contentBackground: ${ getValue( 'contentBackground' ) };
	`;

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames({
			[ `is-${ attributes.gap }-gap` ]: attributes.gap
		}),
		css: styles
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				getValue={ getValue }
			/>

			<div { ...blockProps }>
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
