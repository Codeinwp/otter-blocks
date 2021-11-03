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
	buttonLink: {
		type: 'string'
	},
	price: {
		type: 'number',
		default: 4.99
	},
	oldPrice: {
		type: 'number',
		default: 9.99
	},
	currency: {
		type: 'string',
		default: '$'
	},
	period: {
		type: 'string',
		default: __( 'month', 'otter-blocks' )
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
	},
	buttonColor: {
		type: 'string'
	},
	backgroundColor: {
		type: 'string'
	},
	titleColorColor: {
		type: 'string'
	},
	descriptionColor: {
		type: 'string'
	},
	priceColor: {
		type: 'string'
	}
};

export default attributes;
