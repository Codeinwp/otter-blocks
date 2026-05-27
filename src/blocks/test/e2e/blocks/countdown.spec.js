/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName, insertBlockBySlash, publishAndViewPost } from '../helpers/editor';

test.describe( 'Countdown Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/countdown"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/countdown',
			blockName: 'themeisle-blocks/countdown'
		});
	});

	test( 'select a data and check the rendering', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/countdown'
		});

		const countdownBlock = await expectBlockByName( editor, 'themeisle-blocks/countdown' );
		const otterId = countdownBlock.attributes.id;

		// Focus the block so its Inspector controls render.
		await page.getByRole( 'document', { name: 'Block: Countdown' }).first().click();

		// The picker button is labelled "Select Date" only when no date is set; once Otter
		// auto-fills a default future date, the same button shows the formatted date instead.
		// Match by the stable wrapper class.
		await page.locator( '.o-extend-btn' ).first().click();

		await page.getByLabel( 'Day' ).fill( '17' );
		await page.getByRole( 'combobox', { name: 'Month' }).selectOption( 'August' );
		await page.getByLabel( 'Year' ).fill( '2030' );

		await page.getByLabel( 'Year' ).press( 'Enter' );

		// Editor preview uses singular labels ("Day", "Hour", …); the frontend renders the
		// pluralised form ("Days") once the countdown has a real value.
		await expect( page.locator( '.otter-countdown__label' ).filter({ hasText: /^Day$/ }) ).toBeVisible();

		await page.locator( '.editor-styles-wrapper' ).click();
		await publishAndViewPost({ editor, page });

		expect( ( await page.$eval( `#${otterId}`, ( el ) => el.getAttribute( 'data-date' ) ) ).startsWith( '2030-08-17' ) ).toBeTruthy();

		await expect( page.getByText( 'Days', { exact: true }) ).toBeVisible();

		// Capture the current value of the seconds.
		const currentValue = await page.locator( '.otter-countdown__display-area' )
			.filter({
				hasText: 'Seconds'
			})
			.locator( '.otter-countdown__value' )
			.innerHTML();

		// Wait for 1 second for the seconds to change.
		await page.waitForTimeout( 1300 );

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
