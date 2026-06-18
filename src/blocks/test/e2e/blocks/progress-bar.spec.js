/**
 * WordPress dependencies
 */
import { test } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { insertBlockBySlash } from '../helpers/editor';

test.describe( 'Progress Bar Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/progress-bar"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/progress-bar',
			blockName: 'themeisle-blocks/progress-bar'
		});
	});
});
