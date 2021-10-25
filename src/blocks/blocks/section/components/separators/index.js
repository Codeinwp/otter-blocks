/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';

const Separators = ({
	type,
	front,
	style,
	fill,
	invert,
	width,
	height
}) => {
	if ( 'none' === style ) {
		return false;
	}

	return (
		<div
			className={ classnames(
				'wp-block-themeisle-blocks-advanced-columns-separators',
				type
			) }
			style={ ( ! front && width ) ? {
				transform: `${ width ? `scaleX( ${ width / 100 } )` : '' }`
			} : {}}
		>
			{ ( 'bigTriangle' === style && false === invert ) && (
				<svg
					id="bigTriangle"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'bottom' === type }
					) }
				>
					<path d="M0 0 L50 100 L100 0 Z"></path>
				</svg>
			) }

			{ ( 'bigTriangle' === style && true === invert ) && (
				<svg
					id="bigTriangle"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'top' === type }
					) }
				>
					<path d="M100, 0l-50, 100l-50, -100l0, 100l100, 0l0, -100Z"></path>
				</svg>
			) }

			{ ( 'rightCurve' === style && false === invert ) && (
				<svg
					id="rightCurve"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'top' === type }
					) }
				>
					<path d="M0 100 C 20 0 50 0 100 100 Z"></path>
				</svg>
			) }

			{ ( 'rightCurve' === style && true === invert ) && (
				<svg
					id="rightCurve"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'top' === type }
					) }
				>
					<path d="M0 100 C 50 0 70 0 100 100 Z"></path>
				</svg>
			) }

			{ ( 'curve' === style ) && (
				<svg
					id="curve"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'top' === type }
					) }
				>
					<path d="M0 100 C40 0 60 0 100 100 Z"></path>
				</svg>
			) }

			{ ( 'slant' === style && false === invert ) && (
				<svg
					id="slant"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'bottom' === type }
					) }
				>
					<path d="M0 0 L100 100 L100 0 Z"></path>
				</svg>
			) }

			{ ( 'slant' === style && true === invert ) && (
				<svg
					id="slant"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'bottom' === type }
					) }
				>
					<path d="M0 0 L0 100 L100 0 Z"></path>
				</svg>
			) }

			{ ( 'cloud' === style ) && (
				<svg
					id="cloud"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					className={ classnames(
						{ 'rotate': 'top' === type }
					) }
				>
					<path d="M-5 100 Q 10 -100 15 100 Z M10 100 Q 20 -20 30 100 M25 100 Q 35 -70 45 100 M40 100 Q 50 -100 60 100 M55 100 Q 65 -20 75 100 M70 100 Q 75 -45 90 100 M85 100 Q 90 -50 95 100 M90 100 Q 95 -25 105 100 Z"></path>
				</svg>
			) }
		</div>
	);
};

export default Separators;
