/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import {
	generateTextTransformation,
	insertAiBlock,
	setupAiBlockTest
} from '../helpers/ai-block';
import { waitForEditorReady } from '../helpers/editor';

test.describe( 'AI Block', () => {
	test.beforeEach( async({ admin, otterUtils }) => {
		await setupAiBlockTest({ otterUtils });
		await admin.createNewPost();
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOpenAiMode( 'off' );
	});

	test( 'replace action', async({ editor, page }) => {
		await insertAiBlock( editor, page );
		await generateTextTransformation( page );
		await page.getByRole( 'button', { name: 'Replace', exact: true }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		await expect( editor.canvas.getByText( 'Discover the Next Frontier' ) ).toBeVisible();
	});

	test( 'replace target block', async({ editor, page }) => {
		await waitForEditorReady( page );

		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: {
				content: 'Target Block.'
			}
		});

		const { clientId, name } = await page.evaluate( () => {
			const blocks = wp.data.select( 'core/block-editor' ).getBlocks();
			return blocks[0];
		});

		expect( name ).toBe( 'core/paragraph' );

		await insertAiBlock( editor, page, {
			replaceTargetBlock: {
				name: 'core/paragraph',
				clientId
			}
		});

		await generateTextTransformation( page );
		await page.getByRole( 'button', { name: 'Replace', exact: true }).click();

		await expect( editor.canvas.getByText( 'Target Block.' ) ).toBeHidden();
	});

	test( 'insert below action', async({ editor, page }) => {
		await insertAiBlock( editor, page );
		await generateTextTransformation( page );
		await page.getByRole( 'button', { name: 'Insert below', exact: true }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.some( block => 'themeisle-blocks/content-generator' === block.name ) ).toBe( true );
		await expect( page.getByText( 'Discover the Next Frontier' ).nth( 0 ) ).toBeVisible();
		await expect( page.getByText( 'Discover the Next Frontier' ).nth( 1 ) ).toBeVisible();
	});

	test( 'use last prompt on text transform actions from history list', async({ editor, page }) => {
		await insertAiBlock( editor, page, {
			resultHistory: [{
				result: '\u003ch2\u003eUnlock the Power of Words\u003c/h2\u003e\n\u003cp\u003eAre you ready to captivate your audience and drive conversions like never before? Let me weave magic with words that resonate, inspire, and persuade. From attention-grabbing headlines to compelling calls-to-action, I\'ve got you covered. Let\'s elevate your content and unleash its full potential.\u003c/p\u003e',
				meta: { usedToken: 380, prompt: 'Expand or elaborate on the following: Make a nice text' }
			}]
		});

		await expect( editor.canvas.getByText( 'Expand or elaborate on the following: Make a nice text' ) ).toBeVisible();
	});
});
