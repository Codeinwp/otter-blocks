/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'AI Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'replace action', async({ editor, page }) => {
		const aiBlock = await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		// Wait for the prompt list to load so embeddedPrompts is populated before "Generate".
		await page.waitForResponse( r => decodeURIComponent( r.url() ).includes( 'otter/v1/openai/prompt' ) ).catch( () => null );
		await editor.canvas.getByPlaceholder( 'Start describing what content' ).type( 'Write about Space nation on the rise.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();
		await editor.canvas.getByRole( 'button', { name: 'Replace' }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		await expect( editor.canvas.getByText( 'Discover the Next Frontier' ) ).toBeVisible();
	});

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
		const aiBlock = await editor.insertBlock({
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
		await editor.canvas.getByPlaceholder( 'Start describing what content' ).type( 'Write about Space nation on the rise.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();
		await editor.canvas.getByRole( 'button', { name: 'Replace' }).click();

		await expect( editor.canvas.getByText( 'Target Block.' ) ).toBeHidden();
	});

	test( 'insert below action', async({ editor, page }) => {
		const aiBlock = await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		await page.waitForResponse( r => decodeURIComponent( r.url() ).includes( 'otter/v1/openai/prompt' ) ).catch( () => null );
		await editor.canvas.getByPlaceholder( 'Start describing what content' ).type( 'Write about Space nation on the rise.' );
		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();
		await editor.canvas.getByRole( 'button', { name: 'Insert below' }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.some( block => 'themeisle-blocks/content-generator' === block.name ) ).toBe( true ); // The block is still present.
		await expect( editor.canvas.getByText( 'Discover the Next Frontier' ).nth( 0 ) ).toBeVisible(); // The header in the AI block content.
		await expect( editor.canvas.getByText( 'Discover the Next Frontier' ).nth( 1 ) ).toBeVisible(); // The header inserted below.
	});

	test( 'use last prompt on text transform actions from history list', async({ editor, page }) => {
		const aiBlock = await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation',
				resultHistory: [{ result: '\u003ch2\u003eUnlock the Power of Words\u003c/h2\u003e\n\u003cp\u003eAre you ready to captivate your audience and drive conversions like never before? Let me weave magic with words that resonate, inspire, and persuade. From attention-grabbing headlines to compelling calls-to-action, I\'ve got you covered. Let\'s elevate your content and unleash its full potential.\u003c/p\u003e', meta: { usedToken: 380, prompt: 'Expand or elaborate on the following: Make a nice text' }}]
			}
		});

		await expect( editor.canvas.getByText( 'Expand or elaborate on the following: Make a nice text' ) ).toBeVisible();
	});
});
