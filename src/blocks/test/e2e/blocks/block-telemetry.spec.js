/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

const isTelemetryChunk = ( url ) =>
	/build\/blocks\/chunk-editor-telemetry\.js/.test( url );

const TELEMETRY_OPTIONS = {
	otter_blocks_logger_flag: 'yes',
	otter_blocks_logger_data: { blocks: [], templates: [] },
	otter_activation_first_save: false
};

const TELEMETRY_OPTIONS_OFF = {
	otter_blocks_logger_flag: '',
	otter_blocks_logger_data: { blocks: [], templates: [] },
	otter_activation_first_save: false
};

const mockTelemetryTracker = async page => {
	await page.addInitScript( () => {
		window.__telemetryEvents = [];
		window.tiTrk = {
			with: () => ( {
				set: ( key, data ) => {
					window.__telemetryEvents.push({ key, data });
				}
			} )
		};
	});
};

const getTelemetryEvents = page =>
	page.evaluate( () => window.__telemetryEvents ?? [] );

const waitForEditorTelemetry = async ( page, navigation ) => {
	const chunkLoaded = page.waitForResponse(
		response => isTelemetryChunk( response.url() ),
		{ timeout: 15_000 }
	);

	await navigation();
	await chunkLoaded;
	await page.waitForFunction(
		() => window.wp.data.select( 'core/editor' )?.__unstableIsEditorReady?.(),
		{ timeout: 15_000 }
	);
	await page.waitForTimeout( 500 );
};

const eventsMatching = ( events, feature, featureComponent ) =>
	events.filter(
		event =>
			event.data?.feature === feature &&
			event.data?.featureComponent === featureComponent
	);

const saveCurrentPost = page =>
	page.evaluate( async() => {
		await window.wp.data.dispatch( 'core/editor' ).savePost();
	} );

const getLoggerBlockInstances = async ( requestUtils, blockName ) => {
	const settings = await requestUtils.rest({ path: '/wp/v2/settings' });
	const block = settings.otter_blocks_logger_data?.blocks?.find(
		entry => blockName === entry.name
	);

	return block?.instances ?? 0;
};

test.describe( 'Editor telemetry', () => {
	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOptions( TELEMETRY_OPTIONS_OFF );
	});

	test( 'does not load telemetry chunk when consent is off', async({ admin, page, otterUtils }) => {
		await otterUtils.setOptions({ otter_blocks_logger_flag: '' });

		const chunks = [];

		page.on( 'response', response => {
			if ( isTelemetryChunk( response.url() ) ) {
				chunks.push( response.url() );
			}
		});

		await admin.createNewPost();
		await page.waitForTimeout( 3000 );

		expect( chunks ).toHaveLength( 0 );
	});

	test( 'loads telemetry chunk when consent is on', async({ admin, page, otterUtils }) => {
		await otterUtils.setOptions({ otter_blocks_logger_flag: 'yes' });

		const chunks = [];

		page.on( 'response', response => {
			if ( isTelemetryChunk( response.url() ) ) {
				chunks.push( response.url() );
			}
		});

		await admin.createNewPost();

		await expect.poll( () => chunks.length, { timeout: 15_000 } ).toBeGreaterThanOrEqual( 1 );
		expect( chunks.some( url => url.includes( 'chunk-editor-telemetry' ) ) ).toBe( true );
	});

	test( 'fires activation first-insert once when an Otter block is added', async({
		admin,
		page,
		otterUtils,
		editor
	}) => {
		await otterUtils.setOptions( TELEMETRY_OPTIONS );
		await mockTelemetryTracker( page );

		await waitForEditorTelemetry( page, () => admin.createNewPost() );

		await editor.insertBlock({ name: 'themeisle-blocks/advanced-heading' });

		await expect.poll(
			async() => eventsMatching(
				await getTelemetryEvents( page ),
				'activation',
				'first-insert'
			).length,
			{ timeout: 15_000 }
		).toBe( 1 );

		await editor.insertBlock({ name: 'themeisle-blocks/button' });
		await page.waitForTimeout( 3000 );

		expect(
			eventsMatching(
				await getTelemetryEvents( page ),
				'activation',
				'first-insert'
			)
		).toHaveLength( 1 );
	});

	test( 'fires activation first-save once on save with depth bucket', async({
		admin,
		page,
		otterUtils,
		editor
	}) => {
		await otterUtils.setOptions( TELEMETRY_OPTIONS );
		await mockTelemetryTracker( page );

		await waitForEditorTelemetry( page, () => admin.createNewPost() );

		await editor.insertBlock({ name: 'themeisle-blocks/advanced-heading' });

		void saveCurrentPost( page ).catch( () => {} );

		await expect.poll(
			async() => eventsMatching(
				await getTelemetryEvents( page ),
				'activation',
				'first-save'
			).length,
			{ timeout: 15_000, intervals: [ 200, 500, 1000 ] }
		).toBe( 1 );

		const events = await getTelemetryEvents( page );

		expect( eventsMatching( events, 'activation', 'first-save' ) ).toHaveLength( 1 );
		expect( eventsMatching( events, 'activation', 'first-save-depth' ) ).toHaveLength( 1 );
		expect( eventsMatching( events, 'activation', 'first-save-depth' )[ 0 ].data.featureValue ).toBe( '1' );

		await saveCurrentPost( page );
		await page.waitForTimeout( 2000 );

		expect(
			eventsMatching(
				await getTelemetryEvents( page ),
				'activation',
				'first-save'
			)
		).toHaveLength( 1 );
	});

	test( 'fires block-usage when Otter blocks are added or removed', async({
		admin,
		page,
		otterUtils,
		editor
	}) => {
		await otterUtils.setOptions( TELEMETRY_OPTIONS );
		await mockTelemetryTracker( page );

		await waitForEditorTelemetry( page, () => admin.createNewPost() );
		await page.waitForTimeout( 2500 );

		await editor.insertBlock({ name: 'themeisle-blocks/advanced-heading' });

		await expect.poll(
			async() => {
				const events = await getTelemetryEvents( page );

				return events.some(
					event =>
						'block-usage' === event.data?.feature &&
						'themeisle-blocks/advanced-heading' === event.data?.featureComponent &&
						'1' === event.data?.featureValue
				);
			},
			{ timeout: 15_000, intervals: [ 500, 1000 ] }
		).toBe( true );

		await page.evaluate( () => {
			const blockEditor = window.wp.data.select( 'core/block-editor' );
			const block = blockEditor.getBlocks().find(
				item => 'themeisle-blocks/advanced-heading' === item.name
			);

			window.wp.data.dispatch( 'core/block-editor' ).removeBlock( block.clientId );
		});

		await expect.poll(
			async() => {
				const events = await getTelemetryEvents( page );

				return events.some(
					event =>
						'block-usage' === event.data?.feature &&
						'themeisle-blocks/advanced-heading' === event.data?.featureComponent &&
						'-1' === event.data?.featureValue
				);
			},
			{ timeout: 15_000, intervals: [ 500, 1000 ] }
		).toBe( true );
	});

	test( 'updates otter_blocks_logger_data when a published post with Otter blocks is saved', async({
		admin,
		page,
		otterUtils,
		editor,
		requestUtils
	}) => {
		await otterUtils.setOptions( TELEMETRY_OPTIONS );

		const post = await requestUtils.createPost({
			title: 'Inventory telemetry',
			status: 'publish',
			content: '<!-- wp:paragraph --><p>Seed</p><!-- /wp:paragraph -->'
		});

		await waitForEditorTelemetry( page, () => admin.editPost( post.id ) );

		await editor.insertBlock({ name: 'themeisle-blocks/advanced-heading' });

		const settingsSaved = page.waitForResponse(
			response =>
				response.url().includes( 'wp/v2/settings' ) &&
				'POST' === response.request().method()
		);

		await saveCurrentPost( page );
		await settingsSaved;
		await page.waitForTimeout( 2000 );

		await expect.poll(
			() => getLoggerBlockInstances( requestUtils, 'themeisle-blocks/advanced-heading' ),
			{ timeout: 15_000 }
		).toBeGreaterThanOrEqual( 1 );
	});

	test( 'reports invalid Otter block markup once per slug', async({
		admin,
		page,
		otterUtils
	}) => {
		await otterUtils.setOptions( TELEMETRY_OPTIONS );
		await mockTelemetryTracker( page );

		await waitForEditorTelemetry( page, () => admin.createNewPost() );

		await page.evaluate( () => {
			const { parse } = window.wp.blocks;
			const { resetBlocks } = window.wp.data.dispatch( 'core/block-editor' );

			resetBlocks(
				parse(
					'<!-- wp:themeisle-blocks/advanced-heading -->\n<h2>Broken</h2>\n<!-- /wp:themeisle-blocks/advanced-heading -->'
				)
			);
		});

		await page.waitForFunction( () => {
			const blockEditor = window.wp?.data?.select( 'core/block-editor' );
			const block = blockEditor?.getBlocks?.().find(
				item => 'themeisle-blocks/advanced-heading' === item.name
			);

			return block && false === block.isValid;
		}, { timeout: 15_000 } );

		await expect.poll(
			async() => eventsMatching(
				await getTelemetryEvents( page ),
				'block-health',
				'render-error'
			).length,
			{ timeout: 15_000 }
		).toBe( 1 );

		await page.evaluate( () => {
			const { parse } = window.wp.blocks;
			const { resetBlocks } = window.wp.data.dispatch( 'core/block-editor' );

			resetBlocks(
				parse(
					'<!-- wp:themeisle-blocks/advanced-heading -->\n<h2>Broken again</h2>\n<!-- /wp:themeisle-blocks/advanced-heading -->'
				)
			);
		});

		await page.waitForTimeout( 3000 );

		expect(
			eventsMatching(
				await getTelemetryEvents( page ),
				'block-health',
				'render-error'
			)
		).toHaveLength( 1 );
	});
});
