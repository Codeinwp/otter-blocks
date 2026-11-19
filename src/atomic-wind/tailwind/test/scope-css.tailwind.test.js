const fs = require( 'fs' );
const path = require( 'path' );
const { compile } = require( 'tailwindcss' );
const { scopeToAtomicWind, splitSelectorList, transformCssSelectors } = require( '../scope-css' );

const WRAPPER = ':where([class*="wp-block-atomic-wind-"])';

const packageDir = path.dirname( require.resolve( 'tailwindcss/package.json' ) );
const stylesheetFiles = {
	tailwindcss: 'index.css',
	'tailwindcss/preflight': 'preflight.css',
	'tailwindcss/preflight.css': 'preflight.css',
	'./preflight.css': 'preflight.css',
	'tailwindcss/theme': 'theme.css',
	'tailwindcss/theme.css': 'theme.css',
	'./theme.css': 'theme.css',
	'tailwindcss/utilities': 'utilities.css',
	'tailwindcss/utilities.css': 'utilities.css',
	'./utilities.css': 'utilities.css',
};

async function loadStylesheet( id, base ) {
	const file = stylesheetFiles[ id ];
	if ( ! file ) {
		throw new Error( `Unsupported @import "${ id }"` );
	}
	return {
		path: `virtual:tailwindcss/${ file }`,
		base,
		content: fs.readFileSync( path.join( packageDir, file ), 'utf8' ),
	};
}

async function loadModule() {
	throw new Error( 'Plugins and config files are not supported.' );
}

function collectRules( css ) {
	const rules = [];
	transformCssSelectors( css, ( selector, body ) => {
		rules.push( { selector, body } );
		return selector;
	} );
	return rules;
}

describe( 'scopeToAtomicWind against the real Tailwind compiler', () => {
	let raw;
	let rawRules;
	let scopedRules;

	beforeAll( async () => {
		const compiler = await compile( '@import "tailwindcss" important;\n', { base: '/', loadStylesheet, loadModule } );
		raw = compiler.build( [ 'flex', 'mt-4', 'font-serif', 'leading-10', 'text-lg' ] );
		rawRules = collectRules( raw );
		scopedRules = collectRules( scopeToAtomicWind( raw ) );
	} );

	it( 'the compiler still emits the root typography rule this guards against', () => {
		const rule = rawRules.find(
			( { selector, body } ) =>
				splitSelectorList( selector ).includes( 'html' ) && /font-family\s*:/.test( body ) && /line-height\s*:/.test( body )
		);

		expect( rule ).toBeDefined();
	} );

	it( 'puts no standard declaration on the block wrapper', () => {
		const wrapperRules = scopedRules.filter( ( { selector } ) => selector === WRAPPER );

		expect( wrapperRules.length ).toBeGreaterThan( 0 );
		const offenders = wrapperRules.flatMap( ( { body } ) =>
			body
				.replace( /\/\*[\s\S]*?\*\//g, '' )
				.split( ';' )
				.map( ( declaration ) => declaration.trim() )
				.filter( ( declaration ) => declaration && ! /^--[\w-]+\s*:/.test( declaration ) )
		);

		expect( offenders ).toEqual( [] );
	} );

	it( 'keeps theme variables on the block wrapper', () => {
		const wrapperBodies = scopedRules.filter( ( { selector } ) => selector === WRAPPER ).map( ( { body } ) => body );

		expect( wrapperBodies.some( ( body ) => /--spacing\s*:/.test( body ) ) ).toBe( true );
		expect( wrapperBodies.some( ( body ) => /--font-serif\s*:/.test( body ) ) ).toBe( true );
	} );

	it( 'leaves no document-root selector in the stylesheet', () => {
		const roots = scopedRules.flatMap( ( { selector } ) => splitSelectorList( selector ) ).filter( ( selector ) => /^(:root|:host|html|body)$/.test( selector ) );

		expect( roots ).toEqual( [] );
	} );

	it( 'keeps the typography utilities', () => {
		const serif = scopedRules.find( ( { selector } ) => selector.startsWith( '.font-serif:where(' ) );
		const leading = scopedRules.find( ( { selector } ) => selector.startsWith( '.leading-10:where(' ) );

		expect( serif && serif.body ).toMatch( /font-family\s*:/ );
		expect( leading && leading.body ).toMatch( /line-height\s*:/ );
	} );

	it( 'keeps element resets scoped to the blocks', () => {
		const found = scopedRules.some( ( { selector } ) =>
			splitSelectorList( selector ).some( ( part ) => part.startsWith( 'h1:where([class*="wp-block-atomic-wind-"]' ) )
		);

		expect( found ).toBe( true );
	} );
} );
