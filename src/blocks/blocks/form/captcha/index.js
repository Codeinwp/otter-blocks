/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { formFieldIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Captcha', 'otter-blocks' ),
	description: __( 'Protect the form from spam with a captcha challenge. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'captcha',
		'recaptcha',
		'turnstile'
	],
	edit,
	save: () => null
});
