/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { insertParagraphAndOpenAiToolbar } from '../helpers/ai-toolbar';

// Prefix-matched by the e2e bootstrap mu-plugin, which stubs the OpenAI HTTP
// call server-side with deterministic pipeline responses.
const PRESEEDED_OPENAI_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXxx';

const mockTelemetryTracker = async page => {
	await page.addInitScript( () => {
		window.__telemetryEvents = [];
		window.tiTrk = {
			with: () => ( {
				set: ( key, data ) => {
					window.__telemetryEvents.push({ key, data });
				},
				add: ( data ) => {
					window.__telemetryEvents.push({ key: null, data });
				}
			} )
		};
	});
};

const getTelemetryEvents = page =>
	page.evaluate( () => window.__telemetryEvents ?? [] );

const eventsMatching = ( events, feature, featureComponent ) =>
	events.filter(
		event =>
			event.data?.feature === feature &&
			event.data?.featureComponent === featureComponent
	);

/**
 * Open the AI toolbar on a paragraph, run a stubbed text edit, and wait for
 * the result. The instruction contains a text-intent hint ("shorten") so the
 * agent skips the DECIDE call and runs a single TEXT_EDIT request.
 *
 * @param {import('@playwright/test').Page}                       page
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor
 * @return {Promise<import('@playwright/test').Locator>} The modal dialog.
 */
const generateWithToolbar = async ( page, editor ) => {
	await insertParagraphAndOpenAiToolbar( page, editor, 'A long paragraph that needs trimming.' );
	await page.getByRole( 'menuitem', { name: 'Edit with AI' }).click();

	const dialog = page.getByRole( 'dialog' );
	await expect( dialog ).toBeVisible();

	await dialog.getByRole( 'textbox', { name: 'Prompt' }).fill( 'Shorten this text.' );
	await dialog.getByRole( 'button', { name: 'Run' }).click();

	await expect( dialog.getByRole( 'button', { name: /^Apply/ }) ).toBeEnabled({ timeout: 30000 });

	return dialog;
};

test.describe( 'AI generation telemetry', () => {
	test.beforeEach( async({ admin, page, otterUtils }) => {
		await otterUtils.setOptions({
			otter_blocks_logger_flag: 'yes',
			themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY,
			themeisle_blocks_settings_block_ai_toolbar_module: true
		});
		await mockTelemetryTracker( page );
		await admin.createNewPost();
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOptions({
			otter_blocks_logger_flag: '',
			themeisle_open_ai_api_key: ''
		});
	});

	test( 'fires kept outcome and retry depth when a transform is applied', async({ editor, page }) => {
		const dialog = await generateWithToolbar( page, editor );

		await dialog.getByRole( 'button', { name: /^Apply/ }).click();
		await expect( dialog ).toBeHidden();

		const events = await getTelemetryEvents( page );

		const outcomes = eventsMatching( events, 'ai-generation', 'outcome-transform' );
		expect( outcomes ).toHaveLength( 1 );
		expect( outcomes[ 0 ].data.featureValue ).toBe( 'replace' );

		const retries = eventsMatching( events, 'ai-generation', 'regenerate-count' );
		expect( retries ).toHaveLength( 1 );
		expect( retries[ 0 ].data.featureValue ).toBe( '0' );
	});

	test( 'fires discard outcome when generated output is thrown away', async({ editor, page }) => {
		const dialog = await generateWithToolbar( page, editor );

		await dialog.getByRole( 'button', { name: 'Discard' }).click();
		await expect( dialog ).toBeHidden();

		const events = await getTelemetryEvents( page );

		const outcomes = eventsMatching( events, 'ai-generation', 'outcome-transform' );
		expect( outcomes ).toHaveLength( 1 );
		expect( outcomes[ 0 ].data.featureValue ).toBe( 'discard' );
	});
});
