/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Dashboard', () => {
	test.beforeEach( async({ admin }) => {
		await admin.visitAdminPage( 'admin.php?page=otter' );
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
