/**
 * External dependencies
 */
import { request } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

async function globalSetup( config: FullConfig ) {
	const { storageState, baseURL } = config.projects[ 0 ].use;
	const storageStatePath =
		'string' === typeof storageState ? storageState : undefined;

	console.log( `[INFO] Base URL Test Instance: ${baseURL}` );

	const requestContext = await request.newContext({
		baseURL
	});

	const r = await requestContext.head( baseURL );

	console.log( '[Info] Request Status', r.status() );
	console.log( '[INFO] Endpoint Link', r.headers().link );

	if ( r.headers().link === undefined ) {
		console.warn( '[Warning] No links header found. The connection might be invalid.' );
	}

	const requestUtils = new RequestUtils( requestContext, {
		storageStatePath
	});

	// Authenticate and save the storageState to disk.
	await requestUtils.setupRest();

	await requestContext.dispose();
}

export default globalSetup;
