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
	frontVerticalAlign: {
		type: 'string'
	},
	frontHorizontalAlign: {
		type: 'string'
	},
	backVerticalAlign: {
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
	frontBackgroundImage: {
		type: 'object'
	},
	frontBackgroundType: {
		type: 'string',
		default: 'color'
	},
	frontBackgroundColor: {
		type: 'string'
	},
	frontBackgroundGradient: {
		type: 'string'
	},
	frontBackgroundPosition: {
		type: 'object'
	},
	frontBackgroundRepeat: {
		type: 'string'
	},
	frontBackgroundAttachment: {
		type: 'string'
	},
	frontBackgroundSize: {
		type: 'string'
	},
	backBackgroundImage: {
		type: 'object'
	},
	backBackgroundType: {
		type: 'string',
		default: 'color'
	},
	backBackgroundColor: {
		type: 'string'
	},
	backBackgroundGradient: {
		type: 'string'
	},
	backBackgroundPosition: {
		type: 'object'
	},
	backBackgroundRepeat: {
		type: 'string'
	},
	backBackgroundSize: {
		type: 'string'
	},
	backBackgroundAttachment: {
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
