/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import './style.scss';
import './editor.scss';
import { contactIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/form', {
	title: __( 'Form', 'otter-blocks' ),
	description: __( 'Display a form for your clients.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'business',
		'form',
		'email'
	],
	attributes,
	supports: {
		align: [ 'wide', 'full' ]
	},
	edit,
	save,
	variations: [
		{
			name: 'themeisle-blocks/form-contact',
			description: __( 'Contact form for clients', 'otter-blocks' ),
			icon: icon,
			title: __( 'Contact Form', 'otter-blocks' ),
			innerBlocks: [
				[
					'themeisle-blocks/form-input',
					{
						label: __( 'Name', 'otter-blocks' ),
						type: 'text',
						isRequired: true
					}
				],
				[
					'themeisle-blocks/form-input',
					{
						label: __( 'Email', 'otter-blocks' ),
						type: 'email',
						isRequired: true
					}
				],
				[
					'themeisle-blocks/form-textarea',
					{
						label: __( 'Message', 'otter-blocks' )
					}
				],
				[
					'core/paragraph',
					{
						content: __( 'You agree to receive email communication from us by submitting this form and understand that your contact information will be stored with us.', 'otter-blocks' ),
						fontSize: 'extra-small'
					}
				]
			]
		},
		{
			name: 'themeisle-blocks/form-subscribe',
			description: __( 'Add the clients to your subscription list', 'otter-blocks' ),
			icon: icon,
			title: __( 'Subscribe Form', 'otter-blocks' ),
			innerBlocks: [
				[
					'themeisle-blocks/form-input',
					{
						label: __( 'Name', 'otter-blocks' ),
						type: 'text',
						isRequired: true
					}
				],
				[
					'themeisle-blocks/form-input',
					{
						label: __( 'Email', 'otter-blocks' ),
						type: 'email',
						isRequired: true
					}
				],
				[
					'core/paragraph',
					{
						content: __( 'You agree to receive email communication from us by submitting this form and understand that your contact information will be stored with us.', 'otter-blocks' ),
						fontSize: 'extra-small'
					}
				]
			]
		}
	]
});
