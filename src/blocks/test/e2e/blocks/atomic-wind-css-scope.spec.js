/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { setAtomicWind } from '../helpers/design-library';
import { publishAndViewPost } from '../helpers/editor';

const boxMarkup = ( className, children ) =>
	`<!-- wp:atomic-wind/box {"className":"${ className }"} --><div class="wp-block-atomic-wind-box ${ className }">${ children }</div><!-- /wp:atomic-wind/box -->`;

const textMarkup = ( className, content ) =>
	`<!-- wp:atomic-wind/text {"tagName":"span","className":"${ className }"} --><span data-rich-text="" class="wp-block-atomic-wind-text ${ className }">${ content }</span><!-- /wp:atomic-wind/text -->`;

const TYPOGRAPHY_CONTENT = boxMarkup( 'typo-parent font-serif leading-10', textMarkup( 'typo-child', 'Child' ) + textMarkup( 'typo-own font-mono', 'Own' ) );

const THEMES = [ 'twentytwentyfive', 'twentytwentyone', 'raft' ];

const lineHeightRatio = ( locator, relativeToRoot = false ) => locator.evaluate( ( el, toRoot ) => {
	const style = window.getComputedStyle( el );
	const base = toRoot ? window.getComputedStyle( el.ownerDocument.documentElement ) : style;

	return parseFloat( style.lineHeight ) / parseFloat( base.fontSize );
}, relativeToRoot );

/**
 * @param {import('@wordpress/e2e-test-utils-playwright').RequestUtils} requestUtils Request utils.
 * @return {Promise<{ atomicWind: boolean, theme: string }>} Atomic Wind option and active theme.
 */
const captureSiteState = async( requestUtils ) => {
	const settings = await requestUtils.rest({ path: '/wp/v2/settings' });
	const [ active ] = await requestUtils.rest({ path: '/wp/v2/themes', params: { status: 'active' }});

	return { atomicWind: !! settings.themeisle_blocks_settings_atomic_wind_blocks, theme: active.stylesheet };
};

/**
 * Load a post as the editor so the style builder caches its compiled CSS.
 *
 * @param {import('@playwright/test').Page} page Page.
 * @param {string}                          link Post URL.
 */
const cachePostCss = async( page, link ) => {
	await page.addInitScript( () => {
		document.addEventListener( 'atomic-wind:css-saved', () => {
			window.otterE2ECssSaved = true;
		});
	});
	await page.goto( link );
	await page.waitForFunction( () => window.otterE2ECssSaved );
};

/**
 * @param {import('@playwright/test').Browser} browser Browser.
 * @param {string}                             url     Page to open logged out.
 * @return {Promise<import('@playwright/test').Page>} Visitor page.
 */
const openAsVisitor = async( browser, url ) => {
	const visitor = await browser.newPage({ storageState: { cookies: [], origins: [] }});
	await visitor.goto( url );
	await expect( visitor.locator( '#wpadminbar' ) ).toHaveCount( 0 );

	return visitor;
};

/**
 * @param {import('@wordpress/e2e-test-utils-playwright').RequestUtils} requestUtils Request utils.
 * @param {Array<{ id: number }>}                                       posts        Posts to delete.
 */
const deletePosts = ( requestUtils, posts ) => Promise.all( posts.map( ( post ) => requestUtils.rest({
	method: 'DELETE',
	path: `/wp/v2/posts/${ post.id }`,
	params: { force: true }
}) ) );

/**
 * @param {import('@playwright/test').Page|import('@playwright/test').FrameLocator} root Page or editor canvas.
 */
const expectInheritedTypography = async( root ) => {
	const parent = root.locator( '.typo-parent' );
	const child = root.locator( '.typo-child' );

	// The parent utilities landing proves the stylesheet reached the page.
	await expect( parent ).toHaveCSS( 'font-family', /^ui-serif/ );
	await expect.poll( () => lineHeightRatio( parent, true ) ).toBeCloseTo( 2.5, 1 );

	await expect( child ).toHaveCSS( 'font-family', /^ui-serif/ );
	const parentLineHeight = await parent.evaluate( ( el ) => window.getComputedStyle( el ).lineHeight );
	await expect( child ).toHaveCSS( 'line-height', parentLineHeight );

	await expect( root.locator( '.typo-own' ) ).toHaveCSS( 'font-family', /^ui-monospace/ );

	for ( const block of [ parent, child ] ) {
		// Without the stylesheet `tab-size` computes to 8.
		await expect( block ).toHaveCSS( 'tab-size', '4' );
		await expect( block ).toHaveCSS( '-webkit-tap-highlight-color', 'rgba(0, 0, 0, 0)' );
	}
};

/**
 * The generated Tailwind stylesheet carries preflight, whose rules target bare
 * HTML elements, and a theme layer defining variables such as `--spacing`. It
 * is injected into the whole document, so both must only reach markup inside
 * Atomic Wind blocks — theme markup elsewhere keeps its own element styling and
 * its own variables.
 */
test.describe( 'Atomic Wind Tailwind CSS scope', () => {
	let original;

	test.beforeAll( async({ requestUtils }) => {
		original = await captureSiteState( requestUtils );
	});

	test.beforeEach( async({ otterUtils, admin }) => {
		await setAtomicWind( otterUtils, true );
		await admin.createNewPost();
	});

	test.afterAll( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, original.atomicWind );
	});

	test( 'resets elements inside the block without touching theme markup', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/list',
			attributes: { className: 'theme-list' },
			innerBlocks: [
				{ name: 'core/list-item', attributes: { content: 'Theme item' } }
			]
		});

		await editor.insertBlock({
			name: 'atomic-wind/box',
			attributes: { className: 'flex mt-4 p-8' },
			innerBlocks: [
				{
					name: 'core/list',
					attributes: { className: 'block-list' },
					innerBlocks: [
						{ name: 'core/list-item', attributes: { content: 'Block item' } }
					]
				}
			]
		});

		await publishAndViewPost({ editor, page });

		const box = page.locator( '.wp-block-atomic-wind-box' );

		// The utility landing proves the stylesheet reached the page at all,
		// so the assertions below cannot pass on a missing stylesheet.
		await expect( box ).toHaveCSS( 'display', 'flex' );

		// `mt-4`/`p-8` resolve through `var(--spacing)`, which is defined on the
		// block wrapper rather than at `:root`. Zero values here would mean the
		// variables no longer reach the utilities.
		await expect( box ).toHaveCSS( 'margin-top', '16px' );
		await expect( box ).toHaveCSS( 'padding', '32px' );

		await expect( page.locator( 'ul.block-list' ) ).toHaveCSS( 'list-style-type', 'none' );
		await expect( page.locator( 'ul.theme-list' ) ).toHaveCSS( 'list-style-type', 'disc' );
	});

	test( 'keeps Tailwind theme variables out of the document root', async({ editor, page }) => {
		// `mt-4` is what pulls `--spacing` into the theme layer; without a
		// variable-consuming utility the stylesheet defines none and the
		// assertion below would hold either way.
		await editor.insertBlock({
			name: 'atomic-wind/box',
			attributes: { className: 'flex mt-4' }
		});

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.wp-block-atomic-wind-box' ) ).toHaveCSS( 'display', 'flex' );

		const [ rootSpacing, blockSpacing ] = await page.evaluate( () => [
			getComputedStyle( document.documentElement ).getPropertyValue( '--spacing' ).trim(),
			getComputedStyle( document.querySelector( '.wp-block-atomic-wind-box' ) )
				.getPropertyValue( '--spacing' )
				.trim()
		] );

		expect( rootSpacing ).toBe( '' );
		expect( blockSpacing ).toBe( '0.25rem' );
	});

	/**
	 * Classes are collected from the whole canvas, so a utility class on
	 * unrelated content must not pick up the generated (important) styles.
	 *
	 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor Editor utils.
	 */
	const insertUtilityCollision = async( editor ) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { className: 'outside-text hidden', content: 'Outside text' }
		});

		await editor.insertBlock({
			name: 'atomic-wind/box',
			attributes: { className: 'flex' },
			innerBlocks: [
				{
					name: 'atomic-wind/text',
					attributes: { className: 'inside-text hidden', content: 'Inside text' }
				}
			]
		});
	};

	test( 'keeps utilities off unrelated editor content', async({ editor }) => {
		await insertUtilityCollision( editor );

		// The inside rule landing proves `.hidden` was generated at all.
		await expect( editor.canvas.locator( '.inside-text' ) ).toHaveCSS( 'display', 'none' );
		await expect( editor.canvas.locator( '.outside-text' ) ).toHaveCSS( 'display', 'block' );
	});

	test( 'keeps utilities off unrelated frontend content', async({ editor, page }) => {
		await insertUtilityCollision( editor );

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.inside-text' ) ).toHaveCSS( 'display', 'none' );
		await expect( page.locator( '.outside-text' ) ).toHaveCSS( 'display', 'block' );
	});
});

test.describe( 'Atomic Wind typography inheritance', () => {
	let original;

	test.beforeAll( async({ requestUtils }) => {
		original = await captureSiteState( requestUtils );
	});

	test.beforeEach( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, true );
	});

	test.afterAll( async({ otterUtils, requestUtils }) => {
		await requestUtils.activateTheme( original.theme );
		await setAtomicWind( otterUtils, original.atomicWind );
	});

	test( 'inherits typography from a theme-styled ancestor on the frontend', async({ page, requestUtils }) => {
		const post = await requestUtils.createPost({
			title: 'Atomic Wind theme typography',
			status: 'publish',
			content: `<!-- wp:group {"className":"typo-theme-wrap"} --><div class="wp-block-group typo-theme-wrap">${ boxMarkup( 'typo-theme-box flex', textMarkup( 'typo-theme', 'Theme text' ) ) }</div><!-- /wp:group -->`
		});

		try {
			await page.goto( post.link );
			await expect( page.locator( '.typo-theme-box' ) ).toHaveCSS( 'display', 'flex' );

			await page.addStyleTag({ content: '.typo-theme-wrap{font-family:"Otter Theme Font",serif;line-height:3}' });

			await expect( page.locator( '.typo-theme' ) ).toHaveCSS( 'font-family', /Otter Theme Font/ );
			await expect( page.locator( '.typo-theme-box' ) ).toHaveCSS( 'font-family', /Otter Theme Font/ );
			await expect.poll( () => lineHeightRatio( page.locator( '.typo-theme' ) ) ).toBeCloseTo( 3, 1 );
		} finally {
			await deletePosts( requestUtils, [ post ] );
		}
	});

	test( 'inherits a parent block typography on the frontend', async({ page, requestUtils }) => {
		const post = await requestUtils.createPost({
			title: 'Atomic Wind parent typography',
			status: 'publish',
			content: TYPOGRAPHY_CONTENT
		});

		try {
			await page.goto( post.link );
			await expectInheritedTypography( page );
		} finally {
			await deletePosts( requestUtils, [ post ] );
		}
	});

	test( 'inherits a parent block typography from the cached stylesheet', async({ browser, page, requestUtils }) => {
		const post = await requestUtils.createPost({
			title: 'Atomic Wind cached typography',
			status: 'publish',
			content: TYPOGRAPHY_CONTENT
		});

		let visitor;

		try {
			await cachePostCss( page, post.link );
			visitor = await openAsVisitor( browser, post.link );

			await expect( visitor.locator( '#atomic-wind-tailwind-generator-js' ) ).toHaveCount( 0 );
			await expect( visitor.locator( '#atomic-wind-tailwind-inline-css' ) ).toHaveCount( 1 );
			await expectInheritedTypography( visitor );
		} finally {
			await visitor?.close();
			await deletePosts( requestUtils, [ post ] );
		}
	});

	test( 'inherits a parent block typography in the editor', async({ admin, editor }) => {
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'atomic-wind/box',
			attributes: { className: 'typo-parent font-serif leading-10' },
			innerBlocks: [
				{ name: 'atomic-wind/text', attributes: { tagName: 'span', className: 'typo-child', content: 'Child' }},
				{ name: 'atomic-wind/text', attributes: { tagName: 'span', className: 'typo-own font-mono', content: 'Own' }}
			]
		});

		await expectInheritedTypography( editor.canvas );
	});

	test( 'renders the shipped patterns with the theme font and the root defaults', async({ page, requestUtils }) => {
		const patterns = await requestUtils.rest({ path: '/wp/v2/block-patterns/patterns' });
		const shipped = patterns.filter( ( pattern ) => pattern.name.startsWith( 'otter-blocks/aw-' ) );

		expect( shipped.length ).toBeGreaterThanOrEqual( 20 );

		const content = shipped.map( ( pattern ) => {
			const slug = pattern.name.replace( 'otter-blocks/', '' );

			return `<!-- wp:group {"className":"awp ${ slug }"} --><div class="wp-block-group awp ${ slug }">${ pattern.content }</div><!-- /wp:group -->`;
		}).join( '\n' );

		const post = await requestUtils.createPost({
			title: 'Atomic Wind shipped patterns',
			status: 'publish',
			content
		});

		// Assumes the active theme's own font stack does not start with `ui-sans-serif`.
		const inspect = () => page.evaluate( () => {
			const offenders = [];
			const empty = [];
			const blocks = document.querySelectorAll( '.awp [class*="wp-block-atomic-wind-"]' );

			for ( const el of blocks ) {
				const style = window.getComputedStyle( el );
				const problems = [];

				if ( style.fontFamily.startsWith( 'ui-sans-serif' ) && ! el.closest( '[class~="font-sans"]' ) ) {
					problems.push( 'default font stack' );
				}

				if ( '4' !== style.tabSize ) {
					problems.push( `tab-size ${ style.tabSize }` );
				}

				if ( 'rgba(0, 0, 0, 0)' !== style.getPropertyValue( '-webkit-tap-highlight-color' ) ) {
					problems.push( 'tap highlight' );
				}

				if ( problems.length ) {
					const group = el.closest( '.awp' );
					const pattern = [ ...group.classList ].find( ( name ) => name.startsWith( 'aw-' ) );
					const classes = ( el.getAttribute( 'class' ) || '' ).split( ' ' ).slice( 0, 3 ).join( ' ' );
					offenders.push( `${ pattern } <${ el.tagName.toLowerCase() } class="${ classes }"> ${ problems.join( ', ' ) }` );
				}
			}

			const groups = [ ...document.querySelectorAll( '.awp' ) ];

			for ( const group of groups ) {
				if ( ! group.querySelector( '[class*="wp-block-atomic-wind-"]' ) ) {
					empty.push( [ ...group.classList ].find( ( name ) => name.startsWith( 'aw-' ) ) );
				}
			}

			return {
				count: blocks.length,
				groups: groups.length,
				empty,
				total: offenders.length,
				offenders: offenders.slice( 0, 10 )
			};
		});

		try {
			await page.goto( post.link );

			await expect.poll( async() => {
				const { total, offenders } = await inspect();
				return { total, offenders };
			}, { timeout: 30000 }).toEqual({ total: 0, offenders: [] });

			const result = await inspect();
			expect( result.empty ).toEqual([]);
			expect( result.groups ).toBe( shipped.length );
			expect( result.count ).toBeGreaterThan( 500 );
		} finally {
			await deletePosts( requestUtils, [ post ] );
		}
	});

	for ( const theme of THEMES ) {
		test( `matches a plain sibling's typography on ${ theme }`, async({ page, requestUtils }) => {
			await requestUtils.activateTheme( theme );

			const [ active ] = await requestUtils.rest({ path: '/wp/v2/themes', params: { status: 'active' }});
			expect( active.stylesheet ).toBe( theme );

			const post = await requestUtils.createPost({
				title: `Atomic Wind ${ theme } typography`,
				status: 'publish',
				content: `<!-- wp:group {"className":"typo-ctx"} --><div class="wp-block-group typo-ctx"><!-- wp:html --><span class="typo-control">Control</span><!-- /wp:html -->${ boxMarkup( 'typo-theme-box flex', textMarkup( 'typo-theme', 'Theme text' ) ) }</div><!-- /wp:group -->`
			});

			try {
				await page.goto( post.link );
				await expect( page.locator( '.typo-theme-box' ) ).toHaveCSS( 'display', 'flex' );

				const control = await page.locator( '.typo-control' ).evaluate( ( el ) => {
					const style = window.getComputedStyle( el );

					return { fontFamily: style.fontFamily, lineHeight: style.lineHeight };
				});

				await expect( page.locator( '.typo-theme' ) ).toHaveCSS( 'font-family', control.fontFamily );
				await expect( page.locator( '.typo-theme' ) ).toHaveCSS( 'line-height', control.lineHeight );
			} finally {
				await deletePosts( requestUtils, [ post ] );
				await requestUtils.activateTheme( original.theme );
			}
		});
	}
});
