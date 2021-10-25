/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	RichText
} from '@wordpress/block-editor';

const Save = ({
	attributes,
	className
}) => {
	return (
		<div
			className={ className }
			id={ attributes.id }
		>
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
