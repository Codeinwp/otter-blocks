const attributes = {
	id: {
		type: 'string'
	},
	subject: {
		type: 'string'
	},
	emailTo: {
		type: 'string'
	},
	optionName: {
		type: 'string'
	},
	hasCaptcha: {
		type: 'boolean'
	},
	provider: {
		type: 'string',
		default: ''
	},
	apiKey: {
		type: 'string'
	},
	listId: {
		type: 'string'
	},
	action: {
		type: 'string',
		default: 'subscribe'
	}
};

export default attributes;
