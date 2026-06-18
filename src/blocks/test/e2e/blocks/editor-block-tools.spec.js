/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { insertBlockBySlash } from '../helpers/editor';

test.describe( 'Block Tools', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'default tools (Animations / Custom CSS / Visibility Conditions) are visible in Inspector', async({ editor, page }) => {

		// In current Otter, Animations / Custom CSS / Visibility Conditions are enabled by default
		// (managed via Block Tools > "Manage Default Tools" — they're locked in the Otter Options
		// dropdown). The earlier "enable each via Otter Options" dance is no longer required.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/progress-bar',
			blockName: 'themeisle-blocks/progress-bar'
		});

		// Each panel header is a generic button in the Inspector; assert all three are present.
		const settingsBtn = page.getByRole( 'button', { name: 'Settings', exact: true }).first();
		if ( ! ( await settingsBtn.getAttribute( 'class' ) || '' ).includes( 'is-pressed' ) ) {
			await settingsBtn.click();
		}
		await expect( page.getByRole( 'button', { name: 'Animations' }) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'Custom CSS' }) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'Visibility Conditions' }) ).toBeVisible();
	});
});
