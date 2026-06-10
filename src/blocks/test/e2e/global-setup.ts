/**
 * External dependencies
 */
import { request } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

async function assertWpEnvReady( requestContext: { get: ( url: string ) => Promise<{ ok: () => boolean; json: () => Promise<{ namespaces?: string[] }> }> }, baseURL: string ) {
	const indexResponse = await requestContext.get( `${ baseURL }/wp-json/` );

	if ( ! indexResponse.ok() ) {
		throw new Error( `[Otter E2E] wp-env is not reachable at ${ baseURL }` );
	}

	const index = await indexResponse.json();

	if ( ! index.namespaces?.includes( 'wp/v2' ) ) {
		throw new Error( '[Otter E2E] wp-env REST API is missing the wp/v2 namespace.' );
	}
}

async function globalSetup( config: FullConfig ) {
	const { storageState, baseURL } = config.projects[ 0 ].use;
	const storageStatePath =
		'string' === typeof storageState ? storageState : undefined;

	const requestContext = await request.newContext({
		baseURL
	});

	await assertWpEnvReady( requestContext, baseURL as string );

	const r = await requestContext.head( baseURL );

	if ( r.headers().link === undefined ) {
		console.warn( '[Warning] No links header found. The connection might be invalid.' );
	}

	const requestUtils = new RequestUtils( requestContext, {
		storageStatePath
	});

	// Authenticate and save the storageState to disk.
	await requestUtils.setupRest();

	// Activate the Otter Pro license stub via the test-only mu-plugin
	// (packages/e2e-tests/mu-plugins/otter-e2e-bootstrap.php). On CI this is a
	// no-op because the real license is already active; locally it's the only
	// thing that flips window.otterPro.isActive to truthy.
	await requestUtils.rest({
		method: 'POST',
		path: '/otter-e2e/v1/pro/activate'
	}).catch( ( error: unknown ) => {
		console.warn( '[Otter E2E] Pro stub activation failed — Pro-gated tests may fail:', error );
	});

	// Verify the test-only bootstrap is mounted in wp-env.
	await requestUtils.rest({
		method: 'POST',
		path: '/otter-e2e/v1/prompts/seed'
	}).catch( ( error: unknown ) => {
		console.warn( '[Otter E2E] Prompt seeding failed — AI block tests may fail:', error );
	});

	await requestContext.dispose();
}

export default globalSetup;
