/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

const ATOMIC_WIND_OPTION = 'themeisle_blocks_settings_atomic_wind_blocks';

/**
 * Flip the Atomic Wind blocks setting that every Design Library template is
 * built on. The blocks register server-side on the next editor load, so call
 * this before `admin.createNewPost()`.
 *
 * @param {import('../fixtures').OtterUtils} otterUtils Otter REST helpers.
 * @param {boolean}                          enabled    Whether to enable the blocks.
 * @return {Promise<unknown>} The REST response.
 */
export function setAtomicWind( otterUtils, enabled ) {
	return otterUtils.setOptions({ [ ATOMIC_WIND_OPTION ]: enabled ? '1' : '' });
}

/**
 * Open the Design Library modal from the editor toolbar.
 *
 * @param {import('@playwright/test').Page} page The editor page.
 * @return {Promise<import('@playwright/test').Locator>} The modal locator.
 */
export async function openLibrary( page ) {
	await page
		.getByRole( 'button', { name: 'Design Library' })
		.click();

	const modal = page.locator( '.o-library__modal' );

	await expect( modal ).toBeVisible();

	return modal;
}

/**
 * Wait until the library has resolved its patterns (skeleton replaced by the
 * real grid) and return the grid locator.
 *
 * @param {import('@playwright/test').Locator} modal The library modal.
 * @return {Promise<import('@playwright/test').Locator>} The grid locator.
 */
export async function waitForGrid( modal ) {
	const grid = modal.locator( '.o-library__grid' );

	await expect( grid ).toBeVisible();
	await expect( modal.locator( '.o-library__card:not(.is-skeleton)' ).first() ).toBeVisible();

	return grid;
}

/**
 * The locator for the first real (non-skeleton) card in the grid.
 *
 * @param {import('@playwright/test').Locator} modal The library modal.
 * @return {import('@playwright/test').Locator} The first card.
 */
export function firstCard( modal ) {
	return modal.locator( '.o-library__card:not(.is-skeleton)' ).first();
}

/**
 * The result count shown in the topbar ("N templates").
 *
 * @param {import('@playwright/test').Locator} modal The library modal.
 * @return {Promise<number>} The parsed count.
 */
export async function resultCount( modal ) {
	const text = await modal
		.locator( '.o-library__resultline strong' )
		.first()
		.innerText();

	return parseInt( text.trim(), 10 );
}
