/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

export const styles = [
	{
		label: __( 'Default', 'otter-blocks' ),
		value: 'default',
		isDefault: true
	},
	{
		label: __( 'Boxed', 'otter-blocks' ),
		value: 'boxed'
	},
	{
		label: __( 'Tiled', 'otter-blocks' ),
		value: 'tiled'
	}
];
