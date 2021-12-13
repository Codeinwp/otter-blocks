/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classnames(
			{ 'flipX': 'flipX' === attributes.animType },
			{ 'flipY': 'flipY' === attributes.animType },
			'anim'
		)

	});
	return (
		<div { ...blockProps }>
			<div
				className={
					classnames(
						'o-inner',
						{ invert: attributes.isInverted }
					)
				}
			>
				<div className="o-front">
					<div className="o-content">
						{ attributes.frontMedia?.url && (
							<img
								className="o-ing"
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

				<div className="o-back">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
};

export default Save;
