/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';


import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	ToolbarGroup,
	Spinner,
	ExternalLink,
	Disabled
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment, useEffect, useState } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

import { useDispatch, useSelect } from '@wordpress/data';
import { rawHandler, createBlock } from '@wordpress/blocks';
import { BlockControls } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import { aiGeneration } from '../../helpers/icons';
import './editor.scss';
import { PromptsData, editLastConversation, injectActionIntoPrompt, retrieveEmbeddedPrompt, sendPromptToOpenAI, tryInjectIntoTemplate } from '../../helpers/prompt';
import useSettings from '../../helpers/use-settings';
import { openAiAPIKeyName } from '../../components/prompt';
import { insertBlockBelow } from '../../helpers/block-utility';
import type { BlockProps } from '../../helpers/blocks';

const isValidBlock =  ( blockName: string|undefined ) => {
	if ( ! blockName ) {
		return false;
	}

	return [
		'core/paragraph',
		'core/heading'
	].some( ( name ) => name === blockName );
};

/**
 * Extract the content from a block or blocks.
 *
 * @param source The block or blocks to extract the content from.
 */
const extractContent = ( source: BlockProps<unknown> | BlockProps<unknown>[]): string => {

	if ( Array.isArray( source ) ) {
		return source.reduce( ( content: string, block: BlockProps<unknown> ) => {
			return content + extractContent( block );
		}, '' );
	}

	if (
		'core/paragraph' === source.name ||
		'core/heading' === source.name
	) {
		return source.attributes.content as string;
	}

	return '';
};

let embeddedPromptsCache: PromptsData|null = null;

const AIToolbar = ({
	props,
	onClose
}) => {
	const [ getOption, _, status ] = useSettings();
	const [ hasAPIKey, setHasAPIKey ] = useState<boolean>( false );
	const [ isProcessing, setIsProcessing ] = useState<Record<string, boolean>>({});
	const [ displayError, setDisplayError ] = useState<string|undefined>( undefined );
	const [ customActions, setCustomActions ] = useState<{title: string, prompt: string}[]>([]);

	// Get the create notice function from the hooks api.
	const { createNotice } = useDispatch( 'core/notices' );

	const {
		isMultipleSelection,
		selectedBlocks
	} = useSelect( ( select ) => {
		const selectedBlocks = select( 'core/block-editor' ).getMultiSelectedBlocks();

		return {
			isMultipleSelection: 1 < selectedBlocks.length,
			selectedBlocks
		};
	}, []);

	useEffect( () => {
		if ( 'loading' === status ) {
			return;
		}

		if ( 'loaded' === status && ! hasAPIKey ) {
			const key = getOption( openAiAPIKeyName ) as string;
			setHasAPIKey(  Boolean( key ) && 0 < key.length );
			setCustomActions( getOption( 'themeisle_blocks_settings_prompt_actions' ) as {title: string, prompt: string}[]);
		}
	}, [ status, getOption ]);

	useEffect( () => {
		if ( ! displayError ) {
			return;
		}

		createNotice(
			'error',
			displayError,
			{
				type: 'snackbar',
				isDismissible: true
			}
		);

		setDisplayError( undefined );
	}, [ displayError ]);

	const generateContent = async( content: string, actionKey: string, callback: Function = () =>{}, actionIndex: number = -1 ) => {

		if ( ! content ) {
			setDisplayError( __( 'No content detected in selected block.', 'otter-blocks' ) );
			return;
		}

		if ( ! embeddedPromptsCache ) {
			const response = await retrieveEmbeddedPrompt( 'textTransformation' );
			embeddedPromptsCache = response?.prompts ?? [];
		}

		let embeddedPrompt = embeddedPromptsCache?.find( ( prompt ) => 'textTransformation' === prompt.otter_name );

		if ( ! embeddedPrompt ) {
			setDisplayError( __( 'Something when wrong retrieving the prompts.', 'otter-blocks' ) );
			return;
		}

		const action: undefined | string = embeddedPrompt?.[actionKey];

		if ( ! action ) {
			setDisplayError( __( 'The action is not longer available.', 'otter-blocks' ) );
			return;
		}

		if ( ! hasAPIKey ) {
			setDisplayError( __( 'No Open API key detected. Please add your key.', 'otter-blocks' ) );
			return;
		}

		setIsProcessing( prevState => ({ ...prevState, [ actionKey ]: true }) );

		window.oTrk?.add({ feature: 'ai-generation', featureComponent: 'ai-toolbar', featureValue: actionKey }, { consent: true });

		embeddedPrompt = injectActionIntoPrompt(
			embeddedPrompt,
			action
		);

		if ( -1 !== actionIndex && customActions?.[ actionIndex ]?.prompt ) {

			// Overwrite the prompt with the custom action.
			embeddedPrompt = editLastConversation( embeddedPrompt, ( _ ) => tryInjectIntoTemplate( customActions![ actionIndex ]!.prompt, content ) );
			window.oTrk?.add({ feature: 'ai-generation', featureComponent: 'ai-toolbar-custom-action', featureValue: customActions?.[ actionIndex ]?.title }, { consent: true });
		}

		sendPromptToOpenAI(
			content,
			injectActionIntoPrompt(
				embeddedPrompt,
				action
			),
			{
				'otter_used_action': `textTransformation::${ actionKey }`,
				'otter_user_content': content
			}
		).then( ( response ) => {
			if ( response.error ) {
				setDisplayError( response.error?.message ?? response.error );
				return;
			}

			const blockContentRaw = response?.choices?.[0]?.message.content;

			if ( ! blockContentRaw ) {
				return;
			}

			const newBlocks = rawHandler({
				HTML: blockContentRaw
			});

			const aiBlock = createBlock(
				'themeisle-blocks/content-generator',
				{
					promptID: 'textTransformation',
					resultHistory: [{
						result: response?.choices?.[0]?.message.content ?? '',
						meta: {
							usedToken: response?.usage.total_tokens,
							prompt: embeddedPrompt.messages?.[ embeddedPrompt.messages.length - 1 ]?.content
						}
					}],
					replaceTargetBlock: {
						clientId: props.clientId,
						name: props.name
					}
				},
				newBlocks
			);

			insertBlockBelow( props.clientId, aiBlock );

			setIsProcessing( prevState => ({ ...prevState, [ actionKey ]: false }) );
			callback?.();
		}).catch( ( error ) => {
			setDisplayError( error.message );
			setIsProcessing( prevState => ({ ...prevState, [ actionKey ]: false }) );
		});
	};

	const ActionMenuItem = ( args: { actionKey: string, children: React.ReactNode, callback: Function, actionIndex?: number }) => {
		return (
			<Disabled isDisabled={Object.values( isProcessing ).some( x => x )}>
				<MenuItem
					onClick={ () => {
						generateContent( extractContent( isMultipleSelection ? selectedBlocks : props ), args.actionKey, () => args.callback?.( args.actionKey ), args?.actionIndex );
					}}
				>
					{ args.children }
					{ isProcessing?.[args.actionKey] && <Spinner /> }
				</MenuItem>
			</Disabled>
		);
	};

	return (
		<Fragment>
			{
				( ! hasAPIKey ) && (
					<MenuGroup>
						<span className='o-menu-item-alignment' style={{ display: 'block', marginBottom: '10px' }}>
							{ __( 'Please add your OpenAI API key in Integrations.', 'otter-blocks' ) }
						</span>
						<ExternalLink className='o-menu-item-alignment' href={window.themeisleGutenberg.optionsPath} target="_blank" rel="noopener noreferrer">
							{
								__( 'Go to Dashboard', 'otter-blocks' )
							}
						</ExternalLink>
					</MenuGroup>
				)
			}
			<MenuGroup>
				{
					customActions.map( ( action, index ) => (
						<ActionMenuItem key={index} actionIndex={index} actionKey={'otter_action_prompt'} callback={onClose}>
							{ action.title }
						</ActionMenuItem>
					) )
				}
			</MenuGroup>
			<MenuGroup>
				<ActionMenuItem actionKey='otter_action_prompt' callback={onClose}>
					{ __( 'Use as prompt', 'otter-blocks' ) }
				</ActionMenuItem>
			</MenuGroup>
			<MenuGroup>
				<ExternalLink className='o-menu-item-alignment' href={`${window.themeisleGutenberg?.optionsPath}#integrations`} rel="noopener noreferrer">
					{
						__( 'Edit Custom Prompts', 'otter-blocks' )
					}
				</ExternalLink>
			</MenuGroup>
			<MenuGroup>
				<ExternalLink className='o-menu-item-alignment' href="https://docs.themeisle.com/collection/1563-otter---page-builder-blocks-extensions"rel="noopener noreferrer">
					{
						__( 'Go to docs', 'otter-blocks' )
					}
				</ExternalLink>
			</MenuGroup>
		</Fragment>
	);
};

const withConditions = createHigherOrderComponent( BlockEdit => {
	return props => {
		const {
			isMultipleSelection,
			areValidBlocks,
			isHidden
		} = useSelect( ( select ) => {

			const canUse = Boolean( window.themeisleGutenberg?.hasModule?.aiToolbar );

			if ( ! canUse ) {
				return {
					isMultipleSelection: false,
					areValidBlocks: false,
					isHidden: true
				};
			}

			const selectedBlocks: {name: string; [key: string]: any}[] = select( 'core/block-editor' )?.getMultiSelectedBlocks() ?? [];
			const hiddenBlocks: string[] = select( 'core/preferences' )?.get( 'core/edit-post', 'hiddenBlockTypes' ) ?? [];

			return {
				isMultipleSelection: 1 < selectedBlocks.length,
				areValidBlocks: selectedBlocks.every( ( block ) => isValidBlock( block.name ) ),
				isHidden: hiddenBlocks.includes( 'themeisle-blocks/content-generator' ) ?? false
			};
		}, []);

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{
					(
						! isHidden &&
						(
							( isValidBlock( props.name ) && props.isSelected ) || ( areValidBlocks && isMultipleSelection )
						)
					) &&
					(
						<BlockControls>
							<ToolbarGroup>
								<DropdownMenu
									icon={ aiGeneration }
									label={ __( 'Otter AI Content', 'otter-blocks' ) }
								>
									{
										({ onClose }) => (
											<AIToolbar props={ props } onClose={ onClose } />
										)
									}
								</DropdownMenu>
							</ToolbarGroup>
						</BlockControls>
					) }
			</Fragment>
		);
	};

}, 'withConditions' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-ai-content-toolbar', withConditions );
