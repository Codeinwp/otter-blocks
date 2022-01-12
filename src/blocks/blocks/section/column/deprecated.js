/**
 * External dependencies
 */
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { omit } from 'lodash';

import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { isNullObject } from '../../../helpers/helper-functions.js';

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
}, {
	attributes: {
		...omit(
			attributes,
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
		},
		backgroundGradient: {
			type: 'string',
			default: 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)'
		}
	},

	supports: {
		inserter: false,
		reusable: false,
		html: false
	},

	migrate: ( oldAttributes ) => {
		const padding = {};
		const paddingTablet = {};
		const paddingMobile = {};
		const margin = {};
		const marginTablet = {};
		const marginMobile = {};
		const border = {};
		const borderRadius = {};
		let backgroundImage = {};
		let backgroundPosition = {};

		if ( 'unlinked' === oldAttributes.paddingType ) {
			padding.top = oldAttributes.paddingTop ? oldAttributes.paddingTop + 'px' : '20px';
			padding.bottom = oldAttributes.paddingBottom ? oldAttributes.paddingBottom + 'px' : '20px';
			padding.left = oldAttributes.paddingLeft ? oldAttributes.paddingLeft + 'px' : '20px';
			padding.right = oldAttributes.paddingRight ? oldAttributes.paddingRight + 'px' : '20px';
		} else {
			padding.top = oldAttributes.padding ? oldAttributes.padding + 'px' : '20px';
			padding.bottom = oldAttributes.padding ? oldAttributes.padding + 'px' : '20px';
			padding.left = oldAttributes.padding ? oldAttributes.padding + 'px' : '20px';
			padding.right = oldAttributes.padding ? oldAttributes.padding + 'px' : '20px';
		}

		if ( 'unlinked' === oldAttributes.paddingTypeTablet ) {
			paddingTablet.top = oldAttributes.paddingTopTablet ? oldAttributes.paddingTopTablet + 'px' : null;
			paddingTablet.bottom = oldAttributes.paddingBottomTablet ? oldAttributes.paddingBottomTablet + 'px' : null;
			paddingTablet.left = oldAttributes.paddingLeftTablet ? oldAttributes.paddingLeftTablet + 'px' : null;
			paddingTablet.right = oldAttributes.paddingRightTablet ? oldAttributes.paddingRightTablet + 'px' : null;
		} else {
			paddingTablet.top = oldAttributes.paddingTablet ? oldAttributes.paddingTablet + 'px' : null;
			paddingTablet.bottom = oldAttributes.paddingTablet ? oldAttributes.paddingTablet + 'px' : null;
			paddingTablet.left = oldAttributes.paddingTablet ? oldAttributes.paddingTablet + 'px' : null;
			paddingTablet.right = oldAttributes.paddingTablet ? oldAttributes.paddingTablet + 'px' : null;
		}

		if ( 'unlinked' === oldAttributes.paddingTypeMobile ) {
			paddingMobile.top = oldAttributes.paddingMobileTop ? oldAttributes.paddingMobileTop + 'px' : null;
			paddingMobile.bottom = oldAttributes.paddingMobileBottom ? oldAttributes.paddingMobileBottom + 'px' : null;
			paddingMobile.left = oldAttributes.paddingMobileLeft ? oldAttributes.paddingMobileLeft + 'px' : null;
			paddingMobile.right = oldAttributes.paddingMobileRight ? oldAttributes.paddingMobileRight + 'px' : null;
		} else {
			paddingMobile.top = oldAttributes.paddingMobile ? oldAttributes.paddingMobile + 'px' : null;
			paddingMobile.bottom = oldAttributes.paddingMobile ? oldAttributes.paddingMobile + 'px' : null;
			paddingMobile.left = oldAttributes.paddingMobile ? oldAttributes.paddingMobile + 'px' : null;
			paddingMobile.right = oldAttributes.paddingMobile ? oldAttributes.paddingMobile + 'px' : null;
		}

		if ( 'linked' === oldAttributes.marginType ) {
			margin.top = oldAttributes.margin ? oldAttributes.margin + 'px' : '20px';
			margin.bottom = oldAttributes.margin ? oldAttributes.margin + 'px' : '20px';
			margin.left = oldAttributes.margin ? oldAttributes.margin + 'px' : '20px';
			margin.right = oldAttributes.margin ? oldAttributes.margin + 'px' : '20px';
		} else {
			margin.top = oldAttributes.marginTop ? oldAttributes.marginTop + 'px' : '20px';
			margin.bottom = oldAttributes.marginBottom ? oldAttributes.marginBottom + 'px' : '20px';
			margin.left = oldAttributes.marginLeft ? oldAttributes.marginLeft + 'px' : '20px';
			margin.right = oldAttributes.marginRight ? oldAttributes.marginRight + 'px' : '20px';
		}

		if ( 'linked' === oldAttributes.marginTypeTablet ) {
			marginTablet.top = oldAttributes.marginTablet ? oldAttributes.marginTablet + 'px' : null;
			marginTablet.bottom = oldAttributes.marginTablet ? oldAttributes.marginTablet + 'px' : null;
			marginTablet.left = oldAttributes.marginTablet ? oldAttributes.marginTablet + 'px' : null;
			marginTablet.right = oldAttributes.marginTablet ? oldAttributes.marginTablet + 'px' : null;
		} else {
			marginTablet.top = oldAttributes.marginTopTablet ? oldAttributes.marginTopTablet + 'px' : null;
			marginTablet.bottom = oldAttributes.marginBottomTablet ? oldAttributes.marginBottomTablet + 'px' : null;
			marginTablet.left = oldAttributes.marginLeftTablet ? oldAttributes.marginLeftTablet + 'px' : null;
			marginTablet.right = oldAttributes.marginRightTablet ? oldAttributes.marginRightTablet + 'px' : null;
		}

		if ( 'linked' === oldAttributes.marginTypeMobile ) {
			marginMobile.top = oldAttributes.marginMobile ? oldAttributes.marginMobile + 'px' : null;
			marginMobile.bottom = oldAttributes.marginMobile ? oldAttributes.marginMobile + 'px' : null;
			marginMobile.left = oldAttributes.marginMobile ? oldAttributes.marginMobile + 'px' : null;
			marginMobile.right = oldAttributes.marginMobile ? oldAttributes.marginMobile + 'px' : null;
		} else {
			marginMobile.top = oldAttributes.marginTopMobile ? oldAttributes.marginTopMobile + 'px' : null;
			marginMobile.bottom = oldAttributes.marginBottomMobile ? oldAttributes.marginBottomMobile + 'px' : null;
			marginMobile.left = oldAttributes.marginLeftMobile ? oldAttributes.marginLeftMobile + 'px' : null;
			marginMobile.right = oldAttributes.marginRightMobile ? oldAttributes.marginRightMobile + 'px' : null;
		}

		if ( 'unlinked' === oldAttributes.borderType ) {
			border.top = oldAttributes.borderTop ? oldAttributes.borderTop + 'px' : null;
			border.bottom = oldAttributes.borderBottom ? oldAttributes.borderBottom + 'px' : null;
			border.left = oldAttributes.borderLeft ? oldAttributes.borderLeft + 'px' : null;
			border.right = oldAttributes.borderRight ? oldAttributes.borderRight + 'px' : null;
		} else {
			border.top = oldAttributes.border ? oldAttributes.border + 'px' : null;
			border.bottom = oldAttributes.border ? oldAttributes.border + 'px' : null;
			border.left = oldAttributes.border ? oldAttributes.border + 'px' : null;
			border.right = oldAttributes.border ? oldAttributes.border + 'px' : null;
		}

		if ( 'unlinked' === oldAttributes.borderRadiusType ) {
			borderRadius.top = oldAttributes.borderRadiusTop ? oldAttributes.borderRadiusTop + 'px' : null;
			borderRadius.bottom = oldAttributes.borderRadiusBottom ? oldAttributes.borderRadiusBottom + 'px' : null;
			borderRadius.left = oldAttributes.borderRadiusLeft ? oldAttributes.borderRadiusLeft + 'px' : null;
			borderRadius.right = oldAttributes.borderRadiusRight ? oldAttributes.borderRadiusRight + 'px' : null;
		} else {
			borderRadius.top = oldAttributes.borderRadius ? oldAttributes.borderRadius + 'px' : null;
			borderRadius.bottom = oldAttributes.borderRadius ? oldAttributes.borderRadius + 'px' : null;
			borderRadius.left = oldAttributes.borderRadius ? oldAttributes.borderRadius + 'px' : null;
			borderRadius.right = oldAttributes.borderRadius ? oldAttributes.borderRadius + 'px' : null;
		}

		if ( undefined !== oldAttributes.backgroundImageURL && undefined !== oldAttributes.backgroundImageID ) {
			backgroundImage = {
				id: oldAttributes.backgroundImageID,
				url: oldAttributes.backgroundImageURL
			};
		}

		const positions = {
			'top left': {
				x: '0.00',
				y: '0.00'
			},
			'top center': {
				x: '0.50',
				y: '0.00'
			},
			'top right': {
				x: '1.00',
				y: '0.00'
			},
			'center left': {
				x: '0.00',
				y: '0.50'
			},
			'center center': {
				x: '0.50',
				y: '0.50'
			},
			'center right': {
				x: '1.00',
				y: '0.50'
			},
			'bottom left': {
				x: '0.00',
				y: '1.00'
			},
			'bottom center': {
				x: '0.50',
				y: '1.00'
			},
			'bottom right': {
				x: '1.00',
				y: '1.00'
			}
		};

		if ( undefined !== oldAttributes.backgroundPosition ) {
			backgroundPosition = positions[ oldAttributes.backgroundPosition ];
		}

		const attributes = {
			...omit(
				oldAttributes,
				[
					'paddingType',
					'paddingTypeTablet',
					'paddingTypeMobile',
					'paddingTop',
					'paddingTopTablet',
					'paddingTopMobile',
					'paddingRight',
					'paddingRightTablet',
					'paddingRightMobile',
					'paddingBottom',
					'paddingBottomTablet',
					'paddingBottomMobile',
					'paddingLeft',
					'paddingLeftTablet',
					'paddingLeftMobile',
					'marginType',
					'marginTypeTablet',
					'marginTypeMobile',
					'marginTop',
					'marginTopTablet',
					'marginTopMobile',
					'marginRight',
					'marginRightTablet',
					'marginRightMobile',
					'marginBottom',
					'marginBottomTablet',
					'marginBottomMobile',
					'marginLeft',
					'marginLeftTablet',
					'marginLeftMobile',
					'borderType',
					'borderTop',
					'borderRight',
					'borderBottom',
					'borderLeft',
					'borderRadiusType',
					'borderRadiusTop',
					'borderRadiusRight',
					'borderRadiusBottom',
					'borderRadiusLeft'
				]
			),
			...( ! isNullObject( padding ) && { padding }),
			...( ! isNullObject( paddingTablet ) && { paddingTablet }),
			...( ! isNullObject( paddingMobile ) && { paddingMobile }),
			...( ! isNullObject( margin ) && { margin }),
			...( ! isNullObject( marginTablet ) && { marginTablet }),
			...( ! isNullObject( marginMobile ) && { marginMobile }),
			...( ! isNullObject( border ) && { border }),
			...( ! isNullObject( borderRadius ) && { borderRadius }),
			...( ! isNullObject( backgroundImage ) && { backgroundImage }),
			...( ! isNullObject( backgroundPosition ) && { backgroundPosition })
		};

		return {
			...attributes
		};
	},

	isEligible: attributes => {
		const oldAttributes = [
			'padding',
			'paddingTablet',
			'paddingMobile',
			'paddingTop',
			'paddingTopTablet',
			'paddingTopMobile',
			'paddingRight',
			'paddingRightTablet',
			'paddingRightMobile',
			'paddingBottom',
			'paddingBottomTablet',
			'paddingBottomMobile',
			'paddingLeft',
			'paddingLeftTablet',
			'paddingLeftMobile',
			'margin',
			'marginTablet',
			'marginMobile',
			'marginTop',
			'marginTopTablet',
			'marginTopMobile',
			'marginRight',
			'marginRightTablet',
			'marginRightMobile',
			'marginBottom',
			'marginBottomTablet',
			'marginBottomMobile',
			'marginLeft',
			'marginLeftTablet',
			'marginLeftMobile',
			'borderType',
			'border',
			'borderTop',
			'borderRight',
			'borderBottom',
			'borderLeft',
			'borderRadiusType',
			'borderRadius',
			'borderRadiusTop',
			'borderRadiusRight',
			'borderRadiusBottom',
			'borderRadiusLeft'
		];

		const isEligible = oldAttributes.some( attr => attributes[ attr ] && 'number' === typeof attributes[ attr ]) || ( undefined !== attributes.backgroundImageURL && undefined !== attributes.backgroundImageID ) || ( undefined !== attributes.backgroundPosition && 'object' !== typeof attributes.backgroundPosition );

		return isEligible;
	},

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
