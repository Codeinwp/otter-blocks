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

	const showShouldOverlay = ( 'color' === attributes.backgroundOverlayType && attributes.backgroundOverlayColor ) || ( 'image' === attributes.backgroundOverlayType && attributes.backgroundOverlayImage?.url ) || ( 'gradient' === attributes.backgroundOverlayType && attributes.backgroundOverlayGradient );

	const blockProps = useBlockProps.save({
		id: attributes.id
	});

	return (
		<Tag { ...blockProps }>
			{ showShouldOverlay && <div className="wp-block-themeisle-blocks-advanced-column-overlay"></div> }
			<InnerBlocks.Content />
		</Tag>
	);
};

export default Save;
