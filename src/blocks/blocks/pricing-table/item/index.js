import { rotateRight as icon } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import './style.scss';
import './editor.scss';

import edit from './edit';
import save from './save';
import attributes from './attributes';

registerBlockType( 'themeisle/pricing-table-item', {
	title: __( 'Pricing Table', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [ 'themeisle', 'pricing', 'table' ],
	attributes,
	edit,
	save
});
