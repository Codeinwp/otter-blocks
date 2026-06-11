import { addCaptchaOnPage } from '../../frontend/form/captcha';

/**
 * Build a form container like the saved Form block markup.
 *
 * @param {string}  id              The form id.
 * @param {Object}  options         Options.
 * @param {boolean} options.legacy  Add the legacy `has-captcha` class.
 * @param {string}  options.provider Add a Captcha block container with the given provider.
 * @return {HTMLDivElement} The form node, attached to the document.
 */
const createForm = ( id, { legacy = false, provider = null } = {}) => {
	const form = document.createElement( 'div' );
	form.id = id;
	form.className = 'wp-block-themeisle-blocks-form' + ( legacy ? ' has-captcha' : '' );

	const container = document.createElement( 'div' );
	container.className = 'otter-form__container';

	const fieldNode = document.createElement( 'div' );
	fieldNode.className = 'field';
	container.appendChild( fieldNode );

	if ( provider ) {

		// The mount node rendered by the Captcha block (dynamic, PHP).
		const captchaNode = document.createElement( 'div' );
		captchaNode.className = 'o-form-captcha';
		captchaNode.dataset.captchaProvider = provider;
		container.appendChild( captchaNode );
	}

	const buttonNode = document.createElement( 'div' );
	buttonNode.className = 'wp-block-button';
	container.appendChild( buttonNode );

	form.appendChild( container );
	document.body.appendChild( form );

	return form;
};

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

	it( 'renders Turnstile inside the Captcha block container', () => {
		const form = createForm( 'form-1', { provider: 'turnstile' });
		const captchaNode = form.querySelector( '.o-form-captcha' );

		window.turnstile = {
			render: jest.fn( ( node, options ) => {
				options.callback( 'turnstile-token' );
				return 'widget-1';
			} ),
			reset: jest.fn()
		};

		addCaptchaOnPage( [ form ] );

		expect( window.turnstile.render ).toHaveBeenCalledWith( captchaNode, expect.any( Object ) );
		expect( window.themeisleGutenberg.tokens['form-1'].token ).toBe( 'turnstile-token' );

		window.themeisleGutenberg.tokens['form-1'].reset();
		expect( window.turnstile.reset ).toHaveBeenCalledWith( 'widget-1' );
	} );

	it( 'injects the Turnstile script with an id that does not shadow window.turnstile', () => {
		// Regression: an element with id="turnstile" is exposed as the global
		// `window.turnstile`, which shadows Cloudflare's API and makes api.js
		// believe Turnstile was already loaded, so `render` is never installed.
		const form = createForm( 'form-id', { provider: 'turnstile' });

		addCaptchaOnPage( [ form ] );

		const injected = document.querySelector(
			'script[src*="challenges.cloudflare.com/turnstile"]'
		);
		expect( injected ).not.toBeNull();
		expect( injected.id ).not.toBe( 'turnstile' );
		expect( document.getElementById( 'turnstile' ) ).toBeNull();
	} );

	it( 'does not inject a second Turnstile script when one is already on the page', () => {
		const form = createForm( 'form-dup', { provider: 'turnstile' });

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

	it( 'renders reCaptcha inside the Captcha block container', () => {
		const form = createForm( 'form-2', { provider: 'recaptcha' });
		const captchaNode = form.querySelector( '.o-form-captcha' );

		window.grecaptcha = {
			render: jest.fn( ( node, options ) => {
				options.callback( 'recaptcha-token' );
				return 123;
			} ),
			reset: jest.fn()
		};

		addCaptchaOnPage( [ form ] );

		expect( window.grecaptcha.render ).toHaveBeenCalledWith( captchaNode, expect.any( Object ) );
		expect( window.themeisleGutenberg.tokens['form-2'].token ).toBe( 'recaptcha-token' );

		window.themeisleGutenberg.tokens['form-2'].reset();
		expect( window.grecaptcha.reset ).toHaveBeenCalledWith( 123 );
	} );

	it( 'renders reCaptcha for legacy forms with the has-captcha class', () => {
		const form = createForm( 'form-legacy', { legacy: true });

		window.grecaptcha = {
			render: jest.fn( () => 7 ),
			reset: jest.fn()
		};

		addCaptchaOnPage( [ form ] );

		expect( window.grecaptcha.render ).toHaveBeenCalled();

		// Legacy behavior appends the mount node before the submit area.
		const container = form.querySelector( '.otter-form__container' );
		const mountNode = window.grecaptcha.render.mock.calls[0][0];
		expect( container.contains( mountNode ) ).toBe( true );
	} );

	it( 'prefers the Captcha block container over a stale legacy class', () => {
		const form = createForm( 'form-mixed', { legacy: true, provider: 'turnstile' });
		const captchaNode = form.querySelector( '.o-form-captcha' );

		window.grecaptcha = {
			render: jest.fn(),
			reset: jest.fn()
		};
		window.turnstile = {
			render: jest.fn( () => 'widget-2' ),
			reset: jest.fn()
		};

		addCaptchaOnPage( [ form ] );

		expect( window.turnstile.render ).toHaveBeenCalledWith( captchaNode, expect.any( Object ) );
		expect( window.grecaptcha.render ).not.toHaveBeenCalled();
	} );

	it( 'ignores Captcha block containers that belong to nested forms', () => {
		const form = createForm( 'form-outer', { legacy: true });
		const container = form.querySelector( '.otter-form__container' );

		// A nested form with its own Captcha block.
		const innerForm = document.createElement( 'div' );
		innerForm.className = 'wp-block-themeisle-blocks-form';
		const innerContainer = document.createElement( 'div' );
		innerContainer.className = 'otter-form__container';
		const innerCaptcha = document.createElement( 'div' );
		innerCaptcha.className = 'o-form-captcha';
		innerCaptcha.dataset.captchaProvider = 'turnstile';
		innerContainer.appendChild( innerCaptcha );
		innerForm.appendChild( innerContainer );
		container.insertBefore( innerForm, container.lastChild );

		window.grecaptcha = {
			render: jest.fn( () => 11 ),
			reset: jest.fn()
		};
		window.turnstile = {
			render: jest.fn(),
			reset: jest.fn()
		};

		addCaptchaOnPage( [ form ] );

		// The outer form keeps its legacy reCaptcha; the nested container is not claimed.
		expect( window.grecaptcha.render ).toHaveBeenCalled();
		expect( window.grecaptcha.render.mock.calls[0][0]).not.toBe( innerCaptcha );
	} );
} );
