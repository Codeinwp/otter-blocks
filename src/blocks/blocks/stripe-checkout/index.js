/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { store as icon } from '@wordpress/icons';

/**
  * Internal dependencies
  */
import metadata from './block.json';
import edit from './edit';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Stripe Checkout', 'otter-blocks' ),
	description: __( 'A Stripe Checkout to sell your products on your website without any hassle. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'stripe',
		'checkout',
		'payment'
	],
	edit,
	save: () => null,
	supports: {
		html: false
	}
});
