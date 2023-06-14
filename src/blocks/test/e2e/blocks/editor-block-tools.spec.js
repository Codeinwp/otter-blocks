/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Block Tools', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'enable all and check if they are visible as default in Inspector', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.getByRole( 'button', { name: 'Otter Options' }).click( );

		/**
		 * Activate Custom CSS
		 */
		const customCSSContainer = await page.locator( 'div' ).filter({ hasText: /^Custom CSS$/ }).first();
		await expect( customCSSContainer ).toBeVisible();
		await customCSSContainer.getByLabel( 'Custom CSS' ).click();
		expect( await customCSSContainer.locator( 'input' ).isChecked() ).toBeTruthy();

		/**
		 * Activate Animation
		 */
		const animationContainer = await page.locator( 'div' ).filter({ hasText: /^Animation$/ }).first();
		await expect( animationContainer ).toBeVisible();
		await animationContainer.getByLabel( 'Animation' ).click();
		expect( await animationContainer.locator( 'input' ).isChecked() ).toBeTruthy();

		/**
		 * Activate Visibility Condition
		 */
		const visibilityConditionContainer = await page.locator( 'div' ).filter({ hasText: /^Visibility Condition$/ }).first();
		await expect( visibilityConditionContainer ).toBeVisible();
		await visibilityConditionContainer.getByLabel( 'Visibility Condition' ).click();
		expect( await visibilityConditionContainer.locator( 'input' ).isChecked() ).toBeTruthy();

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/progress-bar' );
		await page.keyboard.press( 'Enter' );

		/**
		 * Check if all the options are visible in Inspector
		 */
		await page.getByRole( 'button', { name: 'Settings', exact: true }).click();
		await expect( await page.getByRole( 'button', { name: 'Animations' }) ).toBeVisible();
		await expect( await page.getByRole( 'button', { name: 'Custom CSS' }) ).toBeVisible();
		await expect( await page.getByRole( 'button', { name: 'Visibility Condition' }) ).toBeVisible();
	});
});
