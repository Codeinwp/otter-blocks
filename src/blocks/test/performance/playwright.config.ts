/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const { fileURLToPath } = require( 'url' );
const { defineConfig, devices } = require( '@playwright/test' );

process.env.WP_ARTIFACTS_PATH ??= path.join( process.cwd(), 'artifacts' );
process.env.STORAGE_STATE_PATH ??= path.join(
	process.env.WP_ARTIFACTS_PATH,
	'storage-states/admin.json'
);

process.env.ASSETS_PATH = path.join( __dirname, 'assets' );

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

const config = defineConfig({

	// fullyParallel: false,
	workers: 1,
	testDir: fileURLToPath( new URL( './specs', 'file:' + __filename ).href ),
	outputDir: path.join( process.env.WP_ARTIFACTS_PATH, 'test-results' ),
	snapshotPathTemplate:
		'{testDir}/{testFileDir}/__snapshots__/{arg}-{projectName}{ext}',
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
		storageState: process.env.STORAGE_STATE_PATH,
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
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ], video: 'off' }
		}
	],
	// Keep the list reporter on CI too — the custom reporter implements no
	// onError, so without it global-setup and test failures exit silently.
	reporter: [[ 'list' ], [ './config/performance-reporter.ts' ]],
	forbidOnly: !! process.env.CI,
	fullyParallel: false,
	retries: 0,
	timeout: parseInt( process.env.TIMEOUT || '', 10 ) || 600_000, // Defaults to 10 minutes.
	reportSlowTests: null,
	globalSetup: fileURLToPath(
		new URL( './config/global-setup.ts', 'file:' + __filename ).href
	)
});

export default config;
