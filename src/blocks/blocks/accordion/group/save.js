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
		'data-has-schema': attributes.FAQSchema,
		className: classnames({
			exclusive: false === attributes.alwaysOpen,
			[ `is-${ attributes.gap }-gap` ]: attributes.gap && 'string' === typeof attributes.gap,
			'no-gap': 0 === attributes.gap,
			'has-gap': attributes.gap && 'string' !== typeof attributes.gap && 0 !== attributes.gap,
			'icon-first': attributes.iconFirst,
			'has-icon': !! attributes.icon,
			'has-open-icon': !! attributes.openItemIcon
		})
	});

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
