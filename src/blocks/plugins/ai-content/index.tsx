/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

// @ts-ignore
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Toolbar,
	Spinner,
	ExternalLink,
	Disabled
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment, useEffect, useState } from '@wordpress/element';

import {
	addFilter,
	applyFilters
} from '@wordpress/hooks';

import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { rawHandler, createBlock } from '@wordpress/blocks';
import { BlockControls } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import { aiGeneration } from '../../helpers/icons';
import './editor.scss';
import { PromptsData, injectActionIntoPrompt, retrieveEmbeddedPrompt, sendPromptToOpenAI } from '../../helpers/prompt';
import useSettings from '../../helpers/use-settings';
import { openAiAPIKeyName } from '../../components/prompt';
import { insertBlockBelow } from '../../helpers/block-utility';
import { BlockProps } from '../../helpers/blocks';

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

const withConditions = createHigherOrderComponent( BlockEdit => {
	return props => {
		const [ getOption, _, status ] = useSettings();
		const [ hasAPIKey, setHasAPIKey ] = useState<boolean>( false );
		const [ isProcessing, setIsProcessing ] = useState<Record<string, boolean>>({});
		const [ displayError, setDisplayError ] = useState<string|undefined>( undefined );

		// Get the create notice function from the hooks api.
		const { createNotice } = useDispatch( 'core/notices' );

		const {
			isMultipleSelection,
			areValidBlocks,
			selectedBlocks
		} = useSelect( ( select ) => {
			const selectedBlocks = select( 'core/block-editor' ).getMultiSelectedBlocks();

			return {
				isMultipleSelection: 1 < selectedBlocks.length,
				areValidBlocks: selectedBlocks.every( ( block ) => isValidBlock( block.name ) ),
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

		const generateContent = async( content: string, actionKey: string, callback: Function = () =>{}) => {

			if ( ! content ) {
				setDisplayError( __( 'No content detected in selected block.', 'otter-blocks' ) );
				return;
			}

			if ( ! embeddedPromptsCache ) {
				const response = await retrieveEmbeddedPrompt( 'textTransformation' );
				embeddedPromptsCache = response?.prompts ?? [];
			}

			const embeddedPrompt = embeddedPromptsCache?.find( ( prompt ) => 'textTransformation' === prompt.otter_name );

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
								prompt: ''
							}
						}]
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

		const ActionMenuItem = ( args: { actionKey: string, children: React.ReactNode, callback: Function }) => {
			return (
				<Disabled isDisabled={Object.values( isProcessing ).some( x => x )}>
					<MenuItem
						onClick={ () => {
							generateContent( extractContent( isMultipleSelection ? selectedBlocks : props ), args.actionKey, () => args.callback?.( args.actionKey ) );
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
				<BlockEdit { ...props } />
				{(
					( isValidBlock( props.name ) && props.isSelected ) || ( areValidBlocks && isMultipleSelection ) ) &&
					(
						<BlockControls>
							<Toolbar>
								<DropdownMenu
									icon={aiGeneration}
									label={ __( 'Otter AI Content' ) }
								>
									{
										({ onClose }) => (
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
													<span className="o-menu-item-header o-menu-item-alignment">{__( 'Writing', 'otter-blocks' )}</span>
													<ActionMenuItem actionKey='otter_action_generate_title' callback={onClose}>
														{ __( 'Generate a heading', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_continue_writing' callback={onClose}>
														{ __( 'Continue writing', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_summarize' callback={onClose}>
														{ __( 'Summarize it', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_make_shorter' callback={onClose}>
														{ __( 'Make it shorter', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_make_longer' callback={onClose}>
														{ __( 'Make it longer', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_make_descriptive' callback={onClose}>
														{ __( 'Make it more descriptive', 'otter-blocks' ) }
													</ActionMenuItem>
												</MenuGroup>
												<MenuGroup>
													<span className="o-menu-item-header o-menu-item-alignment">{__( 'Tone', 'otter-blocks' )}</span>
													<ActionMenuItem actionKey='otter_action_tone_professional' callback={onClose}>
														{ __( 'Professional', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_tone_friendly' callback={onClose}>
														{ __( 'Friendly', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_tone_humorous' callback={onClose}>
														{ __( 'Humorous', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_tone_confident' callback={onClose}>
														{ __( 'Confident', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_tone_persuasive' callback={onClose}>
														{ __( 'Persuasive', 'otter-blocks' ) }
													</ActionMenuItem>
													<ActionMenuItem actionKey='otter_action_tone_casual' callback={onClose}>
														{ __( 'Casual', 'otter-blocks' ) }
													</ActionMenuItem>
												</MenuGroup>
												<MenuGroup>
													<ActionMenuItem actionKey='otter_action_prompt' callback={onClose}>
														{ __( 'Use as prompt', 'otter-blocks' ) }
													</ActionMenuItem>
												</MenuGroup>
												<MenuGroup>
													<ExternalLink className='o-menu-item-alignment' href="https://docs.themeisle.com/collection/1563-otter---page-builder-blocks-extensions" target="_blank" rel="noopener noreferrer">
														{
															__( 'Go to docs', 'otter-blocks' ) // TODO: Add link to docs & CSS styling
														}
													</ExternalLink>
												</MenuGroup>
											</Fragment>
										)
									}
								</DropdownMenu>
							</Toolbar>
						</BlockControls>
					) }
			</Fragment>
		);
	};
}, 'withConditions' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-ai-content-toolbar', withConditions );
