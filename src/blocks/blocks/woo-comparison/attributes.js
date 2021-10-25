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
		default: window.themeisleGutenberg.themeMods.listingType
	},
	altRow: {
		type: 'boolean',
		default: Boolean( window.themeisleGutenberg.themeMods.altRow )
	},
	fields: {
		type: 'string',
		default: window.themeisleGutenberg.themeMods.fields
	},
	rowColor: {
		type: 'string',
		default: window.themeisleGutenberg.themeMods.rowColor
	},
	headerColor: {
		type: 'string',
		default: window.themeisleGutenberg.themeMods.headerColor
	},
	textColor: {
		type: 'string',
		default: window.themeisleGutenberg.themeMods.textColor
	},
	borderColor: {
		type: 'string',
		default: window.themeisleGutenberg.themeMods.borderColor
	},
	altRowColor: {
		type: 'string',
		default: window.themeisleGutenberg.themeMods.altRowColor
	}

};

export default attributes;
