import { addCaptchaOnPage } from '../../frontend/form/captcha';

describe( 'Form captcha', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
		delete window.themeisleGutenberg;
		delete window.grecaptcha;
		delete window.turnstile;

		window.themeisleGutenbergForm = {
			reRecaptchaSitekey: 'recaptcha-sitekey',
			reRecaptchaAPIURL: 'https://www.google.com/recaptcha/api.js',
			turnstileSitekey: 'turnstile-sitekey',
			turnstileAPIURL: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
		};
	} );

	it( 'renders Turnstile when provider is turnstile', () => {
		const form = document.createElement( 'div' );
		form.id = 'form-1';
		form.className = 'wp-block-themeisle-blocks-form has-captcha';
		form.dataset.captchaProvider = 'turnstile';

		const container = document.createElement( 'div' );
		container.className = 'otter-form__container';

		const fieldNode = document.createElement( 'div' );
		fieldNode.className = 'field';

		const buttonNode = document.createElement( 'div' );
		buttonNode.className = 'wp-block-button';

		container.appendChild( fieldNode );
		container.appendChild( buttonNode );
		form.appendChild( container );
		document.body.appendChild( form );

		window.turnstile = {
			render: jest.fn( ( node, options ) => {
				options.callback( 'turnstile-token' );
				return 'widget-1';
			} ),
			reset: jest.fn()
		};

		addCaptchaOnPage( [ form ] );

		expect( window.turnstile.render ).toHaveBeenCalled();
		expect( window.themeisleGutenberg.tokens['form-1'].token ).toBe( 'turnstile-token' );

		window.themeisleGutenberg.tokens['form-1'].reset();
		expect( window.turnstile.reset ).toHaveBeenCalledWith( 'widget-1' );
	} );

	it( 'injects the Turnstile script with an id that does not shadow window.turnstile', () => {
		// Regression: an element with id="turnstile" is exposed as the global
		// `window.turnstile`, which shadows Cloudflare's API and makes api.js
		// believe Turnstile was already loaded, so `render` is never installed.
		const form = document.createElement( 'div' );
		form.id = 'form-id';
		form.className = 'wp-block-themeisle-blocks-form has-captcha';
		form.dataset.captchaProvider = 'turnstile';

		const container = document.createElement( 'div' );
		container.className = 'otter-form__container';
		container.appendChild( document.createElement( 'div' ) );
		form.appendChild( container );
		document.body.appendChild( form );

		addCaptchaOnPage( [ form ] );

		const injected = document.querySelector(
			'script[src*="challenges.cloudflare.com/turnstile"]'
		);
		expect( injected ).not.toBeNull();
		expect( injected.id ).not.toBe( 'turnstile' );
		expect( document.getElementById( 'turnstile' ) ).toBeNull();
	} );

	it( 'does not inject a second Turnstile script when one is already on the page', () => {
		const form = document.createElement( 'div' );
		form.id = 'form-dup';
		form.className = 'wp-block-themeisle-blocks-form has-captcha';
		form.dataset.captchaProvider = 'turnstile';

		const container = document.createElement( 'div' );
		container.className = 'otter-form__container';
		container.appendChild( document.createElement( 'div' ) );
		form.appendChild( container );
		document.body.appendChild( form );

		// Simulate Turnstile's api.js already loaded by another source.
		const thirdParty = document.createElement( 'script' );
		thirdParty.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		document.body.appendChild( thirdParty );

		addCaptchaOnPage( [ form ] );

		const turnstileScripts = document.querySelectorAll(
			'script[src*="challenges.cloudflare.com/turnstile"]'
		);
		expect( turnstileScripts ).toHaveLength( 1 );
		expect( document.getElementById( 'otter-turnstile-script' ) ).toBeNull();
	} );

	it( 'renders reCaptcha when provider is recaptcha', () => {
		const form = document.createElement( 'div' );
		form.id = 'form-2';
		form.className = 'wp-block-themeisle-blocks-form has-captcha';
		form.dataset.captchaProvider = 'recaptcha';

		const container = document.createElement( 'div' );
		container.className = 'otter-form__container';

		const fieldNode = document.createElement( 'div' );
		fieldNode.className = 'field';

		const buttonNode = document.createElement( 'div' );
		buttonNode.className = 'wp-block-button';

		container.appendChild( fieldNode );
		container.appendChild( buttonNode );
		form.appendChild( container );
		document.body.appendChild( form );

		window.grecaptcha = {
			render: jest.fn( ( node, options ) => {
				options.callback( 'recaptcha-token' );
				return 123;
			} ),
			reset: jest.fn()
		};

		addCaptchaOnPage( [ form ] );

		expect( window.grecaptcha.render ).toHaveBeenCalled();
		expect( window.themeisleGutenberg.tokens['form-2'].token ).toBe( 'recaptcha-token' );

		window.themeisleGutenberg.tokens['form-2'].reset();
		expect( window.grecaptcha.reset ).toHaveBeenCalledWith( 123 );
	} );
} );

