/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';

test.describe( 'Timeline Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'insert block', async({ editor, page }) => {

		await editor.insertBlock({
			name: 'themeisle-blocks/timeline'
		});

		await expect( editor.canvas.locator( '.o-timeline-content' ).first() ).toBeVisible(); // First container visible.
		await expect( editor.canvas.getByText( 'Project Launch' ) ).toBeVisible(); // Content visible.

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.o-timeline-content' ).first() ).toBeVisible(); // First container visible.
		await expect( page.getByText( 'Project Launch' ) ).toBeVisible(); // Content visible.

		await expect( page.locator( '.o-timeline-content' ).first() ).toBeVisible();
	});

});
