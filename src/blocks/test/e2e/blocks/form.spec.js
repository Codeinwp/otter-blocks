/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Form Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});


	test( 'can be created by typing "/form"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/form' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasProgressBar = blocks.some( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( hasProgressBar ).toBeTruthy();
	});

	test( 'click on the first variation and check if it has content', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		await page.waitForTimeout( 100 );

		const blocks = await editor.getBlocks();

		const formBlock = blocks.find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		const { clientId } = formBlock;

		await page.click( `#block-${clientId} > div > fieldset > ul > li:nth-child(1) > button` );

		await page.waitForTimeout( 100 );

		// Check if the blocks has innerBlocks

		const updateBlocks = await editor.getBlocks();

		const updatedFormBlock = updateBlocks.find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( updatedFormBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add a value to CC field and save', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		await page.waitForTimeout( 100 );

		const blocks = await editor.getBlocks();

		const formBlock = blocks.find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		const { clientId } = formBlock;

		await page.click( `#block-${clientId} > div > fieldset > ul > li:nth-child(1) > button` );

		await page.waitForTimeout( 100 );

		// Open the options panel
		await page.getByRole( 'button', { name: 'Form Options options' }).click();

		await page.waitForTimeout( 100 );

		// activate the option
		await page.getByRole( 'menuitemcheckbox', { name: 'Show CC' }).click();

		// Close the options panel
		await page.getByRole( 'button', { name: 'Form Options options' }).click();

		const cc = page.getByPlaceholder( 'Send copies to' );

		await cc.fill( 'otter@test-form.com' );

		expect( await cc.inputValue() ).toBe( 'otter@test-form.com' );

		// Publish and check for confirmation test.
		await editor.publishPost();

		await page.waitForTimeout( 1000 );

		const msg = page.getByRole( 'button', { name: 'Dismiss this notice' }).filter({
			hasText: 'Form options have been saved.'
		});

		expect( await msg.isVisible() ).toBeTruthy();

		// TODO: Check for if the values is also saved in database.
	});
});
