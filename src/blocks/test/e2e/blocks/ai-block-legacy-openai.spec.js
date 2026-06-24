/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

const SECTION_PLACEHOLDER = 'e.g. A hero section for a dental clinic with a heading and two buttons';

/**
 * AI Block through Otter's legacy OpenAI backend (`openai-key` setting).
 *
 * Unlike ai-block.spec.js, these tests do NOT mock the `/otter/v1/openai/generate`
 * route in the browser: requests reach the server, where the AI_Backend_Resolver
 * picks Otter_OpenAI_Backend and its api.openai.com request is intercepted
 * server-side by `packages/e2e-tests/mu-plugins/otter-e2e-ai-provider-mock.php`
 * (gated on the sentinel key below, so other specs keep real-endpoint behavior).
 */
test.describe( 'AI Block via legacy OpenAI backend', () => {
	const PRESEEDED_OPENAI_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXxx';
	const LEGACY_MOCK_KEY = 'sk-otter-e2e-legacy-mock';

	test.beforeEach( async({ admin, otterUtils }) => {
		// With no Connectors provider configured, resolution falls back to the
		// legacy Otter OpenAI key path.
		await otterUtils.setOptions({
			'themeisle_open_ai_api_key': LEGACY_MOCK_KEY,
			'connectors_ai_openai_api_key': ''
		});
		await otterUtils.seedPrompts();

		await admin.createNewPost();
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOptions({
			'themeisle_open_ai_api_key': PRESEEDED_OPENAI_KEY
		});
	});

	test( 'generates content through the legacy backend without route mocks', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		await page.waitForResponse( r => r.url().includes( '/otter/v1/openai/prompt' ) ).catch( () => null );
		await editor.canvas.getByPlaceholder( SECTION_PLACEHOLDER ).fill( 'Write about anything.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		const dialog = page.getByRole( 'dialog' );
		const insertButton = dialog.getByRole( 'button', { name: 'Insert section' });
		await expect( insertButton ).toBeEnabled({ timeout: 30000 });
		await insertButton.click();

		const blocks = await editor.getBlocks();

		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		await expect( editor.canvas.getByText( 'Legacy OpenAI mock response' ) ).toBeVisible();
	});

	test( 'surfaces empty completions as an error instead of an empty result', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		await page.waitForResponse( r => r.url().includes( '/otter/v1/openai/prompt' ) ).catch( () => null );

		// The marker makes the server-side mock return a completion with no choices.
		await editor.canvas.getByPlaceholder( SECTION_PLACEHOLDER ).fill( 'otter-e2e-empty' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog.getByText( 'OpenAI returned an empty response' ) ).toBeVisible({ timeout: 30000 });
		await expect( dialog.getByRole( 'button', { name: 'Insert section' }) ).toBeDisabled();
	});
});
