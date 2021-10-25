const attributes = {
	id: {
		type: 'string'
	},
	align: {
		type: 'string'
	},
	library: {
		type: 'string',
		default: 'fontawesome'
	},
	prefix: {
		type: 'string',
		default: 'fab'
	},
	icon: {
		type: 'string',
		default: 'themeisle'
	},
	link: {
		type: 'string'
	},
	newTab: {
		type: 'boolean',
		default: false
	},
	fontSize: {
		type: 'number',
		default: 16
	},
	padding: {
		type: 'number',
		default: 5
	},
	margin: {
		type: 'number',
		default: 5
	},
	backgroundColor: {
		type: 'string'
	},
	textColor: {
		type: 'string'
	},
	borderColor: {
		type: 'string'
	},
	backgroundColorHover: {
		type: 'string'
	},
	textColorHover: {
		type: 'string'
	},
	borderColorHover: {
		type: 'string'
	},
	borderSize: {
		type: 'number',
		default: 0
	},
	borderRadius: {
		type: 'number',
		default: 0
	}
};

export default attributes;
