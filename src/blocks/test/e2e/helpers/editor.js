/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

export async function getBlockByName( editor, blockName ) {
	const blocks = await editor.getBlocks();

	return blocks.find( ( block ) => blockName === block.name );
}

export async function expectBlockByName( editor, blockName ) {
	const block = await getBlockByName( editor, blockName );

	expect( block ).toBeTruthy();

	return block;
}

export async function insertAndGetBlock( editor, blockConfig, blockName = blockConfig.name ) {
	await editor.insertBlock( blockConfig );

	return expectBlockByName( editor, blockName );
}

export async function insertBlockBySlash({ editor, page, shortcut, blockName }) {
	await editor.canvas.getByRole( 'button', { name: 'Add default block' }).click();
	await page.keyboard.type( shortcut.startsWith( '/' ) ? shortcut : `/${shortcut}` );
	await expect( page.locator( '.components-autocomplete__results [role="option"]' ).first() ).toBeVisible();
	await page.keyboard.press( 'Enter' );

	if ( blockName ) {
		return expectBlockByName( editor, blockName );
	}
}

export async function publishAndViewPost({ editor, page, query = '', waitAfterPublish = 0 }) {
	const postId = await editor.publishPost();

	if ( waitAfterPublish ) {
		await page.waitForTimeout( waitAfterPublish );
	}

	await page.goto( `/?p=${postId}${query}` );

	return postId;
}
