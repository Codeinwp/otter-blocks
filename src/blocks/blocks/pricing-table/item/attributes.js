import { __ } from '@wordpress/i18n';

const attributes = {
	title: {
		type: 'string'
	},
	description: {
		type: 'string'
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
		type: 'string',
		default: __( 'See all features', 'otter-blocks' )
	}
};

export default attributes;
