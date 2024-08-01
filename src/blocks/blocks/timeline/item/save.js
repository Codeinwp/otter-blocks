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
			<div class="container">
				<div class="icon">
					<i class="fas fa-circle"></i>
				</div>
				<div class="content">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
};

export default Save;
