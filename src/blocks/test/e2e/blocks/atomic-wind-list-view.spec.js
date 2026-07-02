/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { setAtomicWind } from '../helpers/design-library';

/**
 * List View labels for Atomic Wind blocks: generic wrappers show their semantic
 * tag, text blocks show their content, and a custom name from the Rename UI wins.
 */
test.describe( 'Atomic Wind List View labels', () => {
	test.beforeEach( async({ otterUtils, admin }) => {
		await setAtomicWind( otterUtils, true );
		await admin.createNewPost();
	});

	test.afterAll( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, false );
	});

	test( 'shows semantic and content-based names instead of generic titles', async({ editor, page }) => {
		// Top-level blocks only: List View collapses inner blocks by default.
		await editor.insertBlock({
			name: 'atomic-wind/box',
			attributes: { tagName: 'section' }
		});

		await editor.insertBlock({
			name: 'atomic-wind/text',
			attributes: { content: 'Hello labels' }
		});

		await editor.insertBlock({
			name: 'atomic-wind/box',
			attributes: {
				tagName: 'header',
				metadata: { name: 'Hero Wrapper' }
			}
		});

		await page.getByLabel( 'Document Overview' ).click();

		// The box labels resolve from the semantic tag, the text label from its content.
		await expect( page.getByRole( 'link', { name: 'Section', exact: true }) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'Hello labels' }) ).toBeVisible();

		// A custom name set through the core Rename UI must win over the tag label.
		await expect( page.getByRole( 'link', { name: 'Hero Wrapper' }) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'Header', exact: true }) ).toBeHidden();
	});
});
