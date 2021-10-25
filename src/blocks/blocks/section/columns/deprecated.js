/**
 * External dependencies
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { omit } from 'lodash';

import { InnerBlocks } from '@wordpress/block-editor';

import {
	SVG,
	Path
} from '@wordpress/components';

const attributes = {
	align: {
		type: 'string'
	},
	id: {
		type: 'string'
	},
	columns: {
		type: 'number'
	},
	layout: {
		type: 'string'
	},
	layoutTablet: {
		type: 'string',
		default: 'equal'
	},
	layoutMobile: {
		type: 'string',
		default: 'equal'
	},
	columnsGap: {
		type: 'string',
		default: 'default'
	},
	paddingType: {
		type: 'string',
		default: 'linked'
	},
	paddingTypeTablet: {
		type: 'string',
		default: 'linked'
	},
	paddingTypeMobile: {
		type: 'string',
		default: 'linked'
	},
	padding: {
		type: 'number',
		default: 20
	},
	paddingTablet: {
		type: 'number',
		default: 20
	},
	paddingMobile: {
		type: 'number',
		default: 20
	},
	paddingTop: {
		type: 'number',
		default: 20
	},
	paddingTopTablet: {
		type: 'number',
		default: 20
	},
	paddingTopMobile: {
		type: 'number',
		default: 20
	},
	paddingRight: {
		type: 'number',
		default: 20
	},
	paddingRightTablet: {
		type: 'number',
		default: 20
	},
	paddingRightMobile: {
		type: 'number',
		default: 20
	},
	paddingBottom: {
		type: 'number',
		default: 20
	},
	paddingBottomTablet: {
		type: 'number',
		default: 20
	},
	paddingBottomMobile: {
		type: 'number',
		default: 20
	},
	paddingLeft: {
		type: 'number',
		default: 20
	},
	paddingLeftTablet: {
		type: 'number',
		default: 20
	},
	paddingLeftMobile: {
		type: 'number',
		default: 20
	},
	marginType: {
		type: 'string',
		default: 'unlinked'
	},
	marginTypeTablet: {
		type: 'string',
		default: 'unlinked'
	},
	marginTypeMobile: {
		type: 'string',
		default: 'unlinked'
	},
	margin: {
		type: 'number',
		default: 20
	},
	marginTablet: {
		type: 'number',
		default: 20
	},
	marginMobile: {
		type: 'number',
		default: 20
	},
	marginTop: {
		type: 'number',
		default: 20
	},
	marginTopTablet: {
		type: 'number',
		default: 20
	},
	marginTopMobile: {
		type: 'number',
		default: 20
	},
	marginBottom: {
		type: 'number',
		default: 20
	},
	marginBottomTablet: {
		type: 'number',
		default: 20
	},
	marginBottomMobile: {
		type: 'number',
		default: 20
	},
	columnsWidth: {
		type: 'number'
	},
	columnsHeight: {
		type: 'string',
		default: 'auto'
	},
	columnsHeightCustom: {
		type: 'number'
	},
	columnsHeightCustomTablet: {
		type: 'number'
	},
	columnsHeightCustomMobile: {
		type: 'number'
	},
	horizontalAlign: {
		type: 'string',
		default: 'unset'
	},
	verticalAlign: {
		type: 'string',
		default: 'unset'
	},
	backgroundType: {
		type: 'string',
		default: 'color'
	},
	backgroundColor: {
		type: 'string'
	},
	backgroundImageID: {
		type: 'number'
	},
	backgroundImageURL: {
		type: 'string'
	},
	backgroundAttachment: {
		type: 'string',
		default: 'scroll'
	},
	backgroundPosition: {
		type: 'string',
		default: 'top left'
	},
	backgroundRepeat: {
		type: 'string',
		default: 'repeat'
	},
	backgroundSize: {
		type: 'string',
		default: 'auto'
	},
	backgroundGradientFirstColor: {
		type: 'string',
		default: '#36d1dc'
	},
	backgroundGradientFirstLocation: {
		type: 'number',
		default: 0
	},
	backgroundGradientSecondColor: {
		type: 'string',
		default: '#5b86e5'
	},
	backgroundGradientSecondLocation: {
		type: 'number',
		default: 100
	},
	backgroundGradientType: {
		type: 'string',
		default: 'linear'
	},
	backgroundGradientAngle: {
		type: 'number',
		default: 90
	},
	backgroundGradientPosition: {
		type: 'string',
		default: 'center center'
	},
	backgroundOverlayOpacity: {
		type: 'number',
		default: 50
	},
	backgroundOverlayType: {
		type: 'string',
		default: 'color'
	},
	backgroundOverlayColor: {
		type: 'string'
	},
	backgroundOverlayImageID: {
		type: 'number'
	},
	backgroundOverlayImageURL: {
		type: 'string'
	},
	backgroundOverlayAttachment: {
		type: 'string',
		default: 'scroll'
	},
	backgroundOverlayPosition: {
		type: 'string',
		default: 'top left'
	},
	backgroundOverlayRepeat: {
		type: 'string',
		default: 'repeat'
	},
	backgroundOverlaySize: {
		type: 'string',
		default: 'auto'
	},
	backgroundOverlayGradientFirstColor: {
		type: 'string',
		default: '#36d1dc'
	},
	backgroundOverlayGradientFirstLocation: {
		type: 'number',
		default: 0
	},
	backgroundOverlayGradientSecondColor: {
		type: 'string',
		default: '#5b86e5'
	},
	backgroundOverlayGradientSecondLocation: {
		type: 'number',
		default: 100
	},
	backgroundOverlayGradientType: {
		type: 'string',
		default: 'linear'
	},
	backgroundOverlayGradientAngle: {
		type: 'number',
		default: 90
	},
	backgroundOverlayGradientPosition: {
		type: 'string',
		default: 'center center'
	},
	backgroundOverlayFilterBlur: {
		type: 'number',
		default: 0
	},
	backgroundOverlayFilterBrightness: {
		type: 'number',
		default: 10
	},
	backgroundOverlayFilterContrast: {
		type: 'number',
		default: 10
	},
	backgroundOverlayFilterGrayscale: {
		type: 'number',
		default: 0
	},
	backgroundOverlayFilterHue: {
		type: 'number',
		default: 0
	},
	backgroundOverlayFilterSaturate: {
		type: 'number',
		default: 10
	},
	backgroundOverlayBlend: {
		type: 'string',
		default: 'normal'
	},
	borderType: {
		type: 'string',
		default: 'linked'
	},
	border: {
		type: 'number',
		default: 0
	},
	borderTop: {
		type: 'number',
		default: 0
	},
	borderRight: {
		type: 'number',
		default: 0
	},
	borderBottom: {
		type: 'number',
		default: 0
	},
	borderLeft: {
		type: 'number',
		default: 0
	},
	borderColor: {
		type: 'string',
		default: '#000000'
	},
	borderRadiusType: {
		type: 'string',
		default: 'linked'
	},
	borderRadius: {
		type: 'number',
		default: 0
	},
	borderRadiusTop: {
		type: 'number',
		default: 0
	},
	borderRadiusRight: {
		type: 'number',
		default: 0
	},
	borderRadiusBottom: {
		type: 'number',
		default: 0
	},
	borderRadiusLeft: {
		type: 'number',
		default: 0
	},
	boxShadow: {
		type: 'boolean',
		default: false
	},
	boxShadowColor: {
		type: 'string',
		default: '#000000'
	},
	boxShadowColorOpacity: {
		type: 'number',
		default: 50
	},
	boxShadowBlur: {
		type: 'number',
		default: 5
	},
	boxShadowSpread: {
		type: 'number',
		default: 0
	},
	boxShadowHorizontal: {
		type: 'number',
		default: 0
	},
	boxShadowVertical: {
		type: 'number',
		default: 0
	},
	dividerTopType: {
		type: 'string',
		default: 'none'
	},
	dividerTopColor: {
		type: 'string',
		default: '#000000'
	},
	dividerTopWidth: {
		type: 'number',
		default: 100
	},
	dividerTopWidthTablet: {
		type: 'number',
		default: 100
	},
	dividerTopWidthMobile: {
		type: 'number',
		default: 100
	},
	dividerTopHeight: {
		type: 'number',
		default: 100
	},
	dividerTopHeightTablet: {
		type: 'number',
		default: 100
	},
	dividerTopHeightMobile: {
		type: 'number',
		default: 100
	},
	dividerTopInvert: {
		type: 'boolean',
		default: false
	},
	dividerBottomType: {
		type: 'string',
		default: 'none'
	},
	dividerBottomColor: {
		type: 'string',
		default: '#000000'
	},
	dividerBottomWidth: {
		type: 'number',
		default: 100
	},
	dividerBottomWidthTablet: {
		type: 'number',
		default: 100
	},
	dividerBottomWidthMobile: {
		type: 'number',
		default: 100
	},
	dividerBottomHeight: {
		type: 'number',
		default: 100
	},
	dividerBottomHeightTablet: {
		type: 'number',
		default: 100
	},
	dividerBottomHeightMobile: {
		type: 'number',
		default: 100
	},
	dividerBottomInvert: {
		type: 'boolean',
		default: false
	},
	hide: {
		type: 'boolean',
		default: false
	},
	hideTablet: {
		type: 'boolean',
		default: false
	},
	hideMobile: {
		type: 'boolean',
		default: false
	},
	columnsHTMLTag: {
		type: 'string',
		default: 'div'
	}
};

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
				<SVG
					id="bigTriangle"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'bottom' === type ? {
						transform: `${ 'bottom' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M0 0 L50 100 L100 0 Z"></Path>
				</SVG>
			) }

			{ ( 'bigTriangle' === style && true === invert ) && (
				<SVG
					id="bigTriangle"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'top' === type ? {
						transform: `${ 'top' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M100, 0l-50, 100l-50, -100l0, 100l100, 0l0, -100Z"></Path>
				</SVG>
			) }

			{ ( 'rightCurve' === style && false === invert ) && (
				<SVG
					id="rightCurve"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'top' === type ? {
						transform: `${ 'top' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M0 100 C 20 0 50 0 100 100 Z"></Path>
				</SVG>
			) }

			{ ( 'rightCurve' === style && true === invert ) && (
				<SVG
					id="rightCurve"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'top' === type ? {
						transform: `${ 'top' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M0 100 C 50 0 70 0 100 100 Z"></Path>
				</SVG>
			) }

			{ ( 'curve' === style ) && (
				<SVG
					id="curve"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'top' === type ? {
						transform: `${ 'top' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M0 100 C40 0 60 0 100 100 Z"></Path>
				</SVG>
			) }

			{ ( 'slant' === style && false === invert ) && (
				<SVG
					id="slant"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'bottom' === type ? {
						transform: `${ 'bottom' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M0 0 L100 100 L100 0 Z"></Path>
				</SVG>
			) }

			{ ( 'slant' === style && true === invert ) && (
				<SVG
					id="slant"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'bottom' === type ? {
						transform: `${ 'bottom' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M0 0 L0 100 L100 0 Z"></Path>
				</SVG>
			) }

			{ ( 'cloud' === style ) && (
				<SVG
					id="cloud"
					fill={ fill }
					viewBox="0 0 100 100"
					width="100%"
					height={ height ? `${ height }px` : '100' }
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ 'top' === type ? {
						transform: `${ 'top' === type ? 'rotate(180deg)' : '' }`
					} : {}}
				>
					<Path d="M-5 100 Q 10 -100 15 100 Z M10 100 Q 20 -20 30 100 M25 100 Q 35 -70 45 100 M40 100 Q 50 -100 60 100 M55 100 Q 65 -20 75 100 M70 100 Q 75 -45 90 100 M85 100 Q 90 -50 95 100 M90 100 Q 95 -25 105 100 Z"></Path>
				</SVG>
			) }
		</div>
	);
};

const SeparatorsNew = ({
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
				<SVG
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
					<Path d="M0 0 L50 100 L100 0 Z"></Path>
				</SVG>
			) }

			{ ( 'bigTriangle' === style && true === invert ) && (
				<SVG
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
					<Path d="M100, 0l-50, 100l-50, -100l0, 100l100, 0l0, -100Z"></Path>
				</SVG>
			) }

			{ ( 'rightCurve' === style && false === invert ) && (
				<SVG
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
					<Path d="M0 100 C 20 0 50 0 100 100 Z"></Path>
				</SVG>
			) }

			{ ( 'rightCurve' === style && true === invert ) && (
				<SVG
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
					<Path d="M0 100 C 50 0 70 0 100 100 Z"></Path>
				</SVG>
			) }

			{ ( 'curve' === style ) && (
				<SVG
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
					<Path d="M0 100 C40 0 60 0 100 100 Z"></Path>
				</SVG>
			) }

			{ ( 'slant' === style && false === invert ) && (
				<SVG
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
					<Path d="M0 0 L100 100 L100 0 Z"></Path>
				</SVG>
			) }

			{ ( 'slant' === style && true === invert ) && (
				<SVG
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
					<Path d="M0 0 L0 100 L100 0 Z"></Path>
				</SVG>
			) }

			{ ( 'cloud' === style ) && (
				<SVG
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
					<Path d="M-5 100 Q 10 -100 15 100 Z M10 100 Q 20 -20 30 100 M25 100 Q 35 -70 45 100 M40 100 Q 50 -100 60 100 M55 100 Q 65 -20 75 100 M70 100 Q 75 -45 90 100 M85 100 Q 90 -50 95 100 M90 100 Q 95 -25 105 100 Z"></Path>
				</SVG>
			) }
		</div>
	);
};

const deprecated = [ {
	attributes,

	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},

	save: ({
		attributes,
		className
	}) => {
		const Tag = attributes.columnsHTMLTag;

		let background, overlayBackground, borderStyle, borderRadiusStyle, boxShadowStyle;

		if ( 'color' === attributes.backgroundType ) {
			background = {
				background: attributes.backgroundColor
			};
		}

		if ( 'image' === attributes.backgroundType ) {
			background = {
				backgroundImage: `url( '${ attributes.backgroundImageURL }' )`,
				backgroundAttachment: attributes.backgroundAttachment,
				backgroundPosition: attributes.backgroundPosition,
				backgroundRepeat: attributes.backgroundRepeat,
				backgroundSize: attributes.backgroundSize
			};
		}

		if ( 'gradient' === attributes.backgroundType ) {
			let direction;

			if ( 'linear' === attributes.backgroundGradientType ) {
				direction = `${ attributes.backgroundGradientAngle }deg`;
			} else {
				direction = `at ${ attributes.backgroundGradientPosition }`;
			}

			background = {
				background: `${ attributes.backgroundGradientType }-gradient( ${ direction }, ${ attributes.backgroundGradientFirstColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundGradientFirstLocation }%, ${ attributes.backgroundGradientSecondColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundGradientSecondLocation }% )`
			};
		}

		if ( 'linked' === attributes.borderType ) {
			borderStyle = {
				borderWidth: `${ attributes.border }px`,
				borderStyle: 'solid',
				borderColor: attributes.borderColor
			};
		}

		if ( 'unlinked' === attributes.borderType ) {
			borderStyle = {
				borderTopWidth: `${ attributes.borderTop }px`,
				borderRightWidth: `${ attributes.borderRight }px`,
				borderBottomWidth: `${ attributes.borderBottom }px`,
				borderLeftWidth: `${ attributes.borderLeft }px`,
				borderStyle: 'solid',
				borderColor: attributes.borderColor
			};
		}

		if ( 'linked' === attributes.borderRadiusType ) {
			borderRadiusStyle = {
				borderRadius: `${ attributes.borderRadius }px`
			};
		}

		if ( 'unlinked' === attributes.borderRadiusType ) {
			borderRadiusStyle = {
				borderTopLeftRadius: `${ attributes.borderRadiusTop }px`,
				borderTopRightRadius: `${ attributes.borderRadiusRight }px`,
				borderBottomRightRadius: `${ attributes.borderRadiusBottom }px`,
				borderBottomLeftRadius: `${ attributes.borderRadiusLeft }px`
			};
		}

		if ( true === attributes.boxShadow ) {
			boxShadowStyle = {
				boxShadow: `${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ attributes.boxShadowSpread }px ${  hexToRgba( ( attributes.boxShadowColor ? attributes.boxShadowColor : '#000000' ), attributes.boxShadowColorOpacity ) }`
			};
		}

		const style = {
			...background,
			...borderStyle,
			...borderRadiusStyle,
			...boxShadowStyle,
			justifyContent: attributes.horizontalAlign
		};

		if ( 'color' === attributes.backgroundOverlayType ) {
			overlayBackground = {
				background: attributes.backgroundOverlayColor,
				opacity: attributes.backgroundOverlayOpacity / 100
			};
		}

		if ( 'image' === attributes.backgroundOverlayType ) {
			overlayBackground = {
				backgroundImage: `url( '${ attributes.backgroundOverlayImageURL }' )`,
				backgroundAttachment: attributes.backgroundOverlayAttachment,
				backgroundPosition: attributes.backgroundOverlayPosition,
				backgroundRepeat: attributes.backgroundOverlayRepeat,
				backgroundSize: attributes.backgroundOverlaySize,
				opacity: attributes.backgroundOverlayOpacity / 100
			};
		}

		if ( 'gradient' === attributes.backgroundOverlayType ) {
			let direction;

			if ( 'linear' === attributes.backgroundOverlayGradientType ) {
				direction = `${ attributes.backgroundOverlayGradientAngle }deg`;
			} else {
				direction = `at ${ attributes.backgroundOverlayGradientPosition }`;
			}

			overlayBackground = {
				background: `${ attributes.backgroundOverlayGradientType }-gradient( ${ direction }, ${ attributes.backgroundOverlayGradientFirstColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundOverlayGradientFirstLocation }%, ${ attributes.backgroundOverlayGradientSecondColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundOverlayGradientSecondLocation }% )`,
				opacity: attributes.backgroundOverlayOpacity / 100
			};
		}

		const overlayStyle = {
			...overlayBackground,
			mixBlendMode: attributes.backgroundOverlayBlend,
			filter: `blur( ${ attributes.backgroundOverlayFilterBlur / 10 }px ) brightness( ${ attributes.backgroundOverlayFilterBrightness / 10 } ) contrast( ${ attributes.backgroundOverlayFilterContrast / 10 } ) grayscale( ${ attributes.backgroundOverlayFilterGrayscale / 100 } ) hue-rotate( ${ attributes.backgroundOverlayFilterHue }deg ) saturate( ${ attributes.backgroundOverlayFilterSaturate / 10 } )`
		};

		let innerStyle = {};

		if ( attributes.columnsWidth ) {
			innerStyle = {
				maxWidth: attributes.columnsWidth + 'px'
			};
		}

		const desktopLayout = attributes.hide ? '' : `has-desktop-${ attributes.layout }-layout`;
		const tabletLayout = attributes.hideTablet ? '' : `has-tablet-${ attributes.layoutTablet }-layout`;
		const mobileLayout = attributes.hideMobile ? '' : `has-mobile-${ attributes.layoutMobile }-layout`;

		const classes = classnames(
			className,
			`has-${ attributes.columns }-columns`,
			desktopLayout,
			tabletLayout,
			mobileLayout,
			{ 'hide-in-desktop': attributes.hide },
			{ 'hide-in-tablet': attributes.hideTablet },
			{ 'hide-in-mobile': attributes.hideMobile },
			`has-${ attributes.lcolumnsGap }-gap`,
			`has-vertical-${ attributes.verticalAlign }`
		);

		return (
			<Tag
				className={ classes }
				id={ attributes.id }
				style={ style }
			>
				<div
					className="wp-themeisle-block-overlay"
					style={ overlayStyle }
				>
				</div>

				<Separators
					type="top"
					front={ true }
					style={ attributes.dividerTopType }
					fill={ attributes.dividerTopColor }
					invert={ attributes.dividerTopInvert }
				/>

				<div
					className="innerblocks-wrap"
					style={ innerStyle }
				>
					<InnerBlocks.Content />
				</div>

				<Separators
					type="bottom"
					front={ true }
					style={ attributes.dividerBottomType }
					fill={ attributes.dividerBottomColor }
					invert={ attributes.dividerBottomInvert }
				/>
			</Tag>
		);
	}
}, {
	attributes,

	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},

	save: ({
		attributes,
		className
	}) => {
		const Tag = attributes.columnsHTMLTag;

		let background, overlayBackground, borderStyle, borderRadiusStyle, boxShadowStyle;

		if ( 'color' === attributes.backgroundType ) {
			background = {
				background: attributes.backgroundColor
			};
		}

		if ( 'image' === attributes.backgroundType ) {
			background = {
				backgroundImage: `url( '${ attributes.backgroundImageURL }' )`,
				backgroundAttachment: attributes.backgroundAttachment,
				backgroundPosition: attributes.backgroundPosition,
				backgroundRepeat: attributes.backgroundRepeat,
				backgroundSize: attributes.backgroundSize
			};
		}

		if ( 'gradient' === attributes.backgroundType ) {
			let direction;

			if ( 'linear' === attributes.backgroundGradientType ) {
				direction = `${ attributes.backgroundGradientAngle }deg`;
			} else {
				direction = `at ${ attributes.backgroundGradientPosition }`;
			}

			background = {
				background: `${ attributes.backgroundGradientType }-gradient( ${ direction }, ${ attributes.backgroundGradientFirstColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundGradientFirstLocation }%, ${ attributes.backgroundGradientSecondColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundGradientSecondLocation }% )`
			};
		}

		if ( 'linked' === attributes.borderType ) {
			borderStyle = {
				borderWidth: `${ attributes.border }px`,
				borderStyle: 'solid',
				borderColor: attributes.borderColor
			};
		}

		if ( 'unlinked' === attributes.borderType ) {
			borderStyle = {
				borderTopWidth: `${ attributes.borderTop }px`,
				borderRightWidth: `${ attributes.borderRight }px`,
				borderBottomWidth: `${ attributes.borderBottom }px`,
				borderLeftWidth: `${ attributes.borderLeft }px`,
				borderStyle: 'solid',
				borderColor: attributes.borderColor
			};
		}

		if ( 'linked' === attributes.borderRadiusType ) {
			borderRadiusStyle = {
				borderRadius: `${ attributes.borderRadius }px`
			};
		}

		if ( 'unlinked' === attributes.borderRadiusType ) {
			borderRadiusStyle = {
				borderTopLeftRadius: `${ attributes.borderRadiusTop }px`,
				borderTopRightRadius: `${ attributes.borderRadiusRight }px`,
				borderBottomRightRadius: `${ attributes.borderRadiusBottom }px`,
				borderBottomLeftRadius: `${ attributes.borderRadiusLeft }px`
			};
		}

		if ( true === attributes.boxShadow ) {
			boxShadowStyle = {
				boxShadow: `${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ attributes.boxShadowSpread }px ${  hexToRgba( ( attributes.boxShadowColor ? attributes.boxShadowColor : '#000000' ), attributes.boxShadowColorOpacity ) }`
			};
		}

		const style = {
			...background,
			...borderStyle,
			...borderRadiusStyle,
			...boxShadowStyle,
			justifyContent: attributes.horizontalAlign
		};

		if ( 'color' === attributes.backgroundOverlayType ) {
			overlayBackground = {
				background: attributes.backgroundOverlayColor,
				opacity: attributes.backgroundOverlayOpacity / 100
			};
		}

		if ( 'image' === attributes.backgroundOverlayType ) {
			overlayBackground = {
				backgroundImage: `url( '${ attributes.backgroundOverlayImageURL }' )`,
				backgroundAttachment: attributes.backgroundOverlayAttachment,
				backgroundPosition: attributes.backgroundOverlayPosition,
				backgroundRepeat: attributes.backgroundOverlayRepeat,
				backgroundSize: attributes.backgroundOverlaySize,
				opacity: attributes.backgroundOverlayOpacity / 100
			};
		}

		if ( 'gradient' === attributes.backgroundOverlayType ) {
			let direction;

			if ( 'linear' === attributes.backgroundOverlayGradientType ) {
				direction = `${ attributes.backgroundOverlayGradientAngle }deg`;
			} else {
				direction = `at ${ attributes.backgroundOverlayGradientPosition }`;
			}

			overlayBackground = {
				background: `${ attributes.backgroundOverlayGradientType }-gradient( ${ direction }, ${ attributes.backgroundOverlayGradientFirstColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundOverlayGradientFirstLocation }%, ${ attributes.backgroundOverlayGradientSecondColor || 'rgba( 0, 0, 0, 0 )' } ${ attributes.backgroundOverlayGradientSecondLocation }% )`,
				opacity: attributes.backgroundOverlayOpacity / 100
			};
		}

		const overlayStyle = {
			...overlayBackground,
			mixBlendMode: attributes.backgroundOverlayBlend
		};

		let innerStyle = {};

		if ( attributes.columnsWidth ) {
			innerStyle = {
				maxWidth: attributes.columnsWidth + 'px'
			};
		}

		const desktopLayout = attributes.hide ? '' : `has-desktop-${ attributes.layout }-layout`;
		const tabletLayout = attributes.hideTablet ? '' : `has-tablet-${ attributes.layoutTablet }-layout`;
		const mobileLayout = attributes.hideMobile ? '' : `has-mobile-${ attributes.layoutMobile }-layout`;

		const classes = classnames(
			className,
			`has-${ attributes.columns }-columns`,
			desktopLayout,
			tabletLayout,
			mobileLayout,
			{ 'hide-in-desktop': attributes.hide },
			{ 'hide-in-tablet': attributes.hideTablet },
			{ 'hide-in-mobile': attributes.hideMobile },
			`has-${ attributes.columnsGap }-gap`,
			`has-vertical-${ attributes.verticalAlign }`
		);

		return (
			<Tag
				className={ classes }
				id={ attributes.id }
				style={ style }
			>
				<div
					className="wp-themeisle-block-overlay"
					style={ overlayStyle }
				>
				</div>

				<Separators
					type="top"
					front={ true }
					style={ attributes.dividerTopType }
					fill={ attributes.dividerTopColor }
					invert={ attributes.dividerTopInvert }
				/>

				<div
					className="innerblocks-wrap"
					style={ innerStyle }
				>
					<InnerBlocks.Content />
				</div>

				<Separators
					type="bottom"
					front={ true }
					style={ attributes.dividerBottomType }
					fill={ attributes.dividerBottomColor }
					invert={ attributes.dividerBottomInvert }
				/>
			</Tag>
		);
	}
}, {
	attributes: {
		...attributes,
		paddingTablet: {
			type: 'number'
		},
		paddingMobile: {
			type: 'number'
		},
		paddingTopTablet: {
			type: 'number'
		},
		paddingTopMobile: {
			type: 'number'
		},
		paddingRightTablet: {
			type: 'number'
		},
		paddingRightMobile: {
			type: 'number'
		},
		paddingBottomTablet: {
			type: 'number'
		},
		paddingBottomMobile: {
			type: 'number'
		},
		paddingLeftTablet: {
			type: 'number'
		},
		paddingLeftMobile: {
			type: 'number'
		},
		marginTablet: {
			type: 'number'
		},
		marginMobile: {
			type: 'number'
		},
		marginTopTablet: {
			type: 'number'
		},
		marginTopMobile: {
			type: 'number'
		},
		marginBottomTablet: {
			type: 'number'
		},
		marginBottomMobile: {
			type: 'number'
		},
		reverseColumnsTablet: {
			type: 'boolean',
			default: false
		},
		reverseColumnsMobile: {
			type: 'boolean',
			default: false
		}
	},

	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},

	save: ({
		attributes,
		className
	}) => {
		const Tag = attributes.columnsHTMLTag;

		const desktopLayout = attributes.hide ? '' : `has-desktop-${ attributes.layout }-layout`;
		const tabletLayout = attributes.hideTablet ? '' : `has-tablet-${ attributes.layoutTablet }-layout`;
		const mobileLayout = attributes.hideMobile ? '' : `has-mobile-${ attributes.layoutMobile }-layout`;

		const classes = classnames(
			className,
			`has-${ attributes.columns }-columns`,
			desktopLayout,
			tabletLayout,
			mobileLayout,
			{ 'hide-in-desktop': attributes.hide },
			{ 'hide-in-tablet': attributes.hideTablet },
			{ 'hide-in-mobile': attributes.hideMobile },
			{ 'has-reverse-columns-tablet': ( attributes.reverseColumnsTablet && ! attributes.hideTablet && 'collapsedRows' === attributes.layoutTablet ) },
			{ 'has-reverse-columns-mobile': ( attributes.reverseColumnsMobile && ! attributes.hideMobile && 'collapsedRows' === attributes.layoutMobile ) },
			`has-${ attributes.columnsGap }-gap`,
			`has-vertical-${ attributes.verticalAlign }`
		);

		return (
			<Tag
				className={ classes }
				id={ attributes.id }
			>
				<div className="wp-block-themeisle-blocks-advanced-columns-overlay"></div>

				<SeparatorsNew
					type="top"
					front={ true }
					style={ attributes.dividerTopType }
					fill={ attributes.dividerTopColor }
					invert={ attributes.dividerTopInvert }
				/>

				<div className="innerblocks-wrap">
					<InnerBlocks.Content />
				</div>

				<SeparatorsNew
					type="bottom"
					front={ true }
					style={ attributes.dividerBottomType }
					fill={ attributes.dividerBottomColor }
					invert={ attributes.dividerBottomInvert }
				/>
			</Tag>
		);
	}
}, {
	attributes: {
		...attributes,
		paddingTablet: {
			type: 'number'
		},
		paddingMobile: {
			type: 'number'
		},
		paddingTopTablet: {
			type: 'number'
		},
		paddingTopMobile: {
			type: 'number'
		},
		paddingRightTablet: {
			type: 'number'
		},
		paddingRightMobile: {
			type: 'number'
		},
		paddingBottomTablet: {
			type: 'number'
		},
		paddingBottomMobile: {
			type: 'number'
		},
		paddingLeftTablet: {
			type: 'number'
		},
		paddingLeftMobile: {
			type: 'number'
		},
		marginTablet: {
			type: 'number'
		},
		marginMobile: {
			type: 'number'
		},
		marginTopTablet: {
			type: 'number'
		},
		marginTopMobile: {
			type: 'number'
		},
		marginBottomTablet: {
			type: 'number'
		},
		marginBottomMobile: {
			type: 'number'
		},
		reverseColumnsTablet: {
			type: 'boolean',
			default: false
		},
		reverseColumnsMobile: {
			type: 'boolean',
			default: false
		}
	},

	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},

	migrate: ( oldAttributes ) => {
		let backgroundGradient = '';
		let backgroundOverlayGradient = '';

		if ( 'gradient' === oldAttributes.backgroundType ) {
			let direction = '';

			if ( 'linear' === oldAttributes.backgroundGradientType ) {
				direction = `${ oldAttributes.backgroundGradientAngle }deg, `;
			}

			backgroundGradient = `${ oldAttributes.backgroundGradientType }-gradient(${ direction }${ hexToRgba( oldAttributes.backgroundGradientFirstColor ) || 'rgba( 0, 0, 0, 0 )' } ${ oldAttributes.backgroundGradientFirstLocation }%, ${ hexToRgba( oldAttributes.backgroundGradientSecondColor ) || 'rgba( 0, 0, 0, 0 )' } ${ oldAttributes.backgroundGradientSecondLocation }%)`;
		}

		if ( 'gradient' === oldAttributes.backgroundOverlayType ) {
			let direction = '';

			if ( 'linear' === oldAttributes.backgroundOverlayGradientType ) {
				direction = `${ oldAttributes.backgroundOverlayGradientAngle }deg, `;
			}

			backgroundOverlayGradient = `${ oldAttributes.backgroundOverlayGradientType }-gradient(${ direction }${ hexToRgba( oldAttributes.backgroundOverlayGradientFirstColor ) || 'rgba( 0, 0, 0, 0 )' } ${ oldAttributes.backgroundOverlayGradientFirstLocation }%, ${ hexToRgba( oldAttributes.backgroundOverlayGradientSecondColor ) || 'rgba( 0, 0, 0, 0 )' } ${ oldAttributes.backgroundOverlayGradientSecondLocation }%)`;
		}

		const attributes = {
			...omit(
				oldAttributes,
				[
					'backgroundGradientFirstColor',
					'backgroundGradientFirstLocation',
					'backgroundGradientSecondColor',
					'backgroundGradientSecondLocation',
					'backgroundGradientType',
					'backgroundGradientAngle',
					'backgroundGradientPosition',
					'backgroundOverlayGradientFirstColor',
					'backgroundOverlayGradientFirstLocation',
					'backgroundOverlayGradientSecondColor',
					'backgroundOverlayGradientSecondLocation',
					'backgroundOverlayGradientType',
					'backgroundOverlayGradientAngle',
					'backgroundOverlayGradientPosition'
				]
			),
			backgroundGradient,
			backgroundOverlayGradient
		};

		return {
			...attributes
		};
	},

	isEligible: attributes => ( 'gradient' === attributes.backgroundType && undefined !== attributes.backgroundGradientFirstColor ) || ( 'gradient' === attributes.backgroundOverlayType && undefined !== attributes.backgroundOverlayGradientFirstColor ),

	save: ({
		attributes,
		className
	}) => {
		const Tag = attributes.columnsHTMLTag;

		const desktopLayout = attributes.hide ? '' : `has-desktop-${ attributes.layout }-layout`;
		const tabletLayout = attributes.hideTablet ? '' : `has-tablet-${ attributes.layoutTablet }-layout`;
		const mobileLayout = attributes.hideMobile ? '' : `has-mobile-${ attributes.layoutMobile }-layout`;

		const classes = classnames(
			className,
			`has-${ attributes.columns }-columns`,
			desktopLayout,
			tabletLayout,
			mobileLayout,
			{ 'hide-in-desktop': attributes.hide },
			{ 'hide-in-tablet': attributes.hideTablet },
			{ 'hide-in-mobile': attributes.hideMobile },
			{ 'has-reverse-columns-tablet': ( attributes.reverseColumnsTablet && ! attributes.hideTablet && 'collapsedRows' === attributes.layoutTablet ) },
			{ 'has-reverse-columns-mobile': ( attributes.reverseColumnsMobile && ! attributes.hideMobile && 'collapsedRows' === attributes.layoutMobile ) },
			`has-${ attributes.columnsGap }-gap`,
			`has-vertical-${ attributes.verticalAlign }`
		);

		return (
			<Tag
				className={ classes }
				id={ attributes.id }
			>
				<div className="wp-block-themeisle-blocks-advanced-columns-overlay"></div>

				<SeparatorsNew
					type="top"
					front={ true }
					style={ attributes.dividerTopType }
					fill={ attributes.dividerTopColor }
					invert={ attributes.dividerTopInvert }
				/>

				<div className="innerblocks-wrap">
					<InnerBlocks.Content />
				</div>

				<SeparatorsNew
					type="bottom"
					front={ true }
					style={ attributes.dividerBottomType }
					fill={ attributes.dividerBottomColor }
					invert={ attributes.dividerBottomInvert }
				/>
			</Tag>
		);
	}
} ];

export default deprecated;
