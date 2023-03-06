/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		'data-title': attributes.title,
		...( attributes.defaultOpen && { 'data-default-open': attributes.defaultOpen })
	});

	return (
		<div { ...blockProps }>
			<RichText.Content
				tagName={'div'}
				className="wp-block-themeisle-blocks-tabs-item__header"
				value={ attributes.title || __( 'Untitled Tab', 'otter-blocks' ) }
				tabIndex="0"
			/>

			<div className="wp-block-themeisle-blocks-tabs-item__content">
				<InnerBlocks.Content />
			</div>
		</div>
	);
};

export default Save;
