/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import classNames from 'classnames';

import metadata from './block.json';

const deprecated = [{
	// Markup before sub-list support, which added the list role.
	attributes: { ...metadata.attributes },

	save: ({
		attributes,
		className
	}) => {
		const blockProps = useBlockProps.save({
			id: attributes.id,
			className: classNames( className, { 'has-divider': Boolean( attributes.hasDivider ) })
		});

		return (
			<div { ...blockProps }>
				<InnerBlocks.Content />
			</div>
		);
	}
}];

export default deprecated;
