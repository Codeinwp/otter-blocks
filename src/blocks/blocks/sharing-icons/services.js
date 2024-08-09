/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const SERVICES = {
	facebook: {
		label: __( 'Facebook', 'otter-blocks' ),
		icon: 'facebook-f'
	},
	twitter: {
		label: __( 'X', 'otter-blocks' ),
		icon: 'twitter'
	},
	linkedin: {
		label: __( 'Linkedin', 'otter-blocks' ),
		icon: 'linkedin-in'
	},
	pinterest: {
		label: __( 'Pinterest', 'otter-blocks' ),
		icon: 'pinterest-p'
	},
	tumblr: {
		label: __( 'Tumblr', 'otter-blocks' ),
		icon: 'tumblr'
	},
	reddit: {
		label: __( 'Reddit', 'otter-blocks' ),
		icon: 'reddit-alien'
	},
	whatsapp: {
		label: __( 'WhatsApp', 'otter-blocks' ),
		icon: 'whatsapp'
	},
	email: {
		label: __( 'Email', 'otter-blocks' ),
		icon: 'envelope'
	},
	telegram: {
		label: __( 'Telegram', 'otter-blocks' ),
		icon: 'telegram'
	},
	mastodon: {
		label: __( 'Mastodon', 'otter-blocks' ),
		icon: 'mastodon'
	},
	comments: {
		label: __( 'Comment', 'otter-blocks' ),
		icon: 'comment'
	},
	threads: {
		label: __( 'Threads', 'otter-blocks' ),
		icon: ''
	}
};

export default SERVICES;
