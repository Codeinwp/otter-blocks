/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import {
	expectBlockByName,
	insertBlockBySlash,
	publishAndViewPost
} from '../helpers/editor';

const BLOCK = 'themeisle-blocks/content-slider';

/**
 * Build a Content Slider block representation with N paragraph slides.
 *
 * @param {number} count      Number of slides.
 * @param {Object} attributes Extra block attributes.
 * @return {Object} Block representation for editor.insertBlock.
 */
const sliderWithSlides = ( count, attributes = {}) => ({
	name: BLOCK,
	attributes,
	innerBlocks: Array.from({ length: count }, ( _, i ) => ({
		name: 'core/paragraph',
		attributes: { content: `Slide ${ i + 1 }` }
	}) )
});

test.describe( 'Content Slider Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/content slider"', async({ editor, page }) => {
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/content slider',
			blockName: BLOCK
		});

		await expectBlockByName( editor, BLOCK );
	});

	test( 'editor shows one slide at a time and toolbar navigates (mode B)', async({ editor, page }) => {
		await editor.insertBlock( sliderWithSlides( 3 ) );

		const block = editor.canvas.getByRole( 'document', { name: 'Block: Content Slider' });
		await editor.selectBlocks( block );

		// Only the active slide is visible at a time.
		await expect( editor.canvas.getByText( 'Slide 1', { exact: true }) ).toBeVisible();
		await expect( editor.canvas.getByText( 'Slide 2', { exact: true }) ).toBeHidden();

		// Toolbar "Next slide" advances the active slide.
		await page.getByRole( 'button', { name: 'Next slide', exact: true }).click();
		await expect( editor.canvas.getByText( 'Slide 2', { exact: true }) ).toBeVisible();
		await expect( editor.canvas.getByText( 'Slide 1', { exact: true }) ).toBeHidden();

		// "Add slide" appends a fourth slide.
		await page.getByRole( 'button', { name: 'Add slide', exact: true }).click();
		const stored = await expectBlockByName( editor, BLOCK );
		expect( stored.innerBlocks.length ).toBe( 4 );
	});

	test( 'frontend renders slides, arrows and dots', async({ editor, page }) => {
		await editor.insertBlock( sliderWithSlides( 3 ) );
		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.wp-block-themeisle-blocks-content-slider' ) ).toBeVisible();
		await expect( page.locator( '.o-content-track > *' ) ).toHaveCount( 3 );
		await expect( page.locator( '.o-content-arrow--prev' ) ).toBeVisible();
		await expect( page.locator( '.o-content-arrow--next' ) ).toBeVisible();

		// Dots are built by JS, one per slide.
		await expect( page.locator( '.o-content-dots .o-content-dot' ) ).toHaveCount( 3 );

		// Carousel semantics for assistive tech.
		await expect( page.locator( '.wp-block-themeisle-blocks-content-slider' ) ).toHaveAttribute( 'aria-roledescription', 'carousel' );
	});

	test( 'arrows and dots change the active slide; loop wraps around', async({ editor, page }) => {
		await editor.insertBlock( sliderWithSlides( 3, { loop: true }) );
		await publishAndViewPost({ editor, page });

		const dots = page.locator( '.o-content-dots .o-content-dot' );
		const next = page.locator( '.o-content-arrow--next' );
		const prev = page.locator( '.o-content-arrow--prev' );

		// Initially the first dot is active.
		await expect( dots.nth( 0 ) ).toHaveClass( /o-content-dot--active/ );

		// Next advances the active dot.
		await next.click();
		await expect( dots.nth( 1 ) ).toHaveClass( /o-content-dot--active/ );

		// Clicking a dot jumps to that slide.
		await dots.nth( 2 ).click();
		await expect( dots.nth( 2 ) ).toHaveClass( /o-content-dot--active/ );

		// Next from the last slide wraps to the first (soft loop).
		await next.click();
		await expect( dots.nth( 0 ) ).toHaveClass( /o-content-dot--active/ );

		// Prev from the first slide wraps to the last.
		await prev.click();
		await expect( dots.nth( 2 ) ).toHaveClass( /o-content-dot--active/ );
	});

	test( 'keyboard arrow keys navigate slides', async({ editor, page }) => {
		await editor.insertBlock( sliderWithSlides( 3 ) );
		await publishAndViewPost({ editor, page });

		const dots = page.locator( '.o-content-dots .o-content-dot' );

		await page.locator( '.o-content-arrow--next' ).focus();
		await page.keyboard.press( 'ArrowRight' );
		await expect( dots.nth( 1 ) ).toHaveClass( /o-content-dot--active/ );

		await page.keyboard.press( 'ArrowLeft' );
		await expect( dots.nth( 0 ) ).toHaveClass( /o-content-dot--active/ );
	});

	test( 'showArrows and showDots toggles hide chrome', async({ editor, page }) => {
		await editor.insertBlock( sliderWithSlides( 2, { showArrows: false, showDots: false }) );
		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.wp-block-themeisle-blocks-content-slider' ) ).toBeVisible();
		await expect( page.locator( '.o-content-arrows' ) ).toHaveCount( 0 );
		await expect( page.locator( '.o-content-dots' ) ).toHaveCount( 0 );
	});

	test( 'chrome color attributes apply as scoped CSS variables', async({ editor, page }) => {
		await editor.insertBlock( sliderWithSlides( 2, {
			arrowsColor: '#ff0000',
			dotsActiveColor: '#00ff00'
		}) );
		await publishAndViewPost({ editor, page });

		const slider = page.locator( '.wp-block-themeisle-blocks-content-slider' );
		const arrowColor = await slider.evaluate( el => window.getComputedStyle( el ).getPropertyValue( '--o-arrow-color' ).trim() );
		const dotActive = await slider.evaluate( el => window.getComputedStyle( el ).getPropertyValue( '--o-dot-active-color' ).trim() );

		expect( arrowColor ).toBe( '#ff0000' );
		expect( dotActive ).toBe( '#00ff00' );
	});

	test( 'autoplay advances slides and pauses on hover', async({ editor, page }) => {
		// The shared config forces prefers-reduced-motion: reduce, which would
		// (correctly) disable autoplay. Opt out for this specific test.
		await page.emulateMedia({ reducedMotion: 'no-preference' });

		await editor.insertBlock( sliderWithSlides( 3, { autoplay: true, delay: 1 }) );
		await publishAndViewPost({ editor, page });

		const dots = page.locator( '.o-content-dots .o-content-dot' );

		// Autoplay moves forward on its own.
		await expect( dots.nth( 1 ) ).toHaveClass( /o-content-dot--active/, { timeout: 4000 });

		// Hovering pauses autoplay: the active dot should not change while hovered.
		await page.locator( '.wp-block-themeisle-blocks-content-slider' ).hover();
		const activeAfterHover = await page.locator( '.o-content-dot--active' ).getAttribute( 'aria-label' );
		await page.waitForTimeout( 1500 );
		const activeStill = await page.locator( '.o-content-dot--active' ).getAttribute( 'aria-label' );
		expect( activeStill ).toBe( activeAfterHover );
	});

	test( 'reduced motion disables autoplay', async({ editor, page }) => {
		await editor.insertBlock( sliderWithSlides( 3, { autoplay: true, delay: 1 }) );
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await publishAndViewPost({ editor, page });

		const dots = page.locator( '.o-content-dots .o-content-dot' );

		// With reduced motion, autoplay never starts: first slide stays active.
		await page.waitForTimeout( 2000 );
		await expect( dots.nth( 0 ) ).toHaveClass( /o-content-dot--active/ );
	});

	test( 'no console errors on the frontend', async({ editor, page }) => {
		// Third-party survey/tracking scripts (Formbricks) are disabled in the
		// e2e environment by the otter-e2e bootstrap mu-plugin, so the console
		// should be free of unrelated noise here.
		const errors = [];
		page.on( 'console', msg => {
			if ( 'error' === msg.type() ) {
				errors.push( msg.text() );
			}
		});
		page.on( 'pageerror', err => errors.push( err.message ) );

		await editor.insertBlock( sliderWithSlides( 3 ) );
		await publishAndViewPost({ editor, page });

		await page.locator( '.o-content-arrow--next' ).click({ clickCount: 3 });
		expect( errors ).toEqual([]);
	});
});
