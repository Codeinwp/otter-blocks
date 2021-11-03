const attributes = {
	title: {
		type: 'string',
		default: __( 'Pricing Title', 'otter-blocks' )
	},
	description: {
		type: 'string',
		default: __( 'Pricing Description', 'otter-blocks' )
	},
	buttonText: {
		type: 'string',
		default: __( 'Purchase', 'otter-blocks' )
	},
	variations: {
		type: 'array',
		default: []
	},
	isFeatured: {
		type: 'boolean',
		default: false
	},
	hasTableLink: {
		type: 'boolean',
		default: false
	},
	selector: {
		type: 'string'
	},
	linkText: {
		default: __( 'See all features', 'otter-blocks' ),
		type: 'string'
	}
};

export default attributes;
