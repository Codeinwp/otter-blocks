/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
	attributes
}) => {
	const Tag = attributes.columnsHTMLTag;

	const blockProps = useBlockProps.save({
		id: attributes.id
	});

	return (
		<Tag { ...blockProps }>
			<InnerBlocks.Content />
		</Tag>
	);
};

export default Save;
