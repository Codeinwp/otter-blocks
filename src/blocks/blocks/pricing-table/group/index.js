import './editor.scss';
import './style.scss';

import edit from './edit';
import save from './save';
import attributes from './attributes';

import { rotateRight as icon } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType( 'themeisle/pricing-table', {
	title: __( 'Pricing Tables Group', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [ 'themeisle', 'pricing', 'tables', 'group' ],
	attributes,
	edit,
	save
});
