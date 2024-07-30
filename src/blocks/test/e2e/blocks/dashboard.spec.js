/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Dashboard', () => {
	test.beforeEach( async({ admin }) => {
		await admin.visitAdminPage( 'admin.php?page=otter' );
	});

	test( 'toggle AI Block Toolbar', async({ page }) => {

		const toggle = page.getByLabel( 'Enable AI Block Toolbar Module' );
		const initialToggleValue = await toggle.isChecked();

		await toggle.click();
		await page.waitForTimeout( 1000 ); // Wait for the toggle to be updated.
		expect( await toggle.isChecked() ).not.toEqual( initialToggleValue );

		page.reload();

		await toggle.click();
		await page.waitForTimeout( 1000 );
		expect( await toggle.isChecked() ).toEqual( initialToggleValue );
	});

	test( 'edit editable custom actions', async({ page }) => {

		const actionTitleValue = 'Fix Spelling';
		const actionPromptValue = 'Fix spelling mistakes in the content.';

		await page.getByRole( 'button', { name: 'Integrations' }).click();
		await page.getByRole( 'button', { name: 'OpenAI' }).click();

		// Edit the first action.
		page.locator( '.otter-ai-toolbar-actions .components-panel__body:first-child button' ).click();
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
		await page.getByRole( 'button', { name: 'OpenAI' }).click();
		await expect( page.getByRole( 'button', { name: actionTitleValue }) ).toBeVisible();
	});
});
