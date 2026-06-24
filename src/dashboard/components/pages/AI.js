/**
 * External dependencies
 */
import { arrayMove } from '@dnd-kit/sortable';

/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import {
	BaseControl,
	Button,
	ExternalLink,
	Notice,
	PanelBody,
	PanelRow,
	SelectControl,
	TextControl,
	__experimentalHStack as HStack
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import useSettings from '../../../blocks/helpers/use-settings.js';
import { SortableVerticalList } from '../../../blocks/components/sortable/index.js';
import SortableToolbarAction from '../SortableToolbarAction.js';
import {
	AI_TOOLBAR_ACTIONS_OPTION,
	countCustomActions,
	createCustomAction,
	getToolbarActionsFromSettings,
	hasMissingBuiltinActions,
	MAX_CUSTOM_TOOLBAR_ACTIONS,
	mergeBuiltinDefaults,
	normalizeToolbarActions
} from '../../../blocks/plugins/ai-content/actions';

const maskApiKey = ( apiKey ) => apiKey.slice( 0, 3 ) + 'X'.repeat( apiKey.length - 8 ) + apiKey.slice( -4 );

const AI_WP_CLIENT_OPTION = 'themeisle_blocks_settings_ai_wp_client';

const AI = () => {
	const [ getOption, updateOption, status ] = useSettings();
	const [ openAISecretKey, setOpenAISecretKey ] = useState( '' );
	const [ maskOpenAISecretKey, setMaskOpenAISecretKey ] = useState( '' );
	const [ hasSavedApiKey, setHasSavedApiKey ] = useState( false );
	const [ toolbarActions, setToolbarActions ] = useState( [] );
	const [ savedActionsSnapshot, setSavedActionsSnapshot ] = useState( '' );
	const [ aiProviders, setAiProviders ] = useState( [] );
	const [ wpAiProvider, setWpAiProvider ] = useState( '' );
	const [ wpAiModel, setWpAiModel ] = useState( '' );
	const hasInitializedActions = useRef( false );
	const hasInitializedWpAi = useRef( false );
	const { createNotice } = useDispatch( 'core/notices' );

	const aiClientSupported = Boolean( window.otterObj?.aiClientSupported );
	const aiClientAvailable = Boolean( window.otterObj?.aiClientAvailable );
	const hasStoredApiKey = hasSavedApiKey || 0 < getOption( 'themeisle_open_ai_api_key' )?.length;

	// Toolbar actions apply to whichever backend is active: a configured
	// Connectors provider or a saved legacy OpenAI key.
	const hasConfiguredAI = aiClientAvailable || hasStoredApiKey;
	const customActionCount = countCustomActions( toolbarActions );
	const canAddCustomAction = customActionCount < MAX_CUSTOM_TOOLBAR_ACTIONS;
	const showRestoreDefaults = hasMissingBuiltinActions( toolbarActions );
	const isDirty = '' !== savedActionsSnapshot && JSON.stringify( toolbarActions ) !== savedActionsSnapshot;

	useEffect( () => {
		const apiKey = getOption( 'themeisle_open_ai_api_key' );

		if ( ! apiKey || 8 > apiKey.length ) {
			return;
		}

		setMaskOpenAISecretKey( maskApiKey( apiKey ) );
	}, [ getOption( 'themeisle_open_ai_api_key' ) ]);

	useEffect( () => {
		if ( hasInitializedActions.current || 'loaded' !== status ) {
			return;
		}

		const actions = normalizeToolbarActions( getToolbarActionsFromSettings( getOption ) );

		hasInitializedActions.current = true;
		setToolbarActions( actions );
		setSavedActionsSnapshot( JSON.stringify( actions ) );
	}, [ status ]);

	useEffect( () => {
		if ( ! aiClientAvailable ) {
			return;
		}

		apiFetch({
			path: '/ai/v1/providers?capability=text_generation'
		}).then( ( data ) => {
			setAiProviders( Array.isArray( data ) ? data : [] );
		}).catch( () => {
			setAiProviders( [] );
		});
	}, [ aiClientAvailable ]);

	useEffect( () => {
		if ( hasInitializedWpAi.current || 'loaded' !== status ) {
			return;
		}

		const config = getOption( AI_WP_CLIENT_OPTION ) || {};

		setWpAiProvider( config.provider || '' );
		setWpAiModel( config.model || '' );
		hasInitializedWpAi.current = true;
	}, [ status, getOption ]);

	const selectedAiProvider = aiProviders.find( ( item ) => item.id === wpAiProvider );
	const catalogModelOptions = ( selectedAiProvider?.models ?? [] ).map( ( model ) => ({
		label: model.name || model.id,
		value: model.id
	}));
	const modelOptions = [
		{
			label: __( 'Auto', 'otter-blocks' ),
			value: ''
		},
		...catalogModelOptions,
		...( wpAiModel && ! catalogModelOptions.some( ( option ) => option.value === wpAiModel ) ? [{
			label: wpAiModel,
			value: wpAiModel
		}] : [])
	];

	const saveWpAiSettings = () => {
		updateOption(
			AI_WP_CLIENT_OPTION,
			{
				provider: wpAiProvider,
				model: wpAiModel
			},
			__( 'AI provider settings saved.', 'otter-blocks' )
		);
	};

	const saveApiKey = async() => {
		try {
			const response = await apiFetch({
				path: 'otter/v1/openai/key',
				method: 'POST',
				data: {
					api_key: openAISecretKey
				}
			});

			if ( response?.message ) {
				createNotice(
					'success',
					response.message,
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);

				if ( 8 <= openAISecretKey.length ) {
					setMaskOpenAISecretKey( maskApiKey( openAISecretKey ) );
				}

				if ( 0 < openAISecretKey.length ) {
					setHasSavedApiKey( true );
				}

				setOpenAISecretKey( '' );
				return;
			}

			createNotice(
				'error',
				__( 'An unknown error occurred.', 'otter-blocks' ),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		} catch ( e ) {
			createNotice(
				'error',
				e?.message ?? __( 'An unknown error occurred.', 'otter-blocks' ),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		}
	};

	const updateAction = ( index, changes ) => {
		const newActions = [ ...toolbarActions ];
		newActions[ index ] = {
			...newActions[ index ],
			...changes
		};
		setToolbarActions( newActions );
	};

	const removeAction = ( index ) => {
		setToolbarActions( toolbarActions.filter( ( _, actionIndex ) => actionIndex !== index ) );
	};

	const addCustomAction = () => {
		if ( ! canAddCustomAction ) {
			return;
		}

		setToolbarActions([ ...toolbarActions, createCustomAction() ]);
	};

	const restoreBuiltinDefaults = () => {
		setToolbarActions( mergeBuiltinDefaults( toolbarActions ) );
	};

	const reorderActions = ( oldIndex, newIndex ) => {
		setToolbarActions( arrayMove( toolbarActions, oldIndex, newIndex ) );
	};

	const saveToolbarActions = () => {
		window.tiTrk?.with( 'otter' ).add({ feature: 'dashboard-ai', featureComponent: 'toolbar-actions' });
		updateOption(
			AI_TOOLBAR_ACTIONS_OPTION,
			toolbarActions,
			__( 'Settings saved.', 'otter-blocks' ),
			undefined,
			() => setSavedActionsSnapshot( JSON.stringify( toolbarActions ) )
		);
	};

	return (
		<Fragment>
			<PanelBody
				title={ __( 'AI Provider', 'otter-blocks' ) }
			>
				{ aiClientSupported && (
					<PanelRow>
						<BaseControl
							label={ __( 'WordPress AI', 'otter-blocks' ) }
							help={ __( 'Otter AI features use the AI providers configured under Settings > Connectors.', 'otter-blocks' ) }
							id="otter-options-ai-backend"
							className="otter-button-field"
						>
							<div className="otter-button-group">
								<ExternalLink
									href={ window.otterObj?.connectorsUrl }
								>
									{ __( 'Manage Connectors', 'otter-blocks' ) }
								</ExternalLink>
							</div>
						</BaseControl>
					</PanelRow>
				) }

				{ aiClientSupported && aiClientAvailable && (
					<Fragment>
						<PanelRow>
							<SelectControl
								label={ __( 'AI provider', 'otter-blocks' ) }
								help={ __( 'Auto uses the first configured connector.', 'otter-blocks' ) }
								value={ wpAiProvider }
								options={ [
									{
										label: __( 'Auto', 'otter-blocks' ),
										value: ''
									},
									...aiProviders.map( ( item ) => ({
										label: item.name || item.id,
										value: item.id
									}))
								] }
								disabled={ 'saving' === status }
								onChange={ ( value ) => {
									setWpAiProvider( value );
									setWpAiModel( '' );
								} }
							/>
						</PanelRow>

						{ 1 < modelOptions.length && (
							<PanelRow>
								<SelectControl
									label={ __( 'Model', 'otter-blocks' ) }
									help={ __( 'Only models from the connector catalog. Leave on Auto to let WordPress choose.', 'otter-blocks' ) }
									value={ wpAiModel }
									options={ modelOptions }
									disabled={ 'saving' === status }
									onChange={ setWpAiModel }
								/>
							</PanelRow>
						) }

						<PanelRow>
							<Button
								variant="secondary"
								disabled={ 'saving' === status }
								onClick={ saveWpAiSettings }
							>
								{ __( 'Save provider settings', 'otter-blocks' ) }
							</Button>
						</PanelRow>

						<PanelRow>
							<hr className="otter-ai-provider__delimiter" />
						</PanelRow>
					</Fragment>
				) }

				{ aiClientSupported && ! aiClientAvailable && ! hasStoredApiKey && (
					<PanelRow>
						<Notice
							status="info"
							isDismissible={ false }
						>
							{ __( 'No AI provider is configured yet. Set one up under Settings > Connectors to use Otter AI features.', 'otter-blocks' ) }
						</Notice>
					</PanelRow>
				) }

				{ aiClientSupported && ! aiClientAvailable && hasStoredApiKey && (
					<PanelRow>
						<Notice
							status="warning"
							isDismissible={ false }
						>
							{ __( 'No AI provider is configured under Settings > Connectors. Your OpenAI API key below is being used instead.', 'otter-blocks' ) }
						</Notice>
					</PanelRow>
				) }

				{ ( ! aiClientSupported || hasStoredApiKey ) && (
					<PanelRow>
						<BaseControl
							label={
								aiClientSupported ?
									__( 'OpenAI API (Deprecated)', 'otter-blocks' ) :
									__( 'OpenAI API', 'otter-blocks' )
							}
							help={
								aiClientSupported ?
									__( 'Legacy connection. We recommend switching to WordPress AI under Settings > Connectors. Clearing the key removes this option.', 'otter-blocks' ) :
									__( 'Connect your OpenAI API key to use AI features in the block editor.', 'otter-blocks' )
							}
							id="otter-options-openai-api"
							className="otter-button-field"
						>
							<TextControl
								type="text"
								label={ __( 'Secret Key', 'otter-blocks' ) }
								value={ openAISecretKey }
								placeholder={ maskOpenAISecretKey ? maskOpenAISecretKey : __( 'OpenAI API Key', 'otter-blocks' ) }
								disabled={ 'saving' === status }
								onChange={ value => setOpenAISecretKey( value ) }
							/>

							<div className="otter-button-group">
								<Button
									variant="secondary"
									isSecondary
									disabled={ 'saving' === status }
									onClick={ saveApiKey }
								>
									{ __( 'Save', 'otter-blocks' ) }
								</Button>

								<ExternalLink
									href="https://platform.openai.com/account/api-keys"
								>
									{ __( 'Get API Key', 'otter-blocks' ) }
								</ExternalLink>

								<ExternalLink
									href="https://docs.themeisle.com/article/1916-how-to-generate-an-openai-api-key"
								>
									{ __( 'More Info', 'otter-blocks' ) }
								</ExternalLink>
							</div>
						</BaseControl>
					</PanelRow>
				) }
			</PanelBody>

			{ hasConfiguredAI && (
				<PanelBody
					title={ __( 'Toolbar Actions', 'otter-blocks' ) }
					initialOpen={ true }
				>
					<PanelRow>
						<BaseControl
							label={ __( 'AI Toolbar Actions', 'otter-blocks' ) }
							help={ __( 'Configure, reorder, and customize the actions available in the AI Content toolbar.', 'otter-blocks' ) }
							id="otter-options-toolbar-actions"
							className="otter-button-field"
						>
							<p className="otter-ai-toolbar-actions__hint">
								{ __( 'Press and hold the drag handle to reorder actions.', 'otter-blocks' ) }
							</p>

							<p className="otter-ai-toolbar-actions__counter">
								{
									sprintf(
										/* translators: 1: number of custom actions, 2: maximum custom actions */
										__( 'Custom actions: %1$d/%2$d', 'otter-blocks' ),
										customActionCount,
										MAX_CUSTOM_TOOLBAR_ACTIONS
									)
								}
							</p>

							<div className="otter-ai-toolbar-actions">
								<SortableVerticalList
									className="otter-ai-toolbar-actions__list"
									items={ toolbarActions }
									getItemId={ ( action ) => action.id }
									onReorder={ reorderActions }
								>
									{ ( action, index, id ) => (
										<SortableToolbarAction
											key={ id }
											id={ id }
											action={ action }
											index={ index }
											isSaving={ 'saving' === status }
											onUpdate={ updateAction }
											onRemove={ removeAction }
										/>
									) }
								</SortableVerticalList>

								<button
									type="button"
									className="otter-ai-toolbar-actions__add"
									disabled={ 'saving' === status || ! canAddCustomAction }
									onClick={ addCustomAction }
								>
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
									</svg>
									<span>{ __( 'Add custom action', 'otter-blocks' ) }</span>
								</button>
							</div>

							{ showRestoreDefaults && (
								<HStack spacing={ 3 } className="otter-ai-toolbar-actions__controls">
									<Button
										variant="tertiary"
										disabled={ 'saving' === status }
										onClick={ restoreBuiltinDefaults }
									>
										{ __( 'Restore default actions', 'otter-blocks' ) }
									</Button>
								</HStack>
							) }

							<div className="otter-button-group otter-ai-toolbar-actions__footer">
								<Button
									variant="primary"
									isPrimary
									disabled={ 'saving' === status || ! isDirty }
									onClick={ saveToolbarActions }
								>
									{ __( 'Save Actions', 'otter-blocks' ) }
								</Button>

								<ExternalLink
									href="https://docs.themeisle.com/collection/1563-otter---page-builder-blocks-extensions"
								>
									{ __( 'More Info', 'otter-blocks' ) }
								</ExternalLink>
							</div>
						</BaseControl>
					</PanelRow>
				</PanelBody>
			) }
		</Fragment>
	);
};

export default AI;
