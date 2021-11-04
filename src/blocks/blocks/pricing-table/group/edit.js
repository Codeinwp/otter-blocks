
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
