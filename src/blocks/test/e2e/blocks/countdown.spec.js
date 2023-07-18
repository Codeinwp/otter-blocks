/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Tabs Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/tabs"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/countdown' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasCountdown = blocks.some( ( block ) => 'themeisle-blocks/countdown' === block.name );

		expect( hasCountdown ).toBeTruthy();
	});

	test( 'select a data', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/countdown'
		});

		let countdownBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/countdown' === block.name );

		await page.getByRole( 'button', { name: 'Select Date' }).click();

		await page.getByLabel( 'Day' ).fill( '17' );

		await page.getByLabel( 'Year' ).fill( '2030' );

		await page.getByRole( 'combobox', { name: 'Month' }).selectOption( 'August' );


		await page.getByRole( 'button', { name: 'August 17, 2023. Selected' }).click();


		// Add a small delay to allow the block to update.
		await page.waitForTimeout( 200 );

		// TODO: add render test
	});
});
