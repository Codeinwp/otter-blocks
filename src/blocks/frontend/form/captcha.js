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
 * Get the Captcha block container of a form, ignoring the ones inside nested forms.
 *
 * @param {HTMLDivElement} form The form container.
 * @return {HTMLDivElement|null} The captcha mount node rendered by the Captcha block.
 */
export const getCaptchaContainer = ( form ) => {

	/** @type {Array.<HTMLDivElement>} */
	const innerForms = [ ...( form?.querySelectorAll( ':scope > .otter-form__container .wp-block-themeisle-blocks-form' ) ?? []) ];

	return [ ...( form?.querySelectorAll( ':scope > .otter-form__container .o-form-captcha' ) ?? []) ]
		.filter( node => ! innerForms?.some( innerForm => innerForm?.contains( node ) ) )?.[0] ?? null;
};

/**
 * Get the captcha provider selected for a form. The Captcha block container wins
 * over the legacy form-level setting, which is always reCaptcha.
 *
 * @param {HTMLDivElement}      form      The form container.
 * @param {HTMLDivElement|null} container The Captcha block container.
 * @return {string} The captcha provider.
 */
const getCaptchaProvider = ( form, container = null ) => {
	return container?.dataset?.captchaProvider || 'recaptcha';
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
	const captchaForms = [ ...forms ]
		.map( form => ({ form, container: getCaptchaContainer( form ) }) )
		.filter( ({ form, container }) => container || form?.classList?.contains( 'has-captcha' ) );
	const recaptchaForms = captchaForms.filter( ({ form, container }) => 'recaptcha' === getCaptchaProvider( form, container ) );
	const turnstileForms = captchaForms.filter( ({ form, container }) => 'turnstile' === getCaptchaProvider( form, container ) );

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
 * @param {Array.<{form: HTMLDivElement, container: HTMLDivElement|null}>} forms The form containers with their captcha mount nodes.
 * @return {void}
 */
const ensureRecaptchaLoaded = ( forms ) => {
	const render = () => forms.forEach( ({ form, container }) => renderRecaptchaOn( form, container ) );

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
 * @param {Array.<{form: HTMLDivElement, container: HTMLDivElement|null}>} forms The form containers with their captcha mount nodes.
 * @return {void}
 */
const ensureTurnstileLoaded = ( forms ) => {
	const render = () => forms.forEach( ({ form, container }) => renderTurnstileOn( form, container ) );

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
 * @param {HTMLDivElement}      form      The form container.
 * @param {HTMLDivElement|null} mountNode The Captcha block container. When missing, a node is appended before the submit area (legacy).
 * @return {number|undefined} The captcha widget ID.
 */
const renderRecaptchaOn = ( form, mountNode = null ) => {
	if ( ! isRecaptchaReady() ) {
		return;
	}

	const captchaNode = mountNode || createCaptchaNode( form );

	// The Captcha block container must be empty (it can hold an editor-only configuration warning).
	captchaNode.replaceChildren();

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
 * @param {HTMLDivElement}      form      The form container.
 * @param {HTMLDivElement|null} mountNode The Captcha block container. When missing, a node is appended before the submit area (legacy).
 * @return {string|undefined} The captcha widget ID.
 */
const renderTurnstileOn = ( form, mountNode = null ) => {
	if ( ! isTurnstileReady() ) {
		return;
	}

	const captchaNode = mountNode || createCaptchaNode( form );

	// The Captcha block container must be empty (it can hold an editor-only configuration warning).
	captchaNode.replaceChildren();

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
