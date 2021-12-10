/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	RichText,
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
			<div className="otter-business-hour__container">
				<div className="otter-business-hour__title">
					<RichText.Content
						value={ attributes.title }
						tagName="span"
					/>
				</div>

				<div className="otter-business-hour__content">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
};

export default Save;
