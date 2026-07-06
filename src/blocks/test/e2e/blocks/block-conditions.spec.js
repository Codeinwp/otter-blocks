/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost, waitForEditorReady } from '../helpers/editor';
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
		await waitForEditorReady( page );

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

	test( 'build visibility conditions through the inspector rule builder', async({ editor, page }) => {
		await waitForEditorReady( page );

		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { content: 'Members only content' }
		});

		await editor.openDocumentSettingsSidebar();

		// The panel is collapsed by default.
		await page.getByRole( 'button', { name: 'Visibility Conditions' }).click();

		// First rule group: pick a condition through the searchable picker.
		await page.getByRole( 'button', { name: 'Add Rule Group' }).click();
		await page.getByRole( 'button', { name: 'Add condition' }).click();

		await page.getByPlaceholder( 'Search conditions…' ).fill( 'logged in' );
		await page.locator( '.o-conditions-picker__item' ).filter({ hasText: 'Logged In Users' }).click();

		await expect( page.locator( '.o-conditions__row-title' ) ).toHaveText( 'Logged In Users' );

		// A second condition in the same group is combined with AND.
		await page.getByRole( 'button', { name: 'Add condition' }).click();
		await page.locator( '.o-conditions-picker__item' ).filter({ hasText: 'Logged Out Users' }).click();

		await expect( page.locator( '.o-conditions__separator-label' ).filter({ hasText: 'AND' }) ).toBeVisible();

		// A second rule group is combined with OR.
		await page.getByRole( 'button', { name: 'Add Rule Group' }).click();
		await expect( page.locator( '.o-conditions__separator-label' ).filter({ hasText: 'OR' }) ).toBeVisible();

		// Deleting the extra group and condition trims the attribute back down.
		await page.getByRole( 'button', { name: 'Delete rule group' }).nth( 1 ).click();
		await expect( page.locator( '.o-conditions__separator-label' ).filter({ hasText: 'OR' }) ).toBeHidden();

		await page.getByRole( 'button', { name: 'Remove condition' }).nth( 1 ).click();
		await expect( page.locator( '.o-conditions__separator-label' ).filter({ hasText: 'AND' }) ).toBeHidden();

		const conditions = await page.evaluate(
			() => window.wp.data.select( 'core/block-editor' ).getSelectedBlock()?.attributes?.otterConditions
		);

		expect( conditions ).toHaveLength( 1 );
		expect( conditions[0]).toHaveLength( 1 );
		expect( conditions[0][0].type ).toBe( 'loggedInUser' );

		// The built condition drives the frontend: visible logged in, hidden logged out.
		const postId = await publishAndViewPost({ editor, page });
		await expect( page.getByText( 'Members only content' ) ).toBeVisible();

		await page.getByRole( 'menuitem', { name: 'Howdy, admin' }).hover();
		await page.waitForTimeout( 200 );
		await page.getByRole( 'menuitem', { name: 'Log Out' }).click();

		await page.goto( `/?p=${postId}` );
		await expect( page.getByText( 'Members only content' ) ).toBeHidden();
	});
});
