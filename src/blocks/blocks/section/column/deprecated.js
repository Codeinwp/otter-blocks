/**
 * External dependencies
 */
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { omit } from 'lodash';

import { InnerBlocks } from '@wordpress/block-editor';

const attributes = {
	id: {
		type: 'string'
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
	marginRight: {
		type: 'number',
		default: 0
	},
	marginRightTablet: {
		type: 'number',
		default: 0
	},
	marginRightMobile: {
		type: 'number',
		default: 0
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
	marginLeft: {
		type: 'number',
		default: 0
	},
	marginLeftTablet: {
		type: 'number',
		default: 0
	},
	marginLeftMobile: {
		type: 'number',
		default: 0
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
	columnsHTMLTag: {
		type: 'string',
		default: 'div'
	},
	columnWidth: {
		type: 'string'
	}
};

const deprecated = [ {
	attributes,

	supports: {
		inserter: false,
		reusable: false,
		html: false
	},

	save: ({
		attributes,
		className
	}) => {
		const Tag = attributes.columnsHTMLTag;

		let background, borderStyle, borderRadiusStyle, boxShadowStyle;

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
			...boxShadowStyle
		};

		return (
			<Tag
				className={ className }
				id={ attributes.id }
				style={ style }
			>
				<InnerBlocks.Content />
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
		marginRightTablet: {
			type: 'number'
		},
		marginRightMobile: {
			type: 'number'
		},
		marginBottomTablet: {
			type: 'number'
		},
		marginBottomMobile: {
			type: 'number'
		},
		marginLeftTablet: {
			type: 'number'
		},
		marginLeftMobile: {
			type: 'number'
		}
	},

	supports: {
		inserter: false,
		reusable: false,
		html: false
	},

	migrate: ( oldAttributes ) => {
		let backgroundGradient = '';

		if ( 'gradient' === oldAttributes.backgroundType ) {
			let direction = '';

			if ( 'linear' === oldAttributes.backgroundGradientType ) {
				direction = `${ oldAttributes.backgroundGradientAngle }deg, `;
			}

			backgroundGradient = `${ oldAttributes.backgroundGradientType }-gradient(${ direction }${ hexToRgba( oldAttributes.backgroundGradientFirstColor ) || 'rgba( 0, 0, 0, 0 )' } ${ oldAttributes.backgroundGradientFirstLocation }%, ${ hexToRgba( oldAttributes.backgroundGradientSecondColor ) || 'rgba( 0, 0, 0, 0 )' } ${ oldAttributes.backgroundGradientSecondLocation }%)`;
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
					'backgroundGradientPosition'
				]
			),
			backgroundGradient
		};

		return {
			...attributes
		};
	},

	isEligible: attributes => 'gradient' === attributes.backgroundType && undefined !== attributes.backgroundGradientFirstColor,

	save: ({
		attributes,
		className
	}) => {
		const Tag = attributes.columnsHTMLTag;

		return (
			<Tag
				className={ className }
				id={ attributes.id }
			>
				<InnerBlocks.Content />
			</Tag>
		);
	}
} ];

export default deprecated;
