/**
 * Internal dependencies.
 */
import { addCaptchaOnPage } from './captcha.js';
import DisplayFormMessage from './message.js';
import { domReady } from '../../helpers/frontend-helper-functions.js';

let startTimeAntiBot = null;
let METADATA_VERSION = 1;

let saveMode = 'permanent';

const hasStripeConfirmation = () => {
	const urlParams = new URLSearchParams( window.location.search );
	return urlParams.has( 'stripe_checkout' );
};

const confirmRecord = async() => {

	// Get the record id from the URL
	const urlParams = new URLSearchParams( window.location.search );
	const stripeSessionId = urlParams.get( 'stripe_checkout' );

	const formURlEndpoint = ( window?.themeisleGutenbergForm?.root || ( window.location.origin + '/wp-json/' ) ) + 'otter/v1/form/confirm';

	return await fetch( formURlEndpoint + `?stripe_checkout=${stripeSessionId}`, {
		method: 'GET',
		credentials: 'include'
	});
};

/**
 * Get the form fields.
 * @param {HTMLDivElement} form The form.
 * @returns {HTMLDivElement[]} The form fields.
 */
const getFormFieldInputs = ( form ) => {

	/** @type {Array.<HTMLDivElement>} */
	const innerForms = [ ...form?.querySelectorAll( ':scope > .otter-form__container .wp-block-themeisle-blocks-form' ) ];

	/**
	 * Remove the field from the inner forms.
	 *
	 * @type {Array.<HTMLDivElement>}
	 */
	return [ ...form?.querySelectorAll( ':scope > .otter-form__container .wp-block-themeisle-blocks-form-input, :scope > .otter-form__container .wp-block-themeisle-blocks-form-textarea, :scope > .otter-form__container .wp-block-themeisle-blocks-form-multiple-choice, :scope > .otter-form__container .wp-block-themeisle-blocks-form-file, :scope > .otter-form__container .wp-block-themeisle-blocks-form-hidden-field, :scope > .otter-form__container .wp-block-themeisle-blocks-form-stripe-field' ) ].filter( input => {
		return ! innerForms?.some( innerForm => innerForm?.contains( input ) );
	});
};

/**
 * Get the fields with their value from the form.
 *
 * @param {HTMLDivElement} form The form.
 * @returns {Promise<{formFieldsData: import('./types').FormFieldData[]}>}
 */
const extractFormFields = async( form ) => {


	/** @type {Array.<import('./types').FormFieldData>} */
	const formFieldsData = [{ label: window?.themeisleGutenbergForm?.messages['form-submission'] || 'Form submission from', value: window.location.href, metadata: { position: 0 }}];

	/**
	 * All input fields that belong to the current form. Fields from inner forms are removed.
	 *
	 * @type {Array.<HTMLDivElement>}
	 */
	const allInputs = getFormFieldInputs( form );

	allInputs?.forEach( ( input, index ) => {
		const labelContainer = input.querySelector( '.otter-form-input-label' );
		const labelElem = ( labelContainer ?? input ).querySelector( '.otter-form-input-label__label, .otter-form-textarea-label__label' );

		const fieldNumberLabel = `(Field ${index + 1})`;
		let label = `${fieldNumberLabel} ${( labelElem ?? labelContainer )?.innerHTML?.replace( /<[^>]*>?/gm, '' )}`;

		let value = undefined;
		let fieldType = undefined;
		let mappedName = undefined;
		let metadata = {};
		const { id } = input;

		const valueElem = input.querySelector( '.otter-form-input:not([type="checkbox"], [type="radio"], [type="file"], [type="hidden"]), .otter-form-textarea-input' );
		if ( null !== valueElem ) {
			value = valueElem?.value;
			fieldType = valueElem?.type;
			mappedName = valueElem?.name;
		} else {
			const select = input.querySelector( 'select' );
			mappedName = select?.name;

			/** @type{HTMLInputElement} */
			const fileInput = input.querySelector( 'input[type="file"]' );

			const hiddenInput = input.querySelector( 'input[type="hidden"]' );

			const stripeField = input.classList.contains( 'wp-block-themeisle-blocks-form-stripe-field' );

			if ( fileInput ) {
				const files = fileInput?.files;
				const mappedName = fileInput?.name;

				for ( let i = 0; i < files.length; i++ ) {
					formFieldsData.push({
						label: label,
						value: `${files[i].name} (${ ( files[i].size / ( 1024 * 1024 ) ).toFixed( 4 ) } MB)`,
						type: fileInput.type,
						id: id,
						metadata: {
							version: METADATA_VERSION,
							name: files[i].name,
							size: files[i].size,
							file: files[i],
							fieldOptionName: fileInput?.dataset?.fieldOptionName,
							position: index + 1,
							mappedName: mappedName
						}
					});
				}
			} else if ( select ) {
				value = [ ...select.selectedOptions ].map( o => o?.label )?.filter( l => Boolean( l ) ).join( ', ' );
				fieldType = 'multiple-choice';
			} else if ( hiddenInput ) {
				const paramName = hiddenInput?.dataset?.paramName;

				if ( paramName ) {
					const urlParams = new URLSearchParams( window.location.search );
					value = urlParams.get( paramName );
					fieldType = 'hidden';
				}
			} else if ( stripeField ) {

				// Find more proper selectors instead of h3 and h5
				label = `${fieldNumberLabel} ${input.querySelector( '.o-stripe-checkout-description h3' )?.innerHTML?.replace( /<[^>]*>?/gm, '' )}`;
				value = input.querySelector( '.o-stripe-checkout-description h5' )?.innerHTML?.replace( /<[^>]*>?/gm, '' );
				fieldType = 'stripe-field';
				mappedName = input.name;
				metadata = {
					fieldOptionName: input?.dataset?.fieldOptionName
				};
				saveMode = 'temporary';
			} else {
				const labels = input.querySelectorAll( '.o-form-multiple-choice-field > label' );
				const valuesElem = input.querySelectorAll( '.o-form-multiple-choice-field > input' );
				mappedName = valuesElem[0]?.name;
				value = [ ...labels ].filter( ( label, index ) => valuesElem[index]?.checked ).map( label => label.innerHTML ).join( ', ' );
				fieldType = 'multiple-choice';
			}
		}

		if ( value ) {
			formFieldsData.push({
				label: label || '(No label)',
				value: value,
				type: fieldType,
				id: id,
				metadata: {
					...metadata,
					version: METADATA_VERSION,
					position: index + 1,
					mappedName: mappedName
				}
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

	const inputFields = getFormFieldInputs( form );

	for ( const field of inputFields ) {
		if ( field.classList.contains( 'wp-block-themeisle-blocks-form-input' ) ) {
			const input = field.querySelector( 'input' );
			if ( ! input?.checkValidity() ) {
				input?.reportValidity();
				result = false;
				break;
			}
		} else if ( field.classList.contains( 'wp-block-themeisle-blocks-form-textarea' ) ) {
			const input = field.querySelector( 'textarea' );
			if ( ! input?.checkValidity() ) {
				input?.reportValidity();
				result = false;
				break;
			}
		} else if ( field.classList.contains( 'wp-block-themeisle-blocks-form-multiple-choice' ) ) {
			const select = field.querySelector( 'select' );
			if ( select?.hasAttribute( 'required' ) && ! select?.checkValidity() ) {
				select?.reportValidity();
				result = false;
				break;
			}


			// Check if it is required and at least one is checked.
			const radios = field.querySelectorAll( '.o-form-multiple-choice-field input[type="radio"]' );
			if ( radios?.length && radios[0]?.hasAttribute( 'required' ) && ! [ ...radios ].some( radio => radio.checked ) ) {

				// radios[0]?.setCustomValidity( 'Please select one option.' );
				radios[0]?.reportValidity();
				result = false;
				break;
			}

			const checkboxes = field.querySelectorAll( '.o-form-multiple-choice-field input[type="checkbox"]' );
			if ( checkboxes?.length && checkboxes[0]?.hasAttribute( 'required' ) && ! [ ...checkboxes ].some( checkbox => checkbox.checked ) ) {
				checkboxes[0]?.reportValidity();
				result = false;
				break;
			}
		} else if ( field.classList.contains( 'wp-block-themeisle-blocks-form-file' ) ) {
			const input = field.querySelector( 'input' );
			if ( ! input?.checkValidity() ) {
				input?.reportValidity();
				result = false;
				break;
			}
		}
	}

	return result;
}

/**
 * Make a FormData object from the form fields data.
 * Strip binary data into separate keys.
 *
 * @param {import('./types').FormDataStructure} data
 */
const createFormData = ( data ) => {
	var formData = new FormData();

	/**
	 * For simple data, we will encode them as JSON in 'form_data' key.
	 * This gives the flexibility to have the same data shape like in backend without creating complex serializers.
	 * For complex data like files, we will use FormData way to handle them.
	 */
	data?.payload?.formInputsData?.forEach( ( field, index ) => {
		if ( 'file' === field.type ) {
			let key = 'file__' + field.metadata.position + '_' + index;

			formData.append( key, field.metadata.file );
			data.payload.formInputsData[index].metadata.file = undefined;
			data.payload.formInputsData[index].metadata.data = key; // Create a link with the file which will be used in backend via $_FILES.
		}
	});

	formData.append( 'form_data',  JSON.stringify( data ) );

	return formData;
};

/**
 * Try to get the current post id from body class.
 * @returns {number}
 */
const getCurrentPostId = () => {
	const body = document.querySelector( 'body' );
	const classes = body?.classList?.value?.split( ' ' );
	const postClass = classes?.find( c => c.includes( 'postid-' ) || c.includes( 'page-id-' ) );

	if ( postClass ) {
		const postId = postClass.split( '-' ).pop();
		if ( postId ) {
			return parseInt( postId );
		}
	}

	return 0;
};

/**
 * Handle the response after the form is submitted.
 *
 * @param {Promise<Response>} request
 * @param {DisplayFormMessage} displayMsg
 * @param {(response: import('./types.js').IFormResponse, displayMsg:DisplayFormMessage) => void} onSuccess
 * @param {(response: import('./types.js').IFormResponse, displayMsg:DisplayFormMessage) => void} onFail
 * @param {() => void} onCleanUp
 */
const handleAfterSubmit = ( request, displayMsg, onSuccess, onFail, onCleanUp ) => {
	request.then( r => r.json() ).then( response  => {

		/**
		 * @type {import('./types.js').IFormResponse} The response from the server.
		 */
		const res =  response;

		if ( '0' === res?.code || '1' === res?.code || res?.success ) {
			onSuccess?.( res, displayMsg );
		} else {
			let errorMsgSlug = '';

			// TODO: Write pattern to display a more useful error message.
			if ( '110' === res.code ) {
				displayMsg.setMsg( res?.reasons?.join( '' ), 'error' ).show();
			} else if ( '12' === res.code || '13' === res.code ) {
				displayMsg.pullMsg( 'invalid-file', 'error' ).show();
			} else if ( 0 < res?.displayError?.length ) {
				errorMsgSlug = res?.displayError;
				displayMsg.setMsg( errorMsgSlug, 'error' ).show();
			} else {
				displayMsg.setMsg( res?.reasons?.join( '' ), 'error' ).show();
			}

			onFail?.( res, displayMsg );

			// eslint-disable-next-line no-console
			console.error( `(${res?.code}) ${res?.reasons?.join( '' )}` );
		}

		/**
		 * Reset the form.
		 */

		onCleanUp?.();

	})?.catch( ( error ) => {
		console.error( error );
		displayMsg.pullMsg( 'try-again', 'error' ).show();

		onFail?.( error, displayMsg );
	});
};

const makeSpinner = ( anchor ) => {
	const spinner = document.createElement( 'span' );
	spinner.classList.add( 'spinner' );

	return {
		show: () => {
			anchor.appendChild( spinner );
		},
		hide: () => {
			anchor.removeChild( spinner );
		}
	};
};

/**
 * Send the date from the form to the server
 *
 * @param {HTMLDivElement}    form The element that contains all the inputs
 * @param {HTMLButtonElement}  btn  The submit button
 * @param {DisplayFormMessage} displayMsg The display message utility
 */
const collectAndSendInputFormData = async( form, btn, displayMsg ) => {
	const id = form?.id;
	const payload = {};

	// Get the data from the form fields.
	const { formFieldsData } = await extractFormFields( form );
	const formIsEmpty = 2 > formFieldsData?.length;
	const nonceFieldValue = extractNonceValue( form );
	const hasCaptcha = form?.classList?.contains( 'has-captcha' );
	const hasValidToken = id && window.themeisleGutenberg?.tokens?.[id]?.token;

	const spinner = makeSpinner( btn );
	spinner.show();

	if ( formIsEmpty ) {
		btn.disabled = false;
		spinner.hide();
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

		/*
		* the URL is no longer relevant if permalink structure is changed, that's why
		* we try to also send the id taken from the body class.
		*/
		payload.postUrl = window.location.href;
		payload.postId = getCurrentPostId();

		/**
		 * Get the consent
		 */
		if ( form.classList.contains( 'can-submit-and-subscribe' ) ) {
			payload.action = 'submit-subscribe';
			payload.consent = form.querySelector( '.otter-form-consent input' )?.checked || false;
		}

		const formURlEndpoint = ( window?.themeisleGutenbergForm?.root || ( window.location.origin + '/wp-json/' ) ) + 'otter/v1/form/frontend';

		const formData = createFormData({
			handler: 'submit',
			payload
		});

		try {
			const request = fetch( formURlEndpoint, {
				method: 'POST',
				headers: {
					'X-WP-Nonce': window?.themeisleGutenbergForm?.nonce,
					'O-Form-Save-Mode': saveMode
				},
				credentials: 'include',
				body: formData
			});

			handleAfterSubmit(
				request,
				displayMsg,
				( res, displayMsg ) => {

					if ( 0 < res?.frontend_external_confirmation_url?.length ) {

						// Redirect to the external confirmation URL in a new tab.
						window.open( res.frontend_external_confirmation_url, '_blank' );
						return;
					}

					const msg = res?.submitMessage ? res.submitMessage :  'Success';
					displayMsg.setMsg( msg ).show();

					form?.querySelector( 'form' )?.reset();

					if ( 0 < res?.redirectLink?.length ) {
						form.setAttribute( 'data-redirect', res.redirectLink );
					}

					setTimeout( () => {
						if ( 0 < res?.redirectLink?.length ) {
							let a = document.createElement( 'a' );
							a.target = '_blank';
							a.href = res.redirectLink;
							a.click();
						}
					}, 1000 );
				},
				( res, displayMsg ) => {},
				() => {
					if ( window.themeisleGutenberg?.tokens?.[ id ].reset ) {
						window.themeisleGutenberg?.tokens?.[ id ].reset();
					}
					btn.disabled = false;
					spinner.hide();
				}
			);
		} catch ( e ) {
			console.error( e );
			displayMsg.pullMsg( 'try-again', 'error' ).show();
			btn.disabled = false;
			spinner.hide();
		}
	}
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

		if ( hasStripeConfirmation() ) {
			sendBtn.disabled = true;

			const btnText = sendBtn.innerHTML;
			sendBtn.innerHTML = displayMsg.getMsgBySlug( 'confirmingSubmission' );

			const spinner = makeSpinner( sendBtn );
			spinner.show();

			handleAfterSubmit( confirmRecord(), displayMsg, ( res, displayMsg ) => {
				const msg = res?.submitMessage ? res.submitMessage :  'Success';
				displayMsg.setMsg( msg ).show();
			}, () => {}, () => {
				sendBtn.disabled = false;
				spinner.hide();
				sendBtn.innerHTML = btnText;
			});
		}


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

	forms.forEach( ( form ) => {
		const fields = getFormFieldInputs( form );

		fields.forEach( ( field ) => {
			const input = field.querySelector( 'input' );
			if ( 'file' === input?.type ) {
				const { maxFilesNumber, maxFileSize } = input.dataset;
				input.addEventListener( 'change', ( event ) => {
					let isValidationSuccessful = true;
					const { files } = event.target;

					if ( maxFilesNumber && files.length > maxFilesNumber ) {
						input.setCustomValidity( window.themeisleGutenbergForm?.messages?.['too-many-files'] + maxFilesNumber );
						isValidationSuccessful = false;
					}

					if ( isValidationSuccessful && maxFileSize ) {
						for ( const file of files ) {
							if ( file.size > maxFileSize * 1024 * 1024 ) {
								input.setCustomValidity( window.themeisleGutenbergForm?.messages?.['big-file'] + ' ' + maxFileSize + 'MB.' );
								isValidationSuccessful = false;
								break;
							}
						}
					}

					if ( ! isValidationSuccessful ) {
						input.reportValidity();
						input.value = '';
					} else {
						input.setCustomValidity( '' );
					}
				});
			}
		});
	});
});
