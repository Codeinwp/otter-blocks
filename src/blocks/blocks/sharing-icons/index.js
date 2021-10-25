/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { sharingIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';

registerBlockType( 'themeisle-blocks/sharing-icons', {
	title: __( 'Sharing Icons', 'otter-blocks' ),
	description: __( 'Share buttons for your website visitors to share content on any social sharing service.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'social media',
		'sharing',
		'icons'
	],
	attributes,
	supports: {
		align: [ 'left', 'center', 'right' ]
	},
	styles: [
		{ name: 'default', label: __( 'Regular', 'otter-blocks' ), isDefault: true },
		{ name: 'icons', label: __( 'Icons Only', 'otter-blocks' ) }
	],
	edit,
	save: () => null
});
