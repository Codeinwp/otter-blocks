/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

const BLOCK_NAME = 'themeisle-blocks/circle-counter';

const collectOtterBlockIds = () => {
	const ids = [];

	const extractId = ( block ) => block.attributes.id;

	const loopBlocks = ( block ) => {
		ids.push( extractId( block ) );

		if ( 0 < block.innerBlocks?.length ) {
			for ( const innerBlock of block.innerBlocks ) {
				loopBlocks( innerBlock );
			}
		}
	};

	for ( const block of window.wp.data.select( 'core/block-editor' ).getBlocks() ) {
		loopBlocks( block );
	}

	return ids.filter( ( id ) => id && id.includes( 'themeisle' ) );
};

test.describe( 'Otter Block ID reliability', () => {
	test( 'assigns unique themeisle ids after insert, duplicate, and copy-paste', async({ admin, editor, page }) => {
		await admin.createNewPost();

		await page.evaluate( () => {
			window.wp.data.dispatch( 'core/editor' ).updateEditorSettings({
				autosaveInterval: 100000000000,
				localAutosaveInterval: 100000000000
			});
		});

		await page.evaluate( ( name ) => {
			Array( 5 )
				.fill( name )
				.map( ( blockName ) => window.wp.blocks.createBlock( blockName, {}) )
				.forEach( ( block ) => {
					window.wp.data.dispatch( 'core/block-editor' ).insertBlock( block );
				});
		}, BLOCK_NAME );

		await page.evaluate( () => {
			const blocksIds = window.wp.data
				.select( 'core/block-editor' )
				.getBlocks()
				.map( ( block ) => block.clientId );

			window.wp.data.dispatch( 'core/block-editor' ).duplicateBlocks( blocksIds );
		});

		await page.evaluate( () => {
			window.wp.data
				.select( 'core/block-editor' )
				.getBlocks()
				.forEach( ( block ) => {
					const newBlock = window.wp.blocks.createBlock( block.name, block.attributes );
					window.wp.data.dispatch( 'core/block-editor' ).insertBlock( newBlock );
				});
		});

		const otterIds = await page.evaluate( collectOtterBlockIds );

		expect( otterIds.length ).toBeGreaterThan( 0 );
		expect( otterIds.length ).toBe( new Set( otterIds ).size );

		await editor.saveDraft();
	});
});
