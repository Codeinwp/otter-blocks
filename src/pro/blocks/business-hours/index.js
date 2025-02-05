/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import save from './save.js';
import Inactive from '../../components/inactive/index.js';
import './item/index.js';

const { businessHoursIcon: icon } = window.otterUtils.icons;

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
	title: __( 'Business Hours', 'otter-pro' ),
	description: __( 'Display your business schedule on your website. Powered by Otter.', 'otter-pro' ),
	icon,
	keywords: [
		'business',
		'schedule',
		'time'
	],
	supports: {
		align: [ 'wide', 'full' ],
		inserter: Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired )
	},
	styles: [
		{
			name: 'default',
			label: __( 'Default', 'otter-pro' ),
			isDefault: true
		},
		{
			name: 'black-white',
			label: __( 'Black & White', 'otter-pro' )
		}
	],
	edit,
	save
});
