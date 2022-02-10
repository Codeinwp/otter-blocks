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
	const blockProps = useBlockProps.save({
		id: attributes.id
	});

	return (
		<div { ...blockProps }>
			<div className="wp-block-themeisle-blocks-tabs__content">
				<InnerBlocks.Content />
			</div>
		</div>
	);
};

export default Save;
