/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

const SECTION_PLACEHOLDER = 'e.g. A hero section for a dental clinic with a heading and two buttons';

/**
 * Editor gating when no AI backend is configured: no OpenAI key and no
 * WP AI Client provider. The Otter AI toolbar menu and generation modal share
 * the same backend check and must point the user at setup instead of applying.
 */
test.describe( 'AI surfaces without a configured backend', () => {
	const PRESEEDED_OPENAI_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXxx';

	test.beforeEach( async({ admin, otterUtils }) => {
		await otterUtils.setOptions({
			'themeisle_open_ai_api_key': '',
			'connectors_ai_openai_api_key': ''
		});
		// The content-generator block renders an enable-gate (no prompt field)
		// unless the Atomic Wind blocks it builds with are registered.
		await otterUtils.setAtomicWindBlocks( true );
		await otterUtils.seedPrompts();

		await admin.createNewPost();
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOptions({
			'themeisle_open_ai_api_key': PRESEEDED_OPENAI_KEY
		});
		await otterUtils.setAtomicWindBlocks( false );
	});

	test( 'AI Block generation modal warns when no provider is configured', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		await editor.canvas.getByPlaceholder( SECTION_PLACEHOLDER ).fill( 'A simple hero section.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();
		await expect( dialog.getByText( 'Please add an AI provider in the AI settings.' ) ).toBeVisible();
		await expect( dialog.getByRole( 'link', { name: 'Go to Dashboard' }) ).toBeVisible();
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
