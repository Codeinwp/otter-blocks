/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';
import { tryLoginIn } from '../utils';

test.describe( 'Block Conditions', () => {
	test.beforeEach( async({ admin, page }) => {
		await tryLoginIn( page );
		await admin.createNewPost();
	});

	test.afterEach( async({ page }) => {

		/**
		 * Because some conditions require a user to be logged in,
		 * we need to log in the user after each test so that we do not break the next test.
		 */
		await tryLoginIn( page );
	});

	test( 'check logged out users', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/image',
			attributes: {
				url: 'https://mllj2j8xvfl0.i.optimole.com/cb:jC7e.37109/w:794/h:397/q:mauto/dpr:2.0/f:best/https://themeisle.com/blog/wp-content/uploads/2021/01/How-to-Change-Font-in-WordPress-Theme.png',
				otterConditions: [
					[
						{
							type: 'loggedInUser'
						}
					]
				]
			}
		});

		const postId = await publishAndViewPost({ editor, page });
		await expect( page.locator( 'main .wp-block-image img, .entry-content .wp-block-image img' ).first() ).toBeVisible();

		// // Check the block for logged out users.
		await page.getByRole( 'menuitem', { name: 'Howdy, admin' }).hover();
		await page.waitForTimeout( 200 );
		await page.getByRole( 'menuitem', { name: 'Log Out' }).click();

		await page.goto( `/?p=${postId}` );
		await expect( page.locator( 'main .wp-block-image img, .entry-content .wp-block-image img' ).first() ).toBeHidden();
	});
});
