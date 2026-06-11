#!/usr/bin/env node

/**
 * Start (or reuse) this checkout's wp-env instance without clashing with
 * other checkouts/worktrees over the host port.
 *
 * 1. Reuses the instance if it is already running.
 * 2. Otherwise picks a free port (override file > WP_ENV_PORT > 8888, scanning
 *    upward on conflict), pins it in the gitignored .wp-env.override.json,
 *    and runs `wp-env start`.
 *
 * The Playwright configs read the same override file, so the test suites
 * follow the pinned port automatically. See AGENTS.md.
 */

const fs = require( 'fs' );
const net = require( 'net' );
const path = require( 'path' );
const { spawnSync } = require( 'child_process' );

const ROOT = path.resolve( __dirname, '..' );
const OVERRIDE_PATH = path.join( ROOT, '.wp-env.override.json' );
const DEFAULT_PORT = 8888;

function getStatus() {
	const result = spawnSync( 'npx', [ 'wp-env', 'status', '--json' ], {
		cwd: ROOT,
		encoding: 'utf8'
	});

	try {
		return JSON.parse( result.stdout.trim() );
	} catch ( e ) {
		return null;
	}
}

function isPortFree( port ) {
	return new Promise( ( resolve ) => {
		const socket = net.createConnection({ host: '127.0.0.1', port, timeout: 1000 });
		socket.once( 'connect', () => {
			socket.destroy();
			resolve( false );
		});
		socket.once( 'error', () => resolve( true ) );
		socket.once( 'timeout', () => {
			socket.destroy();
			resolve( true );
		});
	});
}

function readOverride() {
	try {
		return JSON.parse( fs.readFileSync( OVERRIDE_PATH, 'utf8' ) );
	} catch ( e ) {
		return {};
	}
}

async function main() {
	const docker = spawnSync( 'docker', [ 'info' ], { stdio: 'ignore' });
	if ( 0 !== docker.status ) {
		console.error( 'Docker is not running. Start Docker Desktop and retry.' );
		process.exit( 1 );
	}

	const status = getStatus();
	if ( 'running' === status?.status ) {
		console.log( `wp-env is already running at ${ status.urls.development } — reusing it.` );
		return;
	}

	const override = readOverride();
	let port =
		parseInt( override.port, 10 ) ||
		parseInt( process.env.WP_ENV_PORT || '', 10 ) ||
		DEFAULT_PORT;

	while ( ! ( await isPortFree( port ) ) ) {
		console.log( `Port ${ port } is taken, trying ${ port + 1 }.` );
		port += 1;
	}

	if ( override.port !== port ) {
		fs.writeFileSync(
			OVERRIDE_PATH,
			JSON.stringify({ ...override, port }, null, '\t' ) + '\n'
		);
		console.log( `Pinned port ${ port } in .wp-env.override.json.` );
	}

	// Pass the resolved port explicitly so a stale WP_ENV_PORT in the caller's
	// shell cannot override the pinned (verified-free) one.
	const start = spawnSync( 'npx', [ 'wp-env', 'start' ], {
		cwd: ROOT,
		stdio: 'inherit',
		env: { ...process.env, WP_ENV_PORT: String( port ) }
	});

	process.exit( start.status ?? 1 );
}

main();
