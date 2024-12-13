/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import {
	BaseControl,
	Button, ExternalLink,
	Icon,
	Modal,
	Notice,
	SelectControl,
	Spinner,
	TextControl
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState, Fragment } from '@wordpress/element';
import { arrowRight, closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import useSettings from '../../../blocks/helpers/use-settings';

type WebhookEditorProps = {
	webhookId: string,
	onChange: ( webhookId: string ) => void,
}

type Webhook = {
	id: string,
	name: string,
	url: string,
	method: string,
	headers: {key?: string, value?: string}[],
}

const WebhookEditor = ( props: WebhookEditorProps ) => {

	const [ isOpen, setOpen ] = useState( false );
	const [ error, setError ] = useState( '' );

	const [ id, setId ] = useState( '' );

	const [ url, setUrl ] = useState( '' );
	const [ name, setName ] = useState( '' );
	const [ method, setMethod ] = useState( 'GET' );
	const [ headers, setHeaders ] = useState<{key?: string, value?: string}[]>([]);

	const [ getOption, setOption, status ] = useSettings();

	const fetchWebhook = () => {
		const hooksOptions = getOption?.( 'themeisle_webhooks_options' );

		if ( hooksOptions ) {
			setWebhooks( hooksOptions );
		}
	};

	const [ webhooks, setWebhooks ] = useState<Webhook[]>([]);

	const [ initWebhooks, setInitWebhooks ] = useState( true );
	useEffect( () => {
		if ( 'loaded' === status && initWebhooks ) {
			fetchWebhook();
			setInitWebhooks( false );
		}
	}, [ status, initWebhooks ]);

	const checkWebhook = ( webhook: Webhook ) => {
		if ( ! webhook.name ) {
			return  __( 'Please enter a webhook name.', 'otter-pro' );
		}

		if ( ! webhook.url ) {
			return __( 'Please enter a webhook URL.', 'otter-pro' );
		}

		if ( 0 < webhook.headers.length ) {
			for ( const header of webhook.headers ) {
				if ( ! header.key || ! header.value ) {
					return __( 'Please enter a key and value for all headers.', 'otter-pro' );
				}
			}
		}

		return true;
	};

	const saveWebhooks = ( webhooksToSave: Webhook[]) => {
		for ( const webhook of webhooksToSave ) {
			const check = checkWebhook( webhook );
			if ( true !== check ) {
				const msg = sprintf(
					/* translators: %s: webhook name */
					__( 'There was an error saving the webhook: %s', 'otter-pro' ),
					webhook?.name
				) + '\n';
				setError( msg + check );
				return;
			}
		}

		// Save to wp options
		setOption?.( 'themeisle_webhooks_options', [ ...webhooksToSave ], __( 'Webhooks saved.', 'otter-pro' ), 'webhook', ( response ) => {
			setWebhooks( response?.['themeisle_webhooks_options'] ?? []);
			window.oTrk?.add({ feature: 'webhook', featureComponent: 'saving' });
		});
	};

	useEffect( () => {
		if ( isOpen && 0 < webhooks?.length && props.webhookId && id !== props.webhookId ) {
			const webhook = webhooks.find( ( hook: Webhook ) => hook.id === props.webhookId );
			if ( webhook ) {
				setId( webhook.id );
				setName( webhook.name );
				setUrl( webhook.url );
				setMethod( webhook.method );
				setHeaders( webhook.headers );
			}
		}
	}, [ isOpen, webhooks, props.webhookId ]);

	return (
		<Fragment>
			{ isOpen && (
				<Modal
					title={ id ?  __( 'Webhook Editor', 'otter-pro'  ) : __( 'Webhook List', 'otter-pro'  ) }
					onRequestClose={() => setOpen( false )}
					shouldCloseOnClickOutside={ false }
				>
					{
						id ? (
							<Fragment>
								<TextControl
									label={ __( 'Webhook Name', 'otter-pro' ) }
									help={ __( 'Enter the URL to send the data to.', 'otter-pro' )}
									value={name}
									onChange={setName}
									placeholder={ __( 'My Webhook', 'otter-pro' )}
								/>
								<TextControl
									label={ __( 'URL', 'otter-pro' ) }
									help={ __( 'Enter the URL to send the data to.', 'otter-pro' )}
									value={url}
									onChange={setUrl}
									placeholder={ __( 'https://example.com', 'otter-pro' )}
								/>
								<SelectControl
									label={ __( 'Method', 'otter-pro' ) }
									value={method}
									onChange={setMethod}
									options={[
										{ label: 'GET', value: 'GET' },
										{ label: 'POST', value: 'POST' },
										{ label: 'PUT', value: 'PUT' }
									]}
								/>
								<BaseControl
									id="otter-blocks-webhook-headers"
									label={ __( 'Headers', 'otter-pro' ) }
									help={ __( 'Enter the HTTP headers to send with the request.', 'otter-pro' )}
								>
									<div className="o-webhook-headers">
										{
											headers?.map( ( header, index ) => {
												return (
													<div className="o-webhook-header" key={index}>
														<TextControl
															value={header?.key ?? ''}
															placeholder={ __( 'Content-Type', 'otter-pro' )}
															onChange={( value ) => {
																const newHeaders = [ ...headers ];
																newHeaders[ index ] = {
																	...newHeaders[ index ],
																	key: value
																};
																setHeaders( newHeaders );
															}}
														/>
														<TextControl
															value={header?.value ?? ''}
															placeholder={ __( 'application/json', 'otter-pro' )}
															onChange={( value ) => {
																const newHeaders = [ ...headers ];
																newHeaders[ index ] = {
																	...newHeaders[ index ],
																	value
																};
																setHeaders( newHeaders );
															}}
														/>
														<Button
															variant={ 'tertiary' }
															icon={ <Icon icon={closeSmall} /> }
															onClick={() => {
																const newHeaders = [ ...headers ];
																newHeaders.splice( index, 1 );
																setHeaders( newHeaders );
															}}
														/>
													</div>
												);
											})
										}
										<Button
											variant={ 'secondary' }
											onClick={() => {
												window.oTrk?.add({ feature: 'webhook', featureComponent: 'new' });
												setHeaders([
													...headers,
													{ key: '', value: '' }
												]);
											}}
										>
											{ __( 'Add New Header', 'otter-pro' ) }
										</Button>
									</div>
								</BaseControl>
								<div className="o-webhook-actions">
									<div className="o-webhook-actions__left">
										<Button
											variant={ 'secondary' }
											onClick={() => {
												setId( '' );
											}}
										>
											{ __( 'Back', 'otter-pro' ) }
										</Button>
										<Button
											variant={ 'tertiary' }
											isDestructive
											onClick={() => {
												saveWebhooks( webhooks.filter( ( webhook ) => webhook.id !== id ) );
												setId( '' );
											}}
										>
											{ __( 'Delete', 'otter-pro' ) }
										</Button>
									</div>

									<Button
										variant={ 'primary' }
										isBusy={ 'saving' === status || 'loading' === status }
										onClick={() => {

											const webhook = {
												id,
												name,
												url,
												method,
												headers
											};

											const err = checkWebhook( webhook );

											if ( true !== err ) {
												setError( err );
												return;
											}

											const newWebhooks = [ ...webhooks ];
											const index = newWebhooks.findIndex( ( webhook ) => webhook.id === id );

											if ( -1 === index ) {
												newWebhooks.push( webhook );
											} else {
												newWebhooks[ index ] = webhook;
											}

											saveWebhooks( newWebhooks );
										}}
									>
										{ __( 'Save', 'otter-pro' ) }
									</Button>
								</div>
							</Fragment>
						) : (
							<div className="o-webhooks">
								<div className="o-options-global-defaults">
									{
										webhooks?.map( ( webhook ) => {
											return (
												<div key={webhook?.id} className="o-options-block-item">

													<div className="o-options-block-item-label">
														{ webhook.name }
													</div>
													<Button
														icon={ <Icon icon={arrowRight} /> }

														className="o-options-block-item-button"
														onClick={ () => {
															setId( webhook.id );
															setName( webhook.name );
															setUrl( webhook.url );
															setMethod( webhook.method );
															setHeaders( webhook.headers );
														} }
													/>
												</div>
											);
										})
									}

								</div>

								<div className="o-webhook-add">
									<Button
										variant={ 'primary' }
										onClick={() => {
											setId( `w-${uuidv4()}` );
											setName( '' );
											setUrl( '' );
											setMethod( 'POST' );
											setHeaders([]);
										}}>
										{ __( 'Add New Webhook', 'otter-pro' ) }
									</Button>
								</div>
							</div>
						)
					}

					{
						error && (
							<Notice
								key="webhook"
								status="error"
								isDismissible={true}
								onRemove={() => {
									setError( '' );
								}}>
								{ error }
							</Notice>
						)
					}
				</Modal>
			) }

			{
				'loading' === status && (
					<Fragment>
						<br/>
						<span>
							<Spinner />
							{ __( 'Loading Webhooks', 'otter-pro' ) }
						</span>
					</Fragment>
				)
			}

			<SelectControl
				label={ __( 'Webhook', 'otter-pro' ) }
				value={ props.webhookId }
				options={
					[
						{
							label: __( 'Select Webhook', 'otter-pro' ),
							value: ''
						},
						...(
							webhooks?.map?.( ( webhook ) => {
								return {
									value: webhook.id,
									label: webhook.name
								};
							}) ?? []
						)
					]

				}
				onChange={ props.onChange }
			/>
			< br />
			<Button
				variant="secondary"
				onClick={() => setOpen( true )}
				className="wp-block-themeisle-blocks-tabs-inspector-add-tab"
			>
				{ __( 'Edit Webhooks', 'otter-pro' ) }
			</Button>
			< br />
			<ExternalLink href="https://docs.themeisle.com/article/1550-otter-pro-documentation">
				{ __( 'Learn more about webhooks.', 'otter-pro' ) }
			</ExternalLink>
		</Fragment>
	);
};

export default WebhookEditor;
