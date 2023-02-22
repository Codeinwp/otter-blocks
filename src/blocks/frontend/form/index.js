/**
 * Internal dependencies.
 */
import { addCaptchaOnPage } from './captcha.js';
import DisplayFormMessage from './message.js';
import { domReady } from '../../helpers/frontend-helper-functions.js';

let startTimeAntiBot = null;

/**
 * Get the fields with their value from the form.
 *
 * @param {HTMLDivElement} form The form.
 * @returns
 */
const extractFormFields = form => {

	/** @type {Array.<HTMLDivElement>} */
	const formFieldsData = [{ label: window?.themeisleGutenbergForm?.messages['form-submission'] || 'Form submission from', value: window.location.href }];

	const allInputs = form?.querySelectorAll( ':scope > .otter-form__container > .wp-block-themeisle-blocks-form-input, :scope > .otter-form__container > .wp-block-themeisle-blocks-form-textarea, :scope > .otter-form__container > .wp-block-themeisle-blocks-form-multiple-choice' );

	allInputs?.forEach( ( input, index ) => {
		const label = `(Field ${index + 1}) ${input.querySelector( '.otter-form-input-label, .otter-form-input-label__label, .otter-form-textarea-label__label' )?.innerHTML}`;

		let value = undefined;
		let fieldType = undefined;

		const valueElem = input.querySelector( '.otter-form-input:not([type="checkbox"], [type="radio"]), .otter-form-textarea-input' );
		if ( null !== valueElem ) {
			value = valueElem?.value;
			fieldType = valueElem?.type;
		} else {
			const select = input.querySelector( 'select' );
			if ( select ) {
				value = [ ...select.selectedOptions ].map( o => o?.label )?.filter( l => l ).join( ', ' );
				fieldType = 'multiple-choice';
			} else {
				const labels = input.querySelectorAll( '.o-form-multiple-choice-field > label' );
				const valuesElem = input.querySelectorAll( '.o-form-multiple-choice-field > input' );
				value = [ ...labels ].filter( ( label, index ) => valuesElem[index]?.checked ).map( label => label.innerHTML ).join( ', ' );
				fieldType = 'multiple-choice';
			}
		}

		if ( label && value ) {
			formFieldsData.push({
				label: label,
				value: value,
				type: valueElem?.type
			});
		}
	});

	return { formFieldsData };
};

/**
 * Get the nonce value from the form.
 * @param {HTMLDivElement} form The form.
 * @returns {string}
 */
function extractNonceValue( form ) {
	const query = `.protection #${form.id || ''}_nonce_field`;
	return form.querySelector( query )?.value;
}

/**
 * Validate the inputs from the form.
 *
 * @param {HTMLDivElement} form The form.
 * @returns
 */
function validateInputs( form ) {
	let result = true;

	// Validate text inputs.
	const inputs = form?.querySelectorAll( ':scope > .otter-form__container > .wp-block-themeisle-blocks-form-input input' );
	[ ...inputs ]?.forEach( input => {
		if ( ! input?.checkValidity() ) {
			input?.reportValidity();
			result = false;
		}
	});

	// Validate textarea inputs.
	const textarea = form?.querySelectorAll( ':scope > .otter-form__container > .wp-block-themeisle-blocks-form-textarea textarea' );
	[ ...textarea ]?.forEach( input => {
		if ( ! input?.checkValidity() ) {
			input?.reportValidity();
			result = false;
		}
	});

	// Validate multiple choice inputs.
	const multipleChoiceInputs = form?.querySelectorAll( ':scope > .otter-form__container > .wp-block-themeisle-blocks-form-multiple-choice' );

	multipleChoiceInputs?.forEach( input => {
		const select = input.querySelector( ':scope > select' );
		if ( select?.hasAttribute( 'required' ) && ! select?.checkValidity() ) {
			select?.reportValidity();
			result = false;
		}

		// Check if it is required and at least one is checked.
		const radios = input.querySelectorAll( ':scope > .o-form-multiple-choice-field > input[type="radio"]' );
		if ( radios?.length && radios[0]?.hasAttribute( 'required' ) && ! [ ...radios ].some( radio => radio.checked ) ) {
			radios[0]?.reportValidity();
			result = false;
		}

		const checkboxes = input.querySelectorAll( ':scope > .o-form-multiple-choice-field > input[type="checkbox"]' );
		if ( checkboxes?.length && checkboxes[0]?.hasAttribute( 'required' ) && ! [ ...checkboxes ].some( checkbox => checkbox.checked ) ) {
			checkboxes[0]?.reportValidity();
			result = false;
		}
	});


	return result;
}

/**
 * Send the date from the form to the server
 *
 * @param {HTMLDivElement}    form The element that contains all the inputs
 * @param {HTMLButtonElement}  btn  The submit button
 * @param {DisplayFormMessage} displayMsg The display message utility
 */
const collectAndSendInputFormData = ( form, btn, displayMsg ) => {
	const id = form?.id;
	const payload = {};

	// Get the data from the form fields.
	const { formFieldsData } = extractFormFields( form );
	const formIsEmpty = 2 > formFieldsData?.length;
	const nonceFieldValue = extractNonceValue( form );
	const hasCaptcha = form?.classList?.contains( 'has-captcha' );
	const hasValidToken = id && window.themeisleGutenberg?.tokens?.[id]?.token;


	const spinner = document.createElement( 'span' );
	spinner.classList.add( 'spinner' );
	btn.appendChild( spinner );

	if ( formIsEmpty ) {
		btn.disabled = false;
		btn.removeChild( spinner );
		return;
	}

	const isValidationSuccessful = validateInputs( form );

	if ( hasCaptcha && ! hasValidToken ) {
		const msg = ! window.hasOwnProperty( 'grecaptcha' ) ?
			'captcha-not-loaded' :
			'check-captcha';
		displayMsg.pullMsg(
			msg,
			'error'
		).show();
	}

	if ( ! isValidationSuccessful || ( hasCaptcha && ! hasValidToken ) ) {
		btn.disabled = false;
		btn.removeChild( spinner );
	} else {
		payload.formInputsData = formFieldsData;
		if ( hasValidToken ) {
			payload.token = window.themeisleGutenberg?.tokens?.[ id ].token;
		}

		/**
		 * +---------------- Extract the essential data. ----------------+
		 */
		if ( '' !== form?.dataset?.emailSubject ) {
			payload.emailSubject = form?.dataset?.emailSubject;
		}

		if ( form?.dataset?.optionName ) {
			payload.formOption = form?.dataset?.optionName;
		}

		if ( form?.id ) {
			payload.formId = form?.id;
		}

		if ( nonceFieldValue ) {
			payload.nonceValue = nonceFieldValue;
		}

		payload.antiSpamTime = Date.now() - ( startTimeAntiBot ?? Date.now() );
		payload.antiSpamHoneyPot = Boolean( form.querySelector( ':scope > .otter-form__container > .protection .o-anti-bot' )?.checked ?? false );

		payload.postUrl = window.location.href;


		/**
		 * Get the consent
		 */
		if ( form.classList.contains( 'can-submit-and-subscribe' ) ) {
			payload.action = 'submit-subscribe';
			payload.consent = form.querySelector( '.otter-form-consent input' )?.checked || false;
		}

		const formURlEndpoint = ( window?.themeisleGutenbergForm?.root || ( window.location.origin + '/wp-json/' ) ) + 'otter/v1/form/frontend';

		fetch( formURlEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json, */*;q=0.1',
				'X-WP-Nonce': window?.themeisleGutenbergForm?.nonce
			},
			credentials: 'include',
			body: JSON.stringify({
				handler: 'submit',
				payload
			})
		})
			.then( r => r.json() )
			.then( ( response ) => {

				/**
				 * @type {import('./types.js').IFormResponse}
				 */
				const res = response;

				if ( '0' === res?.code || '1' === res?.code || res?.success ) {
					const msg = res?.submitMessage ? res.submitMessage :  'Success';
					displayMsg.setMsg( msg ).show();

					cleanInputs( form );

					setTimeout( () => {
						if ( 0 < res?.redirectLink?.length ) {
							let a = document.createElement( 'a' );
							a.target = '_blank';
							a.href = res.redirectLink;
							a.click();
						}
					}, 1000 );
				} else {
					let errorMsgSlug = '';

					// TODO: Write pattern to display a more useful error message.
					if ( '110' === res.code ) {
						displayMsg.setMsg( res?.reasons?.join( '' ), 'error' ).show();
					} else if ( 0 < res?.displayError?.length ) {
						errorMsgSlug = res?.displayError;

						displayMsg.setMsg( errorMsgSlug, 'error' ).show();
					} else {
						displayMsg.setMsg( res?.reasons?.join( '' ), 'error' ).show();
					}


					// eslint-disable-next-line no-console
					console.error( `(${res?.code}) ${res?.reasons?.join( '' )}` );
				}

				/**
				 * Reset the form.
				 */

				if ( window.themeisleGutenberg?.tokens?.[ id ].reset ) {
					window.themeisleGutenberg?.tokens?.[ id ].reset();
				}
				btn.disabled = false;
				btn.removeChild( spinner );
			})?.catch( ( error ) => {
				console.error( error );
				displayMsg.pullMsg( 'try-again', 'error' ).show();

				if ( window.themeisleGutenberg?.tokens?.[ id ].reset ) {
					window.themeisleGutenberg?.tokens?.[ id ].reset();
				}
				btn.disabled = false;
				btn.removeChild( spinner );
			});
	}
};

/**
 * Reset all the input fields.
 * @param {HTMLDivElement} form
 */
const cleanInputs = ( form ) => {
	const inputs = form?.querySelectorAll( ':scope > .otter-form__container > .wp-block-themeisle-blocks-form-input' );
	const textarea = form?.querySelectorAll( ':scope > .otter-form__container > .wp-block-themeisle-blocks-form-textarea' );

	[ ...inputs, ...textarea ]?.forEach( input => {
		const valueElem = input.querySelector( '.otter-form-input, .otter-form-textarea-input' );
		if ( valueElem?.value ) {
			valueElem.value = null;
		}
	});
};

/**
 * Render a checkbox for consent
 *
 * @param {HTMLDivElement} form
 */
const renderConsentCheckbox = ( form ) => {
	const container = form.querySelector( '.otter-form__container' );
	const button = form.querySelector( '.wp-block-button' );

	const inputContainer = document.createElement( 'div' );
	inputContainer.classList.add( 'otter-form-consent' );
	container.insertBefore( inputContainer, button );

	const input = document.createElement( 'input' );
	input.type = 'checkbox';
	input.name = 'o-consent';
	input.id = 'o-consent';

	const label = document.createElement( 'label' );
	label.innerHTML = window?.themeisleGutenbergForm?.messages?.privacy || 'I have read and agreed the privacy statement.';
	label.htmlFor = 'o-consent';

	inputContainer.appendChild( input );
	inputContainer.appendChild( label );
};


domReady( () => {
	const forms = document.querySelectorAll( '.wp-block-themeisle-blocks-form' );

	addCaptchaOnPage( forms );

	startTimeAntiBot = Date.now();

	forms.forEach( ( form ) => {
		if ( form.classList.contains( 'can-submit-and-subscribe' ) ) {
			renderConsentCheckbox( form );
		}

		const sendBtn = form.querySelector( 'button' );
		const displayMsg = new DisplayFormMessage( form );

		if ( form.querySelector( ':scope > form > button[type="submit"]' ) ) {
			form?.addEventListener( 'submit', ( event ) => {
				event.preventDefault();
				if ( ! sendBtn.disabled ) {
					sendBtn.disabled = true;
					collectAndSendInputFormData( form, sendBtn, displayMsg );
				}
			}, false );
		} else {

			// legacy
			sendBtn?.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				if ( ! sendBtn.disabled ) {
					sendBtn.disabled = true;
					collectAndSendInputFormData( form, sendBtn, displayMsg );
				}
			}, false );
		}
	});
});
