const attributes = {
	id: {
		type: 'string'
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
	}
};

export default attributes;
