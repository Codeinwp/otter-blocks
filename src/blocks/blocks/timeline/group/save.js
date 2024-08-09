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
		className: classnames(
			className,
			{
				'is-reverse': 'reverse-alternative' === attributes.containersAlignment,
				'is-right': 'right' === attributes.containersAlignment,
				'is-left': 'left' === attributes.containersAlignment
			}
		)
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
