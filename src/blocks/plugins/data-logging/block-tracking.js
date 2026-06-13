/**
 * Track when Otter blocks are added to or removed from the editor.
 *
 * Mirrors the approach Feedzy uses (`js/FeedzyLoop/tracking.js`): subscribe to
 * the block-editor store, keep a per-type instance count for every block in the
 * `themeisle-blocks` category, and on each change emit a signed-delta telemetry
 * event through the already-initialised `window.oTrk` accumulator
 * (`tiTrk.with( 'otter' )`, set up in `../helpers`). The first store tick only
 * seeds the baseline, so blocks already present when a post is opened are not
 * reported as additions.
 *
 * The emitted event reuses the same `feature: 'block-usage'` shape Feedzy sends,
 * so Otter and Feedzy block usage line up under one schema in telemetry and this
 * does not collide with the existing per-block `action: 'block-created'` events.
 *
 * @package
 */

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
 * Block names in the `themeisle-blocks` category. Resolved lazily, once the
 * block types have been registered.
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
 * Recursively count instances of watched blocks, including nested inner blocks.
 *
 * @return {Object.<string, number>} Instance count keyed by block name.
 */
const countBlocks = () => {
	const counts = {};

	const walk = blocks => blocks.forEach( block => {
		if ( watchedBlockTypes.includes( block.name ) ) {
			counts[ block.name ] = ( counts[ block.name ] || 0 ) + 1;
		}

		if ( block.innerBlocks?.length ) {
			walk( block.innerBlocks );
		}
	});

	walk( select( blockEditorStore ).getBlocks() );

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
			.filter( block => 'themeisle-blocks' === block.category )
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
		setTimeout( () => {
			subscribe( updateBlockCounts, blockEditorStore );
		}, 1000 );
	});
}
