/**
 * Track when Otter blocks are added to or removed from the editor.
 */

/**
 * External dependencies.
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies.
 */
import { select, subscribe } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import domReady from '@wordpress/dom-ready';

/**
 * Current instance count per watched block type, from the previous store tick.
 *
 * @type {Object.<string, number>}
 */
let blockCounts = {};

/**
 * Block categories tracked as Otter usage: the core Otter blocks and the
 * Atomic Wind blocks.
 *
 * @type {string[]}
 */
const TRACKED_CATEGORIES = [ 'themeisle-blocks', 'atomic-wind' ];

/**
 * Block names in the tracked categories. Resolved lazily, once the block types
 * have been registered.
 *
 * @type {string[]}
 */
let watchedBlockTypes = [];

/**
 * Skip the first store tick so existing blocks seed the baseline instead of
 * being reported as additions.
 *
 * @type {boolean}
 */
let isInitialized = false;

/**
 * Count instances of every watched block in the post, including nested inner
 * blocks.
 *
 * @return {Object.<string, number>} Instance count keyed by block name.
 */
const countBlocks = () => {
	const { getGlobalBlockCount } = select( blockEditorStore );
	const counts = {};

	watchedBlockTypes.forEach( blockType => {
		counts[ blockType ] = getGlobalBlockCount( blockType );
	});

	return counts;
};

/**
 * Diff the current block counts against the previous tick and report additions
 * or removals as telemetry events.
 */
const updateBlockCounts = () => {

	// Resolve the watched list once block types are available.
	if ( 0 === watchedBlockTypes.length ) {
		watchedBlockTypes = select( 'core/blocks' )
			.getBlockTypes()
			.filter( block => TRACKED_CATEGORIES.includes( block.category ) )
			.map( block => block.name );

		if ( 0 === watchedBlockTypes.length ) {
			return;
		}
	}

	const newCounts = countBlocks();

	if ( isInitialized ) {
		watchedBlockTypes.forEach( blockType => {
			const change = ( newCounts[ blockType ] || 0 ) - ( blockCounts[ blockType ] || 0 );

			if ( 0 === change ) {
				return;
			}

			// Signed delta: positive means added, negative means removed.
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

if ( Boolean( window.themeisleGutenberg?.isBlockEditor ) ) {
	domReady( () => {

		// Respect the tracking opt-in (otter_blocks_logger_flag). `oTrk` also
		// self-gates on consent, but bailing here avoids the per-change work.
		if ( ! Boolean( window.themeisleGutenberg?.canTrack ) ) {
			return;
		}

		// Delay so existing blocks are loaded before the baseline is taken.
		// Debounce the diff so a burst of editor changes collapses into a single count instead of running on every tick.
		setTimeout( () => {
			subscribe( debounce( updateBlockCounts, 1000 ), blockEditorStore );
		}, 1000 );
	});
}
