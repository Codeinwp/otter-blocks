/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, devices } from '@playwright/test';

const STORAGE_STATE_PATH =
    process.env.STORAGE_STATE_PATH ||
    path.join( process.cwd(), 'artifacts/storage-states/admin.json' );

const E2E_WORKERS = parseInt( process.env.E2E_WORKERS || '', 10 ) || ( process.env.CI ? 4 : 2 );

// Port precedence: WP_BASE_URL > WP_ENV_PORT > .wp-env.override.json > 8888.
// The override file pins a per-checkout port (written by `npm run env:start`)
// and is read by wp-env itself, so the suites follow it with no env var.
const getOverridePort = () => {
	try {
		const override = JSON.parse(
			fs.readFileSync(
				path.join( process.cwd(), '.wp-env.override.json' ),
				'utf8'
			)
		);
		return parseInt( override.port, 10 ) || undefined;
	} catch ( e ) {
		return undefined;
	}
};

const WP_ENV_PORT = parseInt( process.env.WP_ENV_PORT || '', 10 ) || getOverridePort() || 8888;
const WP_BASE_URL = process.env.WP_BASE_URL || `http://localhost:${ WP_ENV_PORT }`;

// @wordpress/e2e-test-utils-playwright reads WP_BASE_URL directly (its
// RequestUtils falls back to localhost:8889), so export the resolved URL.
process.env.WP_BASE_URL = WP_BASE_URL;

const SERIAL_SPECS = [

	// Flips the AI backend + connector key options server-side; must not race parallel specs.
	'**/blocks/ai-block-wp-client.spec.js',
	'**/blocks/ai-block-legacy-openai.spec.js',
	'**/blocks/ai-block-unconfigured.spec.js',
	'**/blocks/block-conditions.spec.js',
	'**/blocks/dashboard.spec.js',
	'**/blocks/form.spec.js',
	'**/blocks/form-ai-autoresponder.spec.js',

	// Mutates site-wide scenario state (mail/captcha modes, stored records) via the bootstrap mu-plugin.
	'**/blocks/form-retention.spec.js',
	'**/blocks/form-turnstile.spec.js',
	'**/blocks/onboarding.spec.js',
	'**/blocks/design-library.spec.js'
];

const config = defineConfig({
	reporter: 'list',
	forbidOnly: !! process.env.CI,
	workers: E2E_WORKERS,
	retries: process.env.CI ? 2 : 0,
	timeout: parseInt( process.env.TIMEOUT || '', 10 ) || 100_000, // Defaults to 100 seconds.
	// Keep tests within each file sequential by default.
	fullyParallel: false,
	reportSlowTests: null,
	testDir: fileURLToPath( new URL( './blocks', 'file:' + __filename ).href ),
	outputDir: path.join( process.cwd(), 'artifacts/test-results' ),
	snapshotPathTemplate:
        '{testDir}/{testFileDir}/__snapshots__/{arg}-{projectName}{ext}',
	globalSetup: fileURLToPath(
		new URL( 'global-setup.ts', 'file:' + __filename ).href
	),
	use: {
		baseURL: WP_BASE_URL,
		headless: true,
		viewport: {
			width: 960,
			height: 700
		},
		ignoreHTTPSErrors: true,
		locale: 'en-US',
		contextOptions: {
			reducedMotion: 'reduce',
			strictSelectors: true
		},
		storageState: STORAGE_STATE_PATH,
		actionTimeout: 10_000, // 10 seconds.
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'on-first-retry'
	},
	webServer: {
		command: 'npm run wp-env start',
		port: Number( new URL( WP_BASE_URL ).port ) || 80,
		timeout: 120_000, // 120 seconds.
		reuseExistingServer: true
	},
	projects: [
		{
			name: 'chromium-serial',
			testMatch: SERIAL_SPECS,
			workers: 1,
			use: { ...devices['Desktop Chrome'] },
			grepInvert: /-chromium/
		},
		{
			name: 'chromium-parallel',
			testIgnore: SERIAL_SPECS,
			dependencies: [ 'chromium-serial' ],
			workers: E2E_WORKERS,
			use: { ...devices['Desktop Chrome'] },
			grepInvert: /-chromium/
		}

		// {
		// 	name: 'webkit',
		// 	use: {
		// 		...devices['Desktop Safari'],

		// 		/**
		//          * Headless webkit won't receive dataTransfer with custom types in the
		//          * drop event on Linux. The solution is to use `xvfb-run` to run the tests.
		//          * ```sh
		//          * xvfb-run npm run test:e2e:playwright
		//          * ```
		//          * See `.github/workflows/end2end-test-playwright.yml` for advanced usages.
		//          */
		// 		headless: 'Linux' !== os.type()
		// 	},
		// 	grep: /@webkit/,
		// 	grepInvert: /-webkit/
		// },
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] },
		// 	grep: /@firefox/,
		// 	grepInvert: /-firefox/
		// }
	]
});

export default config;
