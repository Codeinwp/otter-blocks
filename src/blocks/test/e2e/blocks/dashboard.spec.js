/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Dashboard', () => {
	test.beforeEach( async({ admin }) => {
		await admin.visitAdminPage( 'admin.php?page=otter' );
	});

	test( 'check OpenAI API key test', async({ page }) => {
		const integrationsTab = page.getByRole( 'button', { name: 'Integrations' });
		await integrationsTab.click();
		await page.waitForTimeout( 1000 );

		const openAIAccordion = page.getByRole( 'button', { name: 'OpenAI' });
		await openAIAccordion.click();
		await page.waitForTimeout( 1000 );

		const inputArea = page.getByPlaceholder( 'OpenAI API Key' );
		await inputArea.fill( 'test' );

		const save = page.locator( 'div' ).filter({ hasText: /^SaveGet API Key↗More Info↗$/ }).getByRole( 'button' );
		await save.click();
		await page.waitForTimeout( 1000 );

		const snackbar = page.getByTestId( 'snackbar' );

		expect( await snackbar.isVisible() ).toBe( true );
		expect( await snackbar.innerText() ).toContain( 'Incorrect API key provided: test.' );
	});

	test( 'toggle AI Block Toolbar', async({ editor, page }) => {

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
});
