/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { insertParagraphAndOpenAiToolbar } from '../helpers/ai-toolbar';

const PRESEEDED_OPENAI_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXxx';

const DEFAULT_ACTIONS = [
	{
		id: 'rewrite',
		title: 'Rewrite',
		prompt: 'Rewrite this block for clarity and flow:\n\n{block_content}',
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	},
	{
		id: 'summarize',
		title: 'Summarize',
		prompt: 'Summarize this block concisely:\n\n{block_content}',
		enabled: false,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	}
];

test.describe( 'AI Toolbar', () => {
	test.beforeEach( async({ admin, otterUtils }) => {
		await otterUtils.reset();
		await otterUtils.setOptions({
			themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY,
			themeisle_blocks_settings_block_ai_toolbar_module: true
		});
		await otterUtils.seedPrompts();
		await admin.createNewPost();
	});

	test( 'shows the AI toolbar on paragraph blocks', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { content: 'Toolbar visibility test.' }
		});

		await expect( page.getByRole( 'button', { name: 'Otter AI Content' }) ).toBeVisible();
	});

	test( 'opens the modal when an action is selected', async({ editor, page }) => {
		await insertParagraphAndOpenAiToolbar( page, editor );

		await page.getByRole( 'menuitem', { name: 'Rewrite' }).click();

		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Rewrite' }) ).toBeVisible();
		await expect( page.getByText( 'Hello world.' ) ).toBeVisible();
	});

	test( 'does not list disabled toolbar actions', async({ admin, editor, otterUtils, page }) => {
		await otterUtils.setOptions({ themeisle_blocks_settings_ai_toolbar_actions: DEFAULT_ACTIONS });
		await admin.createNewPost();

		await insertParagraphAndOpenAiToolbar( page, editor );

		await expect( page.getByRole( 'menuitem', { name: 'Rewrite' }) ).toBeVisible();
		await expect( page.getByRole( 'menuitem', { name: 'Summarize' }) ).not.toBeVisible();

		await otterUtils.reset();
		await otterUtils.setOptions({ themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY });
		await otterUtils.seedPrompts();
	});

	test( 'links to the dashboard AI tab when the API key is missing', async({ admin, editor, otterUtils, page }) => {
		await otterUtils.setOptions({ themeisle_open_ai_api_key: '' });
		await admin.createNewPost();

		await insertParagraphAndOpenAiToolbar( page, editor );

		const dashboardLink = page.getByRole( 'link', { name: 'Go to Dashboard' });
		await expect( dashboardLink ).toBeVisible();
		await expect( dashboardLink ).toHaveAttribute( 'href', /#ai$/ );

		await otterUtils.setOptions({ themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY });
	});

	test( 'replaces selected content from the modal', async({ editor, page }) => {
		await insertParagraphAndOpenAiToolbar( page, editor, 'Original paragraph content.' );

		await page.getByRole( 'menuitem', { name: 'Rewrite' }).click();

		await page.waitForResponse( ( response ) => response.url().includes( '/otter/v1/openai/prompt' ) ).catch( () => null );
		await page.getByRole( 'button', { name: 'Generate' }).click();
		await expect( page.getByText( 'Rewritten content for testing.' ) ).toBeVisible({ timeout: 15000 });

		await page.getByRole( 'button', { name: 'Apply' }).click();

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		await expect( editor.canvas.getByText( 'Rewritten content for testing.' ) ).toBeVisible();
		await expect( editor.canvas.getByText( 'Original paragraph content.' ) ).toBeHidden();
	});
});
