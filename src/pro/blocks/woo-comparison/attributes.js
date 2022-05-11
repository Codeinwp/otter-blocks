const attributes = {
	id: {
		type: 'string'
	},
	products: {
		type: 'array',
		default: []
	},
	listingType: {
		type: 'string',
		default: window.otterPro.themeMods.listingType
	},
	altRow: {
		type: 'boolean',
		default: Boolean( window.otterPro.themeMods.altRow )
	},
	fields: {
		type: 'string',
		default: window.otterPro.themeMods.fields
	},
	rowColor: {
		type: 'string',
		default: window.otterPro.themeMods.rowColor
	},
	headerColor: {
		type: 'string',
		default: window.otterPro.themeMods.headerColor
	},
	textColor: {
		type: 'string',
		default: window.otterPro.themeMods.textColor
	},
	borderColor: {
		type: 'string',
		default: window.otterPro.themeMods.borderColor
	},
	altRowColor: {
		type: 'string',
		default: window.otterPro.themeMods.altRowColor
	}
};

export default attributes;
