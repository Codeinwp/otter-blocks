const attributes = {
	id: {
		type: 'string'
	},
	align: {
		type: 'string'
	},
	spacing: {
		type: 'number',
		default: 20
	},
	paddingTopBottom: {
		type: 'number'
	},
	paddingLeftRight: {
		type: 'number'
	},
	collapse: {
		type: 'string',
		default: 'collapse-none'
	},
	fontSize: {
		type: 'number'
	},
	fontFamily: {
		type: 'string'
	},
	fontVariant: {
		type: 'string'
	},
	textTransform: {
		type: 'string'
	},
	fontStyle: {
		type: 'string'
	},
	lineHeight: {
		type: 'number'
	}
};

export default attributes;
