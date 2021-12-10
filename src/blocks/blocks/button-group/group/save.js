/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
	attributes
}) => {
	const collapseClass = 'collapse-none' !== attributes.collapse ? attributes.collapse : '';

	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classnames(
			collapseClass,
			'wp-block-buttons',
			{
				[ `align-${ attributes.align }` ]: attributes.align
			}
		)
	});

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
