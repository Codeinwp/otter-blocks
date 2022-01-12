const attributes = {
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
		type: 'string'
	},
	textTransform: {
		type: 'string'
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
		type: 'number'
	},
	paddingMobile: {
		type: 'number'
	},
	paddingTop: {
		type: 'number',
		default: 0
	},
	paddingTopTablet: {
		type: 'number'
	},
	paddingTopMobile: {
		type: 'number'
	},
	paddingRight: {
		type: 'number',
		default: 0
	},
	paddingRightTablet: {
		type: 'number'
	},
	paddingRightMobile: {
		type: 'number'
	},
	paddingBottom: {
		type: 'number',
		default: 0
	},
	paddingBottomTablet: {
		type: 'number'
	},
	paddingBottomMobile: {
		type: 'number'
	},
	paddingLeft: {
		type: 'number',
		default: 0
	},
	paddingLeftTablet: {
		type: 'number'
	},
	paddingLeftMobile: {
		type: 'number'
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
		type: 'number'
	},
	marginMobile: {
		type: 'number'
	},
	marginTop: {
		type: 'number',
		default: 0
	},
	marginTopTablet: {
		type: 'number'
	},
	marginTopMobile: {
		type: 'number'
	},
	marginBottom: {
		type: 'number',
		default: 25
	},
	marginBottomTablet: {
		type: 'number'
	},
	marginBottomMobile: {
		type: 'number'
	}
};

export default attributes;
