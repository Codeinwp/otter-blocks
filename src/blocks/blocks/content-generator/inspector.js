/**
 * WordPress dependencies
 */
import {
	InspectorControls
} from '@wordpress/block-editor';

/**
 * Generation options (Atomic Wind, scope, theme colors) live on the block's
 * generation card itself — see ./edit.js — so the sidebar carries no controls.
 *
 * @return
 */
const Inspector = () => {
	return (
		<InspectorControls>
		</InspectorControls>
	);
};

export default Inspector;
