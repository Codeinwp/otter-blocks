/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

const SECTION_PLACEHOLDER = 'e.g. A hero section for a dental clinic with a heading and two buttons';

test.describe( 'AI Block', () => {
	test.beforeEach( async({ admin, otterUtils }) => {
		// The content-generator block renders an enable-gate (no prompt field)
		// unless the Atomic Wind blocks it builds with are registered.
		await otterUtils.setAtomicWindBlocks( true );
		await admin.createNewPost();
	} );

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setAtomicWindBlocks( false );
	} );

	test( 'replace action', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		await page.waitForResponse( r => decodeURIComponent( r.url() ).includes( 'otter/v1/openai/prompt' ) ).catch( () => null );
		await editor.canvas.getByPlaceholder( SECTION_PLACEHOLDER ).fill( 'Write about Space nation on the rise.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const insertButton = dialog.getByRole( 'button', { name: 'Insert section' });
		await expect( insertButton ).toBeEnabled({ timeout: 30000 });
		await insertButton.click();

		const blocks = await editor.getBlocks();

		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		// The deterministic mock builds a multi-column section that repeats the
		// headline, so match the first occurrence rather than a single element.
		await expect( editor.canvas.getByText( 'Discover the Next Frontier' ).first() ).toBeVisible();
	} );

	test( 'replace target block', async({ editor, page }) => {

		// Create target blocks.
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Target Block.'
			}
		});
		const { clientId, name } = await page.evaluate( () => {
			const blocks = wp.data.select( 'core/block-editor' ).getBlocks();
			return blocks[ 0 ];
		});

		expect( name ).toBe( 'core/paragraph' );

		// Create the AI Block linked to the target block.
		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation',
				replaceTargetBlock: {
					name: 'core/paragraph',
					clientId
				}
			}
		});

		await page.waitForResponse( r => decodeURIComponent( r.url() ).includes( 'otter/v1/openai/prompt' ) ).catch( () => null );
		await editor.canvas.getByPlaceholder( SECTION_PLACEHOLDER ).fill( 'Write about Space nation on the rise.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		const dialog = page.getByRole( 'dialog' );
		const insertButton = dialog.getByRole( 'button', { name: 'Insert section' });
		await expect( insertButton ).toBeEnabled({ timeout: 30000 });
		await insertButton.click();

		await expect( editor.canvas.getByText( 'Target Block.' ) ).toBeHidden();
	} );
} );
