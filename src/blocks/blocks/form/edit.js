/**
 * External dependencies
 */
import classnames from 'classnames';

import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import api from '@wordpress/api';

import apiFetch from '@wordpress/api-fetch';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import {
	createBlock,
	createBlocksFromInnerBlocksTemplate
} from '@wordpress/blocks';

import {
	dispatch,
	select,
	useSelect,
	useDispatch
} from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect,
	useRef,
	createContext
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import {
	blockInit,
	useCSSNode
} from '../../helpers/block-utility.js';
import Inspector from './inspector.js';
import Placeholder from './placeholder.js';
const { attributes: defaultAttributes } = metadata;

export const FormContext = createContext({});
const padding = x => x ? x.top + ' ' + x.right + ' ' + x.bottom + ' ' + x.left : null;

/**
 * Form component
 * @param {import('./type').FormProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	isSelected,
	name
}) => {
	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );

	const [ loadingState, setLoadingState ] = useState({
		formOptions: 'done',
		formIntegration: 'done',
		listId: 'init',
		captcha: 'init',
		serviceTesting: 'init'
	});
	const setLoading = l => {
		setLoadingState( loading => ({ ...loading, ...l }) );
	};

	const [ formOptions, setFormOptions ] = useState({
		provider: undefined,
		redirectLink: undefined,
		fromName: undefined,
		emailTo: undefined,
		subject: undefined,
		email: undefined,
		listId: undefined,
		action: undefined,
		hasCaptcha: undefined,
		submitMessage: undefined,
		apiKey: undefined,
		cc: undefined,
		bcc: undefined
	});

	const setFormOption = option => {
		setFormOptions( options => ({ ...options, ...option }) );
	};

	const [ savedFormOptions, setSavedFormOptions ] = useState( true );

	const [ listIDOptions, setListIDOptions ] = useState([{ label: __( 'None', 'otter-blocks' ), value: '' }]);

	const {
		insertBlock,
		removeBlock
	} = useDispatch( 'core/block-editor' );

	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
	const { createNotice } = dispatch( 'core/notices' );

	const hasInnerBlocks = useSelect(
		select =>
			0 < select( 'core/block-editor' ).getBlocks( clientId ).length,
		[ clientId ]
	);

	const { blockType, defaultVariation, variations } = useSelect(
		select => {
			const {
				getBlockVariations,
				getBlockType,
				getDefaultBlockVariation
			} = select( 'core/blocks' );

			return {
				blockType: getBlockType( name ),
				defaultVariation: getDefaultBlockVariation( name, 'block' ),
				variations: getBlockVariations( name, 'block' )
			};
		},
		[ name ]
	);

	const { children, hasEmailField } = useSelect( select => {
		const {
			getBlock
		} = select( 'core/block-editor' );
		const children = getBlock( clientId ).innerBlocks;
		return {
			children,
			hasEmailField: children?.some( b => ( 'email' === b?.attributes?.type ) )
		};
	});

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	/**
	 * Create the form identification tag for Otter Options.
	 */
	useEffect( () => {
		if ( attributes.id && select( 'core/edit-widgets' ) ) {
			setAttributes({ optionName: `widget_${ attributes.id.slice( -8 ) }` });
		} else if ( attributes.id && Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' )?.getCurrentPostId() ) {
			setAttributes({ optionName: `${ select( 'core/editor' ).getCurrentPostId() }_${ attributes.id.slice( -8 ) }` });
		}
	}, [ attributes.id ]);

	/**
	 * Make sure that a form nonce field is always present.
	 */
	useEffect( () => {
		if ( children ) {
			const verificationBlocks = children.filter( ({ name }) => 'themeisle-blocks/form-nonce' === name );

			if ( 2 <= verificationBlocks?.length ) {
				verificationBlocks.slice( 1 ).forEach( block => {
					removeBlock( block.clientId, false );
				});
			} else if ( 0 === verificationBlocks?.length && clientId ) {
				const nonceBlock = createBlock( 'themeisle-blocks/form-nonce' );
				if ( nonceBlock ) {
					insertBlock?.( nonceBlock, ( children?.length ) || 0, clientId, false );
				}
			}
		}
	}, [ children ]);

	/**
	 * Get the data from the WP Options for the current form.
	 * @param {Array} forms
	 */
	const extractDataFromWpOptions = forms => {
		return forms?.filter( ({ form }) => form === attributes.optionName ).pop();
	};

	/**
	 * Parse the WP Option data.
	 * @param wpOptions
	 */
	const parseDataFormOptions = wpOptions => {
		setFormOptions({
			emailTo: wpOptions?.email,
			fromName: wpOptions?.fromName,
			redirectLink: wpOptions?.redirectLink,
			subject: wpOptions?.emailSubject,
			cc: wpOptions?.cc,
			bcc: wpOptions?.bcc,
			submitMessage: wpOptions?.submitMessage,
			provider: wpOptions?.integration?.provider,
			apiKey: wpOptions?.integration?.apiKey,
			listId: wpOptions?.integration?.listId,
			action: wpOptions?.integration?.action,
			hasCaptcha: wpOptions?.hasCaptcha
		});
	};

	/**
	 * Load data from the server.
	 */
	useEffect( () => {
		let controller = new AbortController();
		const t = setTimeout( () => {
			setLoading({ formOptions: 'done', formIntegration: 'done' });
		}, 3000 );


		if ( attributes.optionName ) {
			api.loadPromise.then( () => {
				setLoading({ formOptions: 'loading', formIntegration: 'loading' });
				( new api.models.Settings() ).fetch({ signal: controller.signal }).done( res => {
					controller = null;
					const formData = extractDataFromWpOptions( res.themeisle_blocks_form_emails );
					if ( formData ) {
						parseDataFormOptions( formData );
						setSavedFormOptions( formData );
					}
					setLoading({
						formIntegration: 'done',
						formOptions: 'done'
					});
					clearTimeout( t );
				}).catch( () => {
					setLoading({
						formIntegration: 'done',
						formOptions: 'done'
					});
					clearTimeout( t );
				});
			});
		}

		return () => {
			controller?.abort();
			clearTimeout( t );
		};
	}, [ attributes.optionName ]);

	const saveFormEmailOptions = () => {
		setLoading({ formOptions: 'saving' });
		( new api.models.Settings() ).fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					hasUpdated = (
						emails[index].email !== formOptions.emailTo ||
						emails[index].redirectLink !== formOptions.redirectLink ||
						emails[index].emailSubject !== formOptions.subject ||
						emails[index].submitMessage !== formOptions.submitMessage ||
						emails[index].fromName !== formOptions.fromName ||
						emails[index].cc !== formOptions.cc ||
						emails[index].bcc !== formOptions.bcc
					);

					// Update the values
					emails[index].email = formOptions.emailTo;
					emails[index].redirectLink = formOptions.redirectLink;
					emails[index].emailSubject = formOptions.subject;
					emails[index].submitMessage = formOptions.submitMessage;
					emails[index].fromName = formOptions.fromName;
					emails[index].cc = formOptions.cc;
					emails[index].bcc = formOptions.bcc;
					isMissing = false;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					email: formOptions.emailTo,
					fromName: formOptions.fromName,
					redirectLink: formOptions.redirectLink,
					emailSubject: formOptions.subject,
					submitMessage: formOptions.submitMessage,
					cc: formOptions.cc,
					bcc: formOptions.bcc
				});
			}

			if ( isMissing || hasUpdated ) {
				const model = new api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_form_emails: emails
				});

				model.save().then( response => {
					const formOptions = extractDataFromWpOptions( response.themeisle_blocks_form_emails );
					if ( formOptions ) {
						parseDataFormOptions( formOptions );
						setSavedFormOptions( formOptions );
						setLoading({ formOptions: 'done' });
						createNotice(
							'info',
							__( 'Form options have been saved.', 'otter-blocks' ),
							{
								isDismissible: true,
								type: 'snackbar'
							}
						);
					} else {
						setLoading({ formOptions: 'error' });
					}
				});
			} else {
				setLoading({ formOptions: 'done' });
			}
		}).catch( () => setLoading({ formOptions: 'error' }) );
	};

	/**
	 * Save integration data.
	 */
	const saveIntegration = () => {
		setLoading({ formIntegration: 'saving' });
		( new api.models.Settings() )?.fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					if ( ! emails[index]?.integration ) {
						emails[index].integration = {};
					}

					hasUpdated = (
						emails[index].integration?.provider !== formOptions.provider ||
						emails[index].integration?.listId !== formOptions.listId ||
						emails[index].integration?.action !== formOptions.action ||
						emails[index].integration?.apiKey !== formOptions.apiKey
					);
					isMissing = false;
					emails[index].integration.provider = formOptions.provider;
					emails[index].integration.apiKey = formOptions.apiKey;
					emails[index].integration.listId = formOptions.listId;
					emails[index].integration.action = formOptions.action;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					integration: {
						provider: formOptions.provider,
						apiKey: formOptions.apiKey,
						listId: formOptions.listId,
						action: formOptions.action
					}
				});
			}

			if ( isMissing || hasUpdated ) {
				const model = new api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_form_emails: emails
				});

				model.save().then( response => {
					const formOptions = extractDataFromWpOptions( response.themeisle_blocks_form_emails );
					if ( formOptions ) {
						parseDataFormOptions( formOptions );
						setSavedFormOptions( formOptions );
						setAttributes({
							action: formOptions?.integration?.action
						});
					}
					setLoading({ formIntegration: 'done' });
					if ( hasUpdated ) {
						createNotice(
							'info',
							__( 'Integration details have been saved.', 'otter-blocks' ),
							{
								isDismissible: true,
								type: 'snackbar'
							}
						);
					}
				}).catch( e => {
					console.error( e );
					setLoading({ formIntegration: 'error' });
				});
			} else {
				setLoading({ formIntegration: 'done' });
			}
		}).catch( () => {
			setLoading({ formIntegration: 'error' });
		});
	};

	useEffect( () => {
		let controller = new AbortController();
		let t;
		if ( formOptions.apiKey && formOptions.provider ) {
			t = setTimeout( () => setLoading({ listId: 'timeout' }), 6_000 );
			setLoading({ listId: 'loading' });
			apiFetch({
				path: 'otter/v1/form/editor',
				method: 'POST',
				data: {
					handler: 'listId',
					payload: {
						provider: formOptions.provider,
						apiKey: formOptions.apiKey,
						action: formOptions.action
					}
				},
				signal: controller.signal
			}).then(
				res => {
					controller = null;
					clearTimeout( t );
					if ( res?.success ) {
						const options = res?.list_id?.map( item => {
							return {
								label: item.name,
								value: item.id?.toString()
							};
						}) || [];
						options.splice( 0, 0, { label: __( 'None', 'otter-blocks' ), value: '' });
						setListIDOptions( options );
						setLoading({ listId: 'done' });

						const isCurrentOptionValid = 1 === options.map( ({ value }) => value ).filter( value => value === formOptions.listId ).length;
						if ( formOptions.listId && ! isCurrentOptionValid ) {
							createNotice(
								'error',
								__( 'The current contact list is invalid. Please choose a new contact list.', 'otter-blocks' ),
								{
									isDismissible: true,
									type: 'snackbar'
								}
							);
						}
					} else {
						createNotice(
							'error',
							res?.error,
							{
								isDismissible: true,
								type: 'snackbar',
								id: 'themeisle-form-server-error'
							}
						);

						setLoading({ listId: 'error' });
					}
				}
			).catch( e => {
				console.error( e );
				setLoading({ listId: 'error' });
			});
		}
		return () => {
			controller?.abort();
			clearTimeout( t );
		};
	}, [ formOptions.apiKey, formOptions.provider ]);


	const sendTestEmail = () => {
		apiFetch({
			path: 'otter/v1/form/editor',
			method: 'POST',
			data: {
				handler: 'testEmail',
				payload: {
					provider: 'default',
					to: formOptions?.emailTo,
					site: window.location.href
				}
			}
		}).then( res => {
			if ( res?.success ) {
				createNotice(
					'info',
					__( 'The test email has been send. Check your emails for confirmation.', 'otter-blocks' ),
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);
			} else {
				createNotice(
					'error',
					__( 'An error has occurred: ', 'otter-blocks' ) + ( res?.error || __( 'unknown', 'otter-blocks' ) ),
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);
			}
		}).catch( error => {
			console.error( error );
			createNotice(
				'error',
				error?.message,
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		});
	};

	const testService = () => {
		setLoading({
			serviceTesting: 'loading'
		});
		apiFetch({
			path: 'otter/v1/form/editor',
			method: 'POST',
			data: {
				handler: 'testEmail',
				payload: {
					formOption: attributes.optionName
				}
			}
		}).then( res => {
			if ( res?.success ) {
				createNotice(
					'info',
					__( 'A test email has been registered to your contact list. Check your provider for confirmation.', 'otter-blocks' ),
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);
				setLoading({
					serviceTesting: 'done'
				});
			} else {
				createNotice(
					'error',
					__( 'An error has occurred: ', 'otter-blocks' ) + ( res?.error || __( 'unknown', 'otter-blocks' ) + __( '. Check your provider for confirmation.', 'otter-blocks' ) ),
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);
				setLoading({
					serviceTesting: 'error'
				});
			}

		}).catch( error => {
			console.error( error );
			createNotice(
				'error',
				error?.message,
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
			setLoading({
				testService: 'error'
			});
		});
	};

	/**
	 * Save the captcha option in settings.
	 */
	useEffect( () => {
		let controller = new AbortController();
		if ( attributes.hasCaptcha !== undefined && attributes.optionName ) {
			try {
				( new api.models.Settings() )?.current?.fetch({ signal: controller.signal }).done( res => {
					controller = null;

					const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
					let isMissing = true;
					let hasChanged = false;

					emails?.forEach( ({ form }, index ) => {
						if ( form === attributes.optionName ) {
							if ( emails[index].hasCaptcha !== attributes.hasCaptcha ) {
								hasChanged = true;
							}
							emails[index].hasCaptcha = attributes.hasCaptcha;
							isMissing = false;
						}
					});

					if ( isMissing ) {
						emails.push({
							form: attributes.optionName,
							hasCaptcha: attributes.hasCaptcha
						});
					}

					if ( isMissing || hasChanged ) {
						const model = new api.models.Settings({
							// eslint-disable-next-line camelcase
							themeisle_blocks_form_emails: emails
						});

						model.save();

						createNotice(
							'info',
							__( 'Form preferences have been saved.', 'otter-blocks' ),
							{
								isDismissible: true,
								type: 'snackbar'
							}
						);
					}
				});
			} catch ( e ) {
				console.warn( e.message );
			}
		}
		return () => controller?.abort();
	}, [ attributes.hasCaptcha, attributes.optionName ]);

	/**
	 * Check if the reCaptcha API Keys are set.
	 */
	useEffect( () => {
		let controller = new AbortController();
		const getCaptchaAPIData = () => {
			setLoading({ captcha: 'loading' });
			try {
				( new api.models.Settings() )?.fetch({ signal: controller.signal }).then( response => {
					controller = null;

					if ( '' !== response.themeisle_google_captcha_api_site_key && '' !== response.themeisle_google_captcha_api_secret_key ) {
						setLoading({ captcha: 'done' });
					} else {
						setLoading({ captcha: 'missing' });
						setGoogleCaptchaAPISiteKey( response.themeisle_google_captcha_api_site_key );
						setGoogleCaptchaAPISecretKey( response.themeisle_google_captcha_api_secret_key );
					}
				}).catch( e => {
					console.error( e );
					setLoading({ captcha: 'error' });
				});
			} catch ( e ) {
				console.warn( e.message );
				setLoading({ captcha: 'error' });
			}
		};

		if ( attributes.hasCaptcha && 'init' === loadingState?.captcha ) {
			getCaptchaAPIData();
		}

		return () => controller?.abort();
	}, [ loadingState.captcha, attributes.hasCaptcha ]);

	/**
	 * Save API Keys in the Otter options.
	 */
	const saveCaptchaAPIKey = () => {
		setLoading({ captcha: 'loading' });
		try {
			const model = new api.models.Settings({
				// eslint-disable-next-line camelcase
				themeisle_google_captcha_api_site_key: googleCaptchaAPISiteKey,
				// eslint-disable-next-line camelcase
				themeisle_google_captcha_api_secret_key: googleCaptchaAPISecretKey
			});

			model?.save?.()?.then( response => {

				if ( '' !== response.themeisle_google_captcha_api_site_key && '' !== response.themeisle_google_captcha_api_secret_key ) {
					setLoading({ captcha: 'done' });
				} else {
					setLoading({ captcha: 'missing' });
				}

				setGoogleCaptchaAPISecretKey( '' );
				setGoogleCaptchaAPISiteKey( '' );
				createNotice(
					'info',
					__( 'Google reCaptcha API Keys have been saved.', 'otter-blocks' ),
					{
						isDismissible: true,
						type: 'snackbar'
					}
				).catch( e => {
					console.error( e );
					setLoading({ captcha: 'error' });
				});
			})?.catch( e => {
				console.error( e );
				setLoading({ captcha: 'error' });
			});
		} catch ( e ) {
			console.warn( e.message );
			setLoading({ captcha: 'error' });
		}
	};

	const inlineStyles = {
		'--message-font-size': attributes.messageFontSize !== undefined && attributes.messageFontSize,
		'--input-font-size': attributes.inputFontSize !== undefined && attributes.inputFontSize,
		'--help-font-size': attributes.helpFontSize !== undefined && attributes.helpFontSize,
		'--input-color': attributes.inputColor,
		'--padding': padding( attributes.inputPadding ),
		'--border-radius': attributes.inputBorderRadius !== undefined && ( attributes.inputBorderRadius + 'px' ),
		'--border-width': attributes.inputBorderWidth !== undefined && ( attributes.inputBorderWidth + 'px' ),
		'--border-color': attributes.inputBorderColor,
		'--label-color': attributes.labelColor,
		'--input-width': attributes.inputWidth !== undefined && ( attributes.inputWidth + '%' ),
		'--submit-color': attributes.submitColor,
		'--required-color': attributes.inputRequiredColor,
		'--input-gap': attributes.inputGap !== undefined && ( attributes.inputGap + 'px' ),
		'--inputs-gap': attributes.inputsGap !== undefined && ( attributes.inputsGap + 'px' ),
		'--label-font-size': attributes.labelFontSize !== undefined && attributes.labelFontSize,
		'--submit-font-size': attributes.submitFontSize !== undefined && attributes.submitFontSize,
		'--help-label-color': attributes.helpLabelColor,
		'--input-bg-color': attributes.inputBackgroundColor
	};

	const [ cssNodeName, setCSS ] = useCSSNode();
	useEffect( ()=>{
		setCSS([
			`.otter-form__container .wp-block-button__link {
				background-color: ${attributes.submitBackgroundColor}
			}`,
			`.otter-form__container .wp-block-button__link:hover {
				${ attributes.submitBackgroundColorHover && `background-color: ${attributes.submitBackgroundColorHover}` }
			}`
		]);
	}, [ attributes.submitBackgroundColor, attributes.submitBackgroundColorHover ]);

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: cssNodeName
	});

	return (
		<Fragment>
			<FormContext.Provider
				value={{
					savedFormOptions,
					listIDOptions,
					setListIDOptions,
					saveFormEmailOptions,
					formOptions,
					setFormOption,
					saveIntegration,
					sendTestEmail,
					loadingState,
					testService,
					hasEmailField
				}}
			>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>

				<div { ...blockProps }>
					{
						( hasInnerBlocks ) ? (
							<form
								className="otter-form__container"
								onSubmit={ () => false }
							>
								<InnerBlocks
								/>

								{
									attributes.hasCaptcha && 'done' !== loadingState?.captcha && (
										<Placeholder
											className="otter-form-captcha"
											loadingState={ loadingState }
											saveAPIKey={ saveCaptchaAPIKey }
											siteKey={ googleCaptchaAPISiteKey }
											secretKey={ googleCaptchaAPISecretKey }
											setSiteKey={ setGoogleCaptchaAPISiteKey }
											setSecretKey={ setGoogleCaptchaAPISecretKey }
										/>
									)
								}

								{ 'submit-subscribe' === attributes.action && (
									<div className="otter-form-consent">
										<input id="o-consent" name="o-consent" type="checkbox" />
										<label htmlFor="o-consent">
											{ __( 'I have read and agreed the privacy statement.', 'otter-blocks' ) }
										</label>
									</div>
								) }

								<div
									className={
										classnames(
											'wp-block-button has-submit-msg',
											{ 'right': 'right' === attributes.submitStyle },
											{ 'full': 'full' === attributes.submitStyle }
										)}
								>
									<button
										className='wp-block-button__link'
										type='submit'
										disabled
									>
										{ attributes.submitLabel ? attributes.submitLabel : __( 'Submit', 'otter-blocks' ) }
									</button>

									{ isSelected && (
										<div>
											<div className='o-form-server-response o-success' style={{ color: attributes.submitMessageColor }}>
												{ formOptions.submitMessage || __( 'Success', 'otter-blocks' ) }
											</div>
											<div className='o-form-server-response o-error' style={{ color: attributes.submitMessageErrorColor, margin: '0px' }}>
												{ __( 'Error. Please try again.', 'otter-blocks' ) }
											</div>
										</div>
									) }
								</div>
							</form>
						) : (
							<VariationPicker
								icon={ get( blockType, [ 'icon', 'src' ]) }
								label={ get( blockType, [ 'title' ]) }
								variations={ variations }
								onSelect={ ( nextVariation = defaultVariation ) => {
									if ( nextVariation ) {
										replaceInnerBlocks(
											clientId,
											createBlocksFromInnerBlocksTemplate(
												nextVariation.innerBlocks
											),
											true
										);
									}
								} }
								allowSkip
							/>
						)
					}
				</div>
			</FormContext.Provider>
		</Fragment>
	);
};

export default Edit;
