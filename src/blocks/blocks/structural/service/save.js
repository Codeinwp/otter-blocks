/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

const Save = ({ className }) => {
	return (
		<div className={ className } >
			<InnerBlocks.Content/>
		</div>
	);
};

export default Save;
