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
		label: __( 'Twitter', 'otter-blocks' ),
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
	}
};

export default SERVICES;
