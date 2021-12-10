/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

const Save = ({
	attributes,
	className
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		className,
		'data-percentage': attributes.percentage,
		'data-duration': attributes.duration,
		'data-height': attributes.height,
		'data-stroke-width': attributes.strokeWidth,
		'data-font-size-percent': attributes.fontSizePercent,
		'data-background-stroke': attributes.backgroundColor,
		'data-progress-stroke': attributes.progressColor
	});

	return (
		<div { ...blockProps }>
			{ ( 'default' === attributes.titleStyle ) && (
				<div className="wp-block-themeisle-blocks-circle-counter-title__area">
					<span className="wp-block-themeisle-blocks-circle-counter-title__value">
						{ attributes.title }
					</span>
				</div>
			) }

			<div className="wp-block-themeisle-blocks-circle-counter__bar"></div>

			{ ( 'bottom' === attributes.titleStyle ) && (
				<div className="wp-block-themeisle-blocks-circle-counter-title__area">
					<span className="wp-block-themeisle-blocks-circle-counter-title__value">
						{ attributes.title }
					</span>
				</div>
			) }
		</div>
	);
};

export default Save;
