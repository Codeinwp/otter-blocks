/**
 * Bootstraps editor telemetry when the consent-gated chunk loads.
 */

/**
 * WordPress dependencies
 */
import { select, subscribe } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as editorStore } from '@wordpress/editor';
import domReady from '@wordpress/dom-ready';

import { onActivationBlockTick, onActivationEditorTick, startActivation } from './activation-funnel.js';
import { startBlockHealth } from './block-health.js';
import { startBlockUsage } from './block-usage.js';
import { getTelemetryBootstrap } from './shared.js';
import { onInventoryEditorTick, startInventory } from './inventory.js';

window.themeisleGutenberg.dataLogging = window.themeisleGutenberg.dataLogging || {};

const wireEditorTelemetry = () => {
	const bootstrap = getTelemetryBootstrap();

	startInventory( bootstrap );
	startActivation( bootstrap );

	subscribe( () => {
		onInventoryEditorTick();
		onActivationEditorTick();
	}, editorStore );

	subscribe( onActivationBlockTick, blockEditorStore );
};

domReady( () => {
	startBlockHealth();

	if ( Boolean( window.themeisleGutenberg?.isBlockEditor ) && select( 'core/editor' ) ) {
		wireEditorTelemetry();
		startBlockUsage();
	}
});
