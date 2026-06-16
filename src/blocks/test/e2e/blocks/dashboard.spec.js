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

		const integrationsTab = page.getByRole( 'button', { name: 'Integrations' });
		await integrationsTab.click();

		const openAIAccordion = page.getByRole( 'button', { name: 'AI Provider' });
		await openAIAccordion.click();

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

			const save = page.locator( 'div' ).filter({ hasText: /^SaveGet API Key↗More Info↗$/ }).getByRole( 'button' );
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

		await page.getByRole( 'button', { name: 'Integrations' }).click();
		await page.getByRole( 'button', { name: 'AI Provider' }).click();

		// The grandfathered input renders with the masked saved key as placeholder.
		await expect( page.getByPlaceholder( /^sk_X+xx$/ ) ).toBeVisible();

		const aiClientSupported = await page.evaluate( () => Boolean( window.otterObj?.aiClientSupported ) );

		if ( aiClientSupported ) {
			await expect( page.getByText( 'Legacy connection.' ) ).toBeVisible();
		}
	});

	test( 'toggle AI Block Toolbar', async({ admin, page, requestUtils }) => {

		/*
		 * The dashboard hydrates settings asynchronously and toggles render
		 * unchecked until then, so reading the initial value from the UI races
		 * hydration (the value can flip between the read and the click). Seed a
		 * known state via the REST API instead, and use the seeded checked
		 * toggles as hydration signals before interacting.
		 */
		await requestUtils.rest({
			method: 'POST',
			path: '/wp/v2/settings',
			data: {
				themeisle_blocks_settings_block_ai_toolbar_module: true,
				themeisle_blocks_settings_css_module: true
			}
		});
		await admin.visitAdminPage( 'admin.php?page=otter' );

		const toggle = page.getByLabel( 'Enable AI Block Toolbar Module' );
		const hydrationCanary = page.getByLabel( 'Enable Custom CSS Module' );

		const waitForSave = () => page.waitForResponse( response =>
			response.url().includes( 'wp/v2/settings' ) &&
			[ 'POST', 'PUT' ].includes( response.request().method() )
		);

		// Checked only happens once the seeded value has hydrated.
		await expect( toggle ).toBeChecked();

		let saved = waitForSave();
		await toggle.click();
		await expect( toggle ).not.toBeChecked();
		await saved;

		await page.reload();

		// Wait for hydration before interacting, otherwise the click can be
		// overwritten when the settings request resolves.
		await expect( hydrationCanary ).toBeChecked();
		await expect( toggle ).not.toBeChecked();

		saved = waitForSave();
		await toggle.click();
		await expect( toggle ).toBeChecked();
		await saved;
	});

	test( 'edit editable custom actions', async({ page }) => {

		const actionTitleValue = 'Fix Spelling';
		const actionPromptValue = 'Fix spelling mistakes in the content.';

		await page.getByRole( 'button', { name: 'Integrations' }).click();
		await page.getByRole( 'button', { name: 'AI Provider' }).click();

		// Edit the first action.
		await page.locator( '.otter-ai-toolbar-actions .components-panel__body:first-child button' ).click();
		await page.locator( '.otter-ai-toolbar-actions .components-panel__body:first-child' ).getByPlaceholder( 'Action Name' ).fill( actionTitleValue );
		await page.locator( '.otter-ai-toolbar-actions .components-panel__body:first-child' ).getByPlaceholder( 'Prompt' ).fill( actionPromptValue );

		// Save the changes.
		const requestPromise = page.waitForRequest( request =>
			request.url().includes( 'settings' )
		);
		await page.locator( 'div' ).filter({ hasText: /^SaveMore Info↗$/ }).getByRole( 'button' ).click();
		await requestPromise;
		await page.reload();

		await page.getByRole( 'button', { name: 'Integrations' }).click();
		await page.getByRole( 'button', { name: 'AI Provider' }).click();
		await expect( page.getByRole( 'button', { name: actionTitleValue }) ).toBeVisible();
	});
});
