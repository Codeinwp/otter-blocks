export const addCaptchaOnPage = ( forms ) => {
	if ( ! window.hasOwnProperty( 'grecaptcha' ) && window?.themeisleGutenbergForm?.reRecaptchaSitekey ) {
		const script = document.createElement( 'script' );
		script.id = 'recaptcha';
		document.body.appendChild( script );

		script.addEventListener( 'load', () => {
			const tryRenderCaptcha = setInterval( () => {
				if ( window.hasOwnProperty( 'grecaptcha' ) && window.grecaptcha.hasOwnProperty( 'render' ) ) {
					forms.forEach( form => {
						if ( form?.classList?.contains( 'has-captcha' ) ) {
							renderCapthcaOn( form );
						}
					});
					clearInterval( tryRenderCaptcha );
				}
			}, 200 );
		});

		script.src = window?.themeisleGutenbergForm?.reRecaptchaAPIURL;
	}
};

/**
 * Render the captcha component on form
 *
 * @param {HTMLDivElement} form The form container
 */
const renderCapthcaOn = ( form ) => {
	if ( ! window.hasOwnProperty( 'grecaptcha' ) ) {
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
				if ( ! window.themeisleGutenberg ) {
					window.themeisleGutenberg = {};
				}

				if ( ! window.themeisleGutenberg?.tokens ) {
					window.themeisleGutenberg.tokens = {};
				}

				window.themeisleGutenberg.tokens[id] = {
					token,
					reset: () => window.grecaptcha?.reset( captcha )
				};
			},
			'expired-callback': () => {
				if ( ! window.themeisleGutenberg?.tokens ) {
					window.themeisleGutenberg = {};
					window.themeisleGutenberg.tokens = {};
				}
				window.themeisleGutenberg.tokens[id] = {
					token: null,
					reset: () => null
				};
			}
		}
	);

	return captcha;
};
