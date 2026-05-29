const TURNSTILE_SCRIPT_ID = 'otter-turnstile-script';

/**
 * @typedef {() => boolean} CaptchaReadyCheck
 */

/**
 * @typedef {() => void} CaptchaRenderCallback
 */

/**
 * @typedef {() => void} CaptchaResetCallback
 */

/**
 * Get the captcha provider selected for a form.
 *
 * @param {HTMLDivElement} form The form container.
 * @return {string} The captcha provider.
 */
const getCaptchaProvider = ( form ) => {
	return form?.dataset?.captchaProvider || 'recaptcha';
};

/**
 * Check if the reCaptcha API is ready to render widgets.
 *
 * @return {boolean} True when the API can render widgets.
 */
const isRecaptchaReady = () => (
	window.hasOwnProperty( 'grecaptcha' ) &&
	Boolean( window.grecaptcha?.render )
);

/**
 * Check if the Turnstile API is ready to render widgets.
 *
 * @return {boolean} True when the API can render widgets.
 */
const isTurnstileReady = () => (
	window.hasOwnProperty( 'turnstile' ) &&
	Boolean( window.turnstile?.render )
);

/**
 * Ensure the global token storage object exists.
 *
 * @return {void}
 */
const ensureTokenStore = () => {
	if ( ! window.themeisleGutenberg ) {
		window.themeisleGutenberg = {};
	}

	if ( ! window.themeisleGutenberg?.tokens ) {
		window.themeisleGutenberg.tokens = {};
	}
};

/**
 * Store the captcha token and reset callback for a form.
 *
 * @param {string}               formId The form ID.
 * @param {string|null}          token  The captcha token.
 * @param {CaptchaResetCallback} reset  The widget reset callback.
 * @return {void}
 */
const setCaptchaToken = ( formId, token, reset = () => {} ) => {
	ensureTokenStore();

	window.themeisleGutenberg.tokens[ formId ] = {
		token,
		reset
	};
};

/**
 * Poll until a captcha API is available, then render the waiting widgets.
 *
 * @param {CaptchaReadyCheck}     isReady Checks if the captcha API is ready.
 * @param {CaptchaRenderCallback} render  Renders the captcha widgets.
 * @return {void}
 */
const waitForCaptcha = ( isReady, render ) => {
	const tryRenderCaptcha = setInterval( () => {
		if ( isReady() ) {
			render();
			clearInterval( tryRenderCaptcha );
		}
	}, 200 );
};

/**
 * Add captcha widgets to the captcha-enabled forms on the page.
 *
 * @param {NodeList|HTMLDivElement[]} forms The form containers.
 * @return {void}
 */
export const addCaptchaOnPage = ( forms ) => {
	const captchaForms = [ ...forms ].filter( form => form?.classList?.contains( 'has-captcha' ) );
	const recaptchaForms = captchaForms.filter( form => 'recaptcha' === getCaptchaProvider( form ) );
	const turnstileForms = captchaForms.filter( form => 'turnstile' === getCaptchaProvider( form ) );

	if ( 0 < recaptchaForms.length ) {
		ensureRecaptchaLoaded( recaptchaForms );
	}

	if ( 0 < turnstileForms.length ) {
		ensureTurnstileLoaded( turnstileForms );
	}
};

/**
 * Load reCaptcha if needed, then render it on the given forms.
 *
 * @param {HTMLDivElement[]} forms The form containers.
 * @return {void}
 */
const ensureRecaptchaLoaded = ( forms ) => {
	const render = () => forms.forEach( renderRecaptchaOn );

	if ( isRecaptchaReady() ) {
		render();
		return;
	}

	if ( ! window?.themeisleGutenbergForm?.reRecaptchaSitekey ) {
		return;
	}

	if ( document.getElementById( 'recaptcha' ) ) {
		waitForCaptcha( isRecaptchaReady, render );
		return;
	}

	const script = document.createElement( 'script' );
	script.id = 'recaptcha';
	script.addEventListener( 'load', () => waitForCaptcha( isRecaptchaReady, render ) );
	script.src = window?.themeisleGutenbergForm?.reRecaptchaAPIURL;
	document.body.appendChild( script );
};

/**
 * Load Turnstile if needed, then render it on the given forms.
 *
 * @param {HTMLDivElement[]} forms The form containers.
 * @return {void}
 */
const ensureTurnstileLoaded = ( forms ) => {
	const render = () => forms.forEach( renderTurnstileOn );

	if ( isTurnstileReady() ) {
		render();
		return;
	}

	if ( ! window?.themeisleGutenbergForm?.turnstileSitekey ) {
		return;
	}

	if ( getTurnstileScript() ) {
		waitForCaptcha( isTurnstileReady, render );
		return;
	}

	const script = document.createElement( 'script' );

	// Do not use id="turnstile". Browsers expose that DOM id as
	// window.turnstile, which can shadow Cloudflare's real API object.
	script.id = TURNSTILE_SCRIPT_ID;
	script.async = true;
	script.defer = true;
	script.addEventListener( 'load', () => waitForCaptcha( isTurnstileReady, render ) );
	script.src = window?.themeisleGutenbergForm?.turnstileAPIURL;
	document.body.appendChild( script );
};

/**
 * Find a Turnstile script already present on the page.
 *
 * @return {HTMLElement|null} The Turnstile script element.
 */
const getTurnstileScript = () => document.getElementById( TURNSTILE_SCRIPT_ID ) ||
	document.querySelector( 'script[src*="challenges.cloudflare.com/turnstile"]' );

/**
 * Create and insert a captcha mount node before the form submit area.
 *
 * @param {HTMLDivElement} form The form container.
 * @return {HTMLDivElement} The inserted captcha mount node.
 */
const createCaptchaNode = ( form ) => {
	const captchaNode = document.createElement( 'div' );
	const container = form.querySelector( '.otter-form__container' );

	container?.insertBefore( captchaNode, container.lastChild );

	return captchaNode;
};

/**
 * Render the reCaptcha component on form.
 *
 * @param {HTMLDivElement} form The form container.
 * @return {number|undefined} The captcha widget ID.
 */
const renderRecaptchaOn = ( form ) => {
	if ( ! isRecaptchaReady() ) {
		return;
	}

	const captchaNode = createCaptchaNode( form );

	const captchaId = window.grecaptcha?.render(
		captchaNode,
		{
			sitekey: window?.themeisleGutenbergForm?.reRecaptchaSitekey,
			callback: ( token ) => {
				setCaptchaToken(
					form.id,
					token,
					() => window.grecaptcha?.reset( captchaId )
				);
			},
			'expired-callback': () => setCaptchaToken( form.id, null )
		}
	);

	return captchaId;
};

/**
 * Render the Turnstile component on form.
 *
 * @param {HTMLDivElement} form The form container.
 * @return {string|undefined} The captcha widget ID.
 */
const renderTurnstileOn = ( form ) => {
	if ( ! isTurnstileReady() ) {
		return;
	}

	const captchaNode = createCaptchaNode( form );

	const widgetId = window.turnstile?.render(
		captchaNode,
		{
			sitekey: window?.themeisleGutenbergForm?.turnstileSitekey,
			callback: ( token ) => {
				setCaptchaToken(
					form.id,
					token,
					() => window.turnstile?.reset( widgetId )
				);
			},
			'expired-callback': () => setCaptchaToken( form.id, null ),
			'error-callback': () => setCaptchaToken( form.id, null )
		}
	);

	return widgetId;
};
