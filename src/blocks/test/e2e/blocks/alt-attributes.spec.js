/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import path from 'path';

/**
 * Internal dependencies
 */
import { publishAndViewPost, selectBlockByName } from '../helpers/editor';

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

	test( 'Icon List parent default image alt is inherited unless overridden', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/icon-list',
			attributes: {
				defaultLibrary: 'image',
				defaultIcon: uploadedMedia.source_url,
				defaultIconId: uploadedMedia.id,
				defaultIconAlt: 'Parent default alt'
			},
			innerBlocks: [
				{
					name: 'themeisle-blocks/icon-list-item',
					attributes: {
						content: 'Inherited item'
					}
				},
				{
					name: 'themeisle-blocks/icon-list-item',
					attributes: {
						library: 'image',
						icon: uploadedMedia.source_url,
						iconId: uploadedMedia.id,
						iconAlt: 'Item override alt',
						content: 'Overridden item'
					}
				}
			]
		});

		const editorIcons = editor.canvas.locator( '.wp-block-themeisle-blocks-icon-list-item img' );

		await expect( editorIcons ).toHaveCount( 2 );
		await expect( editorIcons.first() ).toHaveAttribute( 'alt', 'Parent default alt' );
		await expect( editorIcons.nth( 1 ) ).toHaveAttribute( 'alt', 'Item override alt' );

		await publishAndViewPost({ editor, page });

		const frontendIcons = page.locator( '.wp-block-themeisle-blocks-icon-list-item img' );

		await expect( frontendIcons ).toHaveCount( 2 );
		await expect( frontendIcons.first() ).toHaveAttribute( 'alt', 'Parent default alt' );
		await expect( frontendIcons.nth( 1 ) ).toHaveAttribute( 'alt', 'Item override alt' );
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

		await editor.canvas.getByRole( 'document', { name: 'Block: Icon List Item' }).click();
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

	test( 'Timeline image icon without alt is decorative on the frontend', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/timeline',
			innerBlocks: [
				{
					name: 'themeisle-blocks/timeline-item',
					attributes: {
						iconType: 'image',
						icon: uploadedMedia.source_url,
						iconId: uploadedMedia.id
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

		await expect( page.locator( '.o-timeline-icon img' ) ).toHaveAttribute( 'alt', '' );
	});

	test( 'Timeline image icon alt is editable from the inspector', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/timeline',
			innerBlocks: [
				{
					name: 'themeisle-blocks/timeline-item',
					attributes: {
						iconType: 'image',
						icon: uploadedMedia.source_url,
						iconId: uploadedMedia.id,
						iconAlt: 'Initial alt'
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

		await selectBlockByName( page, 'themeisle-blocks/timeline-item' );
		await editor.openDocumentSettingsSidebar();

		const altField = page.getByLabel( 'Alt text (alternative text)' );

		await expect( altField ).toHaveValue( 'Initial alt' );
		await altField.fill( 'Edited alt' );

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.o-timeline-icon img' ) ).toHaveAttribute( 'alt', 'Edited alt' );
	});

	test( 'Slider image alt is editable from the inspector', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/slider',
			attributes: {
				images: [
					{
						id: uploadedMedia.id,
						url: uploadedMedia.source_url,
						alt: 'Initial alt'
					}
				]
			}
		});

		await editor.canvas.getByRole( 'document', { name: 'Block: Image Slider' }).click();
		await editor.openDocumentSettingsSidebar();
		await page.getByRole( 'button', { name: 'Images' }).click();

		const altField = page.getByLabel( 'Image 1 alt text (alternative text)' );

		await expect( altField ).toHaveValue( 'Initial alt' );
		await altField.fill( 'Edited alt' );

		await publishAndViewPost({ editor, page });

		const slide = page.locator( '.wp-block-themeisle-blocks-slider-item' ).first();

		await expect( slide ).toHaveAttribute( 'alt', 'Edited alt' );
		expect( await slide.getAttribute( 'title' ) ).toBeNull();
	});

	test( 'old Slider content drops the redundant title attribute after resave', async({ editor, page }) => {
		await editor.setContent( `
<!-- wp:themeisle-blocks/slider {"images":[{"id":${ uploadedMedia.id },"url":"${ uploadedMedia.source_url }","alt":"Slide one"}],"autoplay":true,"height":"400px"} -->
<div class="wp-block-themeisle-blocks-slider glide" data-per-view="1" data-gap="0" data-peek="0" data-autoplay="true" data-height="400px" data-hide-arrows="false"><div class="glide__track" data-glide-el="track"><div class="glide__slides"><div class="wp-block-themeisle-blocks-slider-item-wrapper glide__slide" tabindex="0"><figure><img class="wp-block-themeisle-blocks-slider-item" src="${ uploadedMedia.source_url }" alt="Slide one" title="Slide one" data-id="${ uploadedMedia.id }"/></figure></div></div><div class="glide__bullets" data-glide-el="controls[nav]"><button class="glide__bullet" data-glide-dir="=0"></button></div></div></div>
<!-- /wp:themeisle-blocks/slider -->
` );

		await expect( editor.canvas.getByRole( 'button', { name: 'Attempt Block Recovery' }) ).toHaveCount( 0 );
		await expect( editor.canvas.locator( '.wp-block-themeisle-blocks-slider-item' ).first() ).toBeVisible();

		// Touch the block so the post re-serializes with the current save (no title on img).
		await selectBlockByName( page, 'themeisle-blocks/slider' );
		await page.evaluate( () => {
			const block = window.wp.data.select( 'core/block-editor' ).getSelectedBlock();

			window.wp.data.dispatch( 'core/block-editor' ).updateBlockAttributes( block.clientId, {
				hideArrows: ! block.attributes.hideArrows
			});
		});

		await publishAndViewPost({ editor, page });

		const slide = page.locator( '.wp-block-themeisle-blocks-slider-item' ).first();

		await expect( slide ).toHaveAttribute( 'alt', 'Slide one' );
		expect( await slide.getAttribute( 'title' ) ).toBeNull();
	});

	test( 'Flip Card front image renders the alt on frontend', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/flip',
			attributes: {
				frontContentType: 'image',
				frontMedia: {
					id: uploadedMedia.id,
					url: uploadedMedia.source_url,
					alt: 'Flip card image'
				}
			}
		});

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.wp-block-themeisle-blocks-flip .o-flip-front .o-img' ) ).toHaveAttribute( 'alt', 'Flip card image' );
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

		await expect( editor.canvas.getByRole( 'button', { name: 'Attempt Block Recovery' }) ).toHaveCount( 0 );
		await expect( editor.canvas.getByRole( 'document', { name: 'Block: Icon List Item' }).locator( 'img' ) ).toBeVisible();

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
