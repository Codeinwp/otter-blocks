/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { insertBlockBySlash } from '../helpers/editor';

test.describe( 'Custom CSS panel', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'renders a single editor', async({ editor, page }) => {
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/progress-bar',
			blockName: 'themeisle-blocks/progress-bar'
		});

		const settingsBtn = page.getByRole( 'button', { name: 'Settings', exact: true }).first();
		if ( ! ( await settingsBtn.getAttribute( 'class' ) || '' ).includes( 'is-pressed' ) ) {
			await settingsBtn.click();
		}

		await page.getByRole( 'button', { name: 'Custom CSS' }).first().click();

		const codeMirrorEditors = page.locator( '.o-css-editor .CodeMirror' );

		await expect( codeMirrorEditors.first() ).toBeVisible();
		await expect( codeMirrorEditors ).toHaveCount( 1 );
	});
});
