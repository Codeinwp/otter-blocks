/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Product Review Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/product-review"', async({ editor, page }) => {

		// Create a Review Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/product-review' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasReviewBlock = blocks.some( ( block ) => 'themeisle-blocks/review' === block.name );

		expect( hasReviewBlock ).toBeTruthy();
	});

	test( 'add value by typing', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/review' });

		const title = page.getByRole( 'textbox', { name: 'Name of your product…' });

		await title.type( 'Test Product' );

		// Check if the value is added in title
		expect( await title.innerHTML() ).toBe( 'Test Product' );

		const description = page.getByRole( 'textbox', { name: 'Product description or a small review…' });

		await description.type( 'Test Description' );

		// Check if the value is added in description
		expect( await description.innerHTML() ).toBe( 'Test Description' );
	});

	test( 'add a new feature', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/review' });

		/**
		 * Add a new feature
		 */

		await page.getByRole( 'button', { name: 'Product Features' }).click();
		await page.getByRole( 'button', { name: 'Add Feature' }).click();
		await page.getByRole( 'button', { name: 'Feature', exact: true }).click();

		const featureTitle = page.getByPlaceholder( 'Feature title' );

		const FEATURE_TITLE = 'Test Feature';
		const FEATURE_DESCRIPTION = 'Test Feature Description';

		// Clear the input text
		await featureTitle.fill( '' );
		await featureTitle.type( FEATURE_TITLE );
		expect( await featureTitle.inputValue() ).toBe( FEATURE_TITLE );

		const featureDescription = page.getByPlaceholder( 'Feature Description' );

		await featureDescription.type( FEATURE_DESCRIPTION );
		expect( await featureDescription.innerHTML() ).toBe( FEATURE_DESCRIPTION );

		// TODO: find a reliable way to test the rating
		// const featureRating = page.locator( 'input[aria-label="Rating"][inputmode="decimal"]' );
		// const currentValue = await featureRating.inputValue();
		// await featureRating.keyboard.press( 'ArrowDown' );
		// const newValue = await featureRating.inputValue();
		//
		// expect( currentValue ).not.toBe( newValue );


		/**
		 * Check new feature in display
		 */
		await expect( await page.getByRole( 'document', { name: 'Block: Product Review' }).getByText( FEATURE_TITLE, { exact: true }) ).toBeVisible();
		await expect( await page.getByRole( 'document', { name: 'Block: Product Review' }).getByText( FEATURE_DESCRIPTION, { exact: true }) ).toBeVisible();
	});

	test( 'open in new tab', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/review' });

		await page.getByRole( 'button', { name: 'Buttons' }).click({ clickCount: 1 });

		await page.getByRole( 'button', { name: 'Add Links' }).click();

		await page.getByRole( 'button', { name: 'Buy Now' }).click();

		await page.getByPlaceholder( 'Button label' ).fill( 'Buy Now in same tab' );
		await page.getByLabel( 'Open in New Tab' ).click();

		await page.getByRole( 'button', { name: 'Add Links' }).click();

		const postId = await editor.publishPost();

		await page.goto( `/?p=${postId}` );

		await expect( page.getByRole( 'link', { name: 'Buy Now in same tab' }) ).toHaveAttribute( 'target', '_self' );
		await expect( page.getByRole( 'link', { name: 'Buy Now', exact: true }) ).toHaveAttribute( 'target', '_blank' );

	});
});
