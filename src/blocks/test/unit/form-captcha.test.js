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

