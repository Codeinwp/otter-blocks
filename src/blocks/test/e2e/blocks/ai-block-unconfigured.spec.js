/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

/**
 * Editor gating when no AI backend is configured: no OpenAI key and no
 * WP AI Client provider. Both editor surfaces (the AI Block placeholder and
 * the Otter AI toolbar) share the same gate (isAIBackendConfigured) and must
 * point the user at setup instead of pretending generation will work.
 */
test.describe( 'AI surfaces without a configured backend', () => {
	const PRESEEDED_OPENAI_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXxx';

	test.beforeEach( async({ admin, otterUtils }) => {
		await otterUtils.setOptions({
			'themeisle_open_ai_api_key': '',
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

	test( 'AI Block shows the AI setup placeholder', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		// On WP 7.0+ the placeholder routes to the core Connectors flow; the
		// legacy inline key form only remains on older cores.
		const aiClientSupported = await page.evaluate( () => Boolean( window.themeisleGutenberg?.aiClientSupported ) );

		if ( aiClientSupported ) {
			await expect( editor.canvas.getByText( 'No AI provider is configured. Set one up under Settings > Connectors' ) ).toBeVisible();
			await expect( editor.canvas.getByRole( 'link', { name: 'Manage Connectors' }) ).toBeVisible();
		} else {
			await expect( editor.canvas.getByText( 'API Key not found. Please introduce the API Key' ) ).toBeVisible();
		}

		await expect( editor.canvas.getByPlaceholder( 'Start describing what content' ) ).toBeHidden();
	});

	test( 'AI toolbar guides the user to set up a provider', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'A paragraph that could be transformed.'
			}
		});

		await page.getByRole( 'button', { name: 'Otter AI Content' }).click();

		await expect( page.getByText( 'Please set up an AI provider in Integrations.' ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: /Go to Dashboard/ }) ).toBeVisible();
	});
});
