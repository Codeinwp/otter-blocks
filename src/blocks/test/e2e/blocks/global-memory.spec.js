/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Global Memory State', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'keep tab state between Desktop, Table & Mobile', async({ editor, page }) => {

		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		const styleDesktop = page.getByRole( 'button', { name: 'Style', exact: true });

		await styleDesktop.click();

		await page.getByRole( 'button', { name: 'Preview' }).click();
		await page.getByRole( 'menuitem', { name: 'Tablet' }).click();

		const styleTablet = page.getByRole( 'button', { name: 'Style', exact: true });
		await styleTablet.waitFor();

		expect( await styleTablet.isVisible() ).toBeTruthy();

		await page.getByRole( 'menuitem', { name: 'Desktop' }).click();

		const styleDesktopAfter = page.getByRole( 'button', { name: 'Style', exact: true });
		await styleDesktopAfter.waitFor();

		expect( await styleDesktopAfter.isVisible() ).toBeTruthy();
	});
});
