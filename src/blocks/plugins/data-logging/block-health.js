/**
 * Tracks Otter blocks that fail to render in the editor.
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

// ponytail: session-only dedup; sessionStorage if reopen inflation matters.
const reportedSlugs = new Set();

/**
 * Walk the block tree and collect slugs for broken Otter blocks.
 *
 * @param {Array}       blocks  Blocks to inspect.
 * @param {string[]}    tracked Otter block names to watch.
 * @param {Set<string>} acc     Accumulator for errored slugs.
 * @return {Set<string>}
 */
const collectErroredSlugs = ( blocks, tracked, acc ) => {
	blocks.forEach( block => {
		if ( false === block.isValid && tracked.includes( block.name ) ) {
			acc.add( block.name );
		}

		if ( 'core/missing' === block.name ) {
			const originalName = block.attributes?.originalName;

			if ( originalName && tracked.includes( originalName ) ) {
				acc.add( originalName );
			}
		}

		if ( block.innerBlocks?.length ) {
			collectErroredSlugs( block.innerBlocks, tracked, acc );
		}
	});

	return acc;
};

/**
 * Report newly detected broken Otter blocks.
 */
const checkBlockHealth = () => {
	const trackedBlockNames = getTrackedBlockNames();

	if ( 0 === trackedBlockNames.length ) {
		return;
	}

	const { getBlocks } = select( blockEditorStore );
	const errored = collectErroredSlugs(
		getBlocks(),
		trackedBlockNames,
		new Set()
	);

	errored.forEach( slug => {
		if ( reportedSlugs.has( slug ) ) {
			return;
		}

		reportedSlugs.add( slug );

		window.oTrk?.set( `block-health-${ slug }`, {
			feature: 'block-health',
			featureComponent: 'render-error',
			featureValue: slug
		});
	});
};

export const startBlockHealth = () => {
	if ( ! select( blockEditorStore ) || ! select( 'core/blocks' ) ) {
		return;
	}

	setTimeout( () => {
		subscribe( debounce( checkBlockHealth, 1000 ), blockEditorStore );
	}, 1000 );
};
