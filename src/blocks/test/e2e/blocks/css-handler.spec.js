/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { insertBlockBySlash } from '../helpers/editor';

const createDeferred = () => {
	let resolve;

	const promise = new Promise( done => {
		resolve = done;
	});

	return { promise, resolve };
};

test.describe( 'CSS Handler Notices', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'does not show progress or success notices when CSS saves successfully', async({ editor, page }) => {
		const cssSaveStarted = createDeferred();
		const continueCssSave = createDeferred();

		await page.route( '**/wp-json/otter/v1/post_styles/**', async route => {
			cssSaveStarted.resolve();
			await continueCssSave.promise;
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'CSS updated.' })
			});
		});

		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/progress-bar',
			blockName: 'themeisle-blocks/progress-bar'
		});

		const publish = editor.publishPost();

		await cssSaveStarted.promise;
		await expect( page.getByText( 'Saving CSS…' ) ).toBeHidden();

		continueCssSave.resolve();
		await publish;

		await page.waitForTimeout( 500 );
		await expect( page.getByText( 'CSS saved.' ) ).toBeHidden();
	});

	test( 'shows an error notice when CSS saving fails', async({ editor, page }) => {
		await page.route( '**/wp-json/otter/v1/post_styles/**', async route => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({
					code: 'otter_css_error',
					message: 'CSS failed.',
					data: { status: 500 }
				})
			});
		});

		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/progress-bar',
			blockName: 'themeisle-blocks/progress-bar'
		});

		await editor.publishPost();

		await expect( page.getByTestId( 'snackbar' ).filter({ hasText: 'CSS failed.' }) ).toBeVisible();
	});
});
