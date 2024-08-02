/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Timeline Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'insert block', async({ editor, page }) => {

		await editor.insertBlock({
			name: 'themeisle-blocks/timeline'
		});

		await expect( page.locator( '.o-timeline-content' ).first() ).toBeVisible(); // First container visible.
		await expect( page.getByText( 'Project Launch' ) ).toBeVisible(); // Content visible.

		const postId = await editor.publishPost();
		await page.goto( `/?p=${postId}` );

		await expect( page.locator( '.o-timeline-content' ).first() ).toBeVisible(); // First container visible.
		await expect( page.getByText( 'Project Launch' ) ).toBeVisible(); // Content visible.

		await page.waitForTimeout( 1000 );
	});

});
