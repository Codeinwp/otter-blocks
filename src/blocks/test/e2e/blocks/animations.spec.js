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

		expect( page.getByLabel( 'Paragraph block' ).locator( 'o-anim-typing' ).first() ).toBeTruthy();
		expect( page.getByLabel( 'Paragraph block' ).locator( '.o-typing-delay-500ms' ).first() ).toBeTruthy();
	});
});
