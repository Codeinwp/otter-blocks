/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { InnerBlocks } from '@wordpress/block-editor';

const Save = ({
	attributes,
	className
}) => {
	const collapseClass = 'collapse-none' !== attributes.collapse ? attributes.collapse : '';

	return (
		<div
			id={ attributes.id }
			className={ classnames(
				className,
				collapseClass,
				'wp-block-buttons',
				{
					[ `align-${ attributes.align }` ]: attributes.align
				}
			) }
		>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
