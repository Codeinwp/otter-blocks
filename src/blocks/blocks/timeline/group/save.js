/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';
import classnames from 'classnames';

const Save = ({
	attributes,
	className
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classnames( className )
	});

	return (
		<div { ...blockProps }>
			<div className="o-timeline-root">
				<InnerBlocks.Content />
			</div>
		</div>
	);
};

export default Save;
