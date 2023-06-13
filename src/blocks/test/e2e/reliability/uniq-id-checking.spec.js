/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import {
	createNewPost,
	saveDraft
} from '@wordpress/e2e-test-utils';

jest.setTimeout( 1000000 );

describe( 'Otter Block ID Reliability ', () => {

	beforeAll( async() => {
		await createNewPost();

		// Insert 5 blocks.
		await page.evaluate( () => {
			Array( 5 )
				.fill( 'themeisle-blocks/circle-counter' )
				.map( ( name ) =>  wp.blocks.createBlock( name, {}) )
				.forEach( ( block ) => {
					wp.data.dispatch( 'core/block-editor' ).insertBlock( block );
				});
		});

		// Duplicate
		await page.evaluate( () => {
			const { getBlocks } = window.wp.data.select( 'core/block-editor' );
			const blocksIds = getBlocks().map( ( block ) => block.clientId );

			wp.data.dispatch( 'core/block-editor' ).duplicateBlocks( blocksIds );
		});

		// Copy and paste
		await page.evaluate( () => {
			const { getBlocks } = window.wp.data.select( 'core/block-editor' );
			getBlocks().forEach( ( block ) => {
				const newBlock = wp.blocks.createBlock( block.name, block.attributes );
				wp.data.dispatch( 'core/block-editor' ).insertBlock( newBlock );
			});
		});
	});

	beforeEach( async() => {

		// Disable auto-save to avoid impacting the metrics.
		await page.evaluate( () => {
			window.wp.data.dispatch( 'core/editor' ).updateEditorSettings({
				autosaveInterval: 100000000000,
				localAutosaveInterval: 100000000000
			});
		});
	});

	it( 'Has uniq ids', async() => {

		const ids = await page.evaluate( ( ) => {
			const ids = [];
			const { getBlocks } = window.wp.data.select( 'core/block-editor' );
			const extractId = block => ( block.attributes.id );


			const loopBlocks = block => {
				ids.push( extractId( block ) );
				if ( 0 < block.innerBlocks?.length ) {
					for ( const innerBlock of block.innerBlocks ) {
						loopBlocks( innerBlock );
					}
				}
			};

			for ( const block of getBlocks() ) {
				loopBlocks( block );
			}

			return ids;
		});

		const otterIds = ids.filter( x => x && x.includes( 'themeisle' ) );
		expect( 0 < otterIds.length ).toBe( true );

		const s = new Set( otterIds );

		console.log( `Ids: ${otterIds.length} | Uniq ids: ${s.size}` );

		const duplicates = {};

		otterIds.forEach( i => {
			if ( duplicates[i] === undefined ) {
				duplicates[i] = 1;
			} else {
				duplicates[i] += 1;
			}

		});

		console.log( `Ids that appear more than once: ${Object.keys( duplicates ).filter( i => 1 < duplicates[i]).map( i => `\n| ${duplicates[i].toString().padStart( 2, ' ' )} ${i}` ).join( '' )}`  );

		expect( otterIds.length === s.size ).toBe( true );

		await saveDraft();
	});

});
