/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps } from '@wordpress/block-editor';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import Inactive from '../../components/inactive/index.js';

const { reviewIcon: icon } = window.otterUtils.icons;

const { name } = metadata;

if ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	edit = () => <Inactive
		icon={ icon }
		label={ metadata.title }
		blockProps={ useBlockProps() }
	/>;
}

registerBlockType( name, {
	...metadata,
	title: __( 'Review Comparison Table', 'otter-blocks' ),
	description: __( 'A way to compare different product reviews made on the website. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'product',
		'review',
		'comparison'
	],
	supports: {
		html: false,
		inserter: Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired )
	},
	edit,
	save: () => null
});
