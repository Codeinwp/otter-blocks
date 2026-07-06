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

	test( 'arrow keys inside a form field edit text instead of navigating slides', async({ editor, page }) => {

		// A form field as a slide needs Left/Right for its own caret movement;
		// the slider must not hijack those keys when focus is inside the field.
		await editor.insertBlock({
			name: BLOCK,
			attributes: { loop: true },
			innerBlocks: [
				{
					name: 'themeisle-blocks/form',
					innerBlocks: [
						{ name: 'themeisle-blocks/form-input', attributes: { label: 'Name', type: 'text' }}
					]
				},
				{ name: 'core/paragraph', attributes: { content: 'Second slide' }}
			]
		});
		await publishAndViewPost({ editor, page });

		const dots = page.locator( '.o-content-dots .o-content-dot' );
		await expect( dots.nth( 0 ) ).toHaveClass( /o-content-dot--active/ );

		const input = page.locator( '.o-content-track input[type="text"]' ).first();
		await input.fill( 'abc' );

		// Caret sits after "abc"; ArrowLeft should move it within the field.
		await input.press( 'ArrowLeft' );

		// The slide did not change (the key was not hijacked by the slider).
		await expect( dots.nth( 0 ) ).toHaveClass( /o-content-dot--active/ );

		// The caret moved left inside the field instead of being suppressed.
		expect( await input.evaluate( el => el.selectionStart ) ).toBe( 2 );
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

	test( 'renders other Otter blocks as slides', async({ editor, page }) => {
		await editor.insertBlock({
			name: BLOCK,
			innerBlocks: [
				{
					name: 'themeisle-blocks/advanced-heading',
					attributes: { content: 'Otter heading slide', tag: 'h3' }
				},
				{
					name: 'themeisle-blocks/button-group',
					innerBlocks: [
						{
							name: 'themeisle-blocks/button',
							attributes: { text: 'Otter button slide', link: 'https://example.com' }
						}
					]
				},
				{
					name: 'themeisle-blocks/accordion',
					innerBlocks: [
						{
							name: 'themeisle-blocks/accordion-item',
							attributes: { title: 'Otter accordion slide' }
						}
					]
				}
			]
		});

		await publishAndViewPost({ editor, page });

		const track = page.locator( '.o-content-track' );

		// Each Otter block is a direct child (slide) and renders its own markup.
		await expect( track.locator( '> *' ) ).toHaveCount( 3 );
		await expect( track.locator( '.wp-block-themeisle-blocks-advanced-heading' ) ).toContainText( 'Otter heading slide' );
		await expect( track.locator( '.wp-block-themeisle-blocks-button-group .wp-block-button__link' ) ).toContainText( 'Otter button slide' );
		await expect( track.locator( '.wp-block-themeisle-blocks-accordion' ) ).toContainText( 'Otter accordion slide' );
	});

	test( 'renders diverse core blocks and a content-heavy slide', async({ editor, page }) => {
		const listItem = content => ({ name: 'core/list-item', attributes: { content }});
		const paragraph = content => ({ name: 'core/paragraph', attributes: { content }});

		await editor.insertBlock({
			name: BLOCK,
			innerBlocks: [
				// Slide 1 — a mix of core blocks.
				{
					name: 'core/group',
					attributes: { className: 'core-mix-slide', layout: { type: 'constrained' }},
					innerBlocks: [
						{ name: 'core/heading', attributes: { content: 'Core mix heading', level: 2 }},
						{ name: 'core/image', attributes: { url: 'https://s.w.org/images/core/5.3/MtBlanc1.jpg', alt: 'Peak' }},
						paragraph( 'An intro paragraph for the core mix slide.' ),
						{ name: 'core/list', innerBlocks: [ listItem( 'Alpha' ), listItem( 'Beta' ), listItem( 'Gamma' ) ] },
						{ name: 'core/quote', innerBlocks: [ paragraph( 'A quoted line of text.' ) ] },
						{ name: 'core/buttons', innerBlocks: [{ name: 'core/button', attributes: { text: 'Core button' }}] }
					]
				},

				// Slide 2 — content-heavy: many blocks nested inside one slide.
				{
					name: 'core/group',
					attributes: { className: 'huge-slide', layout: { type: 'constrained' }},
					innerBlocks: [
						{ name: 'core/heading', attributes: { content: 'Content-heavy slide', level: 2 }},
						...Array.from({ length: 10 }, ( _, i ) => paragraph( `Body paragraph number ${ i + 1 } with a sentence of content.` ) ),
						{ name: 'core/list', innerBlocks: Array.from({ length: 8 }, ( _, i ) => listItem( `Feature ${ i + 1 }` ) ) },
						{
							name: 'core/columns',
							innerBlocks: [
								{ name: 'core/column', innerBlocks: [ paragraph( 'Left column copy.' ) ] },
								{ name: 'core/column', innerBlocks: [ paragraph( 'Middle column copy.' ) ] },
								{ name: 'core/column', innerBlocks: [ paragraph( 'Right column copy.' ) ] }
							]
						},
						{ name: 'core/quote', innerBlocks: [ paragraph( 'A closing pull quote.' ) ] }
					]
				},

				// Slide 3 — core and Otter blocks together in one slide.
				{
					name: 'core/group',
					attributes: { className: 'mixed-slide', layout: { type: 'constrained' }},
					innerBlocks: [
						{ name: 'core/heading', attributes: { content: 'Mixed slide', level: 3 }},
						{ name: 'themeisle-blocks/advanced-heading', attributes: { content: 'Otter advanced heading', tag: 'h4' }},
						{ name: 'themeisle-blocks/button-group', innerBlocks: [{ name: 'themeisle-blocks/button', attributes: { text: 'Otter CTA', link: 'https://example.com' }}] }
					]
				}
			]
		});

		await publishAndViewPost({ editor, page });

		const track = page.locator( '.o-content-track' );
		await expect( track.locator( '> *' ) ).toHaveCount( 3 );

		// Slide 1 — core blocks render.
		const coreMix = track.locator( '.core-mix-slide' );
		await expect( coreMix.locator( 'h2.wp-block-heading' ) ).toContainText( 'Core mix heading' );
		await expect( coreMix.locator( '.wp-block-image img' ) ).toBeVisible();
		await expect( coreMix.locator( '.wp-block-list li' ) ).toContainText([ 'Alpha', 'Beta', 'Gamma' ]);
		await expect( coreMix.locator( '.wp-block-quote' ) ).toContainText( 'A quoted line of text.' );
		await expect( coreMix.locator( '.wp-block-button__link' ) ).toContainText( 'Core button' );

		// Slide 2 — the content-heavy slide renders all of its blocks.
		const huge = track.locator( '.huge-slide' );
		expect( await huge.locator( 'p' ).count() ).toBeGreaterThanOrEqual( 10 );
		await expect( huge.locator( '.wp-block-list li' ) ).toHaveCount( 8 );
		await expect( huge.locator( '.wp-block-columns .wp-block-column' ) ).toHaveCount( 3 );
		await expect( huge.locator( '.wp-block-quote' ) ).toContainText( 'A closing pull quote.' );

		// Slide 3 — core + Otter blocks coexist in one slide.
		const mixed = track.locator( '.mixed-slide' );
		await expect( mixed.locator( 'h3.wp-block-heading' ) ).toContainText( 'Mixed slide' );
		await expect( mixed.locator( '.wp-block-themeisle-blocks-advanced-heading' ) ).toContainText( 'Otter advanced heading' );
		await expect( mixed.locator( '.wp-block-themeisle-blocks-button-group .wp-block-button__link' ) ).toContainText( 'Otter CTA' );
	});
});
