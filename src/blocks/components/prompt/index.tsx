import { __ } from '@wordpress/i18n';
import { Button, ExternalLink, Notice, Placeholder, Spinner, TextControl } from '@wordpress/components';
import './editor.scss';
import { Fragment, useEffect, useState } from '@wordpress/element';
import useSettings from '../../helpers/use-settings';
import {
	parseFormPromptResponseToBlocks,
	parseToDisplayPromptResponse,
	PromptsData,
	retrieveEmbeddedPrompt,
	sendPromptToOpenAI
} from '../../helpers/prompt';
import PromptInput from './prompt-input';
import { closeSmall, redo, undo } from '@wordpress/icons';
import { ReactNode } from 'react';

type PromptOnSuccessActions = {
	clearHistory: () => void
}

export type PromptOnSuccess = ( result: string, actions: PromptOnSuccessActions ) => void;

type PromptPlaceholderProps = {
	promptName?: string
	title?: string
	description?: string
	value: string
	onValueChange: ( text: string ) => void
	onSuccess?: PromptOnSuccess
	resultAreaTitle?: string
	resutActionLabel?: string
};

export const apiKeyName = 'themeisle_open_ai_api_key';

const BlockGenerationArea = ( props: { result?: string }) => {
	return (
		<div className="prompt-fields" >
			<div className="prompt-column-title">
				{ __( 'Label', 'otter-blocks' ) }
			</div>
			<div className="prompt-column-title">
				{ __( 'Field Type', 'otter-blocks' ) }
			</div>
			{ props.result?.length && parseToDisplayPromptResponse( props.result ).map( field => {
				return (
					<Fragment>
						<div className="prompt-field__label">
							{ field.label }
						</div>
						<div className="prompt-field__type">
							{ field.type }
						</div>
					</Fragment>
				);
			}) }
		</div>
	);
};

const PromptResultArea = (
	props: {
		children?: ReactNode
		mainActionName?: string
		mainAction?: () => void
		onRegenerate?: () => void
		onPrevResult?: () => void
		onNextResult?: () => void
		currentResultIndex?: number
		totalResults: number
		title?: string
		onClose?: () => void
		tokenUsageDescription?: string
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
				<Button
					variant="secondary"
					onClick={ props.mainAction }
				>
					{ props.mainActionName ?? __( 'Preview Generated Content', 'otter-blocks' ) }
				</Button>
				<Button
					variant={'secondary'}
					onClick={ props.onRegenerate }
				>
					{ __( 'Regenerate', 'otter-blocks' ) }
				</Button>
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
	const { title, description, value, onValueChange, onSuccess, promptName } = props;

	const [ getOption, updateOption, status ] = useSettings();
	const [ apiKey, setApiKey ] = useState<string | null>( null );

	const [ generationStatus, setGenerationStatus ] = useState<'loading' | 'loaded' | 'error'>( 'loaded' );

	const [ apiKeyStatus, setApiKeyStatus ] = useState<'checking' | 'missing' | 'present' | 'error'>( 'checking' );
	const [ embeddedPrompts, setEmbeddedPrompts ] = useState<PromptsData>([]);
	const [ result, setResult ] = useState<string | undefined>( undefined );

	const [ resultHistory, setResultHistory ] = useState<{result: string, meta: { usedToken: number }}[]>([]);
	const [ resultHistoryIndex, setResultHistoryIndex ] = useState<number>( 0 );

	const [ showResultArea, setShowResultArea ] = useState<boolean>( false );

	const [ showError, setShowError ] = useState<boolean>( false );
	const [ errorMessage, setErrorMessage ] = useState<string>( '' );
	const [ tokenUsageDescription, setTokenUsageDescription ] = useState<string>( '' );

	const onSuccessActions = {
		clearHistory: () => {
			setResult( undefined );
			setResultHistory([]);
			setResultHistoryIndex( 0 );
		}
	};

	useEffect( () => {
		const getEmbeddedPrompt = async() => {
			retrieveEmbeddedPrompt( promptName ).then( ( promptServer ) => {
				setEmbeddedPrompts( promptServer.prompts );
				console.log( promptServer );
			});
		};

		getEmbeddedPrompt();
	}, []);

	useEffect( () => {
		if ( 'loading' === status ) {
			return;
		}

		if ( 'loaded' === status ) {
			if ( getOption( apiKeyName ) ) {
				setApiKeyStatus( 'present' );
				setApiKey( getOption( apiKeyName ) );
			} else {
				setApiKeyStatus( 'missing' );
			}
		}

		if ( 'error' === status ) {
			setApiKeyStatus( 'error' );
		}
	}, [ status, getOption ]);

	useEffect( () => {
		setResultHistoryIndex( resultHistory.length - 1 );
	}, [ resultHistory ]);

	useEffect( () => {

		if ( ! result ) {
			return;
		}

		if ( 0 > resultHistoryIndex ) {
			return;
		}

		if ( resultHistoryIndex > resultHistory.length - 1 ) {
			return;
		}

		setResult( resultHistory[ resultHistoryIndex ].result );
		setTokenUsageDescription( __( 'Used tokens: ', 'otter-blocks' ) + resultHistory[ resultHistoryIndex ].meta.usedToken );

	}, [ resultHistoryIndex, resultHistory ]);

	function onSubmit() {

		const embeddedPrompt = embeddedPrompts?.find( ( prompt ) => prompt.otter_name === promptName );

		if ( ! embeddedPrompt ) {
			setShowError( true );
			setErrorMessage( __( 'Prompt not found. Reload the page. If the error still persist the server might be down.', 'otter-blocks' ) );
			return;
		}

		if ( ! apiKey ) {
			console.warn( 'API Key not found' );
			setShowError( true );
			setErrorMessage( __( 'API Key not found. Please add your API Key in the settings page.', 'otter-blocks' ) );
			return;
		}

		setGenerationStatus( 'loading' );

		sendPromptToOpenAI( value, apiKey, embeddedPrompt ).then ( ( data ) => {
			if ( data?.error ) {
				console.error( data?.error );
				setGenerationStatus( 'error' );
				setShowError( true );
				setErrorMessage( `Error ${data.error.code} - ${data.error.message}` ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
				return;
			}

			const result = data?.choices?.[0]?.message?.function_call?.arguments;

			setGenerationStatus( 'loaded' );

			if ( ! result ) {
				setShowError( true );
				setErrorMessage( __( 'Empty response from OpenAI. Please try again.', 'otter-blocks' ) );
				return;
			}

			setResult( result );
			setResultHistory([ ...resultHistory, {
				result,
				meta: {
					usedToken: data.usage.total_tokens
				}
			}]);
			setShowResultArea( true );
			setTokenUsageDescription( __( 'Token used: ', 'otter-blocks' ) + data.usage.total_tokens );
		});
	}

	if ( 'present' !== apiKeyStatus ) {
		return (
			<Placeholder
				className="prompt-placeholder"
				label={__( 'OpenAI API Key', 'otter-blocks' )}
			>
				{
					'checking' === apiKeyStatus && (
						<div style={{ display: 'flex', flexDirection: 'row' }}>
							<Spinner />
							<span>{ __( 'Checking the api key...', 'otter-blocks' ) }</span>
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
										console.log( apiKey );

										if ( ! apiKey ) {
											return;
										}

										updateOption( apiKeyName, apiKey.slice(), __( 'Open AI API Key saved.', 'otter-blocks' ), 'o-api-key', () => {
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

							<ExternalLink href={'https://platform.openai.com/account/api-keys'}>
								{ __( 'Get your API Key', 'otter-blocks' ) }
							</ExternalLink>
						</Fragment>
					)
				}
			</Placeholder>
		);

	}

	return (
		<div>
			{
				showResultArea && (
					<PromptResultArea
						title={ props.resultAreaTitle }
						mainAction={
							() => {
								onSuccess?.( result, onSuccessActions );
							}
						}
						currentResultIndex={ resultHistoryIndex + 1 }
						totalResults={ resultHistory.length }
						onPrevResult={() => {
							setResultHistoryIndex( resultHistoryIndex - 1 );
						}}
						onNextResult={() => {
							setResultHistoryIndex( resultHistoryIndex + 1 );
						}}
						onClose={() => {
							setShowResultArea( false );
						}}
						mainActionName={props.resutActionLabel}
						tokenUsageDescription={tokenUsageDescription}
					>
						<BlockGenerationArea result={ result } />
					</PromptResultArea>
				)
			}

			<PromptInput value={value} onValueChange={onValueChange} onGenerate={onSubmit} status={generationStatus} />

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
		</div>

	);
};

export default PromptPlaceholder;
