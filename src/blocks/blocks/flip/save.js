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
		<div id={ attributes.id } className={className, 'anim'}>
			<div
				className="o-inner"
			>
				<div className="o-front">
					<h1>FRONT</h1>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris laoreet tempor ante, ac consequat nisl luctus nec. Etiam eu pellentesque tortor. Vivamus lobortis vitae tortor.</p>
				</div>
				<div className="o-back">
					<InnerBlocks.Content

					/>
				</div>
			</div>
		</div>
	);
};

export default Save;
