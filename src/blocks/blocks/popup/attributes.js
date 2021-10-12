const attributes = {
	id: {
		type: 'string'
	},
	minWidth: {
		type: 'number'
	},
	trigger: {
		type: 'string'
	},
	wait: {
		type: 'number'
	},
	anchor: {
		type: 'string'
	},
	scroll: {
		type: 'number'
	},
	showClose: {
		type: 'boolean',
		default: true
	},
	outsideClose: {
		type: 'boolean',
		default: true
	},
	anchorClose: {
		type: 'boolean',
		default: false
	},
	closeAnchor: {
		type: 'string'
	},
	recurringClose: {
		type: 'boolean',
		default: false
	},
	recurringTime: {
		type: 'number'
	},
	backgroundColor: {
		type: 'string'
	},
	closeColor: {
		type: 'string'
	},
	overlayColor: {
		type: 'string'
	},
	overlayOpacity: {
		type: 'number'
	}
};

export default attributes;
