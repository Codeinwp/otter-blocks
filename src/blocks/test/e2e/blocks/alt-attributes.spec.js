/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import path from 'path';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';

test.describe( 'Alt attributes', () => {

	let uploadedMedia;

	test.beforeAll( async({ requestUtils }) => {
		uploadedMedia = await requestUtils.uploadMedia(
			path.resolve(
				process.cwd(),
				'src/blocks/test/e2e/assets/10x10_e2e_test_image_z9T8jK.png'
			)
		);
	});

	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'Icon List image icon renders the alt on frontend', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/icon-list',
			innerBlocks: [
				{
					name: 'themeisle-blocks/icon-list-item',
					attributes: {
						library: 'image',
						icon: uploadedMedia.source_url,
						iconId: uploadedMedia.id,
						iconAlt: 'A meaningful icon',
						content: 'Item one'
					}
				},
				{
					name: 'themeisle-blocks/icon-list-item',
					attributes: {
						library: 'image',
						icon: uploadedMedia.source_url,
						iconId: uploadedMedia.id,
						content: 'Item two'
					}
				}
			]
		});

		await publishAndViewPost({ editor, page });

		const icons = page.locator( '.wp-block-themeisle-blocks-icon-list-item img' );

		await expect( icons ).toHaveCount( 2 );
		await expect( icons.first() ).toHaveAttribute( 'alt', 'A meaningful icon' );

		// An icon without alt text is decorative: the attribute is present and empty, never missing.
		await expect( icons.nth( 1 ) ).toHaveAttribute( 'alt', '' );
	});

	test( 'Icon List image icon alt is editable from the inspector', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/icon-list',
			innerBlocks: [
				{
					name: 'themeisle-blocks/icon-list-item',
					attributes: {
						library: 'image',
						icon: uploadedMedia.source_url,
						iconId: uploadedMedia.id,
						iconAlt: 'Initial alt',
						content: 'Item one'
					}
				}
			]
		});

		// themeisle-blocks/icon-list is apiVersion 2, which opts the post editor out of the iframed canvas, so blocks render at page level.
		await page.getByRole( 'document', { name: 'Block: Icon List Item' }).click();
		await editor.openDocumentSettingsSidebar();

		const altField = page.getByLabel( 'Alt text (alternative text)' );

		await expect( altField ).toHaveValue( 'Initial alt' );
		await altField.fill( 'Edited alt' );

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.wp-block-themeisle-blocks-icon-list-item img' ) ).toHaveAttribute( 'alt', 'Edited alt' );
	});

	test( 'Timeline image icon renders the alt on frontend', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/timeline',
			innerBlocks: [
				{
					name: 'themeisle-blocks/timeline-item',
					attributes: {
						iconType: 'image',
						icon: uploadedMedia.source_url,
						iconId: uploadedMedia.id,
						iconAlt: 'Timeline event icon'
					},
					innerBlocks: [
						{
							name: 'core/paragraph',
							attributes: { content: 'Event' }
						}
					]
				}
			]
		});

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.o-timeline-icon img' ) ).toHaveAttribute( 'alt', 'Timeline event icon' );
	});

	test( 'Slider images keep the alt and no longer duplicate it as title', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/slider',
			attributes: {
				images: [
					{
						id: uploadedMedia.id,
						url: uploadedMedia.source_url,
						alt: 'Slide one'
					}
				]
			}
		});

		await publishAndViewPost({ editor, page });

		const slide = page.locator( '.wp-block-themeisle-blocks-slider-item' ).first();

		await expect( slide ).toHaveAttribute( 'alt', 'Slide one' );
		expect( await slide.getAttribute( 'title' ) ).toBeNull();
	});

	test( 'old Icon List content (no alt) is migrated by the deprecation', async({ editor, page }) => {

		// Markup serialized by the previous save, before the alt attribute existed.
		await editor.setContent( `
<!-- wp:themeisle-blocks/icon-list -->
<div class="wp-block-themeisle-blocks-icon-list"><!-- wp:themeisle-blocks/icon-list-item {"library":"image","icon":"${ uploadedMedia.source_url }","content":"Item one"} -->
<div class="wp-block-themeisle-blocks-icon-list-item"><img src="${ uploadedMedia.source_url }"/><p class="wp-block-themeisle-blocks-icon-list-item-content">Item one</p></div>
<!-- /wp:themeisle-blocks/icon-list-item --></div>
<!-- /wp:themeisle-blocks/icon-list -->
` );

		// themeisle-blocks/icon-list is apiVersion 2, which opts the post editor out of the iframed canvas, so blocks render at page level.
		await expect( page.getByRole( 'button', { name: 'Attempt Block Recovery' }) ).toHaveCount( 0 );
		await expect( page.getByRole( 'document', { name: 'Block: Icon List Item' }).locator( 'img' ) ).toBeVisible();

		// The migrated block re-serializes with an explicit empty (decorative) alt.
		expect( await editor.getEditedPostContent() ).toContain( 'alt=""' );

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.wp-block-themeisle-blocks-icon-list-item img' ) ).toHaveAttribute( 'alt', '' );
	});

	test( 'old Timeline content (no alt) is migrated by the deprecation', async({ editor, page }) => {
		await editor.setContent( `
<!-- wp:themeisle-blocks/timeline -->
<div class="wp-block-themeisle-blocks-timeline"><div class="o-timeline-root"><!-- wp:themeisle-blocks/timeline-item {"iconType":"image","icon":"${ uploadedMedia.source_url }"} -->
<div class="wp-block-themeisle-blocks-timeline-item"><div class="o-timeline-container"><div class="o-timeline-icon"><img src="${ uploadedMedia.source_url }"/></div><div class="o-timeline-content"><!-- wp:paragraph -->
<p>Event</p>
<!-- /wp:paragraph --></div></div></div>
<!-- /wp:themeisle-blocks/timeline-item --></div></div>
<!-- /wp:themeisle-blocks/timeline -->
` );

		await expect( editor.canvas.getByRole( 'button', { name: 'Attempt Block Recovery' }) ).toHaveCount( 0 );
		await expect( editor.canvas.locator( '.o-timeline-icon img' ) ).toBeVisible();

		expect( await editor.getEditedPostContent() ).toContain( 'alt=""' );

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.o-timeline-icon img' ) ).toHaveAttribute( 'alt', '' );
	});
});
