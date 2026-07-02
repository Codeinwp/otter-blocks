/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';

test.describe( 'Button Group', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'check font settings', async({ editor, page }) => {
		const attributes = {
			fontSize: '28px',
			fontFamily: 'Abel',
			textTransform: 'lowercase',
			fontStyle: 'italic',
			lineHeight: '2.5'
		};

		await editor.insertBlock({
			name: 'themeisle-blocks/button-group',
			attributes,
			innerBlocks: [
				{
					name: 'themeisle-blocks/button',
					attributes: {
						text: 'Button 1'
					}
				}
			]
		});

		await publishAndViewPost({ editor, page });

		// Check CSS font properties
		const btn = page.locator( 'a' ).filter({ hasText: 'Button 1' });
		await expect( btn ).toHaveCSS( 'font-size', attributes.fontSize );
		await expect( btn ).toHaveCSS( 'font-family', attributes.fontFamily );
		await expect( btn ).toHaveCSS( 'text-transform', attributes.textTransform );
		await expect( btn ).toHaveCSS( 'font-style', attributes.fontStyle );
		await expect( btn ).toHaveCSS( 'line-height', `${parseInt( attributes.fontSize ) * parseFloat( attributes.lineHeight )}px` ); // Playwright use computed line-height based on font-size.
	});

	test( 'global defaults typography saves the right attributes and new blocks inherit them', async({ admin, editor, page, requestUtils }) => {
		const getSavedDefaults = async() => {
			const settings = await requestUtils.rest({ path: '/wp/v2/settings' });
			return JSON.parse( settings.themeisle_blocks_settings_global_defaults || '{}' )['themeisle-blocks/button-group'] ?? {};
		};

		// Build the defaults through the Otter Options global-defaults UI.
		await page.getByRole( 'button', { name: 'Otter Options' }).click();
		await page.getByRole( 'button', { name: 'Block Settings' }).click();

		const row = page.locator( '.o-options-block-item' ).filter({
			has: page.getByText( 'Button Group', { exact: true })
		});
		await row.getByRole( 'button', { name: 'Open Settings' }).click();

		// Appearance and Letter Case are hidden until enabled from the view-options menu.
		await page.getByRole( 'button', { name: 'View options' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Appearance' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Letter Case' }).click();
		await page.keyboard.press( 'Escape' );

		await page.getByLabel( 'Appearance' ).selectOption( 'italic' );
		await page.getByRole( 'button', { name: 'Uppercase' }).click();

		await page.getByRole( 'button', { name: 'Save', exact: true }).click();

		// Regression: Appearance/Letter Case used to be written to the wrong keys
		// (fontVariant/fontStyle) instead of fontStyle/textTransform.
		await expect.poll( getSavedDefaults ).toMatchObject({
			fontStyle: 'italic',
			textTransform: 'uppercase'
		});
		expect( ( await getSavedDefaults() ).fontVariant ).toBeUndefined();

		// A Button Group inserted on a fresh editor load inherits the defaults.
		await admin.createNewPost();
		await editor.insertBlock({
			name: 'themeisle-blocks/button-group',
			innerBlocks: [
				{
					name: 'themeisle-blocks/button',
					attributes: { text: 'Inherit me' }
				}
			]
		});

		await expect.poll( async() => {
			const blocks = await editor.getBlocks();
			const group = blocks.find( block => 'themeisle-blocks/button-group' === block.name );
			return {
				fontStyle: group?.attributes?.fontStyle,
				textTransform: group?.attributes?.textTransform
			};
		}).toEqual({ fontStyle: 'italic', textTransform: 'uppercase' });

		await publishAndViewPost({ editor, page });

		const btn = page.locator( 'a' ).filter({ hasText: 'Inherit me' });
		await expect( btn ).toHaveCSS( 'font-style', 'italic' );
		await expect( btn ).toHaveCSS( 'text-transform', 'uppercase' );
	});

	// Global defaults persist site-wide; reset them so other specs are unaffected.
	// Must be '{}', not '': the editor bootstrap json_decode()s the raw option and
	// a null result crashes every Otter block's Edit component.
	test.afterEach( async({ requestUtils }) => {
		await requestUtils.rest({
			method: 'POST',
			path: '/wp/v2/settings',
			data: { themeisle_blocks_settings_global_defaults: '{}' }
		});
	});
});
