/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { faIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';

const { name } = metadata;

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Review Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different product reviews made on the website.', 'otter-blocks' ),
		icon,
		keywords: [
			'product',
			'review',
			'comparison'
		],
		supports: {
			html: false
		},
		edit,
		save: () => null
	});
} else {
	registerBlockType( name, {
		...metadata,
		title: __( 'Review Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different product reviews made on the website.', 'otter-blocks' ),
		icon,
		keywords: [
			'product',
			'review',
			'comparison'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro installed to edit Review Comparison Table block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
