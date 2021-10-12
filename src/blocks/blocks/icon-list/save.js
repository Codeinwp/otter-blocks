/**
 * WordPress dependencies.
 */
import { InnerBlocks } from '@wordpress/block-editor';

const Edit = ({
	attributes,
	className
}) => {
	return (
		<div
			className={ className }
			id={ attributes.id }
		>
			<InnerBlocks.Content />
		</div>
	);
};

export default Edit;
