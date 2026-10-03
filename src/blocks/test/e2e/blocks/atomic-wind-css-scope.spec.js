/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { setAtomicWind } from '../helpers/design-library';
import { publishAndViewPost } from '../helpers/editor';

/**
 * The generated Tailwind stylesheet carries preflight, whose rules target bare
 * HTML elements, and a theme layer defining variables such as `--spacing`. It
 * is injected into the document head, so both must only reach markup inside
 * Atomic Wind blocks — theme markup elsewhere keeps its own element styling and
 * its own variables.
 */
test.describe( 'Atomic Wind Tailwind CSS scope', () => {
	test.beforeEach( async({ otterUtils, admin }) => {
		await setAtomicWind( otterUtils, true );
		await admin.createNewPost();
	});

	test.afterAll( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, false );
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
