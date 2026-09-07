/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { setAtomicWind } from '../helpers/design-library';
import { publishAndViewPost } from '../helpers/editor';

/**
 * Atomic Wind compiles Tailwind in important mode, so a `flex` utility lands as
 * `display:flex!important`. The "Hide on" screen-size condition is also
 * `!important`, so unless its rules outrank the utilities the block stays
 * visible on the device it was hidden for, depending on which stylesheet the
 * page happened to print last.
 */
const MOBILE = { width: 375, height: 700 };
const TABLET = { width: 900, height: 700 };
const DESKTOP = { width: 1280, height: 700 };

const insertHiddenBox = ( editor, screenSizes ) =>
	editor.insertBlock({
		name: 'atomic-wind/box',
		attributes: {
			className: 'flex gap-4 p-8',
			otterConditions: [
				[
					{
						type: 'screenSize',
						screen_sizes: screenSizes
					}
				]
			]
		},
		innerBlocks: [
			{ name: 'core/paragraph', attributes: { content: 'Boxed content' }}
		]
	});

test.describe( 'Atomic Wind hide on screen size', () => {
	test.beforeEach( async({ otterUtils, admin }) => {
		await setAtomicWind( otterUtils, true );
		await admin.createNewPost();
	});

	test.afterAll( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, false );
	});

	test( 'hiding on mobile beats the flex utility', async({ editor, page }) => {
		await insertHiddenBox( editor, [ 'mobile' ] );
		await publishAndViewPost({ editor, page });

		const box = page.locator( '.wp-block-atomic-wind-box' );

		await expect( box ).toHaveClass( /o-hide-on-mobile/ );

		// Outside the hidden range the utility must still apply, so a passing
		// hidden assertion cannot come from a stylesheet that never loaded.
		await page.setViewportSize( TABLET );
		await expect( box ).toHaveCSS( 'display', 'flex' );

		await page.setViewportSize( MOBILE );
		await expect( box ).toHaveCSS( 'display', 'none' );
	});

	test( 'hiding on tablet beats the flex utility', async({ editor, page }) => {
		await insertHiddenBox( editor, [ 'tablet' ] );
		await publishAndViewPost({ editor, page });
		const box = page.locator( '.wp-block-atomic-wind-box' );
		await expect( box ).toHaveClass( /o-hide-on-tablet/ );
		await page.setViewportSize( MOBILE );
		await expect( box ).toHaveCSS( 'display', 'flex' );
		await page.setViewportSize( TABLET );
		await expect( box ).toHaveCSS( 'display', 'none' );
	});

	test( 'hiding on desktop beats the flex utility', async({ editor, page }) => {
		await insertHiddenBox( editor, [ 'desktop' ] );
		await publishAndViewPost({ editor, page });

		const box = page.locator( '.wp-block-atomic-wind-box' );

		await expect( box ).toHaveClass( /o-hide-on-desktop/ );

		await page.setViewportSize( MOBILE );
		await expect( box ).toHaveCSS( 'display', 'flex' );

		await page.setViewportSize( DESKTOP );
		await expect( box ).toHaveCSS( 'display', 'none' );
	});
});
