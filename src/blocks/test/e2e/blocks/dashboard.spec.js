/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

test.describe( 'Dashboard', () => {
	const PRESEEDED_OPENAI_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXxx';

	test.beforeEach( async({ admin }) => {
		await admin.visitAdminPage( 'admin.php?page=otter' );
	});

	test( 'check OpenAI API key test', async({ admin, otterUtils, page }) => {
		// bin/e2e-tests.sh preseeds themeisle_open_ai_api_key, which makes the OpenAI input
		// render with the masked-key placeholder. Clear it so the no-key state shows.
		await otterUtils.setOptions({
			themeisle_open_ai_api_key: '',
			'connectors_ai_openai_api_key': ''
		});
		await admin.visitAdminPage( 'admin.php?page=otter' );

		const aiTab = page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'AI', exact: true });
		await aiTab.click();

		const aiClientSupported = await page.evaluate( () => Boolean( window.otterObj?.aiClientSupported ) );
		const inputArea = page.getByPlaceholder( 'OpenAI API Key' );

		if ( aiClientSupported ) {
			// On WP 7.0+ the legacy key input is deprecated: with no saved key it is
			// hidden and the panel routes to the core Connectors flow.
			await expect( inputArea ).toBeHidden();
			// Scoped to the notice: WP mirrors notice text into the a11y-speak live region.
			await expect( page.locator( '.components-notice' ).getByText( 'No AI provider is configured yet.' ) ).toBeVisible();
			await expect( page.getByRole( 'link', { name: 'Manage Connectors' }) ).toBeVisible();
		} else {
			await expect( inputArea ).toBeVisible();
			await inputArea.fill( 'test' );

			const save = page.getByRole( 'button', { name: 'Save', exact: true });
			await save.click();

			const snackbar = page.getByTestId( 'snackbar' );

			await expect( snackbar ).toBeVisible();
			await expect( snackbar ).toContainText( 'Incorrect API key provided: test.' );
		}

		// Restore the preseeded key for downstream tests that rely on it (AI toolbar actions etc.).
		await otterUtils.setOptions({ themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY });
	});

	test( 'keep the OpenAI key input for users with a saved key', async({ admin, otterUtils, page }) => {
		await otterUtils.setOptions({ themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY });
		await admin.visitAdminPage( 'admin.php?page=otter' );

		await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'AI', exact: true }).click();

		// The grandfathered input renders with the masked saved key as placeholder.
		await expect( page.getByPlaceholder( /^sk_X+xx$/ ) ).toBeVisible();

		const aiClientSupported = await page.evaluate( () => Boolean( window.otterObj?.aiClientSupported ) );

		if ( aiClientSupported ) {
			await expect( page.getByText( 'Legacy connection.' ) ).toBeVisible();
		}
	});

	test( 'toggle AI Block Toolbar', async({ page, otterUtils }) => {
		await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'Dashboard', exact: true }).click();

		const toggle = page.getByLabel( 'Enable AI Block Toolbar Module' );
		await expect( toggle ).toBeVisible();
		const initialToggleValue = await toggle.isChecked();

		try {
			await toggle.click();
			await expect( toggle ).toBeChecked({ checked: ! initialToggleValue });

			await page.reload();
			await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'Dashboard', exact: true }).click();
			await expect( toggle ).toBeChecked({ checked: ! initialToggleValue });

			await toggle.click();
			await expect( toggle ).toBeChecked({ checked: initialToggleValue });
		} finally {
			await otterUtils.setOptions({ themeisle_blocks_settings_block_ai_toolbar_module: true });
		}
	});

	test( 'edit editable custom actions', async({ page }) => {

		const actionTitleValue = 'Fix Spelling';
		const actionPromptValue = 'Fix spelling mistakes in the content.';

		await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'AI', exact: true }).click();

		const firstAction = page.locator( '.otter-ai-action-card' ).first();

		await firstAction.locator( '.otter-ai-action-card__header' ).click();
		await firstAction.getByLabel( 'Action name' ).fill( actionTitleValue );
		await firstAction.getByLabel( 'Prompt' ).fill( actionPromptValue );

		const requestPromise = page.waitForRequest( request =>
			request.url().includes( 'settings' )
		);
		await page.getByRole( 'button', { name: 'Save Actions' }).click();
		await requestPromise;
		await page.reload();

		await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'AI', exact: true }).click();
		await expect( page.getByRole( 'button', { name: actionTitleValue }) ).toBeVisible();
	});

	test( 'adds and removes a custom toolbar action', async({ page, otterUtils }) => {
		await otterUtils.setOptions({ themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY });

		await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'AI', exact: true }).click();
		await page.getByRole( 'button', { name: 'Add custom action' }).click();

		const customAction = page.locator( '.otter-ai-action-card' ).last();
		await customAction.locator( '.otter-ai-action-card__header' ).click();
		await customAction.getByLabel( 'Action name' ).fill( 'My Custom Action' );

		await page.getByRole( 'button', { name: 'Save Actions' }).click();
		await page.reload();

		await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'AI', exact: true }).click();
		await expect( page.getByRole( 'button', { name: 'My Custom Action' }) ).toBeVisible();

		await page.locator( '.otter-ai-action-card' ).filter({ hasText: 'My Custom Action' }).locator( '.otter-ai-action-card__header' ).click();
		await page.getByRole( 'button', { name: 'Delete action' }).click();
		await page.getByRole( 'button', { name: 'Save Actions' }).click();
		await page.reload();

		await page.locator( '.otter-navigation' ).getByRole( 'button', { name: 'AI', exact: true }).click();
		await expect( page.getByRole( 'button', { name: 'My Custom Action' }) ).not.toBeVisible();
	});
});
