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
 * @param {HTMLDivElement} form The element that contains all the inputs
 * @param {HTMLButtonElement} btn The submit button
 */
const collectAndSendInputFormData = ( form, btn ) => {
	const id = form?.id;
	const data = {};

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

		if ( valueElem?.hasAttribute( 'required' ) &&  ! valueElem?.checkValidity() ) {
			elemsWithError.push( valueElem );
		}

		if ( label && valueElem?.value ) {
			formFieldsData.push({
				label,
				value: valueElem?.value,
				type: valueElem?.type,
				checked
			});
		};
	});

	const query = `.protection #${ form.id || '' }_nonce_field`;
	const nonceFieldValue = form.querySelector( query )?.value;

	const msgAnchor = form.querySelector( '.wp-block-button' );
	msgAnchor?.classList.add( 'has-submit-msg' );

	/**
		 * Add the message to the anchor element then removed after a fixed time
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
		},  TIME_UNTIL_REMOVE );
	};

	if ( 0 < elemsWithError.length || ( form?.classList?.contains( 'has-captcha' ) && id && ! window.themeisleGutenberg?.tokens[id].token ) ) {
		elemsWithError.forEach( input => {
			input?.reportValidity();
		});

		if (  form?.classList?.contains( 'has-captcha' ) && id && ! window.themeisleGutenberg?.tokens[id].token  ) {
			const msg = document.createElement( 'div' );
			msg.classList.add( 'otter-form-server-response' );
			if ( ! window.hasOwnProperty( 'grecaptcha' ) ) {
				msg.innerHTML = __( '⚠ Captcha is not loaded. Please check your browser plugins to allow the Google reCaptcha.', 'otter-blocks' );
			} else {
				msg.innerHTML = __( '⚠ Please check the captcha.', 'otter-blocks' );
			}
			msg.classList.add( 'warning' );
			addThenRemoveMsg( msg );
		}

		btn.disabled = false;
	} else {
		data.data = formFieldsData;

		if ( '' !== form?.dataset?.emailSubject ) {
			data.emailSubject = form?.dataset?.emailSubject;
		}

		if ( form?.dataset?.optionName ) {
			data.formOption = form?.dataset?.optionName;
		}

		if (  form?.classList?.contains( 'has-captcha' ) && id && window.themeisleGutenberg?.tokens?.[id].token ) {
			data.token = window.themeisleGutenberg?.tokens?.[id].token;
		}

		if ( form?.id ) {
			data.formId = form?.id;
		}

		if ( nonceFieldValue ) {
			data.nonceValue = nonceFieldValue;
		}

		data.postUrl = window.location.href;

		msgAnchor?.classList.add( 'loading' );
		if ( form?.id ) {
			data.formId = form?.id;
		}

		if ( form.classList.contains( 'is-subscription' ) ) {
			data.action = 'subscribe';
		}

		if ( form.classList.contains( 'can-submit-and-subscribe' ) ) {
			data.action = 'submit-subscribe';
			data.consent = form.querySelector( '.otter-form-consent input' )?.checked || false;
		}

		data.postUrl = window.location.href;

		msgAnchor?.classList.add( 'loading' );


		apiFetch({
			path: 'themeisle-gutenberg-blocks/v1/forms',
			method: 'POST',
			data
		}).then( res => {
			msgAnchor?.classList.remove( 'loading' );
			const msg = document.createElement( 'div' );
			msg.classList.add( 'otter-form-server-response' );

			if ( res?.success ) {
				msg.innerHTML = __( 'Success', 'otter-blocks' );
				msg.classList.add( 'success' );
			} else {

				msg.classList.add( 'error' );

				if ( 'provider' === res?.error_source ) {
					if ( res?.error.includes( 'invalid' ) || res?.error.includes( 'fake' ) ) { // mailchimp
						msg.classList.add( 'warning' );
						msg.innerHTML = __( '⚠ The email address does not look correct!', 'otter-blocks' );
					} else if ( res?.error.includes( 'duplicate' ) || res?.error.includes( 'already' ) ) { // sendinblue
						msg.classList.add( 'info' );
						msg.innerHTML = __( '🛈 The email was already registered!', 'otter-blocks' );
					} else {
						msg.innerHTML = __( 'Error. Something is wrong with the server! Try again later.', 'otter-blocks' );
					}
				} else {
					msg.innerHTML = __( 'Error. Something is wrong with the server! Try again later.', 'otter-blocks' );
				}

				console.error( res?.error, res?.reasons );
			}

			addThenRemoveMsg( msg );

			if ( window.themeisleGutenberg?.tokens?.[id].reset ) {
				window.themeisleGutenberg?.tokens?.[id].reset();
			}
			btn.disabled = false;
		})?.catch( error => {
			msgAnchor?.classList.remove( 'loading' );

			console.error( error );

			const msg = document.createElement( 'div' );
			msg.classList.add( 'otter-form-server-response' );
			msg.innerHTML = __( 'Error. Something is wrong with the server! Try again later.', 'otter-blocks' );
			msg.classList.add( 'error' );

			addThenRemoveMsg( msg );
			if ( window.themeisleGutenberg?.tokens?.[id].reset ) {
				window.themeisleGutenberg?.tokens?.[id].reset();
			}
			btn.disabled = false;
		});
	}
};

domReady( () => {
	const forms = document.querySelectorAll( '.wp-block-themeisle-blocks-form' );

	addCaptchaOnPage( forms );

	forms.forEach( form => {

		if ( form.classList.contains( 'can-submit-and-subscribe' ) ) {
			renderConsentCheckbox( form );
		}

		const sendBtn = form.querySelector( 'button' );
		sendBtn?.addEventListener( 'click', ( event ) => {
			if ( ! sendBtn.disabled ) {
				event.preventDefault();
				sendBtn.disabled = true;
				collectAndSendInputFormData( form, sendBtn );
			}
		});
	});

});

/**
 * Render a checkbox for consent
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
	input.name = 'consent';
	input.id = 'consent';

	const label = document.createElement( 'label' );
	label.innerHTML = __( 'I consent to my name and email to be collected.', 'otter-blocks' );
	label.htmlFor = 'consent';

	inputContainer.appendChild( input );
	inputContainer.appendChild( label );
};
