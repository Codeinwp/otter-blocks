/**
 * External dependencies
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { RichText } from '@wordpress/block-editor';

const deprecated = [ {
	attributes: {
		id: {
			type: 'string'
		},
		content: {
			type: 'string',
			source: 'html',
			selector: 'h1,h2,h3,h4,h5,h6,div,p,span',
			default: ''
		},
		tag: {
			default: 'h2',
			type: 'string'
		},
		align: {
			type: 'string'
		},
		alignTablet: {
			type: 'string'
		},
		alignMobile: {
			type: 'string'
		},
		headingColor: {
			type: 'string',
			default: '#000000'
		},
		highlightColor: {
			type: 'string'
		},
		highlightBackground: {
			type: 'string'
		},
		fontSize: {
			type: 'number'
		},
		fontSizeTablet: {
			type: 'number'
		},
		fontSizeMobile: {
			type: 'number'
		},
		fontFamily: {
			type: 'string'
		},
		fontVariant: {
			type: 'string'
		},
		fontStyle: {
			type: 'string',
			default: 'normal'
		},
		textTransform: {
			type: 'string',
			default: 'none'
		},
		lineHeight: {
			type: 'number'
		},
		letterSpacing: {
			type: 'number'
		},
		textShadow: {
			type: 'boolean',
			default: false
		},
		textShadowColor: {
			type: 'string',
			default: '#000000'
		},
		textShadowColorOpacity: {
			type: 'number',
			default: 50
		},
		textShadowBlur: {
			type: 'number',
			default: 5
		},
		textShadowHorizontal: {
			type: 'number',
			default: 0
		},
		textShadowVertical: {
			type: 'number',
			default: 0
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
			default: 0
		},
		paddingTablet: {
			type: 'number',
			default: 0
		},
		paddingMobile: {
			type: 'number',
			default: 0
		},
		paddingTop: {
			type: 'number',
			default: 0
		},
		paddingTopTablet: {
			type: 'number',
			default: 0
		},
		paddingTopMobile: {
			type: 'number',
			default: 0
		},
		paddingRight: {
			type: 'number',
			default: 0
		},
		paddingRightTablet: {
			type: 'number',
			default: 0
		},
		paddingRightMobile: {
			type: 'number',
			default: 0
		},
		paddingBottom: {
			type: 'number',
			default: 0
		},
		paddingBottomTablet: {
			type: 'number',
			default: 0
		},
		paddingBottomMobile: {
			type: 'number',
			default: 0
		},
		paddingLeft: {
			type: 'number',
			default: 0
		},
		paddingLeftTablet: {
			type: 'number',
			default: 0
		},
		paddingLeftMobile: {
			type: 'number',
			default: 0
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
			default: 0
		},
		marginTablet: {
			type: 'number',
			default: 0
		},
		marginMobile: {
			type: 'number',
			default: 0
		},
		marginTop: {
			type: 'number',
			default: 0
		},
		marginTopTablet: {
			type: 'number',
			default: 0
		},
		marginTopMobile: {
			type: 'number',
			default: 0
		},
		marginBottom: {
			type: 'number',
			default: 25
		},
		marginBottomTablet: {
			type: 'number',
			default: 25
		},
		marginBottomMobile: {
			type: 'number',
			default: 20
		}
	},

	save: ({
		attributes,
		className
	}) => {
		let textShadowStyle;

		if ( attributes.textShadow ) {
			textShadowStyle = {
				textShadow: `${ attributes.textShadowHorizontal }px ${ attributes.textShadowVertical }px ${ attributes.textShadowBlur }px ${  hexToRgba( ( attributes.textShadowColor ? attributes.textShadowColor : '#000000' ), attributes.textShadowColorOpacity ) }`
			};
		}

		const style = {
			color: attributes.headingColor,
			fontFamily: attributes.fontFamily,
			fontWeight: 'regular' === attributes.fontVariant ? 'normal' : attributes.fontVariant,
			fontStyle: attributes.fontStyle,
			textTransform: attributes.textTransform,
			lineHeight: attributes.lineHeight && `${ attributes.lineHeight }px`,
			letterSpacing: attributes.letterSpacing && `${ attributes.letterSpacing }px`,
			...textShadowStyle
		};

		return (
			<RichText.Content
				tagName={ attributes.tag }
				value={ attributes.content }
				id={ attributes.id }
				className={ classnames(
					attributes.id,
					className
				) }
				style={ style }
			/>
		);
	}
} ];

export default deprecated;
