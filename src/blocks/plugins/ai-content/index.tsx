/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	ToolbarGroup,
	ExternalLink
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment, useMemo, useState } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

import { useSelect } from '@wordpress/data';
import { BlockControls } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import { aiGeneration } from '../../helpers/icons';
import './editor.scss';
import { isAIBackendConfigured } from '../../helpers/prompt';
import useSettings from '../../helpers/use-settings';
import { openAiAPIKeyName } from '../../components/prompt';
import type { BlockProps } from '../../helpers/blocks';
import {
	AIToolbarAction,
	filterToolbarActionsForBlocks,
	getToolbarActionsFromSettings,
	normalizeToolbarActions
} from './actions';
import AIContentModal from './modal';
import { extractBlockTextContent } from './apply-content';

type AIToolbarMenuProps = {
	hasAPIKey: boolean;
	toolbarActions: AIToolbarAction[];
	activeBlocks: BlockProps<unknown>[];
	onOpenAction: ( actionId?: string, initialPrompt?: string ) => void;
	onCloseDropdown: () => void;
};

const AIToolbarMenu = ({
	hasAPIKey,
	toolbarActions,
	activeBlocks,
	onOpenAction,
	onCloseDropdown
}: AIToolbarMenuProps ) => {
	const openAction = ( actionId?: string, initialPrompt?: string ) => {
		onOpenAction( actionId, initialPrompt );
		onCloseDropdown();
	};

	return (
		<Fragment>
			{
				( ! hasAPIKey ) && (
					<MenuGroup>
						<span className='o-menu-item-alignment' style={{ display: 'block', marginBottom: '10px' }}>
							{ __( 'Please set up an AI provider in Integrations.', 'otter-blocks' ) }
						</span>
						<ExternalLink className='o-menu-item-alignment' href={ `${ window.themeisleGutenberg.optionsPath }#ai` } target="_blank" rel="noopener noreferrer">
							{
								__( 'Go to Dashboard', 'otter-blocks' )
							}
						</ExternalLink>
					</MenuGroup>
				)
			}
			<MenuGroup>
				{
					toolbarActions.map( ( action ) => (
						<MenuItem
							key={ action.id }
							onClick={ () => openAction( action.id ) }
						>
							{ action.title }
						</MenuItem>
					) )
				}
			</MenuGroup>
			<MenuGroup>
				<MenuItem onClick={ () => openAction( toolbarActions[0]?.id, extractBlockTextContent( activeBlocks ) ) }>
					{ __( 'Use as prompt', 'otter-blocks' ) }
				</MenuItem>
			</MenuGroup>
			<MenuGroup>
				<ExternalLink className='o-menu-item-alignment' href={ `${ window.themeisleGutenberg?.optionsPath }#ai` } rel="noopener noreferrer">
					{
						__( 'Edit Custom Prompts', 'otter-blocks' )
					}
				</ExternalLink>
			</MenuGroup>
			<MenuGroup>
				<ExternalLink className='o-menu-item-alignment' href="https://docs.themeisle.com/collection/1563-otter---page-builder-blocks-extensions" rel="noopener noreferrer">
					{
						__( 'Go to docs', 'otter-blocks' )
					}
				</ExternalLink>
			</MenuGroup>
		</Fragment>
	);
};

const withAIToolbar = createHigherOrderComponent( BlockEdit => {
	return props => {
		const [ getOption, _, settingsStatus ] = useSettings();
		const [ isModalOpen, setIsModalOpen ] = useState( false );
		const [ modalActionId, setModalActionId ] = useState<string | undefined>();
		const [ modalInitialPrompt, setModalInitialPrompt ] = useState<string | undefined>();

		const {
			canUse,
			isMultipleSelection,
			selectedBlocks,
			selectedClientIds,
			activeBlocks
		} = useSelect( ( select ) => {

			const canUseToolbar = Boolean( window.themeisleGutenberg?.hasModule?.aiToolbar );

			if ( ! canUseToolbar ) {
				return {
					canUse: canUseToolbar,
					isMultipleSelection: false,
					selectedBlocks: [],
					selectedClientIds: [],
					activeBlocks: []
				};
			}

			const blockEditor = select( 'core/block-editor' );
			const selectedBlocks: {name: string; clientId: string; [key: string]: any}[] = blockEditor?.getMultiSelectedBlocks() ?? [];
			const selectedClientIds = blockEditor?.getMultiSelectedBlockClientIds() ?? [];
			const clientIds = 0 < selectedClientIds.length ? selectedClientIds : ( props.clientId ? [ props.clientId ] : [] );
			const activeBlocks = clientIds
				.map( ( clientId ) => blockEditor?.getBlock( clientId ) )
				.filter( Boolean );

			return {
				canUse: canUseToolbar,
				isMultipleSelection: 1 < selectedBlocks.length,
				selectedBlocks,
				selectedClientIds,
				activeBlocks
			};
		}, [ props.clientId ]);

		const applicableActions = useMemo( () => {
			if ( 'loading' === settingsStatus ) {
				return [];
			}

			const actions = normalizeToolbarActions(
				getToolbarActionsFromSettings( getOption ) as Parameters<typeof normalizeToolbarActions>[0]
			);
			const blockNames = isMultipleSelection
				? selectedBlocks.map( ( block ) => block.name )
				: [ props.name ];

			return filterToolbarActionsForBlocks( actions, blockNames );
		}, [ getOption, isMultipleSelection, props.name, selectedBlocks, settingsStatus ]);

		const hasAPIKey = 'loaded' === settingsStatus && (
			isAIBackendConfigured() ||
			Boolean( getOption( openAiAPIKeyName ) )
		);

		const isBlockSelected = isMultipleSelection
			? selectedBlocks.some( ( block ) => block.clientId === props.clientId )
			: props.isSelected;

		const showToolbar = canUse && 0 < applicableActions.length && isBlockSelected;

		const openModal = ( actionId?: string, initialPrompt?: string ) => {
			setModalActionId( actionId );
			setModalInitialPrompt( initialPrompt );
			setIsModalOpen( true );
		};

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{
					showToolbar && (
						<Fragment>
							<BlockControls group="other">
								<ToolbarGroup>
									<DropdownMenu
										icon={ aiGeneration }
										label={ __( 'Otter AI Content', 'otter-blocks' ) }
									>
										{
											({ onClose }) => (
												<AIToolbarMenu
													hasAPIKey={ hasAPIKey }
													toolbarActions={ applicableActions }
													activeBlocks={ activeBlocks as BlockProps<unknown>[] }
													onOpenAction={ openModal }
													onCloseDropdown={ onClose }
												/>
											)
										}
									</DropdownMenu>
								</ToolbarGroup>
							</BlockControls>

							{
								isModalOpen && (
									<AIContentModal
										isOpen={ isModalOpen }
										onClose={ () => setIsModalOpen( false ) }
										actions={ applicableActions }
										initialActionId={ modalActionId }
										initialPrompt={ modalInitialPrompt }
										selectedBlocks={ activeBlocks as BlockProps<unknown>[] }
										isMultipleSelection={ isMultipleSelection }
										singleClientId={ props.clientId }
										selectedClientIds={ selectedClientIds }
									/>
								)
							}
						</Fragment>
					) }
			</Fragment>
		);
	};

}, 'withAIToolbar' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-ai-content-toolbar', withAIToolbar );
