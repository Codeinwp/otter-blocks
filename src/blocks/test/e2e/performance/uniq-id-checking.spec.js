/**
 * External dependencies
 */
import { basename, join } from 'path';
import { writeFileSync } from 'fs';

/**
  * WordPress dependencies
  */
import {
	createNewPost,
	saveDraft,
	publishPost,
	insertBlock,
	openGlobalBlockInserter,
	closeGlobalBlockInserter,
	openListView,
	closeListView
} from '@wordpress/e2e-test-utils';

/**
  * Internal dependencies
  */
import {
	readFile,
	deleteFile,
	getTypingEventDurations,
	getClickEventDurations,
	getHoverEventDurations,
	getSelectionEventDurations,
	getLoadingDurations
} from './utils';

jest.setTimeout( 1000000 );

describe( 'Post Editor Performance', () => {
	const results = {
		serverResponse: [],
		firstPaint: [],
		domContentLoaded: [],
		loaded: [],
		firstContentfulPaint: [],
		firstBlock: [],
		type: [],
		focus: [],
		listViewOpen: [],
		inserterOpen: [],
		inserterHover: [],
		inserterSearch: []
	};
	const traceFile = __dirname + '/trace.json';
	let traceResults;

	beforeAll( async() => {
		const html = readFile(
			join( __dirname, '/assets/large-otter-post.html' )
		);

		await createNewPost();
		await page.evaluate( ( _html ) => {
			const { parse } = window.wp.blocks;
			const { dispatch } = window.wp.data;
			const blocks = parse( _html );

			blocks.forEach( ( block ) => {
				if ( 'core/image' === block.name ) {
					delete block.attributes.id;
					delete block.attributes.url;
				}
			});

			dispatch( 'core/block-editor' ).resetBlocks( blocks );
		}, html );

		await saveDraft();
	});

	afterAll( async() => {
		const resultsFilename = basename( __filename, '.js' ) + '.results.json';
		writeFileSync(
			join( __dirname, resultsFilename ),
			JSON.stringify( results, null, 2 )
		);
		deleteFile( traceFile );
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

	it( 'Check if ID is uniq for otter blocks', async() => {
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
		expect( otterIds.length === ( new Set( otterIds ) ).size ).toBe( true );
	});

});
