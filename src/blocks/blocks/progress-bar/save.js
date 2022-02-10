/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classnames({ 'has-tooltip': 'tooltip' === attributes.percentagePosition }),
		'data-percent': attributes.percentage,
		'data-duration': attributes.duration
	});

	return (
		<div { ...blockProps }>
			{ ( 'outer' === attributes.titleStyle || 'outer' === attributes.percentagePosition ) && (
				<div className="wp-block-themeisle-blocks-progress-bar__outer">
					{ 'outer' === attributes.titleStyle && (
						<span className="wp-block-themeisle-blocks-progress-bar__outer__title">
							{ attributes.title }
						</span>
					) }

					{ 'outer' === attributes.percentagePosition && (
						<div className="wp-block-themeisle-blocks-progress-bar__outer__value wp-block-themeisle-blocks-progress-bar__number">
							{ attributes.percentage }
						</div>
					)}
				</div>
			) }

			<div className="wp-block-themeisle-blocks-progress-bar__area">
				{ ( 'default' === attributes.titleStyle || 'highlight' === attributes.titleStyle ) && (
					<div
						className={ classnames(
							'wp-block-themeisle-blocks-progress-bar__area__title',
							{ 'highlight': 'highlight' === attributes.titleStyle }
						) }
					>
						<span>{ attributes.title }</span>
					</div>
				) }

				<div className="wp-block-themeisle-blocks-progress-bar__area__bar">
					{ 'tooltip' === attributes.percentagePosition && (
						<span className="wp-block-themeisle-blocks-progress-bar__area__tooltip">
							<span className="wp-block-themeisle-blocks-progress-bar__number">
								{ attributes.percentage }
							</span>
							<span className="wp-block-themeisle-blocks-progress-bar__area__arrow"></span>
						</span>
					)}

					{ 'append' === attributes.percentagePosition && (
						<div className="wp-block-themeisle-blocks-progress-bar__progress__append wp-block-themeisle-blocks-progress-bar__number">
							{ attributes.percentage }
						</div>
					) }
				</div>
				{ 'default' === attributes.percentagePosition && (
					<div
						className="wp-block-themeisle-blocks-progress-bar__progress wp-block-themeisle-blocks-progress-bar__number"
					>
						{ `${ attributes.percentage }%` }
					</div>
				)}
			</div>
		</div>
	);
};

export default Save;
