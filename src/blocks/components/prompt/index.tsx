/**
 * WordPress dependencies
 */

import { __, sprintf } from '@wordpress/i18n';
import { closeSmall, redo, undo } from '@wordpress/icons';
import { ReactNode } from 'react';
import { Button, ExternalLink, Notice, Placeholder, Spinner, TextControl } from '@wordpress/components';
import { Fragment, useEffect, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */

import useSettings from '../../helpers/use-settings';
import {
	PromptConversation,
	PromptsData,
	injectActionIntoPrompt,
	injectConversationIntoPrompt,
	retrieveEmbeddedPrompt,
	sendPromptToOpenAI, sendPromptToOpenAIWithRegenerate
} from '../../helpers/prompt';
import PromptInput from './prompt-input';
import './editor.scss';

type PromptPlaceholderProps = {
	promptID?: string
	promptPlaceholder?: string
	title?: string
	value: string
	onValueChange: ( text: string ) => void
	children?: ReactNode
	onClose?: () => void
	mainActionLabel?: string
	onPreview?: ( result: string ) => void
	actionButtons?: ( props: {status?: string}) => ReactNode
	resultHistory?: {result: string, meta: { usedToken: number, prompt: string }}[]

	/**
	 * Session key used ONLY as the dedup key for AI generation tracking sets (never sent as a value).
	 */
	trackingKey?: string

	/**
	 * Shared flag set by the parent when the generation is accepted, so a later discard cannot clobber it.
	 */
	hasAcceptedRef?: { current: boolean }
};

export const openAiAPIKeyName = 'themeisle_open_ai_api_key';

// Allowlist the prompt preset id so an arbitrary string can never reach the tracking wire.
const allowedPromptID = ( promptID?: string ): string => {
	return [ 'form', 'textTransformation', 'patternsPicker' ].includes( promptID ?? '' ) ? promptID! : 'other';
};

// Bucket the regenerate-retry count into a coarse, non-PII enum: '0' | '1' | '2-3' | '4+'.
const retryBucket = ( count: number ): string => {
	if ( 1 > count ) {
		return '0';
	}
	if ( 1 === count ) {
		return '1';
	}
	if ( 4 > count ) {
		return '2-3';
	}
	return '4+';
};

const PromptBlockEditor = (
	props: {
		children?: ReactNode
		onRegenerate?: () => void
		onPrevResult?: () => void
		onNextResult?: () => void
		currentResultIndex?: number
		totalResults: number
		title?: string
		onClose?: () => void
		tokenUsageDescription?: string
		actionButtons?: ReactNode
		status?: string
		currentPrompt?: string
		showRegenerate?: boolean
	}
) => {
	return (
		<div className="prompt-result__container">
			<div className="prompt-result__header">
				<div className="prompt-result__header__title">
					{ props?.title ?? __( 'Result', 'otter-blocks' ) }
				</div>
				<div className="prompt-result__header__actions">
					<Button
						variant="tertiary"
						onClick={ props.onClose }
						icon={closeSmall}
					/>
				</div>
			</div>
			<div className="prompt-result__content">
				{ props.children }
			</div>
			<div className="prompt-result__actions">

				{ props.actionButtons }

				{
					props.showRegenerate && (
						<Button
							variant={ 'tertiary' }
							onClick={ props.onRegenerate }
							disabled={ 'loading' === props.status }
						>
							{ __( 'Regenerate', 'otter-blocks' ) }
						</Button>
					)
				}

				<div className="prompt-result__actions__navigation">
					{
						0 < props.totalResults && (
							<Fragment>
								<Button
									variant={'tertiary'}
									icon={undo}
									onClick={ props.onPrevResult }
									disabled={ 1 === props.currentResultIndex }
								/>

								<div className="prompt-result__actions__navigation__current">
									{ props.currentResultIndex } / { props.totalResults }
								</div>

								<Button
									variant={'tertiary'}
									icon={redo}
									onClick={ props.onNextResult }
									disabled={ props.totalResults === props.currentResultIndex }
								/>
							</Fragment>
						)
					}
				</div>
			</div>
			<span className="prompt-token-usage">
				{
					props.tokenUsageDescription
				}
			</span>
		</div>
	);
};

const PromptPlaceholder = ( props: PromptPlaceholderProps ) => {
	const { value, onValueChange, promptID, trackingKey, hasAcceptedRef } = props;

	// Regenerate-retry counter for the current generation session (0 on the first generation).
	const retryCount = useRef<number>( 0 );

	const [ getOption, updateOption, status ] = useSettings();
	const [ apiKey, setApiKey ] = useState<string | null>( null );

	const [ generationStatus, setGenerationStatus ] = useState<'loading' | 'loaded' | 'error'>( 'loaded' );

	const [ apiKeyStatus, setApiKeyStatus ] = useState<'checking' | 'missing' | 'present' | 'error'>( window.themeisleGutenberg?.hasOpenAiKey ? 'present' : 'checking' );
	const [ embeddedPrompts, setEmbeddedPrompts ] = useState<PromptsData>([]);

	const [ resultHistory, setResultHistory ] = useState<{result: string, meta: { usedToken: number, prompt: string }}[]>( props.resultHistory ?? []);
	const [ resultHistoryIndex, setResultHistoryIndex ] = useState<number>( 0 );
	
	const [ showError, setShowError ] = useState<boolean>( false );
	const [ errorMessage, setErrorMessage ] = useState<string>( '' );
	const [ tokenUsageDescription, setTokenUsageDescription ] = useState<string>( '' );

	useEffect( () => {
		const getEmbeddedPrompt = async() => {
			retrieveEmbeddedPrompt( promptID ).then( ( promptServer ) => {
				setEmbeddedPrompts( promptServer.prompts );
			});
		};

		getEmbeddedPrompt();
	}, []);

	/**
	 * Use the last conversation as the default prompt value for the text transformation actions.
	 */
	useEffect( () => {
		if (
			! props.promptID ||
			'textTransformation' !== props.promptID ||
			! props.resultHistory
		) {
			return;
		}

		const lastConversation = resultHistory?.[ resultHistory.length - 1 ]?.meta?.prompt;
		if ( lastConversation ) {
			onValueChange( lastConversation );
		}
	}, []);

	useEffect( () => {
		if ( 'loading' === status || 'present' === apiKeyStatus ) {
			return;
		}

		if ( 'loaded' === status ) {
			if ( getOption( openAiAPIKeyName ) ) {
				setApiKeyStatus( 'present' );
				setApiKey( getOption( openAiAPIKeyName ) );
			} else {
				setApiKeyStatus( 'missing' );
			}
		}

		if ( 'error' === status ) {
			setApiKeyStatus( 'error' );
		}
	}, [ status, getOption, apiKeyStatus ]);

	useEffect( () => {
		setResultHistoryIndex( resultHistory.length - 1 );
	}, [ resultHistory ]);

	useEffect( () => {

		if ( 0 > resultHistoryIndex ) {
			return;
		}

		if ( resultHistoryIndex > resultHistory.length - 1 ) {
			return;
		}
		
		setTokenUsageDescription(
			sprintf(
				// translators: %d: number of used tokens
				__( 'Used tokens: %d', 'otter-blocks' ),
				resultHistory[ resultHistoryIndex ].meta.usedToken 
			)
		);
		props.onPreview?.( resultHistory[ resultHistoryIndex ].result );

	}, [ resultHistoryIndex, resultHistory ]);

	function onPromptSubmit( regenerate = false ) {

		let embeddedPrompt = embeddedPrompts?.find( ( prompt ) => prompt.otter_name === promptID );

		if ( undefined === embeddedPrompt ) {
			setShowError( true );
			setErrorMessage( __( 'Prompt not found. Reload the page. If the error still persist the server might be down.', 'otter-blocks' ) );
			return;
		}

		// TODO: refactor this into a more reusable way
		if ( 'textTransformation' === promptID ) {
			const action = embeddedPrompt?.['otter_action_prompt'] ?? '';
			embeddedPrompt = injectActionIntoPrompt( embeddedPrompt, action );
		}

		if ( 'patternsPicker' === promptID && window.themeisleGutenberg?.hasPro ) {

			// Add the Pro patterns to the prompt.
			const addon: PromptConversation[] = embeddedPrompt?.['otter_pro_addon'] ?? [];

			addon?.forEach( ( conversation ) => {
				if ( embeddedPrompt ) {
					embeddedPrompt = injectConversationIntoPrompt( embeddedPrompt, conversation );
				}
			});
		}

		if ( 'present' !== apiKeyStatus ) {
			setShowError( true );
			setErrorMessage( __( 'API Key not found. Please add your API Key in the settings page.', 'otter-blocks' ) );
			return;
		}

		setGenerationStatus( 'loading' );

		// Track regenerate-retry depth: reset on the first generation, increment on each regenerate.
		retryCount.current = regenerate ? retryCount.current + 1 : 0;
		window.oTrk?.set( `ai-retries-${ trackingKey }`, { feature: 'ai-generation', featureComponent: 'regenerate-count', featureValue: retryBucket( retryCount.current ) });

		const sendPrompt = regenerate ? sendPromptToOpenAIWithRegenerate : sendPromptToOpenAI;

		window.oTrk?.add({ feature: 'ai-generation', featureComponent: 'prompt', featureValue: value }, { consent: true });

		sendPrompt?.( value, embeddedPrompt, {
			'otter_used_action': 'textTransformation' === promptID ? 'textTransformation::otter_action_prompt' : ( promptID ?? '' ),
			'otter_user_content': value
		}).then ( ( data ) => {
			if ( data?.error ) {
				setGenerationStatus( 'error' );
				setShowError( true );
				setErrorMessage( `Error ${data.error.code} - ${data.error.message}` ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
				return;
			}

			const result = data?.choices?.[0]?.message?.function_call?.arguments ?? data?.choices?.[0]?.message?.content;

			setGenerationStatus( 'loaded' );

			if ( ! result ) {
				setShowError( true );
				setErrorMessage( __( 'Empty response from OpenAI. Please try again.', 'otter-blocks' ) );
				return;
			}
			
			if ( regenerate ) {
				const newResultHistory = [ ...resultHistory ];
				newResultHistory[ resultHistoryIndex ] = {
					result,
					meta: {
						usedToken: data.usage.total_tokens,
						prompt: value
					}
				};
				setResultHistory( newResultHistory );
			} else {
				setResultHistory([ ...resultHistory, {
					result,
					meta: {
						usedToken: data.usage.total_tokens,
						prompt: value
					}
				}]);
				setResultHistoryIndex( resultHistory.length );

			}
			
			setTokenUsageDescription( __( 'Token used:', 'otter-blocks' ) + data.usage.total_tokens );
			props.onPreview?.( result );
		});
	}

	if ( 'present' !== apiKeyStatus ) {
		return (
			<Placeholder
				className="prompt-placeholder"
				label={ __( 'OpenAI API Key', 'otter-blocks' ) }
			>
				{
					'checking' === apiKeyStatus && (
						<div style={{ display: 'flex', flexDirection: 'row' }}>
							<Spinner />
							<span>{ __( 'Checking the api key…', 'otter-blocks' ) }</span>
						</div>
					)
				}

				{
					'missing' === apiKeyStatus && (
						<Fragment>
							<span>{ __( 'API Key not found. Please introduce the API Key', 'otter-blocks' ) }
							</span>
							<TextControl
								value={apiKey ?? ''}
								onChange={( text ) => {
									setApiKey( text );
								}}
							/>
							<div className="prompt-placeholder__submit">
								<Button
									variant="primary"
									disabled={ ! apiKey || 'saving' === status}
									onClick={() => {

										if ( ! apiKey ) {
											return;
										}

										updateOption( openAiAPIKeyName, apiKey.slice(), __( 'Open AI API Key saved.', 'otter-blocks' ), 'o-api-key', () => {
											setApiKey( '' );
										});
										setApiKeyStatus( 'checking' );

									}}
									isBusy={'loading' === status}
								>

									{ 'loading' !== status &&  __( 'Save', 'otter-blocks' ) }
									{ 'loading' === status && (
										<Fragment>
											<span>{ __( 'Saving', 'otter-blocks' ) }</span>
										</Fragment>
									) }
								</Button>
							</div>
							<p/>

							<div className='o-info-row'>
								<ExternalLink href={'https://platform.openai.com/account/api-keys'}>
									{ __( 'Get your API Key', 'otter-blocks' ) }
								</ExternalLink>

								<ExternalLink
									href="https://docs.themeisle.com/article/1916-how-to-generate-an-openai-api-key"
								>
									{ __( 'More Info', 'otter-blocks' ) }
								</ExternalLink>
							</div>

						</Fragment>
					)
				}
			</Placeholder>
		);

	}

	return (
		<Fragment>
			{
				( 0 < resultHistory?.length ) ? (
					<PromptBlockEditor
						title={ props.title }
						currentResultIndex={ resultHistoryIndex + 1 }
						totalResults={ resultHistory.length }
						onPrevResult={() => {
							setResultHistoryIndex( resultHistoryIndex - 1 );
						}}
						onNextResult={() => {
							setResultHistoryIndex( resultHistoryIndex + 1 );
						}}
						onClose={() => {

							// Track that generated output was discarded (there was output to throw away),
							// unless it was already accepted (a later discard must not clobber a prior accept).
							if ( 0 < resultHistory?.length && ! hasAcceptedRef?.current ) {
								window.oTrk?.set( `ai-outcome-${ trackingKey }`, { feature: 'ai-generation', featureComponent: `outcome-${ allowedPromptID( promptID ) }`, featureValue: 'discard' });
							}

							props.onClose?.();
						}}
						tokenUsageDescription={tokenUsageDescription}
						onRegenerate={() => onPromptSubmit( true )}
						actionButtons={props.actionButtons?.({
							status: generationStatus
						})}
						status={generationStatus}
						currentPrompt={value}
						showRegenerate={ Boolean( resultHistory?.[ resultHistoryIndex ]?.meta?.prompt ) }
					>

						<PromptInput
							value={value}
							onValueChange={onValueChange}
							onGenerate={() => {
								setShowError( false );
								onPromptSubmit();
							}}
							status={generationStatus}
							placeholder={ props.promptPlaceholder }
						/>

						{props.children}
					</PromptBlockEditor>
				) : (
					<PromptInput
						value={value}
						onValueChange={onValueChange}
						onGenerate={() => onPromptSubmit()}
						status={generationStatus}
						placeholder={ props.promptPlaceholder }
					/>
				)
			}

			{
				showError && (
					<Notice
						status="warning"
						isDismissible
						onDismiss={() => setShowError( false )}
					>
						{
							errorMessage
						}
					</Notice>
				)
			}
		</Fragment>
	);
};

export default PromptPlaceholder;
