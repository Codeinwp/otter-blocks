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
import { faIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) ) {
	registerBlockType( 'themeisle-blocks/review-comparison', {
		apiVersion: 2,
		title: __( 'Review Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different product reviews made on the website.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'product',
			'review',
			'comparison'
		],
		attributes,
		supports: {
			html: false
		},
		edit,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/review-comparison', {
		apiVersion: 2,
		title: __( 'Review Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different product reviews made on the website.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'product',
			'review',
			'comparison'
		],
		attributes,
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro installed to edit Review Comparison Table block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
