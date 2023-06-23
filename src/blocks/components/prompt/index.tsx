import { __ } from '@wordpress/i18n';
import { Button, ExternalLink, Placeholder, Spinner, TextControl } from '@wordpress/components';
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
};

export const apiKeyName = 'themeisle_open_ai_api_key';

const BlockGenerationArea = ( props: { result?: string }) => {
	return (
		<div className="prompt-placeholder__block-generation__container" >
			{ props.result?.length && parseToDisplayPromptResponse( props.result ).map( field => {
				return (
					<div className="prompt-placeholder__block-generation__field">
						<div className="prompt-placeholder__block-generation__field__type">
							{ field.type }
						</div>
						<div className="prompt-placeholder__block-generation__field__label">
							{ field.label }
						</div>
					</div>
				);
			}) }
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

	const [ resultHistory, setResultHistory ] = useState<string[]>([]);
	const [ resultHistoryIndex, setResultHistoryIndex ] = useState<number>( 0 );

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

		setResult( resultHistory[ resultHistoryIndex ]);

	}, [ resultHistoryIndex, resultHistory ]);

	function onSubmit() {

		const embeddedPrompt = embeddedPrompts?.find( ( prompt ) => prompt.otter_name === promptName );

		if ( ! embeddedPrompt ) {
			console.warn( 'Prompt not found' );
			return;
		}

		if ( ! apiKey ) {
			console.warn( 'API Key not found' );
			return;
		}

		setGenerationStatus( 'loading' );

		sendPromptToOpenAI( value, apiKey, embeddedPrompt ).then ( ( data ) => {
			if ( data?.error ) {
				console.error( data?.error );
				setGenerationStatus( 'error' );
				return;
			}

			const result = data?.choices?.[0]?.message?.function_call?.arguments;

			setGenerationStatus( 'loaded' );

			setResult( result );
			setResultHistory([ ...resultHistory, result ]);
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
		<Placeholder
			className="prompt-placeholder"
			label={title ?? __( 'Content Generator', 'otter-blocks' )}
			instructions={description ?? __( 'Write what type of form do you want to have.', 'otter-blocks' )}
		>
			<TextControl value={value} onChange={onValueChange} />

			<div className="prompt-placeholder__submit">
				<Button
					variant="primary"
					onClick={onSubmit}
					isBusy={'loading' === generationStatus}
				>

					{ 'loading' !== generationStatus &&  __( 'Generate', 'otter-blocks' ) }
					{ 'loading' === generationStatus && (
						<Fragment>
							<span>{ __( 'Generating...', 'otter-blocks' ) }</span>
						</Fragment>
					) }
				</Button>
				{
					0 < resultHistory.length && (
						<Fragment>
							{
								1 < resultHistory.length && (
									<span className="history-display">
										{ `${resultHistoryIndex + 1}/${resultHistory.length}` }
									</span>
								)
							}

							{
								0 < resultHistoryIndex && (
									<Button
										variant="secondary"
										onClick={() => {
											setResultHistoryIndex( resultHistoryIndex - 1 );
										}}
									>
										{ __( 'Previous', 'otter-blocks' ) }
									</Button>
								)

							}

							{
								resultHistoryIndex < resultHistory.length - 1 && (
									<Button
										variant="secondary"
										onClick={() => {
											setResultHistoryIndex( resultHistoryIndex + 1 );
										}}
									>
										{ __( 'Next', 'otter-blocks' ) }
									</Button>
								)
							}

						</Fragment>
					)
				}
			</div>

			<BlockGenerationArea result={ result } />

			{
				result && (
					<div>
						<Button
							variant="primary"
							onClick={() => {
								onSuccess?.( result, onSuccessActions );
							}}
						>
							{ __( 'Preview', 'otter-blocks' ) }
						</Button>

					</div>
				)
			}
		</Placeholder>
	);
};

export default PromptPlaceholder;
