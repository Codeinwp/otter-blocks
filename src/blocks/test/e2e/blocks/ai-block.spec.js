/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'AI Block', () => {
	test.beforeEach( async({ admin, page }) => {

		// Mock the api response of the otter/v1/generate endpoint for `textTransformation`.
		await page.route( '**/index.php?rest_route=%2Fotter%2Fv1%2Fgenerate&_locale=user', async( route ) => {

			const request = route.request();
			if ( 'POST' !== request.method() ) {
				return route.continue();
			}

			const postData = JSON.parse( request.postData() );
			if ( 'textTransformation::otter_action_prompt' !== postData.otter_used_action ) {
				return route.continue();
			}

			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(
					{
						'id': 'chatcmpl-9oWud5dugI37NCO4ZIUFH2GRFJ9Z4',
						'object': 'chat.completion',
						'created': 1721829943,
						'model': 'gpt-3.5-turbo-0125',
						'choices': [
							{
								'index': 0,
								'message': {
									'role': 'assistant',
									'content': '<h1><strong>Discover the Next Frontier: Space Nation on the Rise<\/strong><\/h1>\n\n<p>Are you ready to embark on a journey to a new world beyond our wildest dreams? Look no further than the rapidly emerging Space Nation that is captivating the imaginations of millions. From groundbreaking technologies to bold explorations, this cosmic civilization is redefining what it means to reach for the stars.<\/p>\n\n<h2><em>Unveiling the Wonders of Space Nation<\/em><\/h2>\n\n<p>Peer into the future and witness the awe-inspiring advancements taking place in this celestial realm. With each innovation, Space Nation pushes the boundaries of possibility, offering a glimpse into a future where the impossible becomes reality.<\/p>\n\n<h2><em>Join the Movement<\/em><\/h2>\n\n<p>Don\'t miss your chance to be part of history in the making. Whether you are an aspiring pioneer or a curious observer, there is a place for you in the unfolding saga of Space Nation. Embrace the spirit of exploration and venture into a realm where the skies are no longer the limit.<\/p>\n\n<h3><strong>Why Space Nation?<\/strong><\/h3>\n\n<ul>\n  <li>Experience groundbreaking technologies shaping the future<\/li>\n  <li>Witness bold explorations into the unknown<\/li>\n  <li>Join a community of visionaries and trailblazers<\/li>\n<\/ul>\n\n<h3><strong>Take Action Today<\/strong><\/h3>\n\n<p>Ready to embark on an adventure that transcends the confines of Earth? Step into the world of Space Nation and dare to dream beyond the stars.<\/p>'
								},
								'logprobs': null,
								'finish_reason': 'stop'
							}
						],
						'usage': {
							'prompt_tokens': 331,
							'completion_tokens': 338,
							'total_tokens': 669
						},
						'system_fingerprint': null
					}
				)
			});
		});

		await admin.createNewPost();
	});

	test( 'replace action', async({ editor, page }) => {
		const aiBlock = await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		await page.getByPlaceholder( 'Start describing what content' ).type( 'Write about Space nation on the rise.' );
		await page.getByRole( 'button', { name: 'Generate' }).click();
		await page.getByRole( 'button', { name: 'Replace' }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		await expect( page.getByText( 'Discover the Next Frontier' ) ).toBeVisible();
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

		await page.getByPlaceholder( 'Start describing what content' ).type( 'Write about Space nation on the rise.' );
		await page.getByRole( 'button', { name: 'Generate' }).click();
		await page.getByRole( 'button', { name: 'Replace' }).click();

		await expect( page.getByText( 'Target Block.' ) ).toBeHidden();
	});

	test( 'insert below action', async({ editor, page }) => {
		const aiBlock = await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation'
			}
		});

		await page.getByPlaceholder( 'Start describing what content' ).type( 'Write about Space nation on the rise.' );
		await page.getByRole( 'button', { name: 'Generate' }).click();
		await page.getByRole( 'button', { name: 'Insert below' }).click();

		const blocks = await editor.getBlocks();

		expect( blocks.some( block => 'themeisle-blocks/content-generator' === block.name ) ).toBe( true ); // The block is still present.
		await expect( page.getByText( 'Discover the Next Frontier' ).nth( 0 ) ).toBeVisible(); // The header in the AI block content.
		await expect( page.getByText( 'Discover the Next Frontier' ).nth( 1 ) ).toBeVisible(); // The header inserted below.
	});

	test( 'use last prompt on text transform actions from history list', async({ editor, page }) => {
		const aiBlock = await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'textTransformation',
				resultHistory: [{ result: '\u003ch2\u003eUnlock the Power of Words\u003c/h2\u003e\n\u003cp\u003eAre you ready to captivate your audience and drive conversions like never before? Let me weave magic with words that resonate, inspire, and persuade. From attention-grabbing headlines to compelling calls-to-action, I\'ve got you covered. Let\'s elevate your content and unleash its full potential.\u003c/p\u003e', meta: { usedToken: 380, prompt: 'Expand or elaborate on the following: Make a nice text' }}]
			}
		});

		await expect( page.getByText( 'Expand or elaborate on the following: Make a nice text' ) ).toBeVisible();
	});
});
