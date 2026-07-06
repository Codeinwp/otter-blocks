/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { waitForEditorReady } from '../helpers/editor';

/**
 * Reset the editor with a known set of blocks and return their client IDs.
 *
 * The keyboard-navigation plugin only acts on top-level Otter blocks, so the
 * returned IDs are everything we need to drive and assert selection from the
 * data store (which lives in the top window, not the iframed canvas).
 *
 * @param {import('@playwright/test').Page} page   The page.
 * @param {Function}                        recipe A function (serialized and run in the browser) returning an array of blocks. It receives `createBlock`.
 * @return {Promise<string[]>} The client IDs of the top-level blocks, in order.
 */
const resetWithBlocks = ( page, recipe ) =>
	page.evaluate( ( recipeSource ) => {
		const build = new Function( 'createBlock', `return (${ recipeSource })( createBlock );` );
		const blocks = build( window.wp.blocks.createBlock );

		window.wp.data.dispatch( 'core/block-editor' ).resetBlocks( blocks );

		return blocks.map( ( block ) => block.clientId );
	}, recipe.toString() );

const getSelectedClientId = ( page ) =>
	page.evaluate( () => window.wp.data.select( 'core/block-editor' ).getSelectedBlockClientId() );

const waitForSelectedClientId = ( page, clientId ) =>
	page.waitForFunction(
		( expected ) => expected === window.wp.data.select( 'core/block-editor' ).getSelectedBlockClientId(),
		clientId
	);

/**
 * Select a block in the canvas the same way a user would, so the keydown
 * originates from inside the editor-canvas iframe where the plugin listens.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor   The editor utils.
 * @param {import('@playwright/test').Page}                       page     The page.
 * @param {string}                                                clientId The block client ID.
 * @return {Promise<void>}
 */
const selectCanvasBlock = async( editor, page, clientId ) => {
	await editor.selectBlocks( editor.canvas.locator( `[data-block="${ clientId }"]` ) );
	await waitForSelectedClientId( page, clientId );
};

test.describe( 'Keyboard navigation for Otter blocks', () => {
	test.beforeEach( async({ admin, page }) => {
		await admin.createNewPost();
		await waitForEditorReady( page );
	});

	test( 'ArrowDown selects the next sibling block', async({ editor, page }) => {
		const [ , sectionId, afterId ] = await resetWithBlocks( page, ( createBlock ) => [
			createBlock( 'core/paragraph', { content: 'Before' }),
			createBlock( 'themeisle-blocks/advanced-columns', {}, [
				createBlock( 'themeisle-blocks/advanced-column', {}, [
					createBlock( 'core/paragraph', { content: 'Inside' })
				])
			]),
			createBlock( 'core/paragraph', { content: 'After' })
		]);

		await selectCanvasBlock( editor, page, sectionId );

		await page.keyboard.press( 'ArrowDown' );

		await waitForSelectedClientId( page, afterId );
	});

	test( 'ArrowUp selects the previous sibling block', async({ editor, page }) => {
		const [ beforeId, sectionId ] = await resetWithBlocks( page, ( createBlock ) => [
			createBlock( 'core/paragraph', { content: 'Before' }),
			createBlock( 'themeisle-blocks/advanced-columns', {}, [
				createBlock( 'themeisle-blocks/advanced-column', {}, [
					createBlock( 'core/paragraph', { content: 'Inside' })
				])
			]),
			createBlock( 'core/paragraph', { content: 'After' })
		]);

		await selectCanvasBlock( editor, page, sectionId );

		await page.keyboard.press( 'ArrowUp' );

		await waitForSelectedClientId( page, beforeId );
	});

	test( 'navigates down and back up between two adjacent Otter blocks', async({ editor, page }) => {
		const [ firstId, secondId ] = await resetWithBlocks( page, ( createBlock ) => [
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'First' }),
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'Second' })
		]);

		await selectCanvasBlock( editor, page, firstId );

		await page.keyboard.press( 'ArrowDown' );
		await waitForSelectedClientId( page, secondId );

		await page.keyboard.press( 'ArrowUp' );
		await waitForSelectedClientId( page, firstId );
	});

	test( 'navigates across several Otter blocks with repeated presses', async({ editor, page }) => {
		const [ firstId, secondId, thirdId ] = await resetWithBlocks( page, ( createBlock ) => [
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'One' }),
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'Two' }),
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'Three' })
		]);

		await selectCanvasBlock( editor, page, firstId );

		await page.keyboard.press( 'ArrowDown' );
		await waitForSelectedClientId( page, secondId );

		await page.keyboard.press( 'ArrowDown' );
		await waitForSelectedClientId( page, thirdId );

		await page.keyboard.press( 'ArrowUp' );
		await waitForSelectedClientId( page, secondId );
	});

	test( 'keeps the selection when there is no sibling in the pressed direction', async({ editor, page }) => {
		// The Otter block is the last top-level block, so ArrowDown has no
		// sibling to move to and the plugin must leave the selection untouched.
		const [ , lastId ] = await resetWithBlocks( page, ( createBlock ) => [
			createBlock( 'core/paragraph', { content: 'Before' }),
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'Last' })
		]);

		await selectCanvasBlock( editor, page, lastId );

		await page.keyboard.press( 'ArrowDown' );

		// Give any (incorrect) deferred selectBlock a couple of frames to run.
		await page.evaluate( () => new Promise( ( resolve ) => window.requestAnimationFrame( () => window.requestAnimationFrame( resolve ) ) ) );

		expect( await getSelectedClientId( page ) ).toBe( lastId );
	});

	test( 'does not navigate when a modifier key is held', async({ editor, page }) => {
		const [ firstId ] = await resetWithBlocks( page, ( createBlock ) => [
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'First' }),
			createBlock( 'themeisle-blocks/advanced-heading', { content: 'Second' })
		]);

		await selectCanvasBlock( editor, page, firstId );

		// Alt+ArrowDown is not a block-navigation shortcut and the plugin bails
		// out on any modifier, so the Otter block must stay selected.
		await page.keyboard.press( 'Alt+ArrowDown' );

		await page.evaluate( () => new Promise( ( resolve ) => window.requestAnimationFrame( () => window.requestAnimationFrame( resolve ) ) ) );

		expect( await getSelectedClientId( page ) ).toBe( firstId );
	});
});
