/**
 * External dependencies
 */
import { average, median, standardDeviation, quantileRank } from 'simple-statistics';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import path from 'path';

/**
 * WordPress dependencies
 */
import {
	createNewPost,
	saveDraft,
	insertBlock,
	openGlobalBlockInserter,
	closeGlobalBlockInserter,
	openListView,
	closeListView,
	canvas
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	readFile,
	deleteFile,
	saveResultsFile,
	getTraceFilePath,
	getTypingEventDurations,
	getClickEventDurations,
	getHoverEventDurations,
	getSelectionEventDurations,
	getLoadingDurations,
	sum
} from '../utils';

import { mapValues } from 'lodash';

jest.setTimeout( 1000000 );

async function loadHtmlIntoTheBlockEditor( html ) {
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
}

async function load1000Paragraphs() {
	await page.evaluate( () => {
		const { createBlock } = window.wp.blocks;
		const { dispatch } = window.wp.data;
		const blocks = Array.from({ length: 1000 }).map( () =>
			createBlock( 'core/paragraph' )
		);
		dispatch( 'core/block-editor' ).resetBlocks( blocks );
	});
}

let screenRecorder;

const savePathVideo = './artifacts/tests/';

const screenRecorderOptions = {
	followNewTab: true,
	fps: 25
};


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
	const traceFilePath = getTraceFilePath();
	let traceResults;

	afterAll( async() => {

		const summary = Object.entries( results ).filter( ([ _, value ]) => 0 < value.length ).map( ([ key, value ]) => {

			const data = mapValues({
				'average': average( value ).toFixed( 2 ),
				'standardDeviation': standardDeviation( value ).toFixed( 2 ),
				'median': median( value ).toFixed( 2 ),
				'quantileRank60': ( quantileRank( value, 60 ) * 100 ).toFixed( 2 ),
				'quantileRank80': ( quantileRank( value, 80 ) * 100 ).toFixed( 2 )
			}, parseFloat );

			if ( 'type' === key ) {
				data.above60 = value.map( ( x, i ) => ({ i, x, render: `${i} - ${x.toFixed( 2  )}` }) ).filter( ({ x }) => 60 < x ).map( ({ render }) => render ).join( ', ' );
			}

			return [ `${key}`, data ];
		});
		results.summary = Object.fromEntries( summary );

		saveResultsFile( __filename, results );
		deleteFile( traceFilePath );
	});

	beforeEach( async() => {
		await createNewPost();

		// Disable auto-save to avoid impacting the metrics.
		await page.evaluate( () => {
			window.wp.data.dispatch( 'core/editor' ).updateEditorSettings({
				autosaveInterval: 100000000000,
				localAutosaveInterval: 100000000000
			});
		});
	});

	// it( 'Loading', async() => {

	// 	await loadHtmlIntoTheBlockEditor(
	// 		readFile( path.join( __dirname, '../assets/large-post.html' ) )
	// 	);

	// 	await loadHtmlIntoTheBlockEditor(
	// 		readFile( path.join( __dirname, '../assets/large-otter-post.html' ) )
	// 	);

	// 	await saveDraft();
	// 	const draftURL = await page.url();

	// 	// Number of sample measurements to take.
	// 	const samples = 5;

	// 	// Number of throwaway measurements to perform before recording samples.
	// 	// Having at least one helps ensure that caching quirks don't manifest in
	// 	// the results.
	// 	const throwaway = 1;

	// 	let i = throwaway + samples;
	// 	while ( i-- ) {
	// 		await page.close();
	// 		page = await browser.newPage();

	// 		await page.goto( draftURL );
	// 		await page.waitForSelector( '.edit-post-layout', {
	// 			timeout: 120000
	// 		});
	// 		await canvas().waitForSelector( '.wp-block', { timeout: 120000 });

	// 		if ( i < samples ) {
	// 			const {
	// 				serverResponse,
	// 				firstPaint,
	// 				domContentLoaded,
	// 				loaded,
	// 				firstContentfulPaint,
	// 				firstBlock
	// 			} = await getLoadingDurations();

	// 			results.serverResponse.push( serverResponse );
	// 			results.firstPaint.push( firstPaint );
	// 			results.domContentLoaded.push( domContentLoaded );
	// 			results.loaded.push( loaded );
	// 			results.firstContentfulPaint.push( firstContentfulPaint );
	// 			results.firstBlock.push( firstBlock );
	// 		}
	// 	}

	// 	await saveDraft();
	// });

	it( 'Typing', async() => {

		screenRecorder = new PuppeteerScreenRecorder( page, screenRecorderOptions );
		await screenRecorder.start( savePathVideo + 'typing-test.mp4' );

		await loadHtmlIntoTheBlockEditor(
			readFile( path.join( __dirname, '../assets/large-post.html' ) )
		);

		await loadHtmlIntoTheBlockEditor(
			readFile( path.join( __dirname, '../assets/large-otter-post.html' ) )
		);

		await insertBlock( 'Paragraph' );
		let i = 20;
		await page.tracing.start({
			path: traceFilePath,
			screenshots: false,
			categories: [ 'devtools.timeline' ]
		});
		while ( i-- ) {

			// Wait for the browser to be idle before starting the monitoring.
			// The timeout should be big enough to allow all async tasks tor run.
			// And also to allow Rich Text to mark the change as persistent.
			// eslint-disable-next-line no-restricted-syntax
			await page.waitForTimeout( 2000 );
			await page.keyboard.type( 'x' );
		}
		await page.tracing.stop();
		traceResults = JSON.parse( readFile( traceFilePath ) );
		const [ keyDownEvents, keyPressEvents, keyUpEvents ] =
			getTypingEventDurations( traceResults );
		if (
			keyDownEvents.length === keyPressEvents.length &&
			keyPressEvents.length === keyUpEvents.length
		) {

			// The first character typed triggers a longer time (isTyping change)
			// It can impact the stability of the metric, so we exclude it.
			for ( let j = 1; j < keyDownEvents.length; j++ ) {
				results.type.push(
					keyDownEvents[ j ] + keyPressEvents[ j ] + keyUpEvents[ j ]
				);
			}
		}

		await saveDraft();

		await screenRecorder.stop();
	});

	it( 'Selecting blocks', async() => {
		await load1000Paragraphs();
		const paragraphs = await canvas().$$( '.wp-block' );
		await paragraphs[ 0 ].click();
		for ( let j = 1; 10 >= j; j++ ) {

			// Wait for the browser to be idle before starting the monitoring.
			// eslint-disable-next-line no-restricted-syntax
			await page.waitForTimeout( 1000 );
			await page.tracing.start({
				path: traceFilePath,
				screenshots: false,
				categories: [ 'devtools.timeline' ]
			});
			await paragraphs[ j ].click();
			await page.tracing.stop();
			traceResults = JSON.parse( readFile( traceFilePath ) );
			const allDurations = getSelectionEventDurations( traceResults );
			results.focus.push(
				allDurations.reduce( ( acc, eventDurations ) => {
					return acc + sum( eventDurations );
				}, 0 )
			);
		}

		await saveDraft();
	});
});
