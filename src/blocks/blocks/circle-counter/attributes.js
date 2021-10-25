/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const attributes = {
	id: {
		type: 'string'
	},
	title: {
		type: 'string',
		default: __( 'Skill', 'otter-blocks' )
	},
	percentage: {
		type: 'number',
		default: 50
	},
	duration: {
		type: 'number',
		default: 2
	},
	titleStyle: {
		type: 'string',
		default: 'default'
	},
	height: {
		type: 'number',
		default: 100
	},
	fontSizeTitle: {
		type: 'number'
	},
	fontSizePercent: {
		type: 'number'
	},
	strokeWidth: {
		type: 'number',
		default: 10
	},
	backgroundColor: {
		type: 'string'
	},
	progressColor: {
		type: 'string'
	},
	titleColor: {
		type: 'string'
	}
};

export default attributes;
