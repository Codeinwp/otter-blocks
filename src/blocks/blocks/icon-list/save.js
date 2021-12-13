/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id
	});

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
