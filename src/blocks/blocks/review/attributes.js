/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

const attributes = {
	id: {
		type: 'string'
	},
	title: {
		type: 'string'
	},
	currency: {
		type: 'string',
		default: 'USD'
	},
	price: {
		type: 'number'
	},
	discounted: {
		type: 'number'
	},
	image: {
		type: 'object'
	},
	description: {
		type: 'string'
	},
	features: {
		type: 'array',
		default: [
			{
				title: __( 'Stability', 'otter-blocks' ),
				rating: 9
			},
			{
				title: __( 'Ease of Use', 'otter-blocks' ),
				rating: 4
			},
			{
				title: __( 'Look & Feel', 'otter-blocks' ),
				rating: 9
			},
			{
				title: __( 'Price', 'otter-blocks' ),
				rating: 7
			}
		]
	},
	pros: {
		type: 'array',
		default: [
			__( 'Easy to use', 'otter-blocks' ),
			__( 'Good price', 'otter-blocks' ),
			__( 'Sturdy build and ergonomics', 'otter-blocks' )
		]
	},
	cons: {
		type: 'array',
		default: [
			__( 'Incompatible with old versions', 'otter-blocks' ),
			__( 'Hard to assemble', 'otter-blocks' ),
			__( 'Bad color combination', 'otter-blocks' )
		]
	},
	links: {
		type: 'array',
		default: [
			{
				label: __( 'Buy on Amazon', 'otter-blocks' ),
				href: '',
				isSponsored: false
			},
			{
				label: __( 'Buy on eBay', 'otter-blocks' ),
				href: '',
				isSponsored: false
			}
		]
	},
	primaryColor: {
		type: 'string'
	},
	backgroundColor: {
		type: 'string'
	},
	textColor: {
		type: 'string'
	},
	buttonTextColor: {
		type: 'string'
	}
};

export default attributes;
