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
	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classnames({
			[ `is-${ attributes.gap }-gap` ]: attributes.gap
		})
	});

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
