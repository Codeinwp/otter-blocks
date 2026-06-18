/**
 * External dependencies
 */
import { existsSync, readFileSync, unlinkSync } from 'fs';

export function readFile( filePath ) {
	if ( ! existsSync( filePath ) ) {
		throw new Error( `File does not exist: ${ filePath }` );
	}

	return readFileSync( filePath, 'utf8' ).trim();
}

export function deleteFile( filePath ) {
	if ( existsSync( filePath ) ) {
		unlinkSync( filePath );
	}
}

export async function tryLoginIn( page, username = 'admin', password = 'password' ) {
	await page.goto( '/wp-login.php' );
	await page.fill( 'input[name="log"]', username );
	await page.fill( 'input[name="pwd"]', password );
	await page.check( 'input[name="rememberme"]' );
	await page.click( 'input[name="wp-submit"]' );

	// Save the context since tests are isolated.
	// So we need to save the auth state to keep the user logged in so that they can be used in the next test.
	await page.context().storageState({ path: 'artifacts/storage-states/admin.json' });
}
