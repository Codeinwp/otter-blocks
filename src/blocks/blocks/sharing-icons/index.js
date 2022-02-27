/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { sharingIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Sharing Icons', 'otter-blocks' ),
	description: __( 'Share buttons for your website visitors to share content on any social sharing service.', 'otter-blocks' ),
	icon,
	keywords: [
		'social media',
		'sharing',
		'icons'
	],
	styles: [
		{ name: 'default', label: __( 'Regular', 'otter-blocks' ), isDefault: true },
		{ name: 'icons', label: __( 'Icons Only', 'otter-blocks' ) }
	],
	edit,
	save: () => null
});
