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

	if ( document.getElementById( 'turnstile' ) ) {
		return;
	}

	const script = document.createElement( 'script' );
	script.id = 'turnstile';
	document.body.appendChild( script );

	script.addEventListener( 'load', () => {
		const tryRenderCaptcha = setInterval( () => {
			if ( window.hasOwnProperty( 'turnstile' ) && window.turnstile?.render ) {
				forms.forEach( renderTurnstileOn );
				clearInterval( tryRenderCaptcha );
			}
		}, 200 );
	});

	script.src = window?.themeisleGutenbergForm?.turnstileAPIURL;
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
