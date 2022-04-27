/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies.
 */
import { addCaptchaOnPage } from './captcha.js';

const TIME_UNTIL_REMOVE = 10_000;

/**
 * Send the date from the form to the server
 *
 * @param {HTMLDivElement}    form The element that contains all the inputs
 * @param {HTMLButtonElement} btn  The submit button
 */
const collectAndSendInputFormData = ( form, btn ) => {
	const id = form?.id;
	const payload = {};

	/** @type {Array.<HTMLDivElement>} */
	const elemsWithError = [];

	const formFieldsData = [ { label: __( 'Form submission from', 'otter-blocks' ), value: window.location.href } ];

	const inputs = form?.querySelectorAll( '.otter-form__container .wp-block-themeisle-blocks-form-input' );
	const textarea = form?.querySelectorAll( '.otter-form__container .wp-block-themeisle-blocks-form-textarea' );

	[ ...inputs, ...textarea ]?.forEach( input => {
		const label = input.querySelector( '.otter-form-input-label__label, .otter-form-textarea-label__label' )?.innerHTML;
		const valueElem = input.querySelector( '.otter-form-input, .otter-form-textarea-input' );

		// TODO: use checkbox in the future versions
		const checked = input.querySelector( '.otter-form-input[type="checkbox"]' )?.checked;

		if ( valueElem?.hasAttribute( 'required' ) && ! valueElem?.checkValidity() ) {
			elemsWithError.push( valueElem );
		}

		if ( label && valueElem?.value ) {
			formFieldsData.push({
				label: label,
				value: valueElem?.value,
				type: valueElem?.type,
				checked: checked
			});
		}
	});


	const query = `.protection #${ form.id || '' }_nonce_field`;
	const nonceFieldValue = form.querySelector( query )?.value;

	const msgAnchor = form.querySelector( '.wp-block-button' );
	msgAnchor?.classList.add( 'has-submit-msg' );

	const spinner = document.createElement( 'span' );
	spinner.classList.add( 'spinner' );
	btn.appendChild( spinner );

	/**
	 * Add the message to the anchor element then removed after a fixed time
	 *
	 * @param {HTMLDivElement} msg The message container
	 */
	const addThenRemoveMsg = ( msg ) => {

		// Remove old messages
		msgAnchor.querySelectorAll( '.otter-form-server-response' ).forEach( _msg => msgAnchor.removeChild( _msg ) );

		// Add the new message to the page
		msgAnchor.appendChild( msg );

		// Delete it after a fixed time
		setTimeout( () => {
			if ( msg && msgAnchor === msg.parentNode ) {
				msgAnchor.removeChild( msg );
			}
		}, TIME_UNTIL_REMOVE );
	};

	if ( 0 < elemsWithError.length || ( form?.classList?.contains( 'has-captcha' ) && id && ! window.themeisleGutenberg?.tokens[id].token ) ) {

		/**
		 * Validata the form inputs data.
		 */
		elemsWithError.forEach( input => {
			input?.reportValidity();
		});

		if ( form?.classList?.contains( 'has-captcha' ) && id && ! window.themeisleGutenberg?.tokens[id].token ) {
			const msg = document.createElement( 'div' );
			msg.classList.add( 'otter-form-server-response' );
			if ( ! window.hasOwnProperty( 'grecaptcha' ) ) {
				msg.innerHTML = __( '⚠ Captcha is not loaded. Please check your browser plugins to allow the Google reCaptcha.', 'otter-blocks' );
			} else {
				msg.innerHTML = __( '⚠ Please check the captcha.', 'otter-blocks' );
			}
			msg.classList.add( 'o-warning' );
			addThenRemoveMsg( msg );
		}

		btn.disabled = false;
		btn.removeChild( spinner );
	} else {
		payload.formInputsData = formFieldsData;
		if ( form?.classList?.contains( 'has-captcha' ) && id && window.themeisleGutenberg?.tokens?.[ id ].token ) {
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

		payload.postUrl = window.location.href;


		/**
		 * Get the consent
		 */
		if ( form.classList.contains( 'can-submit-and-subscribe' ) ) {
			payload.action = 'submit-subscribe';
			payload.consent = form.querySelector( '.otter-form-consent input' )?.checked || false;
		}

		msgAnchor?.classList.add( 'loading' );

		apiFetch({
			path: 'otter/v1/form/frontend',
			method: 'POST',
			data: {
				handler: 'submit',
				payload
			}
		}).then( ( response ) => {

			/**
			 * @type {import('./types.js').IFormResponse}
			 */
			const res = response;

			// Update submit message.
			msgAnchor?.classList.remove( 'loading' );
			const msg = document.createElement( 'div' );
			msg.classList.add( 'o-form-server-response' );

			if ( res?.success ) {
				msg.innerHTML = res?.submitMessage ? res.submitMessage :  __( 'Success', 'otter-blocks' );
				msg.classList.add( 'o-success' );
				cleanInputs( form );

				setTimeout( () => {
					if ( '' !== res?.redirectLink ) {
						let a = document.createElement( 'a' );
						a.target = '_blank';
						a.href = res.redirectLink;
						a.click();
					}
				}, 1000 );
			} else {
				msg.classList.add( 'o-error' );

				// TODO: Write pattern to display a more useful error message.
				if ( res?.provider && res?.error?.includes( 'invalid' ) || res?.error?.includes( 'fake' ) ) { // mailchimp
					msg.classList.add( 'o-warning' );
					msg.innerHTML = __( 'The email address is invalid!', 'otter-blocks' );
				} else if ( res?.provider && res?.error?.includes( 'duplicate' ) || res?.error?.includes( 'already' ) ) { // sendinblue
					msg.classList.add( 'info' );
					msg.innerHTML = __( 'The email was already registered!', 'otter-blocks' );
				} else {
					msg.innerHTML = __( 'Error. Something is wrong with the server! Try again later.', 'otter-blocks' );
				}

				// eslint-disable-next-line no-console
				console.error( res?.error, res?.reasons );
			}

			/**
			 * Reset the form.
			 */
			addThenRemoveMsg( msg );
			if ( window.themeisleGutenberg?.tokens?.[ id ].reset ) {
				window.themeisleGutenberg?.tokens?.[ id ].reset();
			}
			btn.disabled = false;
			btn.removeChild( spinner );
		})?.catch( ( error ) => {
			msgAnchor?.classList.remove( 'loading' );

			// eslint-disable-next-line no-console
			console.error( error );

			const msg = document.createElement( 'div' );
			msg.classList.add( 'otter-form-server-response' );
			msg.innerHTML = __( 'Error. Something is wrong with the server! Try again later.', 'otter-blocks' );
			msg.classList.add( 'error' );

			addThenRemoveMsg( msg );
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
 * @param {HTMLFormElement} form
 */
const cleanInputs = ( form ) => {
	const inputs = form?.querySelectorAll( '.otter-form__container .wp-block-themeisle-blocks-form-input' );
	const textarea = form?.querySelectorAll( '.otter-form__container .wp-block-themeisle-blocks-form-textarea' );

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
	label.innerHTML = __( 'I have read and agreed the privacy statement.', 'otter-blocks' );
	label.htmlFor = 'o-consent';

	inputContainer.appendChild( input );
	inputContainer.appendChild( label );
};


domReady( () => {
	const forms = document.querySelectorAll( '.wp-block-themeisle-blocks-form' );

	addCaptchaOnPage( forms );

	forms.forEach( ( form ) => {
		if ( form.classList.contains( 'can-submit-and-subscribe' ) ) {
			console.log( 'Consent' );
			renderConsentCheckbox( form );
		}

		const sendBtn = form.querySelector( 'button' );

		if ( form.querySelector( 'button[type="submit"]' ) ) {
			form?.addEventListener( 'submit', ( event ) => {
				event.preventDefault();
				if ( ! sendBtn.disabled ) {
					sendBtn.disabled = true;
					collectAndSendInputFormData( form, sendBtn );
				}
			}, false );
		} else {

			// legacy
			sendBtn?.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				if ( ! sendBtn.disabled ) {
					sendBtn.disabled = true;
					collectAndSendInputFormData( form, sendBtn );
				}
			}, false );
		}
	});
});
