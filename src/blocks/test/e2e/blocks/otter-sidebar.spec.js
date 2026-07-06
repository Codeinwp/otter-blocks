/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { insertBlockBySlash, openSettingsSidebar } from '../helpers/editor';

const SIDEBAR_ID = 'themeisle-blocks/otter-options';

// Guards the PluginSidebar import move to @wordpress/editor and the
// enableComplementaryArea scope change: since WP 6.6 plugin sidebars are
// tracked under the 'core' interface scope ('core/edit-post' is deprecated).
const getActiveSidebar = ( page ) => page.evaluate(
	() => window.wp.data.select( 'core/interface' ).getActiveComplementaryArea( 'core' )
);

test.describe( 'Otter Options sidebar', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'opens from the pinned toolbar button', async({ page }) => {
		await page.getByRole( 'region', { name: 'Editor top bar' })
			.getByRole( 'button', { name: 'Otter Options' })
			.click();

		await expect.poll( () => getActiveSidebar( page ) ).toBe( SIDEBAR_ID );
		await expect(
			page.locator( '.interface-complementary-area' ).getByText( 'Otter Options' ).first()
		).toBeVisible();
	});

	test( 'opens from the Options menu', async({ page }) => {
		await page.getByRole( 'region', { name: 'Editor top bar' })
			.getByRole( 'button', { name: 'Options', exact: true })
			.click();

		// PluginSidebarMoreMenuItem: role differs across WP versions.
		await page.getByRole( 'menuitemcheckbox', { name: 'Otter Options' })
			.or( page.getByRole( 'menuitem', { name: 'Otter Options' }) )
			.click();

		await expect.poll( () => getActiveSidebar( page ) ).toBe( SIDEBAR_ID );
	});

	test( 'opens via "Manage Default Tools" in the Block Tools panel', async({ editor, page }) => {
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/progress-bar',
			blockName: 'themeisle-blocks/progress-bar'
		});
		await openSettingsSidebar( page );

		await page.getByRole( 'button', { name: 'Block Tools options' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Manage Default Tools' })
			.or( page.getByRole( 'menuitem', { name: 'Manage Default Tools' }) )
			.click();

		await expect.poll( () => getActiveSidebar( page ) ).toBe( SIDEBAR_ID );
	});
});
