const attributes = {
	id: {
		type: 'string'
	},
	defaultLibrary: {
		type: 'string',
		default: 'fontawesome'
	},
	defaultIconPrefix: {
		type: 'string',
		default: 'fas'
	},
	defaultIcon: {
		type: 'string',
		default: 'angle-right'
	},
	defaultContentColor: {
		type: 'string'
	},
	defaultIconColor: {
		type: 'string'
	},
	defaultSize: {
		type: 'number',
		default: 20
	},
	defaultIsImage: {
		type: 'boolean'
	},
	defaultImage: {
		type: 'object'
	},
	gap: {
		type: 'number',
		default: 5
	},
	horizontalAlign: {
		type: 'string'
	}
};

export default attributes;
