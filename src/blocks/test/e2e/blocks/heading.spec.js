/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Advanced Heading Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/advanced-heading"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/advanced-heading' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasProgressBar = blocks.some( ( block ) => 'themeisle-blocks/advanced-heading' === block.name );

		expect( hasProgressBar ).toBeTruthy();
	});

	test( 'can use typo component"', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/advanced-heading'
		});

		// Open Style tab.
		await page.getByRole( 'button', { name: 'Style' }).click();

		// Select font size.
		await page.getByRole( 'radio', { name: '16' }).click();

		// Open the menu for more options.
		await page.getByRole( 'button', { name: 'View options' }).click();

		// Enable all options.
		await page.getByRole( 'menuitemcheckbox', { name: 'Font Family' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Appearance' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Spacing' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Letter Case' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Line Height' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Variant' }).click();

		// Close the menu.
		await page.getByRole( 'button', { name: 'View options' }).click();

		// Open the family font menu to start the fonts loading. Then close the panel and come back after some time.
		await page.getByRole( 'button', { name: 'Select Font Family' }).click();

		// Fill the line height.
		await page.getByLabel( 'Line Height' ).fill( '1.5' );

		// Fill the letter spacing.
		await page.getByLabel( 'Spacing' ).fill( '10' );

		// Select a letter case.
		await page.getByRole( 'button', { name: 'Uppercase' }).click();

		// Select an appearance.
		await page.getByRole( 'combobox', { name: 'Appearance' }).selectOption( 'Italic' );

		// Select a font family.
		await page.getByRole( 'button', { name: 'Select Font Family' }).click();
		await page.waitForSelector( '.o-gfont-popover .components-menu-item__button div[style*="Comic Neue"]' );
		await page.getByRole( 'menuitem', { name: 'Comic Neue' }).click();

		// Select a variant.
		await page.getByRole( 'combobox', { name: 'Variants' }).selectOption( '700' );

		// Compare with the saved data.
		const blocks = await editor.getBlocks();
		const attrs = blocks.filter( ( block ) => 'themeisle-blocks/advanced-heading' === block.name )?.pop()?.attributes;

		expect( attrs ).toBeDefined();
		expect( attrs?.fontSize ).toBe( '16px' );
		expect( attrs?.fontFamily ).toBe( 'Comic Neue' );
		expect( attrs?.fontVariant ).toBe( '700' );
		expect( attrs?.letterSpacing ).toBe( '10px' );
		expect( attrs?.lineHeight ).toBe( '1.5' );
		expect( attrs?.textTransform ).toBe( 'uppercase' );
		expect( attrs?.fontStyle ).toBe( 'italic' );
	});
});
