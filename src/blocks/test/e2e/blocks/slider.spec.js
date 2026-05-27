/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import path from 'path';

/**
 * Internal dependencies
 */
import { expectBlockByName, insertBlockBySlash, publishAndViewPost } from '../helpers/editor';

test.describe( 'Slider Block', () => {

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

	test( 'can be created by typing "/slider"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/slider',
			blockName: 'themeisle-blocks/slider'
		});
	});

	test( 'insert with images', async({ editor }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/slider',
			attributes: {
				images: [
					{
						id: uploadedMedia.id,
						url: uploadedMedia.source_url,
						alt: uploadedMedia.alt_text
					}
				]
			}
		});

		const sliderBlock = await expectBlockByName( editor, 'themeisle-blocks/slider' );

		expect( sliderBlock.attributes.images.length ).toBeGreaterThan( 0 );
	});

	test( 'check move buttons', async({ editor, page }) => {

		const images = [
			{
				id: uploadedMedia.id,
				url: uploadedMedia.source_url,
				alt: uploadedMedia.alt_text
			}
		];

		images.push( images[ 0 ]);
		images.push( images[ 0 ]);
		images.push( images[ 0 ]);

		await editor.insertBlock({
			name: 'themeisle-blocks/slider',
			attributes: {
				images
			}
		});

		const sliderBlock = await expectBlockByName( editor, 'themeisle-blocks/slider' );

		expect( sliderBlock.attributes.images.length ).toBeGreaterThan( 0 );

		// themeisle-blocks/slider opts out of the iframed canvas, so the block renders at page level.
		await page.getByRole( 'document', { name: 'Block: Image Slider' }).getByRole( 'button' ).first().click();
		await page.getByRole( 'document', { name: 'Block: Image Slider' }).getByRole( 'button' ).nth( 1 ).click();

		await expect( page.locator( 'div:nth-child(2) > figure > .wp-block-themeisle-blocks-slider-item' ) ).toBeVisible();
	});

	test( 'check frontend rendering and interaction', async({ page, editor }) => {
		const images = [
			{
				id: uploadedMedia.id,
				url: uploadedMedia.source_url,
				alt: uploadedMedia.alt_text
			}
		];

		images.push( images[ 0 ]);
		images.push( images[ 0 ]);
		images.push( images[ 0 ]);

		await editor.insertBlock({
			name: 'themeisle-blocks/slider',
			attributes: {
				images
			}
		});

		await publishAndViewPost({ editor, page });

		await expect( page.locator( '.wp-block-themeisle-blocks-slider img' ) ).toHaveCount( 4 );
		await expect( page.locator( '.glide__arrows > button:nth-child(2)' ) ).toBeVisible();

		let hasError = false;
		page.on( 'console', msg => {
			if ( 'error' === msg.type() ) {
				hasError = true;
			}
		});

		await page.locator( '.glide__arrows > button:nth-child(2)' ).click({ clickCount: 3 });

		// There should be no errors in the console after clicking the next button.
		expect( hasError ).toBeFalsy();
	});
});
