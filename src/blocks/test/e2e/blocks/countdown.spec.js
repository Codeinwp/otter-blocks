/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Countdown Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/countdown"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/countdown' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasCountdown = blocks.some( ( block ) => 'themeisle-blocks/countdown' === block.name );

		expect( hasCountdown ).toBeTruthy();
	});

	test( 'select a data and check the rendering', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/countdown'
		});

		let countdownBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/countdown' === block.name );
		const otterId = countdownBlock.attributes.id;

		await page.getByRole( 'button', { name: 'Select Date' }).click();

		await page.getByLabel( 'Day' ).fill( '17' );
		await page.getByRole( 'combobox', { name: 'Month' }).selectOption( 'August' );
		await page.getByLabel( 'Year' ).fill( '2030' );

		await page.getByLabel( 'Year' ).press( 'Enter' );

		// If everything is ok, the day label text should be changed to "Days".
		await expect( page.getByText( 'Days' ) ).toBeVisible();

		await page.locator( '.editor-styles-wrapper' ).click();
		const postId = await editor.publishPost();

		await page.goto( `/?p=${postId}` );

		expect( ( await page.$eval( `#${otterId}`, ( el ) => el.getAttribute( 'data-date' ) ) ).startsWith( '2030-08-17' ) ).toBeTruthy();

		// If everything is ok, the day label text should be changed to "Days".
		await expect( page.getByText( 'Days' ) ).toBeVisible();

		// Capture the current value of the seconds.
		const currentValue = await page.locator( '.otter-countdown__display-area' )
			.filter({
				hasText: 'Seconds'
			})
			.locator( '.otter-countdown__value' )
			.innerHTML();

		// Wait for 1 second for the seconds to change.
		await page.waitForTimeout( 1000 );

		// Capture the new value of the seconds.
		const newValue = await page.locator( '.otter-countdown__display-area' )
			.filter({
				hasText: 'Seconds'
			})
			.locator( '.otter-countdown__value' )
			.innerHTML();

		// Check if the new value is different from the old one.
		expect( currentValue ).not.toEqual( newValue );
	});
});
