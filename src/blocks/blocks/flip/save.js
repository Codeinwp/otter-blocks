/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
	RichText
} from '@wordpress/block-editor';

const Save = ({
	attributes,
	className
}) => {
	return (
		<div
			id={ attributes.id }
			className={
				classnames(
					className,
					{ 'flipX': 'flipX' === attributes.animType },
					{ 'flipY': 'flipY' === attributes.animType },
					'anim'
				)
			}
		>
			<div
				className={
					classnames(
						'o-flip-inner',
						{ invert: attributes.isInverted }
					)
				}
			>
				<div className="o-flip-front">
					<div className="o-flip-content">
						{ attributes.frontMedia?.url && (
							<img
								className="o-img"
								src={ attributes.frontMedia?.url }
								srcSet={ attributes.frontMedia?.url }
								alt={ attributes.frontMedia?.alt }
							/>
						) }

						<RichText.Content
							tagName="h3"
							value={ attributes.title }
						/>

						<RichText.Content
							tagName="p"
							value={ attributes.description }
						/>
					</div>
				</div>

				<div className="o-flip-back">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
};

export default Save;
