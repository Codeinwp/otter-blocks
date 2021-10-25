/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

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
			data-title={ attributes.title }
		>
			<RichText.Content
				tagName="div"
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
