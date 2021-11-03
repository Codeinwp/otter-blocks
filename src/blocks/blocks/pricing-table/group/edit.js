
import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

import Inspector from './inspector';

export default ({ className, attributes, setAttributes }) => {
	const allowedBlocks = [ 'themeisle/pricing-table-item' ];

	const { hasMoneyBackSection, title, text } = attributes;
	return (
		<>
			<Inspector
				setAttributes={ setAttributes }
				attributes={ attributes }
			/>
			<div className={ `o-pricing-table-group-wrap ${ className }` }>
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
								title: 'Personal',
								description: 'Ideal for getting started',
								isFeatured: true
							}
						],
						[
							'themeisle/pricing-table-item',
							{
								title: 'Personal',
								description: 'Ideal for getting started'
							}
						]
					] }
				/>
			</div>
			{ hasMoneyBackSection && (
				<div className="o-money-back">
					<div className="icon">
						<img
							alt={ __( 'Money back icon', 'otter-blocks' ) }
						/>
					</div>
					<div className="content">
						<RichText
							tagName="h3"
							identifier="money-back-title"
							value={ title }
							onChange={ ( nextTitle ) => {
								setAttributes({
									title: nextTitle
								});
							} }
						/>
						<RichText
							tagName="p"
							identifier="money-back-text"
							value={ text }
							onChange={ ( nextText ) => {
								setAttributes({
									text: nextText
								});
							} }
						/>
					</div>
				</div>
			) }
		</>
	);
};
