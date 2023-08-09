/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

// @ts-ignore
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem, DropdownMenu, MenuGroup, MenuItem, Toolbar, Spinner
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment, useEffect, useState } from '@wordpress/element';

import {
	addFilter,
	applyFilters
} from '@wordpress/hooks';

import { useDispatch, useSelect } from '@wordpress/data';
import { rawHandler, serialize } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import { BlockControls } from '@wordpress/block-editor';
import { aiGeneration } from '../../helpers/icons';
import './editor.scss';
import { PromptsData, injectActionIntoPrompt, retrieveEmbeddedPrompt, sendPromptToOpenAI } from '../../helpers/prompt';
import useSettings from '../../helpers/use-settings';
import { openAiAPIKeyName } from '../../components/prompt';
import { insertBlockBelow } from '../../helpers/block-utility';

const isValidBlock =  ( blockName: string|undefined ) => {
	if ( ! blockName ) {
		return false;
	}

	return [
		'core/paragraph'
	].some( ( name ) => name === blockName );
};

const extractContent = ( props ) => {
	if ( 'core/paragraph' === props.name ) {
		return props.attributes.content;
	}

	return '';
};

let embeddedPromptsCache: PromptsData|null = null;

const withConditions = createHigherOrderComponent( BlockEdit => {
	return props => {
		const [ embeddedPrompts, setEmbeddedPrompts ] = useState<PromptsData|null>( null );
		const [ getOption, updateOption, status ] = useSettings();
		const [ apiKey, setApiKey ] = useState<string | null>( null );
		const [ isProcessing, setIsProcessing ] = useState<Record<string, boolean>>({});
		const [ displayError, setDisplayError ] = useState<string|undefined>( undefined );

		// Get the create notice function from the hooks api.
		const { createNotice } = useDispatch( 'core/notices' );


		useEffect( () => {
			const getEmbeddedPrompt = async() => {
				retrieveEmbeddedPrompt( 'textTransformation' ).then( ( promptServer ) => {
					setEmbeddedPrompts( promptServer.prompts );
					embeddedPromptsCache = promptServer.prompts;
				});
			};

			if ( ! embeddedPromptsCache ) {
				console.count( 'getEmbeddedPrompt' ); // TODO: remove after prototyping
				getEmbeddedPrompt();
			}
		}, []);

		useEffect( () => {
			if ( 'loading' === status ) {
				return;
			}

			if ( 'loaded' === status && ! apiKey ) {
				if ( getOption( openAiAPIKeyName ) ) {
					console.log( getOption( openAiAPIKeyName ) );
					setApiKey( getOption( openAiAPIKeyName ) );
				}
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

		const generateContent = ( content: string, actionKey: string, callback: Function = () =>{}) => {

			if ( ! content ) {
				setDisplayError( __( 'No content detected in selected block.', 'otter-blocks' ) );
				return;
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

			if ( ! apiKey ) {
				setDisplayError( __( 'No Open API key detected. Please add your key.', 'otter-blocks' ) );
				return;
			}

			setIsProcessing( prevState => ({ ...prevState, [ actionKey ]: true }) );
			sendPromptToOpenAI(
				content,
				apiKey,
				injectActionIntoPrompt(
					embeddedPrompt,
					action
				)
			).then( ( response ) => {
				if ( response.error ) {
					setDisplayError( response.error );
					return;
				}
				console.log( response );

				console.log( response?.choices?.[0]?.message.content );
				const blockContentRaw = response?.choices?.[0]?.message.content;

				if ( ! blockContentRaw ) {
					return;
				}

				const newBlocks = rawHandler({
					HTML: blockContentRaw
				});

				insertBlockBelow( props.clientId, newBlocks );

				setIsProcessing( prevState => ({ ...prevState, [ actionKey ]: false }) );
				callback?.();
			}).catch( ( error ) => {
				setDisplayError( error.message );
				setIsProcessing( prevState => ({ ...prevState, [ actionKey ]: false }) );
			});
		};

		return (
			<Fragment>
				<BlockEdit { ...props } />

				{ isValidBlock( props.name ) && props.isSelected && (
					<BlockControls>
						<Toolbar>
							<DropdownMenu
								icon={aiGeneration}
								label={ __( 'Otter AI Content' ) }
							>
								{
									({ onClose }) => (
										<Fragment>
											<MenuGroup>
												<span className="o-menu-item-header">{__( 'Writing', 'otter-blocks' )}</span>
												<MenuItem onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_generate_title', onClose );
												} }>
													{ __( 'Generate a title', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_generate_title'] && <Spinner /> }
												</MenuItem>
												<MenuItem  onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_continue_writing', onClose );
												} }>
													{ __( 'Continue writing', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_continue_writing'] && <Spinner /> }
												</MenuItem>
												<MenuItem  onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_summarize', onClose );
												} }>
													{ __( 'Summarize text', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_summarize'] && <Spinner /> }
												</MenuItem>
												<MenuItem  onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_make_shorter', onClose );
												} }>
													{ __( 'Make shorter', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_make_shorter'] && <Spinner /> }
												</MenuItem>
												<MenuItem  onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_make_longer', onClose );
												} }>
													{ __( 'Make longer', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_make_longer'] && <Spinner /> }
												</MenuItem>
											</MenuGroup>
											<MenuGroup>
												<span className="o-menu-item-header">{__( 'Tone', 'otter-blocks' )}</span>
												<MenuItem  onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_tone_professional', onClose );
												} }>
													{ __( 'Professional', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_tone_professional'] && <Spinner /> }
												</MenuItem>
												<MenuItem  onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_tone_friendly', onClose );
												} }>
													{ __( 'Friendly', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_tone_friendly'] && <Spinner /> }
												</MenuItem>
												<MenuItem  onClick={ () => {
													generateContent( extractContent( props ), 'otter_action_tone_humorous', onClose );
												} }>
													{ __( 'Humorous', 'otter-blocks' ) }
													{ isProcessing?.['otter_action_tone_humorous'] && <Spinner /> }
												</MenuItem>
											</MenuGroup>
											<MenuGroup>
												<MenuItem onClick={ onClose }>
													{ __( 'Discard changes', 'otter-blocks' ) }
												</MenuItem>
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
