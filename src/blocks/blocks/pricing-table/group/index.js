import './editor.scss';
import './style.scss';

import edit from './edit';
import save from './save';
import attributes from './attributes';

import { rotateRight as icon } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType( 'themeisle-blocks/pricing-table', {
	title: __( 'Pricing Tables', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [ 'themeisle', 'pricing', 'tables', 'group' ],
	attributes,
	edit,
	save
});
