/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { get } from 'lodash';

import api from '@wordpress/api';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	InnerBlocks
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
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { blockInit } from '../../helpers/block-utility.js';
import defaultAttributes from './attributes.js';
import Inspector from './inspector.js';
import Placeholder from './placeholder.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId,
	name
}) => {

	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );
	const [ isAPILoaded, setAPILoaded ] = useState( false );
	const [ isAPISaved, setAPISaved ] = useState( false );

	const settingsRef = useRef( null );
	const [ areSettingsAvailable, setSettingsStatus ] = useState( false );

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
		if (  attributes.id && select( 'core/edit-widgets' ) ) {
			setAttributes({ optionName: `widget_${ attributes.id.slice( -8 ) }` });
		} else  if ( attributes.id && select( 'core/editor' )?.getCurrentPostId() ) {
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
	 * Load settings.
	 */
	useEffect( () => {
		api.loadPromise.then( () => {
			settingsRef.current = new api.models.Settings();
			setSettingsStatus( true );
		});
	}, []);

	/**
	 * Save the captcha option in settings.
	 */
	useEffect( () => {
		if ( attributes.hasCaptcha !== undefined ) {
			settingsRef?.current?.fetch().done( res => {
				const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
				let isMissing = true;
				let hasChanged = false;

				emails?.forEach( ({ form }, index )=> {
					if ( form === attributes.optionName ) {
						if ( emails[index].hasCaptcha !== attributes.hasCaptcha ) {
							hasChanged = true;
						}
						emails[index].hasCaptcha = attributes.hasCaptcha; // update the value
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
	}, [ attributes.hasCaptcha, settingsRef.current ]);

	/**
	 * Check if the API Keys are set.
	 */
	useEffect( () => {

		const getAPIData = async() => {
			if ( ! isAPILoaded ) {
				settingsRef?.current?.fetch().then( response => {
					setAPILoaded( true );

					if ( '' !== response.themeisle_google_captcha_api_site_key && '' !== response.themeisle_google_captcha_api_secret_key ) {
						setAPISaved( true );
					}
				});
			}
		};

		if ( areSettingsAvailable && attributes.hasCaptcha && ! isAPISaved ) {
			getAPIData();
		}
	}, [ areSettingsAvailable, isAPILoaded, isAPISaved, attributes.hasCaptcha ]);

	/**
	 * Save API Keys in the Otter options.
	 */
	const saveAPIKey = () => {

		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			themeisle_google_captcha_api_site_key: googleCaptchaAPISiteKey,
			// eslint-disable-next-line camelcase
			themeisle_google_captcha_api_secret_key: googleCaptchaAPISecretKey
		});

		model.save().then( response => {
			let saved = false;

			if ( '' !== response.themeisle_google_captcha_api_site_key && '' !== response.themeisle_google_captcha_api_secret_key ) {
				saved = true;
			}

			setAPISaved( saved );
			setGoogleCaptchaAPISecretKey( '' );
			setGoogleCaptchaAPISiteKey( '' );

			createNotice(
				'info',
				__( 'API Keys have been saved.', 'otter-blocks' ),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		});

	};

	/**
	 * Save integration data.
	 */
	useEffect( () => {
		settingsRef?.current?.fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;
			let hasUpdatedNotice = false;

			emails?.forEach( ({ form }, index )=> {
				if ( form === attributes.optionName ) {
					if ( ! emails[index]?.integration ) {
						emails[index].integration = {};
					}

					hasUpdated = emails[index].integration.provider !== attributes.provider || emails[index].integration.apiKey !== attributes.apiKey || emails[index].integration.listId !== attributes.listId || emails[index].integration.action !== attributes.action;
					isMissing = false;
					hasUpdatedNotice =  attributes.apiKey && ( emails[index].integration.listId !== attributes.listId || emails[index].integration.action !== attributes.action );

					emails[index].integration.provider = attributes.provider; // update the value
					emails[index].integration.apiKey = attributes.apiKey;
					emails[index].integration.listId = attributes.listId;
					emails[index].integration.action = attributes.action;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					integration: {
						provider: attributes.provider,
						apiKey: attributes.apiKey,
						listId: attributes.listId,
						action: attributes.action
					}
				});
			}

			console.log( isMissing, hasUpdated );

			if ( isMissing || hasUpdated ) {
				const model = new api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_form_emails: emails
				});

				model.save().then( () => {
					if ( hasUpdatedNotice ) {
						createNotice(
							'info',
							__( 'Integration details have been saved.', 'otter-blocks' ),
							{
								isDismissible: true,
								type: 'snackbar'
							}
						);
					}
				});
			}

		});
	}, [ attributes.optionName, attributes.provider, attributes.apiKey, attributes.listId, attributes.action, settingsRef.current ]);

	const hasIntegrationActive = attributes.provider && attributes.apiKey && attributes.listId;

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				className={ className }
				id={ attributes.id }
			>
				{
					( hasInnerBlocks ) ? (
						<div className="otter-form__container">
							<InnerBlocks
							/>

							{
								attributes.hasCaptcha && ( ! isAPILoaded || ! isAPISaved ) && (
									<Placeholder
										className="otter-form-captcha"
										isAPILoaded={ isAPILoaded }
										isAPISaved={ isAPISaved }
										saveAPIKey={ saveAPIKey }
										siteKey={ googleCaptchaAPISiteKey }
										secretKey={ googleCaptchaAPISecretKey }
										setSiteKey={ setGoogleCaptchaAPISiteKey }
										setSecretKey={ setGoogleCaptchaAPISecretKey }
									/>
								)
							}

							<div className="wp-block-button">
								<button className="wp-block-button__link">
									{ __( hasIntegrationActive && 'subscribe' === attributes.action ? 'Subscribe' : 'Submit', 'otter-blocks' ) }
								</button>
							</div>
						</div>
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
		</Fragment>
	);
};

export default Edit;
