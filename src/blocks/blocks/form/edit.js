/**
 * External dependencies
 */
import classnames from 'classnames';

import { debounce, get, isEqual } from 'lodash';

import hash from 'object-hash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import api from '@wordpress/api';

import apiFetch from '@wordpress/api-fetch';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	BlockControls,
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	createBlock,
	createBlocksFromInnerBlocksTemplate
} from '@wordpress/blocks';

import {
	select,
	useSelect,
	useDispatch
} from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect,
	createContext
} from '@wordpress/element';

import {
	Icon
} from '@wordpress/icons';

import { Button, Notice, ToolbarGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import {
	blockInit,
	getDefaultValueByField,
	insertBlockBelow
} from '../../helpers/block-utility.js';
import Inspector from './inspector.js';
import Placeholder from './placeholder.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks';
import { renderBoxOrNumWithUnit, _cssBlock, _px, findInnerBlocks } from '../../helpers/helper-functions';
import PromptPlaceholder from '../../components/prompt';
import { parseFormPromptResponseToBlocks, sendPromptToOpenAI } from '../../helpers/prompt';
import { aiGeneration, formAiGeneration } from '../../helpers/icons';
import DeferredWpOptionsSave from '../../helpers/defered-wp-options-save';

const { attributes: defaultAttributes } = metadata;

export const FormContext = createContext({});

const formOptionsMap = {
	email: 'emailTo',
	redirectLink: 'redirectLink',
	emailSubject: 'subject',
	submitMessage: 'submitMessage',
	errorMessage: 'errorMessage',
	fromName: 'fromName',
	cc: 'cc',
	bcc: 'bcc',
	autoresponder: 'autoresponder',
	submissionsSaveLocation: 'submissionsSaveLocation',
	webhookId: 'webhookId',
	requiredFields: 'requiredFields'
};

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

	const { responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const [ loadingState, setLoadingState ] = useState({
		formOptions: 'loading',
		formIntegration: 'done',
		listId: 'init',
		captcha: 'init',
		serviceTesting: 'init'
	});

	const setLoading = l => {
		setLoadingState( loading => ({ ...loading, ...l }) );
	};

	/**
	 * Get global value if it is the case.
	 * @param {import('../../common').SyncAttrs<import('./type').FormAttrs>} field
	 * @returns
	 */
	const getSyncValue = field => {
		if ( attributes?.isSynced?.includes( field ) ) {
			return getDefaultValueByField({ name, field, defaultAttributes, attributes });
		}
		return attributes?.[field];
	};


	/** @type {[import('./type').FormOptions, React.Dispatch<React.SetStateAction<import('./type').FormOptions>>]} */
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
		errorMessage: undefined,
		apiKey: undefined,
		cc: undefined,
		bcc: undefined,
		autoresponder: undefined,
		submissionsSaveLocation: undefined
	});

	const {
		insertBlock,
		removeBlock,
		replaceInnerBlocks,
		selectBlock,
		moveBlockToPosition
	} = useDispatch( 'core/block-editor' );

	const setFormOption = option => {
		setFormOptions( options => ({ ...options, ...option }) );
	};

	/**
	 * This mark the block as dirty which allow us to use the save button to trigger the update of the form options tied to WP Options.
	 *
	 * @type {DebouncedFunc<(function(): void)|*>}
	 */
	const enableSaveBtn = debounce( () => {
		const dummyBlock = createBlock( 'core/spacer', { height: '0px' });
		insertBlock( dummyBlock, 0, clientId, false );
		removeBlock( dummyBlock.clientId, false );
	}, 3000 );

	const setFormOptionAndSaveUnlock = option => {
		setFormOption( option );
		enableSaveBtn();
	};

	const [ savedFormOptions, setSavedFormOptions ] = useState( true );
	const [ showAutoResponderNotice, setShowAutoResponderNotice ] = useState( false );
	const [ showDuplicatedMappedName, setShowDuplicatedMappedName ] = useState( false );

	const [ listIDOptions, setListIDOptions ] = useState([{ label: __( 'None', 'otter-blocks' ), value: '' }]);

	const { createNotice } = useDispatch( 'core/notices' );

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

	const [ hasEmailField, setHasEmailField ] = useState( false );

	const { children, hasProtection, currentBlockPosition } = useSelect( select => {
		const {
			getBlock,
			getBlockOrder
		} = select( 'core/block-editor' );
		const children = getBlock( clientId ).innerBlocks;

		const currentBlockPosition = getBlockOrder().indexOf( clientId );

		return {
			currentBlockPosition,
			children,
			hasProtection: 0 < children?.filter( ({ name }) => 'themeisle-blocks/form-nonce' === name )?.length
		};
	});

	const { canSaveData } = useSelect( select => {
		const isSavingPost = select( 'core/editor' )?.isSavingPost();
		const isPublishingPost = select( 'core/editor' )?.isPublishingPost();
		const isAutosaving = select( 'core/editor' )?.isAutosavingPost();
		const widgetSaving = select( 'core/edit-widgets' )?.isSavingWidgetAreas();
		const nonPostEntitySaving = select( 'core/editor' )?.isSavingNonPostEntityChanges();

		return {
			canSaveData: ( ! isAutosaving && ( isSavingPost || isPublishingPost || nonPostEntitySaving ) ) || widgetSaving
		};
	});

	/**
	 * Prevent saving data if the block is inside an AI block. This will prevent polluting the wp_options table.
	 */
	const isInsideAiBlock = useSelect( select => {
		const {
			getBlockParentsByBlockName
		} = select( 'core/block-editor' );

		const parents = getBlockParentsByBlockName( clientId, 'themeisle-blocks/content-generator' );
		return 0 < parents?.length;
	}, [ clientId ]);

	const hasEssentialData = attributes.optionName && hasProtection;

	useEffect( () => {
		if ( canSaveData && ! isInsideAiBlock ) {
			saveFormEmailOptions();
		}
	}, [ canSaveData ]);

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
		} else if ( attributes.id ) {
			setAttributes({ optionName: `${ hash({ url: window.location.pathname }) }_${ attributes.id.slice( -8 ) }` });
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

		if ( formOptions.autoresponder || formOptions.provider || formOptions.listId || formOptions.action ) {
			const emailFields = findInnerBlocks(
				children,
				block => {
					return 'email' === block?.attributes?.type && 'themeisle-blocks/form-input' === block?.name;
				},
				block => {

					// Do not find email field inside inner Form blocks.
					return 'themeisle-blocks/form' !== block?.name;
				}
			);

			setHasEmailField( 0 < emailFields?.length );

			setShowAutoResponderNotice( 0 === emailFields?.length );
		}

		if ( formOptions.webhookId ) {
			const allFields = findInnerBlocks(
				children,
				block => {
					return block?.name?.startsWith( 'themeisle-blocks/form-' );
				},
				block => {

					// Do not find email field inside inner Form blocks.
					return 'themeisle-blocks/form' !== block?.name;
				}
			);


			const mappedNames = [];
			let hasDuplicateMappedNames = false;

			for ( const block of allFields ) {
				if ( block?.attributes?.mappedName ) {
					if ( mappedNames.includes( block?.attributes?.mappedName ) ) {
						hasDuplicateMappedNames = block.clientId;
						break;
					}
					mappedNames.push( block?.attributes?.mappedName );
				}
			}

			setShowDuplicatedMappedName( hasDuplicateMappedNames );
		}

	}, [ children, formOptions.autoresponder, formOptions.provider, formOptions.listId, formOptions.action, formOptions.webhookId ]);

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
			errorMessage: wpOptions?.errorMessage,
			provider: wpOptions?.integration?.provider,
			apiKey: wpOptions?.integration?.apiKey,
			listId: wpOptions?.integration?.listId,
			action: wpOptions?.integration?.action,
			hasCaptcha: wpOptions?.hasCaptcha,
			autoresponder: wpOptions?.autoresponder,
			autoresponderSubject: wpOptions?.autoresponderSubject,
			submissionsSaveLocation: wpOptions?.submissionsSaveLocation,
			webhookId: wpOptions?.webhookId,
			requiredFields: wpOptions?.requiredFields
		});
	};

	/**`
	 * Load data from the server.
	 */
	useEffect( () => {
		let controller = new AbortController();
		const t = setTimeout( () => {
			setLoading({ formOptions: 'done', formIntegration: 'done' });
		}, 20000 );

		if ( attributes.optionName ) {
			setLoading({ formOptions: 'loading', formIntegration: 'loading' });
			try {
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
			} catch ( e ) {
				console.error( e );
				setLoading({ formOptions: 'error' });
			}
		}

		return () => {
			controller?.abort();
			clearTimeout( t );
		};
	}, [ attributes.optionName ]);

	const saveFormEmailOptions = () => {
		setLoading({ formOptions: 'saving' });

		const data = { form: attributes.optionName };
		formOptions.requiredFields = extractRequiredFields();

		Object.keys( formOptionsMap ).forEach( key => {
			data[key] = formOptions[formOptionsMap[key]];
		});

		try {
			( new DeferredWpOptionsSave() ).save( 'form_options', data, ( res, error ) => {
				if ( error ) {
					setLoading({ formOptions: 'error' });
				} else {
					setLoading({ formOptions: 'done' });
					createNotice(
						'info',
						__( 'Form options have been saved.', 'otter-blocks' ),
						{
							isDismissible: true,
							type: 'snackbar'
						}
					);
				}
			});
		} catch ( e ) {
			setLoading({ formOptions: 'error' });
		}
	};

	const extractRequiredFields = () => {

		const stripeFields = findInnerBlocks(
			children,
			block => 'themeisle-blocks/form-stripe-field' === block.name,
			block => 'themeisle-blocks/form' !== block?.name
		);

		return stripeFields?.map( block => block.attributes.fieldOptionName ) || [];
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
							res?.error ?? res?.reasons?.join( '. ' ) ?? __( 'An error has occurred.', 'otter-blocks' ),
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
		'--message-font-size': getSyncValue( 'messageFontSize' ),
		'--input-font-size': getSyncValue( 'inputFontSize' ),
		'--help-font-size': getSyncValue( 'helpFontSize' ),
		'--input-color': getSyncValue( 'inputColor' ),
		'--padding': renderBoxOrNumWithUnit(
			responsiveGetAttributes([
				getSyncValue( 'inputPadding' ),
				getSyncValue( 'inputPaddingTablet' ),
				getSyncValue( 'inputPaddingMobile' )
			]), 'px' ),
		'--border-radius': renderBoxOrNumWithUnit( getSyncValue( 'inputBorderRadius' ), 'px' ),
		'--border-width': renderBoxOrNumWithUnit( getSyncValue( 'inputBorderWidth' ), 'px' ),
		'--border-color': getSyncValue( 'inputBorderColor' ),
		'--label-color': getSyncValue( 'labelColor' ),
		'--input-width': getSyncValue( 'inputWidth' ) !== undefined && ( getSyncValue( 'inputWidth' ) + '%' ),
		'--submit-color': getSyncValue( 'submitColor' ),
		'--submit-bg-color': getSyncValue( 'submitBackgroundColor' ),
		'--submit-color-hover': getSyncValue( 'submitColorHover' ),
		'--submit-bg-color-hover': getSyncValue( 'submitBackgroundColorHover' ),
		'--required-color': getSyncValue( 'inputRequiredColor' ),
		'--input-gap': getSyncValue( 'inputGap' ) !== undefined && ( getSyncValue( 'inputGap' ) + 'px' ),
		'--inputs-gap': getSyncValue( 'inputsGap' ) !== undefined && ( getSyncValue( 'inputsGap' ) + 'px' ),
		'--label-font-size': _px( getSyncValue( 'labelFontSize' ) ),
		'--submit-font-size': getSyncValue( 'submitFontSize' ),
		'--help-label-color': getSyncValue( 'helpLabelColor' ),
		'--input-bg-color': getSyncValue( 'inputBackgroundColor' ),
		'--btn-pad': renderBoxOrNumWithUnit(
			responsiveGetAttributes([
				getSyncValue( 'buttonPadding' ),
				getSyncValue( 'buttonPaddingTablet' ),
				getSyncValue( 'buttonPaddingMobile' )
			]), 'px' )
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles
	});

	const inputFieldActions = {
		select: ( blockId ) => {
			if ( 0 < children?.length ) {
				selectBlock( blockId );
			}
		},
		move: ( blockId, position ) => {
			const blockClientId = children.find( block => block.clientId === blockId )?.clientId;
			if ( blockClientId ) {
				moveBlockToPosition( blockClientId, clientId, clientId, position );
			}
		},
		delete: ( blockId ) => {
			if ( 0 < children?.length ) {
				removeBlock( blockId, false );
			}
		},
		add: ( blockName ) => {
			const itemBlock = createBlock( blockName );
			insertBlock( itemBlock, ( children?.length ) || 0, clientId, false );
		}
	};

	return (
		<Fragment>
			<FormContext.Provider
				value={{
					savedFormOptions,
					listIDOptions,
					setListIDOptions,
					saveFormEmailOptions,
					formOptions,
					setFormOption: setFormOptionAndSaveUnlock,
					saveIntegration,
					sendTestEmail,
					loadingState,
					testService,
					hasEmailField,
					children,
					inputFieldActions,
					hasInnerBlocks,
					selectForm: () => selectBlock( clientId ),
					showAutoResponderNotice
				}}
			>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>

				<BlockControls>
					<ToolbarGroup>
						<Button
							onClick={()=> {
								const generator = createBlock( 'themeisle-blocks/content-generator', {
									promptID: 'form'
								});

								insertBlockBelow( clientId, generator );
							}}
						>
							{ __( 'Create Form With AI', 'otter-blocks' ) }
							<Icon width={22} icon={aiGeneration} style={{ marginLeft: '8px' }} />
						</Button>
					</ToolbarGroup>
				</BlockControls>


				<div { ...blockProps }>

					{
						( hasInnerBlocks ) ? (
							<form
								className="otter-form__container"
								onSubmit={ () => false }
							>
								<style>
									{
										`#block-${ clientId } .wp-block-button .wp-block-button__link:not(:hover) ` + _cssBlock([
											[ 'color', getSyncValue( 'submitColor' ) ],
											[ 'background-color', getSyncValue( 'submitBackgroundColor' )  ]
										])
									}
									{
										`#block-${ clientId } .wp-block-button .wp-block-button__link:hover ` + _cssBlock([
											[ 'color', getSyncValue( 'submitColorHover' ) ],
											[ 'background-color', getSyncValue( 'submitBackgroundColorHover' ) ]
										])
									}
								</style>

								<InnerBlocks/>

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
											{ 'left': 'left' === attributes.submitStyle },
											{ 'right': 'right' === attributes.submitStyle },
											{ 'full': 'full' === attributes.submitStyle },
											{ 'o-full-tablet': 'full' === attributes.submitStyleTablet },
											{ 'o-right-tablet': 'right' === attributes.submitStyleTablet },
											{ 'o-left-tablet': 'left' === attributes.submitStyleTablet },
											{ 'o-full-mobile': 'full' === attributes.submitStyleMobile },
											{ 'o-right-mobile': 'right' === attributes.submitStyleMobile },
											{ 'o-left-mobile': 'left' === attributes.submitStyleMobile },
											{ 'o-center': 'center' === attributes.submitStyle },
											{ 'o-center-tablet': 'center' === attributes.submitStyleTablet },
											{ 'o-center-mobile': 'center' === attributes.submitStyleMobile }
										)}
								>
									<RichText
										className='wp-block-button__link'
										placeholder={ __( 'Submit', 'otter-blocks' ) }
										value={ attributes.submitLabel }
										onChange={ submitLabel => setAttributes({ submitLabel }) }
										tagName="button"
										type='submit'
										onClick={ e => e.preventDefault() }
									/>

									{ isSelected && (
										<Fragment>
											<div>
												<div className='o-form-server-response o-success' style={{ color: attributes.submitMessageColor }}>
													{ formOptions.submitMessage ?? __( 'Success', 'otter-blocks' ) }
												</div>
												<div className='o-form-server-response o-error' style={{ color: attributes.submitMessageErrorColor, margin: '0px' }}>
													{ formOptions.errorMessage ?? __( 'Error. Please try again.', 'otter-blocks' ) }
												</div>
											</div>
											{
												! hasEssentialData && attributes.id && (
													<Fragment>
														<p>{__( 'Some data is missing!', 'otter-blocks' )}</p>
														{
															attributes.optionName === undefined && (
																<p>{__( 'Bad initialization. Please create another Form!', 'otter-blocks' )}</p>
															)
														}
														{
															false === hasProtection && (
																<p>{__( 'CSRF protection is missing. Please create another Form!', 'otter-blocks' )}</p>
															)
														}
													</Fragment>
												)
											}
											{
												showDuplicatedMappedName && (
													<Notice isDismissible={false} status={'error'}>
														<p>{__( 'Some Form fields have the same Mapped Name! Please change the Mapped Name of the duplicated fields.', 'otter-blocks' )}</p>
														<Button
															variant={'primary'}
															onClick={ () => {
																selectBlock( showDuplicatedMappedName );
															}}
														>
															{__( 'Go to Block', 'otter-blocks' )}
														</Button>
													</Notice>
												)
											}
										</Fragment>
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
									selectBlock( clientId );
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
