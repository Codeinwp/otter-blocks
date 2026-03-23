#!/usr/bin/env node
/**
 * Generates assets/atomic-wind/icons.json from the individual SVG files in
 * assets/atomic-wind/icons/.
 *
 * Each key is the icon name (filename without .svg).
 * Each value is the minified inner SVG markup — the content between <svg> and </svg>.
 *
 * Usage:
 *   node bin/generate-icons-json.mjs
 *   node bin/generate-icons-json.mjs --icons-dir path/to/icons --out path/to/output.json
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join( dirname( fileURLToPath( import.meta.url ) ), '..' );

function parseArgs() {
	const args = process.argv.slice( 2 );
	const opts = {
		iconsDir: join( ROOT, 'assets/atomic-wind/icons' ),
		out: join( ROOT, 'assets/atomic-wind/icons.json' ),
	};
	for ( let i = 0; i < args.length; i++ ) {
		if ( args[ i ] === '--icons-dir' ) { opts.iconsDir = args[ ++i ]; }
		if ( args[ i ] === '--out' )       { opts.out = args[ ++i ]; }
	}
	return opts;
}

function extractInner( svgText ) {
	const match = svgText.match( /<svg[^>]*>([\s\S]*?)<\/svg>/i );
	if ( ! match ) { return null; }
	// Collapse all runs of whitespace (newlines, tabs, multiple spaces) to a single space,
	// then trim and remove spaces around > and <.
	return match[ 1 ]
		.replace( /\s+/g, ' ' )
		.replace( />\s+</g, '><' )
		.trim();
}

function main() {
	const { iconsDir, out } = parseArgs();

	const files = readdirSync( iconsDir )
		.filter( ( f ) => f.endsWith( '.svg' ) )
		.sort();

	if ( files.length === 0 ) {
		console.error( `No SVG files found in ${ iconsDir }` );
		process.exit( 1 );
	}

	const icons = {};
	let skipped = 0;

	for ( const file of files ) {
		const name = basename( file, '.svg' );
		const svg = readFileSync( join( iconsDir, file ), 'utf8' );
		const inner = extractInner( svg );
		if ( inner === null ) {
			console.warn( `  skipped (no <svg> found): ${ file }` );
			skipped++;
			continue;
		}
		icons[ name ] = inner;
	}

	writeFileSync( out, JSON.stringify( icons ), 'utf8' );

	const sizeKB = ( Buffer.byteLength( JSON.stringify( icons ), 'utf8' ) / 1024 ).toFixed( 1 );
	console.log( `icons.json written: ${ Object.keys( icons ).length } icons, ${ sizeKB } KB${ skipped ? ` (${ skipped } skipped)` : '' }` );
	console.log( `  -> ${ out }` );
}

main();
