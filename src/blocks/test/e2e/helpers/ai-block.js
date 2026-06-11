/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { waitForEditorReady } from './editor';

export const MOCK_GENERATE_RESPONSE = {
	id: 'chatcmpl-9oWud5dugI37NCO4ZIUFH2GRFJ9Z4',
	object: 'chat.completion',
	created: 1721829943,
	model: 'gpt-3.5-turbo-0125',
	choices: [
		{
			index: 0,
			message: {
				role: 'assistant',
				content: '<h1><strong>Discover the Next Frontier: Space Nation on the Rise</strong></h1>\n\n<p>Are you ready to embark on a journey to a new world beyond our wildest dreams? Look no further than the rapidly emerging Space Nation that is captivating the imaginations of millions. From groundbreaking technologies to bold explorations, this cosmic civilization is redefining what it means to reach for the stars.</p>\n\n<h2><em>Unveiling the Wonders of Space Nation</em></h2>\n\n<p>Peer into the future and witness the awe-inspiring advancements taking place in this celestial realm. With each innovation, Space Nation pushes the boundaries of possibility, offering a glimpse into a future where the impossible becomes reality.</p>\n\n<h2><em>Join the Movement</em></h2>\n\n<p>Don\'t miss your chance to be part of history in the making. Whether you are an aspiring pioneer or a curious observer, there is a place for you in the unfolding saga of Space Nation. Embrace the spirit of exploration and venture into a realm where the skies are no longer the limit.</p>\n\n<h3><strong>Why Space Nation?</strong></h3>\n\n<ul>\n  <li>Experience groundbreaking technologies shaping the future</li>\n  <li>Witness bold explorations into the unknown</li>\n  <li>Join a community of visionaries and trailblazers</li>\n</ul>\n\n<h3><strong>Take Action Today</strong></h3>\n\n<p>Ready to embark on an adventure that transcends the confines of Earth? Step into the world of Space Nation and dare to dream beyond the stars.</p>'
			},
			logprobs: null,
			finish_reason: 'stop'
		}
	],
	usage: {
		prompt_tokens: 331,
		completion_tokens: 338,
		total_tokens: 669
	},
	system_fingerprint: null
};

/**
 * Seed prompts/API key and stub OpenAI REST routes for deterministic AI block tests.
 *
 * @param {import('@playwright/test').Page} page       The page.
 * @param {import('../fixtures').OtterUtils} otterUtils The Otter E2E helpers.
 * @return {Promise<void>}
 */
export async function setupAiBlockTest({ otterUtils }) {
	await otterUtils.seedPrompts();
	await otterUtils.setOpenAiMode( 'stub' );
}

/**
 * Wait until the AI prompt UI is ready to accept input.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @return {Promise<void>}
 */
export async function waitForAiPromptUi( page ) {
	await expect(
		page.getByPlaceholder( 'Start describing what content' )
	).toBeVisible({ timeout: 15_000 });
}

/**
 * Insert a content-generator block and wait until its prompt UI is ready.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor The editor utils.
 * @param {import('@playwright/test').Page}                        page   The page.
 * @param {Record<string, unknown>}                                attributes Block attributes.
 * @return {Promise<void>}
 */
export async function insertAiBlock( editor, page, attributes = {}) {
	const promptsReady = page.waitForResponse(
		response => response.url().includes( '/otter/v1/openai/prompt' ) && response.ok(),
		{ timeout: 15_000 }
	).catch( () => null );

	await waitForEditorReady( page );

	await editor.insertBlock({
		name: 'themeisle-blocks/content-generator',
		attributes: {
			promptID: 'textTransformation',
			...attributes
		}
	});

	await Promise.race([
		promptsReady,
		waitForAiPromptUi( page )
	]);
}

/**
 * Run a text-transformation prompt and wait until post-generate actions are available.
 *
 * @param {import('@playwright/test').Page} page   The page.
 * @param {string}                          prompt The user prompt.
 * @return {Promise<void>}
 */
export async function generateTextTransformation( page, prompt = 'Write about Space nation on the rise.' ) {
	await waitForAiPromptUi( page );

	const input = page.getByPlaceholder( 'Start describing what content' );
	const generateButton = page.getByRole( 'button', { name: 'Generate', exact: true });

	await input.click();
	await input.pressSequentially( prompt, { delay: 10 });
	await expect( generateButton ).toBeEnabled({ timeout: 5_000 });
	await generateButton.click();

	// Action buttons render only after resultHistory is populated.
	await expect( page.getByRole( 'button', { name: 'Replace', exact: true }) ).toBeVisible({ timeout: 30_000 });
}
