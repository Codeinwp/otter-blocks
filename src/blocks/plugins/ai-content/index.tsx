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

// Stable empty array so useSelect returns a referentially-equal value across
// renders (a fresh `[]` would fail useSelect's equality check on every block).
const EMPTY_BLOCKS: BlockProps<unknown>[] = [];
const EMPTY_IDS: string[] = [];

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

		// Only return store-memoized/stable values here. Building arrays inside
		// useSelect (e.g. clientIds.map(getBlock)) yields a new reference every
		// call and trips useSelect's equality check for every block on the page,
		// which floods the console and degrades the editor. `activeBlocks` is
		// derived below with useMemo instead.
		const {
			canUse,
			selectedBlocks,
			selectedClientIds,
			currentBlock
		} = useSelect( ( select ) => {

			const canUseToolbar = Boolean( window.themeisleGutenberg?.hasModule?.aiToolbar );

			if ( ! canUseToolbar ) {
				return {
					canUse: false,
					selectedBlocks: EMPTY_BLOCKS,
					selectedClientIds: EMPTY_IDS,
					currentBlock: null
				};
			}

			const blockEditor = select( 'core/block-editor' );

			return {
				canUse: true,
				selectedBlocks: blockEditor?.getMultiSelectedBlocks() ?? EMPTY_BLOCKS,
				selectedClientIds: blockEditor?.getMultiSelectedBlockClientIds() ?? EMPTY_IDS,
				currentBlock: props.clientId ? blockEditor?.getBlock( props.clientId ) : null
			};
		}, [ props.clientId ]);

		const isMultipleSelection = 1 < selectedBlocks.length;

		const activeBlocks = useMemo( () => {
			if ( 0 < selectedClientIds.length ) {
				return selectedBlocks;
			}
			return currentBlock ? [ currentBlock ] : EMPTY_BLOCKS;
		}, [ selectedBlocks, selectedClientIds, currentBlock ]);

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
