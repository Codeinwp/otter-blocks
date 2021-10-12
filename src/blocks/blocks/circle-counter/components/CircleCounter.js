const CircularProgressBar = ({
	attributes,
	progressRef,
	valueRef
}) => {
	const size = attributes.height;
	const center = size / 2;
	const radius = size / 2 - attributes.strokeWidth / 2;
	const circumference = 2 * Math.PI * radius;

	if ( 0 > radius ) {
		return <div></div>;
	}

	return (
		<div
			className="wp-block-themeisle-blocks-circle-counter__bar"
			style={ {
				height: size + 'px',
				width: size + 'px'
			} }
		>
			<svg
				className="wp-block-themeisle-blocks-circle-counter-container"
				width={ size }
				height={ size }
			>
				<circle
					className="wp-block-themeisle-blocks-circle-counter-bg"
					cx={ center }
					cy={ center }
					r={ radius }
					strokeWidth={ attributes.strokeWidth }
					style={ {
						stroke: attributes.backgroundColor
					} }
				/>
				<circle
					ref={ progressRef }
					className="wp-block-themeisle-blocks-circle-counter-progress"
					cx={ center }
					cy={ center }
					r={ radius }
					strokeWidth={ attributes.strokeWidth }
					strokeDasharray={ circumference }
					style={ {
						stroke: attributes.progressColor
					} }
				/>
				<text
					ref={ valueRef }
					className="wp-block-themeisle-blocks-circle-counter-text"
					x="50%"
					y="50%"
					style={ {
						fill: attributes.progressColor,
						fontSize: attributes.fontSizePercent + 'px'
					} }
				>
					{ attributes.percentage }%
				</text>
			</svg>
		</div>
	);
};

export default CircularProgressBar;
