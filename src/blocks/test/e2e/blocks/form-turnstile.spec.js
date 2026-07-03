/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { getBlockByName, expectBlockByName, publishAndViewPost } from '../helpers/editor';
import { getFormClientId, insertContactForm, insertFormCaptchaBlock } from '../helpers/forms';

const CAPTCHA_BLOCK = 'themeisle-blocks/form-captcha';

test.describe( 'Form Block - Captcha block', () => {

	test.beforeEach( async({ admin, otterUtils }) => {
		await otterUtils.setOptions({
			themeisle_cloudflare_turnstile_site_key: 'turnstile-sitekey',
			themeisle_cloudflare_turnstile_secret_key: 'turnstile-secret'
		});

		await admin.createNewPost();
	});

	test( 'renders and submits with Cloudflare Turnstile captcha', async({ editor, page }) => {
		await page.route( '**/turnstile/v0/api.js*', async( route ) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/javascript',
				body: `
					window.turnstile = {
						render: ( node, options ) => {
							node.setAttribute( 'data-turnstile-rendered', '1' );
							node.textContent = 'Turnstile widget';
							options.callback( 'turnstile-token' );
							return 'widget-1';
						},
						reset: () => {}
					};
				`
			});
		});

		await insertContactForm({ editor, page });

		const formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );
		const formId = formBlock?.attributes?.id;
		expect( formId ).toBeTruthy();

		const formClientId = await getFormClientId( page );
		expect( formClientId ).toBeTruthy();

		await insertFormCaptchaBlock( page, formClientId, 'turnstile' );

		await expect.poll( async() => {
			const form = await getBlockByName( editor, 'themeisle-blocks/form' );
			return form?.innerBlocks?.filter( ({ name }) => CAPTCHA_BLOCK === name )?.length;
		}).toBe( 1 );

		await publishAndViewPost({ editor, page });

		await expect( page.locator( `#${formId} .o-form-captcha[data-captcha-provider="turnstile"]` ) ).toBeAttached();
		await expect( page.locator( `#${formId} [data-turnstile-rendered=\"1\"]` ) ).toBeVisible();

		const requiredInputs = page.locator( `#${formId} input[required], #${formId} textarea[required]` );
		const requiredCount = await requiredInputs.count();

		for ( let i = 0; i < requiredCount; i++ ) {
			const input = requiredInputs.nth( i );
			const type = await input.getAttribute( 'type' );

			if ( 'email' === type ) {
				await input.fill( 'ada@example.com' );
			} else {
				await input.fill( 'Test value' );
			}
		}

		// Avoid triggering server-side anti-bot validation (Form_Server::ANTI_SPAM_TIMEOUT is 5s).
		await page.waitForTimeout( 6000 );

		await page.getByRole( 'button', { name: 'Submit' }).click();

		await expect( page.locator( `#${formId} .o-form-server-response.o-success` ) ).toBeVisible({ timeout: 15000 });
	});

	test( 'keeps a single Captcha block per form', async({ editor, page }) => {
		await insertContactForm({ editor, page });

		await expectBlockByName( editor, 'themeisle-blocks/form' );

		const formClientId = await getFormClientId( page );
		expect( formClientId ).toBeTruthy();

		await insertFormCaptchaBlock( page, formClientId, 'turnstile' );
		await insertFormCaptchaBlock( page, formClientId, 'recaptcha' );

		// The Form block removes every Captcha block beyond the first.
		await expect.poll( async() => {
			const form = await getBlockByName( editor, 'themeisle-blocks/form' );
			return form?.innerBlocks?.filter( ({ name }) => CAPTCHA_BLOCK === name )?.length;
		}).toBe( 1 );
	});
});
