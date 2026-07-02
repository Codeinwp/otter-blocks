/**
 * External dependencies
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import path from 'path';
import { request } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

async function assertWpEnvReady( requestContext: { get: ( url: string ) => Promise<{ ok: () => boolean; headers: () => Record<string, string>; json: () => Promise<{ namespaces?: string[] }> }> }, baseURL: string ) {
	let indexResponse = await requestContext.get( `${ baseURL }/wp-json/` );

	/*
	 * The single-environment PHPUnit suite reinstalls WordPress over the shared
	 * wp-env site, which drops the permalink structure and makes /wp-json/ serve
	 * the homepage HTML. Restore it once and retry before failing.
	 */
	if ( indexResponse.ok() && ! ( indexResponse.headers()['content-type'] ?? '' ).includes( 'application/json' ) ) {
		execSync( 'npx wp-env run cli -- wp rewrite structure /%postname%/', { stdio: 'ignore' });
		indexResponse = await requestContext.get( `${ baseURL }/wp-json/` );
	}

	if ( ! indexResponse.ok() ) {
		throw new Error( `[Otter E2E] wp-env is not reachable at ${ baseURL }` );
	}

	const index = await indexResponse.json();

	if ( ! index.namespaces?.includes( 'wp/v2' ) ) {
		throw new Error( '[Otter E2E] wp-env REST API is missing the wp/v2 namespace.' );
	}
}

/**
 * The free and pro bundles load on the same editor page. If both compilations
 * use the same webpack chunk-loading global, their runtimes resolve each
 * other's numeric module IDs and the editor crashes with
 * "Cannot read properties of undefined (reading 'call')" — but only on builds
 * whose module IDs happen to mismatch, so specs alone can't catch a regression
 * deterministically. Assert the runtime globals are distinct instead.
 */
function assertDistinctWebpackRuntimes() {
	const bundles = [ 'build/blocks/blocks.js', 'build/pro/blocks.js' ].map(
		( bundle ) => path.join( process.cwd(), bundle )
	);

	if ( ! bundles.every( ( bundle ) => existsSync( bundle ) ) ) {
		return;
	}

	const [ free, pro ] = bundles.map(
		( bundle ) => readFileSync( bundle, 'utf8' ).match( /webpackChunk[a-zA-Z_$][\w$]*/ )?.[ 0 ]
	);

	if ( free && free === pro ) {
		throw new Error(
			`[Otter E2E] The free and pro bundles share the webpack runtime global "${ free }" — set a distinct output.uniqueName in webpack.config.pro.js or the editor can crash when both load.`
		);
	}
}

async function globalSetup( config: FullConfig ) {
	assertDistinctWebpackRuntimes();
	const { storageState, baseURL } = config.projects[ 0 ].use;
	const storageStatePath =
		'string' === typeof storageState ? storageState : undefined;

	if ( storageStatePath ) {
		mkdirSync( path.dirname( storageStatePath ), { recursive: true } );
	}

	const requestContext = await request.newContext({
		baseURL
	});

	await assertWpEnvReady( requestContext, baseURL as string );

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
