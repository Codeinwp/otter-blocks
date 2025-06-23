/**
 * WordPress dependencies.
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import './editor.scss';
import './link/index.js';
import './value/index.js';
import './media/index.js';


export const { Slot: OtterDynamicContentSlot, Fill: OtterDynamicContentFill } = createSlotFill( 'OtterDynamicContent' );
