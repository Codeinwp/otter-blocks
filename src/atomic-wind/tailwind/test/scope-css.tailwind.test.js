const fs = require( 'fs' );
const path = require( 'path' );
const { compile } = require( 'tailwindcss' );
const { prefixCss, scopeToAtomicWind, splitSelectorList, transformCssSelectors } = require( '../scope-css' );

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

function declarationNames( body ) {
	return body
		.replace( /\/\*[\s\S]*?\*\//g, '' )
		.split( ';' )
		.map( ( declaration ) => declaration.trim() )
		.filter( Boolean )
		.map( ( declaration ) => declaration.slice( 0, declaration.indexOf( ':' ) ).trim().toLowerCase() );
}

const WRAPPER_PROPERTY = /^(--.+|tab-size|(-webkit-)?text-size-adjust|-webkit-tap-highlight-color)$/;
const TYPOGRAPHY = [ 'font-family', 'font-feature-settings', 'font-variation-settings', 'line-height' ];

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

	it( 'puts only wrapper-safe declarations on the block wrapper', () => {
		const wrapperRules = scopedRules.filter( ( { selector } ) => selector === WRAPPER );

		expect( wrapperRules.length ).toBeGreaterThan( 0 );
		const offenders = wrapperRules.flatMap( ( { body } ) => declarationNames( body ) ).filter( ( name ) => ! WRAPPER_PROPERTY.test( name ) );

		expect( offenders ).toEqual( [] );
	} );

	it( 'removes exactly the inherited typography from the root rule', () => {
		const rawRule = rawRules.find(
			( { selector, body } ) =>
				splitSelectorList( selector ).includes( 'html' ) && /font-family\s*:/.test( body ) && /line-height\s*:/.test( body )
		);
		const wrapperRule = scopedRules.find( ( { selector, body } ) => selector === WRAPPER && /tab-size\s*:/.test( body ) );
		const rawNames = declarationNames( rawRule.body );
		const wrapperNames = declarationNames( wrapperRule.body );
		const removed = rawNames.filter( ( name ) => ! wrapperNames.includes( name ) ).sort();

		expect( removed ).toEqual( TYPOGRAPHY );
		expect( wrapperNames.sort() ).toEqual( rawNames.filter( ( name ) => ! removed.includes( name ) ).sort() );
	} );

	it( 'keeps the non-typographic root defaults on the block wrapper', () => {
		const found = scopedRules
			.filter( ( { selector } ) => selector === WRAPPER )
			.some( ( { body } ) => {
				const names = declarationNames( body );
				return [ 'tab-size', '-webkit-text-size-adjust', '-webkit-tap-highlight-color' ].every( ( name ) => names.includes( name ) );
			} );

		expect( found ).toBe( true );
	} );

	describe.each( [ ':where(.editor-styles-wrapper)', ':where(.is-root-container)' ] )( 'prefixed for a non-iframe editor with %s', ( container ) => {
		let prefixedRules;

		beforeAll( () => {
			prefixedRules = collectRules( prefixCss( scopeToAtomicWind( raw ), container ) );
		} );

		it( 'prefixes every rule with the container', () => {
			const selectors = prefixedRules.flatMap( ( { selector } ) => splitSelectorList( selector ) );

			expect( selectors.length ).toBeGreaterThan( 0 );
			expect( selectors.filter( ( selector ) => ! selector.startsWith( `${ container } ` ) ) ).toEqual( [] );
		} );

		it( 'puts nothing on the container itself', () => {
			const selectors = prefixedRules.flatMap( ( { selector } ) => splitSelectorList( selector ) );

			expect( selectors.filter( ( selector ) => selector === container ) ).toEqual( [] );
		} );

		it( 'keeps inherited typography off the block wrappers', () => {
			const wrapperRules = prefixedRules.filter( ( { selector } ) => selector === `${ container } ${ WRAPPER }` );

			expect( wrapperRules.length ).toBeGreaterThan( 0 );
			expect( wrapperRules.flatMap( ( { body } ) => declarationNames( body ) ).filter( ( name ) => TYPOGRAPHY.includes( name ) ) ).toEqual( [] );
		} );
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
