/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Wait until the block editor and registry are ready for programmatic inserts.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @return {Promise<void>}
 */
export async function waitForEditorReady( page ) {
	await page.waitForFunction(
		() => {
			const blocks = window.wp?.blocks;
			const data = window.wp?.data;

			if ( ! blocks?.getBlockType || ! data?.select ) {
				return false;
			}

			const blockEditor = data.select( 'core/block-editor' );
			const editor = data.select( 'core/editor' );

			if ( ! blockEditor || ! editor ) {
				return false;
			}

			return Boolean( blocks.getBlockType( 'core/paragraph' ) );
		},
		{ timeout: 30_000 }
	);
}

/**
 * Wait until the current post is published and all save requests have finished.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @return {Promise<void>}
 */
export async function waitForPostPublished( page ) {
	await page.waitForFunction(
		() => {
			const editor = window.wp?.data?.select( 'core/editor' );

			if ( ! editor ) {
				return false;
			}

			return (
				editor.isCurrentPostPublished()
				&& ! editor.isSavingPost()
				&& ! editor.isAutosavingPost()
			);
		},
		{ timeout: 30_000 }
	);
}

/**
 * Publish the current post without waiting for snackbar notices.
 *
 * Snackbars are unreliable when other plugins (e.g. Otter form options) enqueue
 * their own notices immediately after publish.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor The editor utils.
 * @param {import('@playwright/test').Page}                       page   The page.
 * @return {Promise<number>} The published post ID.
 */
export async function publishPostReliable( editor, page ) {
	const topBar = page.getByRole( 'region', { name: 'Editor top bar' });
	const saveButton = topBar.getByRole( 'button', { name: 'Save', exact: true });
	const publishButton = topBar.getByRole( 'button', { name: 'Publish', exact: true });
	const buttonToClick = ( await saveButton.isVisible() ) ? saveButton : publishButton;

	await buttonToClick.click();

	const publishRegion = page.getByRole( 'region', { name: 'Editor publish' });
	const entitiesSaveButton = publishRegion.getByRole( 'button', { name: 'Save', exact: true });

	if ( await entitiesSaveButton.isVisible() ) {
		await entitiesSaveButton.click();
	}

	const confirmPublish = publishRegion.getByRole( 'button', { name: 'Publish', exact: true });

	if ( await confirmPublish.isVisible() ) {
		await confirmPublish.click();
	}

	await waitForPostPublished( page );

	const postId = new URL( page.url() ).searchParams.get( 'post' );

	if ( null === postId || '' === postId ) {
		throw new Error( 'publishPostReliable: post ID missing from URL after publish.' );
	}

	return parseInt( postId, 10 );
}

export async function getBlockByName( editor, blockName ) {
	const blocks = await editor.getBlocks();

	return blocks.find( ( block ) => blockName === block.name );
}

export async function expectBlockByName( editor, blockName ) {
	const block = await getBlockByName( editor, blockName );

	expect( block ).toBeTruthy();

	return block;
}

export async function insertAndGetBlock( editor, page, blockConfig, blockName = blockConfig.name ) {
	await waitForEditorReady( page );
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
	const postId = await publishPostReliable( editor, page );

	if ( waitAfterPublish ) {
		await page.waitForTimeout( waitAfterPublish );
	}

	await page.goto( `/?p=${postId}${query}` );

	return postId;
}

/**
 * Select a block by name anywhere in the block tree.
 *
 * @param {import('@playwright/test').Page} page      The page.
 * @param {string}                          blockName Block name to select.
 * @return {Promise<string>} The selected block clientId.
 */
export async function selectBlockByName( page, blockName ) {
	return page.evaluate( name => {
		const findBlock = blocks => {
			for ( const block of blocks ) {
				if ( block.name === name ) {
					return block;
				}

				const inner = findBlock( block.innerBlocks || [] );

				if ( inner ) {
					return inner;
				}
			}

			return null;
		};

		const block = findBlock( window.wp.data.select( 'core/block-editor' ).getBlocks() );

		if ( ! block ) {
			throw new Error( `Block not found: ${ name }` );
		}

		window.wp.data.dispatch( 'core/block-editor' ).selectBlock( block.clientId );

		return block.clientId;
	}, blockName );
}
