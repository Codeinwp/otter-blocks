const attributes = {
	id: {
		type: 'string'
	},
	isInverted: {
		type: 'boolean'
	},
	title: {
		type: 'string'
	},
	description: {
		type: 'string'
	},
	animType: {
		type: 'string',
		default: 'flipY'
	},
	width: {
		type: 'number'
	},
	height: {
		type: 'number'
	},
	padding: {
		type: 'number'
	},
	borderWidth: {
		type: 'string'
	},
	borderColor: {
		type: 'string'
	},
	borderRadius: {
		type: 'number'
	},
	backgroundColor: {
		type: 'string'
	},
	verticalAlign: {
		type: 'string'
	},
	backVerticalAlign: {
		type: 'string'
	},
	horizontalAlign: {
		type: 'string'
	},
	frontMedia: {
		type: 'object'
	},
	frontMediaWidth: {
		type: 'number'
	},
	frontMediaHeight: {
		type: 'number'
	},
	frontImg: {
		type: 'object'
	},
	frontBackgroundType: {
		type: 'string'
	},
	frontBackgroundColor: {
		type: 'string'
	},
	frontBackgroundGradient: {
		type: 'string'
	},
	frontImgFocalpoint: {
		type: 'object'
	},
	frontBackgroundRepeat: {
		type: 'string'
	},
	frontBackgroundRepeat: {
		type: 'string'
	},
	frontBackgroundSize: {
		type: 'string'
	},
	backImg: {
		type: 'object'
	},
	backBackgroundType: {
		type: 'string'
	},
	backBackgroundColor: {
		type: 'string'
	},
	backBackgroundGradient: {
		type: 'string'
	},
	backImgFocalpoint: {
		type: 'object'
	},
	backBackgroundRepeat: {
		type: 'string'
	},
	backBackgroundRepeat: {
		type: 'string'
	},
	backBackgroundSize: {
		type: 'string'
	},
	frontOverlayOpacity: {
		type: 'number'
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
	boxShadowHorizontal: {
		type: 'number',
		default: 0
	},
	boxShadowVertical: {
		type: 'number',
		default: 0
	},
	titleFontSize: {
		type: 'number'
	},
	descriptionFontSize: {
		type: 'number'
	},
	titleColor: {
		type: 'string'
	},
	descriptionColor: {
		type: 'string'
	}
};

export default attributes;
