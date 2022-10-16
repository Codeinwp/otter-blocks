/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import { createSlotFill } from '@wordpress/components';

const { Fill, Slot } = createSlotFill( 'OtterInspectorExtensions' );

const supportedBlocks = [
	'themeisle-blocks/advanced-columns',
	'themeisle-blocks/advanced-column',
	'themeisle-blocks/advanced-heading',
	'themeisle-blocks/accordion'
	'themeisle-blocks/posts-grid',
	'themeisle-blocks/review'
];

export const useInspectorSlot = name => {
	return supportedBlocks.includes( name ) ? Fill : InspectorControls;
};

export const InspectorExtensions = () => {
	return (
		<Slot>
			{ fills => {
				if ( ! fills.length ) {
					return null;
				}

				return fills;
			} }
		</Slot>
	);
};
