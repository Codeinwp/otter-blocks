/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType, createBlock } from '@wordpress/blocks';

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import save from './save.js';
import { popupIcon as icon } from '../../../blocks/helpers/icons';
import Inactive from '../../components/inactive';

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
	title: __( 'Modal', 'otter-pro' ),
	description: __( 'Display your content in beautiful Modal with many customization options. Powered by Otter.', 'otter-pro' ),
	icon,
	keywords: [
		'modal',
		'lightbox'
	],
	edit,
	save,
	example: {
		attributes: {}
	},
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/popup' ],
				transform: ( attributes ) => {
					return createBlock( 'themeisle-blocks/popup', {
						...attributes
					});
				}
			}
		],
		from: [
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/popup' ],
				transform: ( attributes ) => {
					return createBlock( name, {
						...attributes
					});
				}
			}
		]
	}
});
