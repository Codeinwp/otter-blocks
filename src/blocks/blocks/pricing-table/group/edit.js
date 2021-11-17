/** @jsx jsx */
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
	css,
	jsx
} from '@emotion/react';
import {
	useEffect
} from '@wordpress/element';

import { blockInit } from '../../../helpers/block-utility';
import Inspector from './inspector';
import defaultAttributes from './attributes.js';

const Edit = ({
	className,
	attributes,
	setAttributes,
	clientId
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);


	const columnsNumberCSS = ( attributes.columns && (
		css`
			&> .block-editor-inner-blocks > .block-editor-block-list__layout {
				grid-template-columns: repeat(${attributes.columns}, 1fr);
			}
		`
	) ) || '';

	const columnWidthCSS = ( attributes.columnWidth && (
		css`
			.o-pricing-table-wrap {
				width: ${attributes.columnWidth}px;
			}
		`
	) ) || '';

	return (
		<div className={className}>
			<Inspector
				setAttributes={ setAttributes }
				attributes={ attributes }
			/>
			<div
				className={ `o-pricing-table-group-wrap ${ className }` }
				css={
					css`
						${columnsNumberCSS};
						${columnWidthCSS};
					`
				}
			>
				<InnerBlocks
					allowedBlocks={ [ 'themeisle/pricing-table-item' ] }
					template={ [
						[
							'themeisle-blocks/pricing-table-item',
							{
								title: 'Personal',
								description: 'Ideal for getting started'
							}
						],
						[
							'themeisle-blocks/pricing-table-item',
							{
								title: 'Team',
								description: 'Ideal for teams',
								isFeatured: true
							}
						],
						[
							'themeisle-blocks/pricing-table-item',
							{
								title: 'Enterprise',
								description: 'Ideal for serious money bussiness'
							}
						]
					] }
				/>
			</div>
		</div>
	);
};

export default Edit;
