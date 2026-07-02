/**
 * Insert a paragraph, select it, and open the Otter AI Content toolbar menu.
 *
 * @param {import('@playwright/test').Page}                       page
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor
 * @param {string}                                                content
 */
export async function insertParagraphAndOpenAiToolbar( page, editor, content = 'Hello world.' ) {
	await editor.insertBlock({
		name: 'core/paragraph',
		attributes: { content }
	});

	await page.getByRole( 'button', { name: 'Otter AI Content' }).click();
}
