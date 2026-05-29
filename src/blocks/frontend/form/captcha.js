const getCaptchaProvider = ( form ) => {
	return form?.dataset?.captchaProvider || 'recaptcha';
};

const ensureTokenStore = () => {
	if ( ! window.themeisleGutenberg ) {
		window.themeisleGutenberg = {};
	}

	if ( ! window.themeisleGutenberg?.tokens ) {
		window.themeisleGutenberg.tokens = {};
	}
};

export const addCaptchaOnPage = ( forms ) => {
	const formsArray = [ ...forms ];
	const captchaForms = formsArray.filter( form => form?.classList?.contains( 'has-captcha' ) );

	const recaptchaForms = captchaForms.filter( form => 'recaptcha' === getCaptchaProvider( form ) );
	const turnstileForms = captchaForms.filter( form => 'turnstile' === getCaptchaProvider( form ) );

	if ( 0 < recaptchaForms.length ) {
		ensureRecaptchaLoaded( recaptchaForms );
	}

	if ( 0 < turnstileForms.length ) {
		ensureTurnstileLoaded( turnstileForms );
	}
};

const ensureRecaptchaLoaded = ( forms ) => {
	if ( window.hasOwnProperty( 'grecaptcha' ) && window.grecaptcha?.render ) {
		forms.forEach( renderRecaptchaOn );
		return;
	}

	if ( ! window?.themeisleGutenbergForm?.reRecaptchaSitekey ) {
		return;
	}

	if ( document.getElementById( 'recaptcha' ) ) {
		return;
	}

	const script = document.createElement( 'script' );
	script.id = 'recaptcha';
	document.body.appendChild( script );

	script.addEventListener( 'load', () => {
		const tryRenderCaptcha = setInterval( () => {
			if ( window.hasOwnProperty( 'grecaptcha' ) && window.grecaptcha?.render ) {
				forms.forEach( renderRecaptchaOn );
				clearInterval( tryRenderCaptcha );
			}
		}, 200 );
	});

	script.src = window?.themeisleGutenbergForm?.reRecaptchaAPIURL;
};

const ensureTurnstileLoaded = ( forms ) => {
	if ( window.hasOwnProperty( 'turnstile' ) && window.turnstile?.render ) {
		forms.forEach( renderTurnstileOn );
		return;
	}

	if ( ! window?.themeisleGutenbergForm?.turnstileSitekey ) {
		return;
	}

	// Poll until the Turnstile API is ready, then render. Used both after our own
	// injection loads and when the script is already present from another source.
	const renderWhenReady = () => {
		const tryRenderCaptcha = setInterval( () => {
			if ( window.hasOwnProperty( 'turnstile' ) && window.turnstile?.render ) {
				forms.forEach( renderTurnstileOn );
				clearInterval( tryRenderCaptcha );
			}
		}, 200 );
	};

	// Don't inject a second copy if Turnstile is already on the page: our own
	// script element, or an api.js added by another plugin/theme/bundle.
	// Loading it twice triggers Turnstile's "imported multiple times" warning.
	//
	// NOTE: the script id must NOT be `turnstile`. A DOM element with that id
	// is exposed as the global `window.turnstile` (named element access), which
	// shadows Cloudflare's API object. Turnstile's api.js then sees a truthy
	// `window.turnstile`, assumes it was already loaded, and never installs
	// `render`, so the widget silently fails to appear.
	const existing = document.getElementById( 'otter-turnstile-script' ) ||
		document.querySelector( 'script[src*="challenges.cloudflare.com/turnstile"]' );

	if ( existing ) {
		renderWhenReady();
		return;
	}

	const script = document.createElement( 'script' );
	script.id = 'otter-turnstile-script';
	script.async = true;
	script.defer = true;
	script.addEventListener( 'load', renderWhenReady );
	script.src = window?.themeisleGutenbergForm?.turnstileAPIURL;
	document.body.appendChild( script );
};

/**
 * Render the reCaptcha component on form
 *
 * @param {HTMLDivElement} form The form container
 * @return {number|undefined}
 */
const renderRecaptchaOn = ( form ) => {
	if ( ! window.hasOwnProperty( 'grecaptcha' ) || ! window.grecaptcha?.render ) {
		return;
	}

	const { id } = form;

	const captchaNode = document.createElement( 'div' );
	const container = form.querySelector( '.otter-form__container' );
	container?.insertBefore( captchaNode, container.lastChild );

	const captcha = window.grecaptcha?.render(
		captchaNode,
		{
			sitekey: window?.themeisleGutenbergForm?.reRecaptchaSitekey,
			callback: ( token ) => {
				ensureTokenStore();

				window.themeisleGutenberg.tokens[id] = {
					token,
					reset: () => window.grecaptcha?.reset( captcha )
				};
			},
			'expired-callback': () => {
				ensureTokenStore();
				window.themeisleGutenberg.tokens[id] = {
					token: null,
					reset: () => null
				};
			}
		}
	);

	return captcha;
};

/**
 * Render the Turnstile component on form
 *
 * @param {HTMLDivElement} form The form container
 * @return {string|undefined}
 */
const renderTurnstileOn = ( form ) => {
	if ( ! window.hasOwnProperty( 'turnstile' ) || ! window.turnstile?.render ) {
		return;
	}

	const { id } = form;

	const captchaNode = document.createElement( 'div' );
	const container = form.querySelector( '.otter-form__container' );
	container?.insertBefore( captchaNode, container.lastChild );

	const widgetId = window.turnstile?.render(
		captchaNode,
		{
			sitekey: window?.themeisleGutenbergForm?.turnstileSitekey,
			callback: ( token ) => {
				ensureTokenStore();

				window.themeisleGutenberg.tokens[id] = {
					token,
					reset: () => window.turnstile?.reset( widgetId )
				};
			},
			'expired-callback': () => {
				ensureTokenStore();
				window.themeisleGutenberg.tokens[id] = {
					token: null,
					reset: () => null
				};
			},
			'error-callback': () => {
				ensureTokenStore();
				window.themeisleGutenberg.tokens[id] = {
					token: null,
					reset: () => null
				};
			}
		}
	);

	return widgetId;
};
