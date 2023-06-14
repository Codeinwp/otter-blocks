/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Progress Bar Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/progress-bar"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/progress-bar' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasProgressBar = blocks.some( ( block ) => 'themeisle-blocks/progress-bar' === block.name );

		expect( hasProgressBar ).toBeTruthy();
	});
});
