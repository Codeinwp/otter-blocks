/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import path from 'path';

test.describe( 'Slider Block', () => {

	let uploadedMedia;

	test.beforeAll( async({ requestUtils }) => {
		await requestUtils.deleteAllMedia();

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

	test.afterEach( async({ requestUtils }) => {
		await requestUtils.deleteAllPosts();
	});

	test.afterAll( async({ requestUtils }) => {
		await requestUtils.deleteAllMedia();
	});

	test( 'can be created by typing "/slider"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/slider' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasSlider = blocks.some( ( block ) => 'themeisle-blocks/slider' === block.name );

		expect( hasSlider ).toBeTruthy();
	});

	test( 'insert with images', async({ editor, page }) => {
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

		const sliderBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/slider' === block.name );

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
				images: images
			}
		});

		const sliderBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/slider' === block.name );

		expect( sliderBlock.attributes.images.length ).toBeGreaterThan( 0 );

		await page.getByRole( 'document', { name: 'Block: Slider' }).getByRole( 'button' ).first().click();
		await page.getByRole( 'document', { name: 'Block: Slider' }).getByRole( 'button' ).nth( 1 ).click();

		await expect( page.locator( 'div:nth-child(2) > figure > .wp-block-themeisle-blocks-slider-item' ) ).toBeVisible();
	});
});
