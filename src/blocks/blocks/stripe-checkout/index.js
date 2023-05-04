/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import {
	ExternalLink,
	Placeholder
} from '@wordpress/components';

/**
  * Internal dependencies
  */
import metadata from './block.json';
import { cartIcon as icon } from '../../helpers/icons.js';
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

