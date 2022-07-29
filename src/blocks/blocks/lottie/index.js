/**
 * External dependencies
 */
import { video as icon } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Lottie Animation', 'otter-blocks' ),
	description: __( 'Add Lottie animations to your WordPress. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'media',
		'lottie',
		'animation'
	],
	edit,
	save,
	example: {
		viewportWidth: 1200,
		attributes: {
			id: 'wp-block-themeisle-blocks-lottie-2',
			file: {
				url: 'https://assets8.lottiefiles.com/packages/lf20_kd5rzej5.json'
			}
		}
	}
});
