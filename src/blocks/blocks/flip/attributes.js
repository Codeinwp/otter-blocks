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
	frontImg: {
		type: 'object'
	},
	frontImgFocalpoint: {
		type: 'object'
	},
	backImg: {
		type: 'object'
	}
};

export default attributes;
