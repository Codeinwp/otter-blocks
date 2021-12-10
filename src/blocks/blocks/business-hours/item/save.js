/**
 * WordPress dependencies
 */
import {
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
			<div className="otter-business-hour-item__label">
				<RichText.Content
					value={ attributes.label }
					tagName="span"
				/>
			</div>

			<div className="otter-business-hour-item__time">
				<RichText.Content
					value={ attributes.time }
					tagName="span"
				/>
			</div>
		</div>
	);
};

export default Save;
