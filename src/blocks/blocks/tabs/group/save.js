/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';
import classNames from 'classnames';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classNames(
			attributes.className,
			{ 'has-pos-left': 'left' === attributes.tabsPosition  },
			( attributes.titleAlignment && `is-align-${ attributes.titleAlignment }` )
		)
	});

	return (
		<div { ...blockProps }>
			<div className="wp-block-themeisle-blocks-tabs__content">
				<InnerBlocks.Content />
			</div>
		</div>
	);
};

export default Save;
