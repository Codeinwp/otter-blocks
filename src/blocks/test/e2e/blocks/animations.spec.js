/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';

test.describe( 'Animations', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'nested animated block plays on load inside a transform-animated parent', async({ editor, page }) => {
		
		await page.setViewportSize({ width: 1280, height: 900 });

		await editor.insertBlock({
			name: 'core/cover',
			attributes: {
				overlayColor: 'black',
				dimRatio: 100,
				minHeight: 800,
				contentPosition: 'top center',
				className: 'animated slideInDown'
			},
			innerBlocks: [
				{
					name: 'core/heading',
					attributes: {
						content: 'Nested Animated Heading',
						className: 'animated fadeInLeft delay-1s'
					}
				}
			]
		});

		await publishAndViewPost({ editor, page });

		// Without any scrolling, the nested heading must animate in after its delay.
		await expect( page.getByText( 'Nested Animated Heading' ) ).toBeVisible({ timeout: 10000 });
	});

	test( 'can add a typing animation"', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Magna mollis sed ipsum convallis tellus donec. Maximus ligula nostra fusce inceptos in fermentum phasellus. Ante sollicitudin euismod ultrices nullam etiam eu. Himenaeos si ridiculus suscipit velit donec dui tristique. Habitant auctor ridiculus a consectetuer nisi volutpat magnis sed enim lacus. Quisque habitant litora sodales turpis montes.'
			}
		});

		const box = await editor.canvas.getByRole( 'document', { name: 'Block: Paragraph' }).boundingBox();

		// Select a text inside the paragraph block.
		await page.mouse.move( box.x + 10, box.y + 10 );
		await page.mouse.down();
		await page.mouse.move( box.x + box.width - 50, box.y + box.height - 100 );
		await page.mouse.up();

		await page.getByLabel( 'More' ).click();

		await page.getByRole( 'menuitem', { name: 'Typing Animation' }).click();

		await expect( editor.canvas.getByLabel( 'Block: Paragraph' ).locator( 'o-anim-typing' ).first() ).toBeVisible();
	});

	test( 'add simple animation', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Magna mollis sed ipsum convallis tellus donec. Maximus ligula nostra fusce inceptos in fermentum phasellus. Ante sollicitudin euismod ultrices nullam etiam eu. Himenaeos si ridiculus suscipit velit donec dui tristique. Habitant auctor ridiculus a consectetuer nisi volutpat magnis sed enim lacus. Quisque habitant litora sodales turpis montes.'
			}
		});

		// Animations is enabled by default for all blocks (managed via "Manage Default Tools").

		// Open the animation panel.
		await page.getByRole( 'button', { name: 'Animations' }).click();

		// Select an animation — the "None" picker uses a custom button (no aria-role).
		await page.locator( '.o-animations-control__button' ).click();
		await page.getByRole( 'menuitem', { name: 'Head Shake' }).click();

		// Select a delay
		await page.getByRole( 'combobox', { name: 'Delay' }).selectOption( 'delay-500ms' );

		// Select a speed
		await page.getByRole( 'combobox', { name: 'Speed' }).selectOption( 'slower' );

		// Check the CSS classes.
		await expect( editor.canvas.locator( '.headShake' ).first() ).toBeVisible();
		await expect( editor.canvas.locator( '.delay-500ms' ).first() ).toBeVisible();
		await expect( editor.canvas.locator( '.slower' ).first() ).toBeVisible();
	});

	test( 'add simple animation with custom values', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Magna mollis sed ipsum convallis tellus donec. Maximus ligula nostra fusce inceptos in fermentum phasellus. Ante sollicitudin euismod ultrices nullam etiam eu. Himenaeos si ridiculus suscipit velit donec dui tristique. Habitant auctor ridiculus a consectetuer nisi volutpat magnis sed enim lacus. Quisque habitant litora sodales turpis montes.'
			}
		});

		// Animations is enabled by default for all blocks (managed via "Manage Default Tools").

		// Open the animation panel.
		await page.getByRole( 'button', { name: 'Animations' }).click();

		// Select an animation — the "None" picker uses a custom button (no aria-role).
		await page.locator( '.o-animations-control__button' ).click();
		await page.getByRole( 'menuitem', { name: 'Head Shake' }).click();

		// Select a delay. The custom delay/speed UnitControls are both labelled
		// "Value"; only the delay one exists at this point.
		await page.getByRole( 'combobox', { name: 'Delay' }).selectOption( 'o-anim-custom-delay' );
		await page.getByRole( 'spinbutton', { name: 'Value' }).fill( '2' );

		// Select a speed — its "Value" input renders after the delay one.
		await page.getByRole( 'combobox', { name: 'Speed' }).selectOption( 'o-anim-custom-speed' );
		await page.getByRole( 'spinbutton', { name: 'Value' }).last().fill( '2' );

		// Check the CSS classes.
		await expect( editor.canvas.locator( '.headShake' ).first() ).toBeVisible();
		await expect( editor.canvas.locator( '.o-anim-custom-delay.o-anim-value-delay-2s' ).first() ).toBeVisible();
		await expect( editor.canvas.locator( '.o-anim-custom-speed.o-anim-value-speed-2s' ).first() ).toBeVisible();
	});
});
