/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

function escapeRegExp( text ) {
	return text.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

export function visibleText( page, text ) {
	return page.locator( 'div' ).filter({ hasText: new RegExp( `^${escapeRegExp( text )}$` ) });
}

export async function expectSuccessMessage( page ) {
	await expect( visibleText( page, 'Success' ) ).toBeVisible();
}
