/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Animations', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can add a typing animation"', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Magna mollis sed ipsum convallis tellus donec. Maximus ligula nostra fusce inceptos in fermentum phasellus. Ante sollicitudin euismod ultrices nullam etiam eu. Himenaeos si ridiculus suscipit velit donec dui tristique. Habitant auctor ridiculus a consectetuer nisi volutpat magnis sed enim lacus. Quisque habitant litora sodales turpis montes.'
			}
		});

		const box = await page.getByLabel( 'Paragraph block' ).boundingBox();

		// Select a text inside the paragraph block.
		await page.mouse.move( box.x + 10, box.y + 10 );
		await page.mouse.down();
		await page.mouse.move( box.x + box.width - 50, box.y + box.height - 100 );
		await page.mouse.up();

		await page.getByLabel( 'More' ).click();

		await page.getByRole( 'menuitem', { name: 'Typing Animation' }).click();

		await expect( page.getByLabel( 'Paragraph block' ).locator( 'o-anim-typing' ).first() ).toBeVisible();
		await expect( page.getByLabel( 'Paragraph block' ).locator( '.o-typing-delay-500ms' ).first() ).toBeVisible();
	});

	test( 'add simple animation', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Magna mollis sed ipsum convallis tellus donec. Maximus ligula nostra fusce inceptos in fermentum phasellus. Ante sollicitudin euismod ultrices nullam etiam eu. Himenaeos si ridiculus suscipit velit donec dui tristique. Habitant auctor ridiculus a consectetuer nisi volutpat magnis sed enim lacus. Quisque habitant litora sodales turpis montes.'
			}
		});

		// Activate
		await page.getByRole( 'button', { name: 'Block Tools options' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Show Animations' }).click();
		await page.getByRole( 'button', { name: 'Block Tools options' }).click();

		// Open the animation panel.
		await page.getByRole( 'button', { name: 'Animations' }).click();

		// Select an animation
		await page.getByRole( 'button', { name: 'None' }).click();
		await page.getByRole( 'menuitem', { name: 'Head Shake' }).click();

		// Select a delay
		await page.getByRole( 'combobox', { name: 'Delay' }).selectOption( 'delay-500ms' );

		// Select a speed
		await page.getByRole( 'combobox', { name: 'Speed' }).selectOption( 'slower' );

		// Check the CSS classes.
		await expect( page.locator( '.headShake' ).first() ).toBeVisible();
		await expect( page.locator( '.delay-500ms' ).first() ).toBeVisible();
		await expect( page.locator( '.slower' ).first() ).toBeVisible();
	});

	test( 'add simple animation with custom values', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Magna mollis sed ipsum convallis tellus donec. Maximus ligula nostra fusce inceptos in fermentum phasellus. Ante sollicitudin euismod ultrices nullam etiam eu. Himenaeos si ridiculus suscipit velit donec dui tristique. Habitant auctor ridiculus a consectetuer nisi volutpat magnis sed enim lacus. Quisque habitant litora sodales turpis montes.'
			}
		});

		// Activate
		await page.getByRole( 'button', { name: 'Block Tools options' }).click();
		await page.getByRole( 'menuitemcheckbox', { name: 'Show Animations' }).click();
		await page.getByRole( 'button', { name: 'Block Tools options' }).click();

		// Open the animation panel.
		await page.getByRole( 'button', { name: 'Animations' }).click();

		// Select an animation
		await page.getByRole( 'button', { name: 'None' }).click();
		await page.getByRole( 'menuitem', { name: 'Head Shake' }).click();

		// Select a delay
		await page.getByRole( 'combobox', { name: 'Delay' }).selectOption( 'o-anim-custom-delay' );
		await page.locator( '#inspector-input-control-0' ).fill( '2' );

		// Select a speed
		await page.getByRole( 'combobox', { name: 'Speed' }).selectOption( 'o-anim-custom-speed' );
		await page.locator( '#inspector-input-control-1' ).fill( '2' );

		// Check the CSS classes.
		await expect( page.locator( '.headShake' ).first() ).toBeVisible();
		await expect( page.locator( '.o-anim-custom-delay.o-anim-value-delay-2s' ).first() ).toBeVisible();
		await expect( page.locator( '.o-anim-custom-speed.o-anim-value-speed-2s' ).first() ).toBeVisible();
	});
});
