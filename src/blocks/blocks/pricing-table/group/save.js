

import { InnerBlocks, RichText } from '@wordpress/block-editor';


export default ({ attributes }) => {
	return (
		<>
			<div className="o-pricing-table-group-wrap">
				<InnerBlocks.Content />
			</div>
		</>
	);
};
