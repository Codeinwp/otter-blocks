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
	PanelBody,
	PanelRow,
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

const AI = () => {
	const [ getOption, updateOption, status ] = useSettings();
	const [ openAISecretKey, setOpenAISecretKey ] = useState( '' );
	const [ maskOpenAISecretKey, setMaskOpenAISecretKey ] = useState( '' );
	const [ hasSavedApiKey, setHasSavedApiKey ] = useState( false );
	const [ toolbarActions, setToolbarActions ] = useState( [] );
	const [ savedActionsSnapshot, setSavedActionsSnapshot ] = useState( '' );
	const hasInitializedActions = useRef( false );
	const { createNotice } = useDispatch( 'core/notices' );

	const hasStoredApiKey = hasSavedApiKey || 0 < getOption( 'themeisle_open_ai_api_key' )?.length;
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
				title={ __( 'OpenAI Connection', 'otter-blocks' ) }
			>
				<PanelRow>
					<BaseControl
						label={ __( 'OpenAI API', 'otter-blocks' ) }
						help={ __( 'Connect your OpenAI API key to use AI features in the block editor.', 'otter-blocks' ) }
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
			</PanelBody>

			{ hasStoredApiKey && (
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
