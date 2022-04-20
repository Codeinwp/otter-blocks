/** @jsx jsx */

/**
 * External dependencies
 */
import classnames from 'classnames';

import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { get } from 'lodash';

import api from '@wordpress/api';

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
import { blockInit } from '../../helpers/block-utility.js';
import Inspector from './inspector.js';
import Placeholder from './placeholder.js';
const { attributes: defaultAttributes } = metadata;

export const FormContext = createContext({});

/**
 * Form component
 * @param {import('./type').FormProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	name
}) => {
	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );

	const [ loadingState, setLoadingState ] = useState({
		formOptions: 'done',
		formIntegration: 'done',
		listId: 'init',
		apiKey: 'loading',
		captcha: 'init'
	});
	const setLoading = l => {
		setLoadingState( loading => ({ ...loading, ...l }) );
	};

	const [ apiKey, setApiKey ] = useState( '' );

	const [ email, setEmail ] = useState( '' );
	const [ savedFormOptions, setSavedFormOptions ] = useState( true );

	const [ listIDOptions, setListIDOptions ] = useState([ { label: __( 'None', 'otter-blocks' ), value: '' } ]);

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

	const children = useSelect( select => {
		const {
			getBlock
		} = select( 'core/block-editor' );
		return getBlock( clientId ).innerBlocks;
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
	 * Load Email and ApiKey from server.
	 */
	useEffect( () => {
		let controller = new AbortController();
		const t = setTimeout( () => {
			setLoading({apiKey: 'done'});
		}, 3000 );

		if ( attributes.optionName ) {
			api.loadPromise.then( () => {
				( new api.models.Settings() ).fetch({ signal: controller.signal }).done( res => {
					controller = null;
					const formData = extractDataFromWpOptions( res.themeisle_blocks_form_emails );
					if ( formData ) {
						setApiKey( formData?.integration?.apiKey );
						setSavedFormOptions( formData );
						if ( formData?.integration?.provider ) {
							setAttributes({ provider: formData?.integration?.provider });
						}
						setLoading({
							apiKey: 'done',
							formOptions: 'done'
						});
					}
					clearTimeout( t );
				});
			});
		}

		return () => {
			controller?.abort();
			clearTimeout( t );
		};
	}, [ attributes.optionName ]);


	/**
	 * Save the captcha option in settings.
	 */
	useEffect( () => {
		let controller = new AbortController();
		if ( attributes.hasCaptcha !== undefined ) {
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
						__( 'Form preference has been saved.', 'otter-blocks' ),
						{
							isDismissible: true,
							type: 'snackbar'
						}
					);
				}
			});
		}
		return () => controller?.abort();
	}, [ attributes.hasCaptcha,  attributes.redirectLink ]);

	/**
	 * Check if the API Keys are set.
	 */
	useEffect( () => {
		let controller = new AbortController();
		const getCaptchaAPIData = () => {
			setLoading({ captcha: 'loading'});
			( new api.models.Settings() )?.fetch({ signal: controller.signal }).then( response => {
				controller = null;

				if ( '' !== response.themeisle_google_captcha_api_site_key && '' !== response.themeisle_google_captcha_api_secret_key ) {
					setLoading({ captcha: 'done'});
				} else {
					setLoading({ captcha: 'missing'});
				}
			}).catch( e => {
				console.error( e );
				setLoading({ captcha: 'error' });
			});

		};

		if ( attributes.hasCaptcha && 'init' === loadingState?.captcha ) {
			getCaptchaAPIData();
		}

		return () => controller?.abort();
	}, [ loadingState, attributes.hasCaptcha ]);

	/**
	 * Save API Keys in the Otter options.
	 */
	const saveCaptchaAPIKey = () => {
		setLoading({ captcha: 'loading' });
		const model = new api.models.Settings({
			// eslint-disable-next-line camelcase
			themeisle_google_captcha_api_site_key: googleCaptchaAPISiteKey,
			// eslint-disable-next-line camelcase
			themeisle_google_captcha_api_secret_key: googleCaptchaAPISecretKey
		});

		model.save().then( response => {

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
		}).catch( e => {
			console.error( e );
			setLoading({ captcha: 'error' });
		});
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

					hasUpdated = emails[index].integration.provider !== attributes.provider || emails[index].integration.listId !== attributes.listId || emails[index].integration.action !== attributes.action;
					isMissing = false;
					emails[index].integration.provider = attributes.provider;
					emails[index].integration.listId = attributes.listId;
					emails[index].integration.action = attributes.action;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					integration: {
						provider: attributes.provider,
						listId: attributes.listId,
						action: attributes.action
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
						console.log( formOptions );
						setSavedFormOptions( formOptions );
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
		if ( apiKey && attributes.provider ) {
			t = setTimeout( () => setLoading({ listId: 'timeout' }), 6_000 );
			setLoading({ listId: 'loading' });
			window.wp?.apiFetch({
				path: 'otter/v1/form/editor',
				method: 'POST',
				data: {
					handler: 'listId',
					payload: {
						provider: attributes.provider,
						apiKey,
						action: attributes.action
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

						const isCurrentOptionValid = 1 === options.map( ({ value }) => value ).filter( value => value === attributes.listId ).length;
						if ( attributes.listId && ! isCurrentOptionValid ) {
							createNotice(
								'error',
								__( 'The current contact list is invalid! Please choose a new contact list.', 'otter-blocks' ),
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
				}).catch( e => {
				console.error( e );
				setLoading({ listId: 'error' });
			});
		}
		return () => {
			controller?.abort();
			clearTimeout( t );
		};
	}, [ apiKey, attributes.provider ]);

	const saveFormOptions = () => {
		setLoading({ formOptions: 'saving' });
		( new api.models.Settings() ).fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					if ( emails[index].email !== email ) {
						emails[index].email = email; // update the value
						hasUpdated = true;
					}
					if ( emails[index].redirectLink !== attributes.redirectLink ) {
						emails[index].redirectLink = attributes.redirectLink; // update the value
						hasUpdated = true;
					}
					if ( emails[index].emailSubject !== attributes.subject ) {
						emails[index].emailSubject = attributes.subject; // update the value
						hasUpdated = true;
					}
					if ( emails[index].submitMessage !== attributes.submitMessage ) {
						emails[index].submitMessage = attributes.submitMessage; // update the value
						hasUpdated = true;
					}
					if ( emails[index].fromName !== attributes.fromName ) {
						emails[index].fromName = attributes.fromName; // update the value
						hasUpdated = true;
					}
					if ( emails[index].hasCaptcha !== attributes.hasCaptcha ) {
						emails[index].hasCaptcha = attributes.hasCaptcha;
						hasUpdated = true;
					}
					isMissing = false;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					email,
					fromName: attributes.fromName,
					redirectLink: attributes.redirectLink,
					emailSubject: attributes.subject,
					submitMessage: attributes.submitMessage
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
						console.log( formOptions );
						setSavedFormOptions( formOptions );
						setLoading({ formOptions: 'done' });
						createNotice(
							'info',
							__( 'Form Options has been saved!', 'otter-blocks' ),
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

	const saveIntegrationApiKey = ( apiKey ) => {
		setLoading({ apiKey: 'saving' });
		( new api.models.Settings() )?.fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;
			let hasUpdatedNotice = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					if ( ! emails[index]?.integration ) {
						emails[index].integration = {};
					}
					hasUpdated = emails[index].integration.apiKey !== apiKey;
					emails[index].integration.apiKey = apiKey;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					integration: {
						provider: attributes.provider,
						apiKey: apiKey,
						listId: attributes.listId,
						action: attributes.action
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
						setSavedFormOptions( formOptions );
					}

					createNotice(
						'info',
						__( 'The API Key has been saved.', 'otter-blocks' ),
						{
							isDismissible: true,
							type: 'snackbar'
						}
					);

					setLoading({ apiKey: 'done' });
				}).catch( ( e ) => {
					console.error( e );
					setLoading({ apiKey: 'error' });
				});
			} else {
				setLoading({ apiKey: 'done' });
			}
		}).catch( ( e ) => {
			console.error( e );
			setLoading({ apiKey: 'error' });
		});;
	};

	const sendTestEmail = () => {
		wp?.apiFetch({
			path: 'otter/v1/form/editor',
			method: 'POST',
			data: {
				handler: 'testEmail',
				payload: {
					provider: 'default'
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


	const blockProps = useBlockProps({
		id: attributes.id
	});

	const blockRef = useRef( null );

	useEffect( () => {
		const px = x => x ? x + 'px' : null;
		const per = x => x ? x + '%' : null;
		const padding = x => x ? x.top + ' ' + x.right + ' ' + x.bottom + ' ' + x.left : null;

		/**
		 * TODO: Refactor this based on #748
		 */

		if ( blockRef.current ) {
			blockRef.current?.style?.setProperty( '--padding', padding( attributes.inputPadding ) );
			blockRef.current?.style?.setProperty( '--borderRadius', px( attributes.inputBorderRadius ) );
			blockRef.current?.style?.setProperty( '--borderWidth', px( attributes.inputBorderWidth ) );
			blockRef.current?.style?.setProperty( '--borderColor', attributes.inputBorderColor || null );
			blockRef.current?.style?.setProperty( '--labelColor', attributes.labelColor || null );
			blockRef.current?.style?.setProperty( '--inputWidth', per( attributes.inputWidth ) );
			blockRef.current?.style?.setProperty( '--submitColor', attributes.submitColor || null );
			blockRef.current?.style?.setProperty( '--inputGap', px( attributes.inputGap ) );
			blockRef.current?.style?.setProperty( '--inputsGap', px( attributes.inputsGap ) );
			blockRef.current?.style?.setProperty( '--labelFontSize', px( attributes.labelFontSize ) );
			blockRef.current?.style?.setProperty( '--submitFontSize', px( attributes.submitFontSize ) );
		}
	}, [ blockRef.current, attributes ]);

	return (
		<Fragment>
			<FormContext.Provider
				value={{
					savedFormOptions,
					apiKey,
					setApiKey,
					listIDOptions,
					setListIDOptions,
					saveFormOptions,
					email,
					setEmail,
					saveIntegrationApiKey,
					saveIntegration,
					sendTestEmail,
					loadingState
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
								ref={blockRef}
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
										css={
											css`
											${ attributes.submitBackgroundColor && `background-color: ${attributes.submitBackgroundColor};` }
											&:hover {
												${ attributes.submitBackgroundColorHover && `background-color: ${attributes.submitBackgroundColorHover};` }
											}`
										}
									>
										{ attributes.submitLabel ? attributes.submitLabel : __( 'Submit', 'otter-blocks' ) }
									</button>

									<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
										<div className='o-form-server-response o-success' style={{ color: attributes.submitMessageColor }}>
											{ attributes.submitMessage || __( 'Success', 'otter-blocks' ) }
										</div>
										<div className='o-form-server-response o-error' style={{ color: attributes.submitMessageErrorColor, margin: '0px' }}>
											{ __( 'Error. Please try again.', 'otter-blocks' ) }
										</div>
									</div>
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
