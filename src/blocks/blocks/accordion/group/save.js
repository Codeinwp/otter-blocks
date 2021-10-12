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
	return (
		<div
			id={ attributes.id }
			className={ classnames(
				className,
				{
					[`is-${ attributes.gap }-gap`]: attributes.gap
				}
			) }
		>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
