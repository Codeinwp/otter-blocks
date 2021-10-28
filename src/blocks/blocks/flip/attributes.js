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
	paddings: {
		type: 'number'
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
	frontBackgroundColor: {
		type: 'string'
	},
	frontImgFocalpoint: {
		type: 'object'
	},
	backImg: {
		type: 'object'
	},
	backBackgroundColor: {
		type: 'string'
	},
	backImgFocalpoint: {
		type: 'object'
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
	}
};

export default attributes;
