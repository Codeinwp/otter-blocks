/**
 * Tracks Otter block additions and removals in the editor.
 */

/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { select, subscribe } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { getTrackedBlockNames } from './shared.js';

/**
 * Current instance count per watched block type, from the previous store tick.
 *
 * @type {Object.<string, number>}
 */
let blockCounts = {};

/**
 * Skip the first store tick so existing blocks seed the baseline instead of
 * being reported as additions.
 *
 * @type {boolean}
 */
let isInitialized = false;

/**
 * Count instances of every watched block in the post, including nested inner blocks.
 *
 * @return {Object.<string, number>} Instance count keyed by block name.
 */
const countBlocks = () => {
	const { getGlobalBlockCount } = select( blockEditorStore );
	const counts = {};

	getTrackedBlockNames().forEach( blockType => {
		counts[ blockType ] = getGlobalBlockCount( blockType );
	});

	return counts;
};

/**
 * Diff the current block counts against the previous tick and report additions
 * or removals as telemetry events.
 */
const updateBlockCounts = () => {
	const watchedBlockTypes = getTrackedBlockNames();

	if ( 0 === watchedBlockTypes.length ) {
		return;
	}

	const newCounts = countBlocks();

	if ( isInitialized ) {
		watchedBlockTypes.forEach( blockType => {
			const change = ( newCounts[ blockType ] || 0 ) - ( blockCounts[ blockType ] || 0 );

			if ( 0 === change ) {
				return;
			}

			window.oTrk?.set( `${ blockType }:${ Date.now() }`, {
				feature: 'block-usage',
				featureComponent: blockType,
				featureValue: String( change )
			});
		});
	} else {
		isInitialized = true;
	}

	blockCounts = newCounts;
};

export const startBlockUsage = () => {
	if ( ! Boolean( window.themeisleGutenberg?.isBlockEditor ) ) {
		return;
	}

	setTimeout( () => {
		const debouncedUpdate = debounce( updateBlockCounts, 1000 );

		subscribe( debouncedUpdate, blockEditorStore );
		updateBlockCounts();
	}, 1000 );
};
