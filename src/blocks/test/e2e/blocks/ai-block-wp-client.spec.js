/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

/**
 * AI Block through the WordPress 7.0 AI Client (`wp-ai-client` backend).
 *
 * Unlike ai-block.spec.js, these tests do NOT mock the `/otter/v1/openai/generate`
 * route: requests reach the server, where the AI_Client_Adaptor translates them
 * for the WP AI Client and the `ai-provider-for-openai` plugin (mounted via
 * .wp-env.json). The provider's HTTP calls to api.openai.com are intercepted
 * server-side by `packages/e2e-tests/mu-plugins/otter-e2e-ai-provider-mock.php`.
 */
test.describe( 'AI Block via WP AI Client', () => {
	test.beforeEach( async({ admin, otterUtils, page }) => {
		// A configured Connectors provider makes resolution pick the WP AI Client.
		await otterUtils.setOptions({
			'connectors_ai_openai_api_key': 'sk-otter-e2e-mock'
		});
		await otterUtils.seedPrompts();

		await admin.createNewPost();

		// The WP AI Client shipped in WordPress 7.0; skip on older cores or without a usable provider.
		const wpAIClientReady = await page.evaluate( () => Boolean( window.themeisleGutenberg?.aiClientActive && window.themeisleGutenberg?.hasAIProvider ) );
		test.skip( ! wpAIClientReady, 'WP AI Client backend or provider is not available in this WordPress version.' );
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOptions({
			'connectors_ai_openai_api_key': ''
		});
	});

	test( 'generates content through the WP AI Client without route mocks', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		// Wait for the prompt list to load so embeddedPrompts is populated before "Generate".
		await page.waitForResponse( r => r.url().includes( '/otter/v1/openai/prompt' ) ).catch( () => null );
		await editor.canvas.getByPlaceholder( 'Start describing what content' ).type( 'Write about anything.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();
		await editor.canvas.getByRole( 'button', { name: 'Replace' }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		await expect( editor.canvas.getByText( 'WP AI Client mock response' ) ).toBeVisible();
	});

	test( 'generates a form through the structured JSON translation', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'form'
			}
		});

		await page.waitForResponse( r => r.url().includes( '/otter/v1/openai/prompt' ) ).catch( () => null );
		await editor.canvas.getByPlaceholder( 'Start describing what form' ).type( 'A simple contact form.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		// The mocked provider returns {"fields":[...]} via the forced-JSON path
		// (functions/function_call → as_json_response → format: json), which
		// the block parses into form field blocks for preview.
		await expect( editor.canvas.getByText( 'Full Name' ) ).toBeVisible();
		await expect( editor.canvas.getByText( 'Email Address' ) ).toBeVisible();

		await editor.canvas.getByRole( 'button', { name: 'Replace' }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.some( block => 'themeisle-blocks/form' === block.name ) ).toBe( true );
	});
});
