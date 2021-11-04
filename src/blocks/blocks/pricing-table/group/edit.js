/** @jsx jsx */
import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

import Inspector from './inspector';

import {
	css,
	jsx
} from '@emotion/react';

export default ({ className, attributes, setAttributes }) => {
	const allowedBlocks = [ 'themeisle/pricing-table-item' ];

	const columnsNumberCSS = ( attributes.columns && (
		css`
			&> .block-editor-inner-blocks > .block-editor-block-list__layout {
				grid-template-columns: repeat(${attributes.columns}, 1fr);
			}
		`
	) ) || '';

	const columnWidthCSS = ( attributes.columnWidth && (
		css`
			.pricing-table-wrap {
				width: ${attributes.columnWidth}px;
			}
		`
	) ) || '';

	return (
		<>
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
					allowedBlocks={ allowedBlocks }
					template={ [
						[
							'themeisle/pricing-table-item',
							{
								title: 'Personal',
								description: 'Ideal for getting started'
							}
						],
						[
							'themeisle/pricing-table-item',
							{
								title: 'Team',
								description: 'Ideal for teams',
								isFeatured: true
							}
						],
						[
							'themeisle/pricing-table-item',
							{
								title: 'Enterprise',
								description: 'Ideal for serious money bussiness'
							}
						]
					] }
				/>
			</div>
		</>
	);
};
