/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';

test.describe( 'Sharing Icons', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'insert the block', async({ editor, page }) => {
		const attributes = {
			pinterest: {
				active: true
			},
			tumblr: {
				active: true
			},
			reddit: {
				active: true
			},
			whatsapp: {
				active: true
			},
			telegram: {
				active: true
			},
			email: {
				active: true
			},
			mastodon: {
				active: true
			},
			comments: {
				active: true
			},
			threads: {
				active: true
			},
			facebook: {
				active: true
			},
			twitter: {
				active: true
			},
			linkedin: {
				active: true
			}
		};
		await editor.insertBlock({
			name: 'themeisle-blocks/sharing-icons',
			attributes
		});

		await expect( page.getByLabel( 'Block: Sharing Icons' ) ).toBeVisible();

		await publishAndViewPost({ editor, page });

		expect( await page.locator( '.social-icons-wrap .social-icon' ).count() ).toBe( Object.keys( attributes ).length ); // We have all the icons rendered.
		expect( await page.locator( '.social-icons-wrap .social-icon svg' ).count() ).toBe( Object.keys( attributes ).length );
		expect( await page.locator( '.social-icons-wrap .social-icon .v-line' ).count() ).toBe( Object.keys( attributes ).length - 1 ); // X/Twitter is exception.
	});


	test( 'toggle network', async({ editor, page }) => {
		const attributes = {
			reddit: {
				active: true
			}
		};
		await editor.insertBlock({
			name: 'themeisle-blocks/sharing-icons',
			attributes
		});

		await expect( page.getByLabel( 'Block: Sharing Icons' ) ).toBeVisible();

		await page.locator( 'button:nth-child(6)' ).click(); // Hide Reddit icon using the Toolbar actions.

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.social-icons-wrap' ).getByRole( 'link', { name: 'Reddit' }) ).toBeHidden();
	});
});
