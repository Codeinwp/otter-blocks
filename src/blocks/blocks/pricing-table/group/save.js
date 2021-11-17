

import { InnerBlocks } from '@wordpress/block-editor';


const Save = ({ className, attributes }) => {
	return (
		<div id={attributes.id} className={className}>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
