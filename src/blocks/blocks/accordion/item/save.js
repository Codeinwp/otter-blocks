/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
	attributes,
	className
}) => {
	const blockProps = useBlockProps.save({
		open: attributes.initialOpen ? true : false
	});

	return (
		<details { ...blockProps }>
			<summary className="wp-block-themeisle-blocks-accordion-item__title">
				<RichText.Content
					tagName="div"
					value={ attributes.title }
				/>
			</summary>

			<div className="wp-block-themeisle-blocks-accordion-item__content">
				<InnerBlocks.Content />
			</div>
		</details>
	);
};

export default Save;
