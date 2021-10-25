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
import { faIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';

registerBlockType( 'themeisle-blocks/review', {
	title: __( 'Product Review', 'otter-blocks' ),
	description: __( 'Turn your posts into smart reviews with ratings and generate leads with a performing review block.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'product',
		'review',
		'stars'
	],
	attributes,
	supports: {
		html: false
	},
	styles: [
		{
			name: 'default',
			label: __( 'Default', 'otter-blocks' ),
			isDefault: true
		},
		{
			name: 'single-column',
			label: __( 'Single Column', 'otter-blocks' )
		}
	],
	edit,
	save: () => null
});
