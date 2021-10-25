/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { receipt as icon } from '@wordpress/icons';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) ) {
	registerBlockType( 'themeisle-blocks/business-hours', {
		title: __( 'Business Hours', 'otter-blocks' ),
		description: __( 'Display your business schedule on your website.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'business',
			'schedule',
			'time'
		],
		attributes,
		supports: {
			align: [ 'wide', 'full' ]
		},
		styles: [
			{
				name: 'default',
				label: __( 'default', 'otter-blocks' ),
				isDefault: true
			},
			{
				name: 'black-white',
				label: __( 'Black & White', 'otter-blocks' )
			}
		],
		edit,
		save
	});
} else {
	registerBlockType( 'themeisle-blocks/business-hours', {
		title: __( 'Business Hours', 'otter-blocks' ),
		description: __( 'Display your business schedule on your website.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'business',
			'schedule',
			'time'
		],
		attributes,
		supports: {
			inserter: false
		},
		edit: () => <Placeholder>{ __( 'You need to have Neve Pro installed to edit Business Hours block.', 'otter-blocks' ) }</Placeholder>,
		save
	});
}
