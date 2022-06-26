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
	const alignClasses = [ 'desktop', 'tablet', 'mobile' ].reduce( ( acc, device ) => {
		if ( attributes.align[ device ]) {
			acc.push( `align-${ attributes.align[ device ] }-${ device }` );
		}

		return acc;
	}, []);

	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classnames(
			collapseClass,
			'wp-block-buttons',
			{
				[ `align-${ attributes.align }` ]: 'string' === typeof attributes.align
			},
			...alignClasses
		)
	});

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
