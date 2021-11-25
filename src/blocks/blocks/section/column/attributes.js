const attributes = {
	id: {
		type: 'string'
	},
	padding: {
		type: 'object'
	},
	paddingTablet: {
		type: 'object'
	},
	paddingMobile: {
		type: 'object'
	},
	margin: {
		type: 'object'
	},
	marginTablet: {
		type: 'object'
	},
	marginMobile: {
		type: 'object'
	},
	backgroundType: {
		type: 'string',
		default: 'color'
	},
	backgroundColor: {
		type: 'string'
	},
	backgroundImage: {
		type: 'object'
	},
	backgroundAttachment: {
		type: 'string',
		default: 'scroll'
	},
	backgroundPosition: {
		type: 'object'
	},
	backgroundRepeat: {
		type: 'string',
		default: 'repeat'
	},
	backgroundSize: {
		type: 'string',
		default: 'auto'
	},
	backgroundGradient: {
		type: 'string',
		default: 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)'
	},
	border: {
		type: 'object'
	},
	borderColor: {
		type: 'string',
		default: '#000000'
	},
	borderRadius: {
		type: 'object'
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
	boxShadowSpread: {
		type: 'number',
		default: 0
	},
	boxShadowHorizontal: {
		type: 'number',
		default: 0
	},
	boxShadowVertical: {
		type: 'number',
		default: 0
	},
	columnsHTMLTag: {
		type: 'string',
		default: 'div'
	},
	columnWidth: {
		type: 'string'
	}
};

export default attributes;
