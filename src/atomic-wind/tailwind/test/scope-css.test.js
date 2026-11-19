import { prefixCss, scopeToAtomicWind, splitSelectorList } from '../scope-css';

const MATCH = ':where([class*="wp-block-atomic-wind-"], [class*="wp-block-atomic-wind-"] *)';
const SELF = ':where([class*="wp-block-atomic-wind-"])';

describe( 'splitSelectorList', () => {
	it( 'ignores commas nested in functional pseudo-classes and strings', () => {
		expect( splitSelectorList( 'a:is(b, c), d[title="x, y"], e' ) ).toEqual( [
			'a:is(b, c)',
			'd[title="x, y"]',
			'e',
		] );
	} );
} );

describe( 'scopeToAtomicWind', () => {
	it( 'confines element resets to the block subtree', () => {
		expect( scopeToAtomicWind( 'h1, h2 { font-size: inherit; }' ) ).toBe(
			`h1${ MATCH }, h2${ MATCH }{ font-size: inherit; }`
		);
	} );

	it( 'confines utility rules to the block subtree', () => {
		// Classes are collected from the whole canvas, so a global `.hidden`
		// would also hide unrelated content carrying that class.
		expect( scopeToAtomicWind( '.hidden{display:none !important}#id{color:red}' ) ).toBe(
			`.hidden${ MATCH }{display:none !important}#id${ MATCH }{color:red}`
		);
	} );

	it( 'scopes a utility ahead of its pseudo-element', () => {
		expect( scopeToAtomicWind( '.hover\\:underline:hover, .placeholder\\:text-transparent::placeholder{color:transparent}' ) ).toBe(
			`.hover\\:underline:hover${ MATCH }, .placeholder\\:text-transparent${ MATCH }::placeholder{color:transparent}`
		);
	} );

	it( 'scopes the subject compound only, keeping ancestors intact', () => {
		expect( scopeToAtomicWind( ':where(select:is([multiple])) optgroup{font-weight:bolder}' ) ).toBe(
			`:where(select:is([multiple])) optgroup${ MATCH }{font-weight:bolder}`
		);
	} );

	it( 'keeps the pseudo-element last and qualifies bare ones with a universal', () => {
		expect( scopeToAtomicWind( '::placeholder, h1::before, p:first-line{opacity:1}' ) ).toBe(
			`*${ MATCH }::placeholder, h1${ MATCH }::before, p${ MATCH }:first-line{opacity:1}`
		);
	} );

	it( 'scopes attribute-anchored rules, which still match theme markup', () => {
		expect( scopeToAtomicWind( '[hidden]{display:none !important}' ) ).toBe(
			`[hidden]${ MATCH }{display:none !important}`
		);
	} );

	it( 'drops document-level inherited styling instead of moving it onto the block wrapper', () => {
		expect( scopeToAtomicWind( 'html, :host{line-height:1.5;tab-size:4}' ) ).toBe( '' );
	} );

	it( 'moves theme variables onto the block wrapper so they cannot shadow theme ones', () => {
		expect( scopeToAtomicWind( ':root, :host{--spacing:0.25rem;--text-lg:1.125rem}' ) ).toBe(
			`${ SELF }{--spacing:0.25rem;--text-lg:1.125rem}`
		);
	} );

	it( 'scopes the universal custom-property initializers', () => {
		expect( scopeToAtomicWind( '*, ::before, ::backdrop{--tw-content:""}' ) ).toBe(
			`*${ MATCH }, *${ MATCH }::before, *${ MATCH }::backdrop{--tw-content:""}`
		);
	} );

	it( 'keeps a document root used as an ancestor, scoping its subject instead', () => {
		// `[body_&]:text-red-500` and friends put a root in front of the real
		// subject; collapsing the whole selector would drop that subject and
		// apply the declarations to every block wrapper.
		expect( scopeToAtomicWind( 'body .\\[body_\\&\\]\\:text-red-500{color:red}' ) ).toBe(
			`body .\\[body_\\&\\]\\:text-red-500${ MATCH }{color:red}`
		);

		expect( scopeToAtomicWind( 'html figure{margin:0}' ) ).toBe(
			`html figure${ MATCH }{margin:0}`
		);
	} );

	it( 'recurses into conditional at-rules', () => {
		expect( scopeToAtomicWind( '@layer base{@media (width >= 48rem){img{display:block}}}' ) ).toBe(
			`@layer base{@media (width >= 48rem){img${ MATCH }{display:block}}}`
		);
	} );

	it( 'emits keyframes, @property and @import verbatim', () => {
		const css = '@import "x.css";@property --tw-x{syntax:"*";inherits:false}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(1turn)}}';
		expect( scopeToAtomicWind( css ) ).toBe( css );
	} );

	it( 'leaves nested selectors inside a utility rule untouched', () => {
		const css = '.space-y-4{:where(& > :not(:last-child)){margin-block-start:0}}.hover\\:underline{&:hover{text-decoration:underline}}';
		expect( scopeToAtomicWind( css ) ).toBe(
			`.space-y-4${ MATCH }{:where(& > :not(:last-child)){margin-block-start:0}}.hover\\:underline${ MATCH }{&:hover{text-decoration:underline}}`
		);
	} );

	it( 'keeps escaped arbitrary-value selectors intact and keeps scoping after them', () => {
		// Tailwind escapes the quotes in `after:content-["it's"]`, leaving a lone
		// apostrophe. Reading it as a string opener used to swallow the rest of
		// the stylesheet, silently leaking every element rule that followed.
		const utility = '.after\\:content-\\[\\"it\\\'s\\"\\]';
		const css = `${ utility }{--tw-content:"it's"}h1{font-size:inherit}`;

		expect( scopeToAtomicWind( css ) ).toBe(
			`${ utility }${ MATCH }{--tw-content:"it's"}h1${ MATCH }{font-size:inherit}`
		);
	} );

	it( 'does not split selectors on escaped commas', () => {
		const utility = '.grid-cols-\\[repeat\\(2\\,minmax\\(0\\,1fr\\)\\)\\]';
		const css = `${ utility }{grid-template-columns:repeat(2,minmax(0,1fr))}`;

		expect( scopeToAtomicWind( css ) ).toBe( `${ utility }${ MATCH }{grid-template-columns:repeat(2,minmax(0,1fr))}` );
	} );

	it( 'handles a Tailwind-shaped stylesheet layer by layer', () => {
		const css = [
			'@layer properties;@layer theme, base, components, utilities;',
			'@layer theme{:root, :host{--spacing:0.25rem}}',
			'@layer base{*, ::before{box-sizing:border-box;margin:0}',
			'html, :host{line-height:1.5}',
			'ul, menu{list-style:none}',
			'input:where([type="button"])::file-selector-button{appearance:button}}',
			'@layer utilities{.flex{display:flex !important}',
			'.hover\\:underline{&:hover{@media (hover: hover){text-decoration:underline !important}}}}',
			'@property --tw-content{syntax:"*";initial-value:"";inherits:false}',
		].join( '' );

		const out = scopeToAtomicWind( css );

		// Layer statements, theme variables and @property pass through.
		expect( out ).toContain( '@layer properties;@layer theme, base, components, utilities;' );
		expect( out ).toContain( `@layer theme{${ SELF }{--spacing:0.25rem}}` );
		expect( out ).toContain( `.flex${ MATCH }{display:flex !important}` );
		expect( out ).toContain( `.hover\\:underline${ MATCH }{&:hover{@media (hover: hover){text-decoration:underline !important}}}` );
		expect( out ).toContain( '@property --tw-content{syntax:"*";initial-value:"";inherits:false}' );

		// Every base-layer rule is confined to the blocks.
		expect( out ).toContain( `*${ MATCH }, *${ MATCH }::before{box-sizing:border-box;margin:0}` );
		expect( out ).not.toContain( 'line-height' );
		expect( out ).toContain( `ul${ MATCH }, menu${ MATCH }{list-style:none}` );
		expect( out ).toContain( `input:where([type="button"])${ MATCH }::file-selector-button{appearance:button}` );

		// No bare element selector survives at the start of a rule.
		expect( out ).not.toMatch( /(^|[{};])\s*(html|ul|menu|input)\s*[,{]/ );
	} );

	it( 'is a no-op on empty input', () => {
		expect( scopeToAtomicWind( '' ) ).toBe( '' );
	} );

	it( 'drops the minified preflight root rule, whose values only reference variables', () => {
		const css = 'html, :host{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:var(--default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji");font-feature-settings:var(--default-font-feature-settings, normal);font-variation-settings:var(--default-font-variation-settings, normal);-webkit-tap-highlight-color:transparent}';

		expect( scopeToAtomicWind( css ) ).toBe( '' );
	} );

	it( 'drops the pretty-printed preflight root rule', () => {
		const css = 'html, :host {\n  line-height: 1.5;\n  font-family: var(--default-font-family, ui-sans-serif);\n}';

		expect( scopeToAtomicWind( css ) ).toBe( '' );
	} );

	it.each( [ 'html', 'body', ':root', ':host' ] )( 'drops a %s rule that declares no custom property', ( root ) => {
		expect( scopeToAtomicWind( `${ root }{font-family:serif}` ) ).toBe( '' );
	} );

	it( 'keeps pretty-printed theme variables on the block wrapper', () => {
		expect( scopeToAtomicWind( ':root, :host {\n  --spacing: 0.25rem;\n  --font-serif: ui-serif, Georgia;\n}' ) ).toBe(
			`${ SELF }{\n  --spacing: 0.25rem;\n  --font-serif: ui-serif, Georgia;\n}`
		);
	} );

	it( 'keeps a root rule whole when it mixes variables with standard declarations', () => {
		expect( scopeToAtomicWind( ':root{color:red;--x:1}' ) ).toBe( `${ SELF }{color:red;--x:1}` );
	} );

	it( 'drops only the root selector from a mixed selector list', () => {
		expect( scopeToAtomicWind( 'html, h1{line-height:1.5}' ) ).toBe( `h1${ MATCH }{line-height:1.5}` );
	} );

	it( 'keeps the root selector in a mixed list that declares variables', () => {
		expect( scopeToAtomicWind( ':root, .dark{--x:1}' ) ).toBe( `${ SELF }, .dark${ MATCH }{--x:1}` );
	} );

	it( 'drops root typography inside at-rules and keeps sibling rules', () => {
		expect( scopeToAtomicWind( '@layer base{html, :host{line-height:1.5}h1{font-size:inherit}}' ) ).toBe(
			`@layer base{h1${ MATCH }{font-size:inherit}}`
		);
		expect( scopeToAtomicWind( '@media (width >= 48rem){html{line-height:2}}' ) ).toBe( '@media (width >= 48rem){}' );
	} );

	it( 'still scopes typography rules that use a root as an ancestor', () => {
		expect( scopeToAtomicWind( 'body p{font-family:serif}' ) ).toBe( `body p${ MATCH }{font-family:serif}` );
	} );

	it( 'keeps typography utilities set on the block itself', () => {
		expect( scopeToAtomicWind( '.font-serif{font-family:var(--font-serif) !important}.leading-10{line-height:2.5rem !important}' ) ).toBe(
			`.font-serif${ MATCH }{font-family:var(--font-serif) !important}.leading-10${ MATCH }{line-height:2.5rem !important}`
		);
	} );

	it( 'detects variables declared after a comment', () => {
		expect( scopeToAtomicWind( ':root{/* theme */--x:1}' ) ).toBe( `${ SELF }{/* theme */--x:1}` );
		expect( scopeToAtomicWind( ':root{--a:1;/* c */--x:1}' ) ).toBe( `${ SELF }{--a:1;/* c */--x:1}` );
	} );

	it( 'does not count a variable that only appears in a comment', () => {
		expect( scopeToAtomicWind( 'html{/* --x: 1 */line-height:1.5}' ) ).toBe( '' );
	} );
} );

describe( 'prefixCss', () => {
	it( 'prefixes a scoped stylesheet without reintroducing root typography', () => {
		const scoped = scopeToAtomicWind( 'html, :host{line-height:1.5}:root, :host{--spacing:0.25rem}h1{font-size:inherit}' );

		expect( prefixCss( scoped, ':where(.editor-styles-wrapper)' ) ).toBe(
			`:where(.editor-styles-wrapper) ${ SELF }{--spacing:0.25rem}:where(.editor-styles-wrapper) h1${ MATCH }{font-size:inherit}`
		);
	} );

	it( 'prefixes selectors and collapses document-level ones onto the scope', () => {
		expect( prefixCss( 'h1{color:red}html{tab-size:4}', ':where(.editor-styles-wrapper)' ) ).toBe(
			':where(.editor-styles-wrapper) h1{color:red}:where(.editor-styles-wrapper){tab-size:4}'
		);
	} );

	it( 'substitutes the scope for a leading document root, keeping the descendant', () => {
		// The container is itself inside `body`, so prepending would produce
		// `:where(.editor-styles-wrapper) body .utility` — unsatisfiable.
		expect( prefixCss( 'body .utility{color:red}', ':where(.editor-styles-wrapper)' ) ).toBe(
			':where(.editor-styles-wrapper) .utility{color:red}'
		);

		expect( prefixCss( 'html figure:where(x){margin:0}', ':where(.editor-styles-wrapper)' ) ).toBe(
			':where(.editor-styles-wrapper) figure:where(x){margin:0}'
		);
	} );

	it( 'keeps the combinator when substituting the scope', () => {
		expect( prefixCss( 'body > .utility{color:red}', ':where(.editor-styles-wrapper)' ) ).toBe(
			':where(.editor-styles-wrapper) > .utility{color:red}'
		);
	} );

	it( 'prefixes an already-scoped stylesheet without touching escaped utilities', () => {
		const utility = '.hover\\:bg-\\[\\#C65D07\\]';

		expect( prefixCss( `${ utility }{background:#C65D07}`, ':where(.editor-styles-wrapper)' ) ).toBe(
			`:where(.editor-styles-wrapper) ${ utility }{background:#C65D07}`
		);
	} );

	it( 'returns the stylesheet untouched without a scope selector', () => {
		expect( prefixCss( 'h1{color:red}', '' ) ).toBe( 'h1{color:red}' );
	} );
} );
