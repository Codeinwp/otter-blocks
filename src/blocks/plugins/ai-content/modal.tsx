/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';

import {
	Button,
	ExternalLink,
	Icon,
	Modal,
	Notice,
	SelectControl,
	Spinner,
	TextareaControl
} from '@wordpress/components';

import { safeHTML } from '@wordpress/dom';

import { BlockPreview } from '@wordpress/block-editor';

import { desktop, mobile, redo, undo } from '@wordpress/icons';

import { useDispatch, useSelect } from '@wordpress/data';

import {
	useEffect,
	useMemo,
	useRef,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { openAiAPIKeyName } from '../../components/prompt';
import { aiGeneration } from '../../helpers/icons';
import {
	editLastConversation,
	injectActionIntoPrompt,
	PromptData,
	retrieveEmbeddedPrompt,
	sendBlockGenerationPrompt,
	sendPromptToOpenAI,
	sendPromptToOpenAIWithRegenerate
} from '../../helpers/prompt';
import useSettings from '../../helpers/use-settings';
import type { BlockProps } from '../../helpers/blocks';
import {
	AIToolbarAction,
	DEFAULT_TONE_OPTIONS,
	getActionPrompt,
	replaceMagicTags
} from './actions';
import {
	applyGeneratedContent,
	extractBlockAttributeDefinitions,
	extractBlockMarkup,
	extractBlockTextContent,
	extractBlockTypes,
	getSelectedBlockClientIds,
	resolveBlockContentForPrompt
} from './apply-content';
import {
	generateBlocksFromTask
} from './block-generation';
import type { BlockGenerationResult } from './block-generation';

type ResultHistoryItem = {
	result?: string;
	meta: {
		usedToken: number;
		prompt: string;
	};
	generatedBlocks?: BlockProps<unknown>[];
	generationRationale?: string[];
	generationDiagnostics?: BlockGenerationResult['diagnostics'];
};

type AIContentModalProps = {
	isOpen: boolean;
	onClose: () => void;
	actions: AIToolbarAction[];
	initialActionId?: string;
	initialPrompt?: string;
	selectedBlocks: BlockProps<unknown>[];
	isMultipleSelection: boolean;
	singleClientId: string;
	selectedClientIds: string[];

	/**
	 * 'transform' (default) rewrites the selected block(s). 'create' generates a
	 * brand-new section/page from a prompt with no source content, used by the AI
	 * block; on Done the generated blocks replace the target client id.
	 */
	mode?: 'create' | 'transform';

	/**
	 * When true, generation starts automatically on open using the initial prompt,
	 * so the block's Generate button does not require a second click in the modal.
	 */
	autoGenerate?: boolean;

	/**
	 * The generation scope chosen before opening (the block owns Section/Full page).
	 */
	initialScope?: 'section' | 'page';
};

const AIContentModal = ({
	isOpen,
	onClose,
	actions,
	initialActionId,
	initialPrompt,
	selectedBlocks,
	isMultipleSelection,
	singleClientId,
	selectedClientIds,
	mode = 'transform',
	autoGenerate = false,
	initialScope = 'section'
}: AIContentModalProps ) => {
	const isCreateMode = 'create' === mode;
	const [ getOption ] = useSettings();
	const { replaceBlocks } = useDispatch( 'core/block-editor' );
	const { createNotice } = useDispatch( 'core/notices' );
	const blockTypes = useSelect(
		select => select( 'core/blocks' )?.getBlockTypes?.() ?? [],
		[]
	);

	const [ selectedActionId, setSelectedActionId ] = useState( initialActionId || actions[0]?.id || '' );
	const [ tone, setTone ] = useState<string | null>( null );
	const [ status, setStatus ] = useState<'idle' | 'loading' | 'error' | 'loaded'>( 'idle' );
	const [ error, setError ] = useState<string | undefined>();
	const [ resultHistory, setResultHistory ] = useState<ResultHistoryItem[]>([]);
	const [ resultHistoryIndex, setResultHistoryIndex ] = useState( 0 );
	const [ isDirty, setIsDirty ] = useState( true );

	// The generated blocks are previewed progressively as each section completes.
	const [ liveBlocks, setLiveBlocks ] = useState<BlockProps<unknown>[]>([]);
	const [ viewport, setViewport ] = useState<'desktop' | 'mobile'>( 'desktop' );

	// Coarse progress that drives the dynamic loading label (planning → building).
	const [ progress, setProgress ] = useState<{ phase: 'idle' | 'planning' | 'building'; done: number; total: number }>({ phase: 'idle', done: 0, total: 0 });

	// Scope (Section / Full page) is chosen in the block; the modal just consumes it.
	const scope = initialScope;

	const hasAPIKey = Boolean(
		window.themeisleGutenberg?.hasOpenAiKey ||
		getOption( openAiAPIKeyName )
	);

	const selectedAction = useMemo(
		() => actions.find( ( action ) => action.id === selectedActionId ) || actions[0],
		[ actions, selectedActionId ]
	);

	// The parent unmounts the modal on close, so mount equals open: the prompt
	// can be seeded directly from the props.
	const [ prompt, setPrompt ] = useState( initialPrompt ?? selectedAction?.prompt ?? '' );

	const isMountedRef = useRef( true );
	const generationIdRef = useRef( 0 );
	const previousActionIdRef = useRef( selectedAction?.id );
	const embeddedPromptCacheRef = useRef<PromptData | null>( null );

	useEffect( () => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const blockContext = useMemo( () => {
		const blockContent = extractBlockTextContent( selectedBlocks );
		const blockMarkup = extractBlockMarkup( selectedBlocks );
		const blockType = extractBlockTypes( selectedBlocks );
		const blockAttributes = extractBlockAttributeDefinitions( selectedBlocks );

		return {
			blockContent,
			blockMarkup,
			blockType,
			blockAttributes
		};
	}, [ selectedBlocks ]);

	const originalContent = blockContext.blockContent || blockContext.blockMarkup;

	const resetForAction = ( action?: AIToolbarAction ) => {

		// Invalidate any in-flight generation.
		generationIdRef.current++;

		setPrompt( action?.prompt ?? '' );
		setTone( null );
		setStatus( 'idle' );
		setError( undefined );
		setResultHistory([]);
		setResultHistoryIndex( 0 );
		setIsDirty( true );
		setLiveBlocks([]);
		setProgress({ phase: 'idle', done: 0, total: 0 });
	};

	useEffect( () => {
		if ( previousActionIdRef.current === selectedAction?.id ) {
			return;
		}

		previousActionIdRef.current = selectedAction?.id;
		resetForAction( selectedAction );
	}, [ selectedAction?.id ]);

	const markDirty = () => {
		generationIdRef.current++;
		setIsDirty( true );
		setStatus( 'idle' );
	};

	const currentResult = resultHistory[ resultHistoryIndex ]?.result;
	const currentGeneratedBlocks = resultHistory[ resultHistoryIndex ]?.generatedBlocks;
	const currentGenerationDiagnostics = resultHistory[ resultHistoryIndex ]?.generationDiagnostics;
	const tokenUsage = resultHistory[ resultHistoryIndex ]?.meta?.usedToken;
	const isBlockGeneration = 'any' === selectedAction?.availability;

	// While generating, prefer the progressively-built live blocks; once a result
	// is committed, show that version's blocks.
	const previewBlocks = ( 'loading' === status && liveBlocks.length )
		? liveBlocks
		: ( currentGeneratedBlocks?.length ? currentGeneratedBlocks : liveBlocks );
	const previewWidth = 'mobile' === viewport ? 360 : 1280;
	const canSubmit = 'tone' === selectedAction?.type ? Boolean( tone ) : Boolean( prompt.trim() );
	const hasResult = 0 < resultHistory.length && ! isDirty;

	// Phase-aware loading copy for block generation (planning → per-section build).
	const isPlanning = 'building' !== progress.phase || 0 === progress.total;
	const loadingLabel = isPlanning
		? __( 'Planning your layout…', 'otter-blocks' )
		: sprintf(
			// translators: %1$d: current section number, %2$d: total number of sections.
			__( 'Designing section %1$d of %2$d…', 'otter-blocks' ),
			Math.min( progress.done + 1, progress.total ),
			progress.total
		);
	const generationPercent = progress.total > 0 ? Math.round( ( progress.done / progress.total ) * 100 ) : 0;
	const replaceClientIds = getSelectedBlockClientIds( isMultipleSelection, selectedClientIds, singleClientId );

	const getEmbeddedPromptTemplate = async(): Promise<PromptData | null> => {
		if ( ! embeddedPromptCacheRef.current ) {
			const response = await retrieveEmbeddedPrompt( 'textTransformation' );
			embeddedPromptCacheRef.current = response?.prompts?.find( ( item ) => 'textTransformation' === item.otter_name ) ?? null;
		}

		if ( ! embeddedPromptCacheRef.current ) {
			return null;
		}

		return embeddedPromptCacheRef.current;
	};

	const buildEmbeddedPromptFromTask = async( taskPrompt: string ): Promise<{ embeddedPrompt: PromptData; resolvedPrompt: string } | null> => {
		const template = await getEmbeddedPromptTemplate();

		if ( ! template ) {
			return null;
		}

		const baseAction = template?.['otter_action_prompt'] ?? '';
		let embeddedPrompt = injectActionIntoPrompt( template, baseAction );
		embeddedPrompt = editLastConversation( embeddedPrompt, () => taskPrompt );

		return {
			embeddedPrompt,
			resolvedPrompt: taskPrompt
		};
	};

	const buildEmbeddedPrompt = async(): Promise<{ embeddedPrompt: PromptData; resolvedPrompt: string } | null> => {
		const resolvedPrompt = replaceMagicTags( prompt, {
			...blockContext,
			tone: tone || undefined
		});

		/*
		 * Replace the last user message of the template with the fully resolved
		 * prompt. The same resolved prompt is also used as the request task (the
		 * `{INSERT_TASK}` substitution inside `sendPromptToOpenAI`), so the
		 * request stays correct even if the server template changes shape. The
		 * block content is only resolved here, so it cannot be injected twice.
		 */
		return buildEmbeddedPromptFromTask( resolvedPrompt );
	};

	const generateContent = async( regenerate = false ) => {
		if ( ! hasAPIKey ) {
			setError( __( 'No OpenAI API key detected. Please add your key.', 'otter-blocks' ) );
			setStatus( 'error' );
			return;
		}

		if ( ! isCreateMode && ! originalContent ) {
			setError( __( 'No content detected in selected block.', 'otter-blocks' ) );
			setStatus( 'error' );
			return;
		}

		if ( 'tone' === selectedAction?.type && ! tone ) {
			setError( __( 'Choose a tone before generating.', 'otter-blocks' ) );
			setStatus( 'error' );
			return;
		}

		const generationId = ++generationIdRef.current;
		const isStale = () => ! isMountedRef.current || generationId !== generationIdRef.current;

		setStatus( 'loading' );
		setError( undefined );

		try {
			if ( 'any' === selectedAction?.availability ) {
				let usedToken = 0;
				const baseTask = replaceMagicTags( prompt, {
					...blockContext,
					tone: tone || undefined
				});

				let task = baseTask;
				if ( isCreateMode && 'page' === scope ) {
					// translators: %s: the user's prompt describing the page.
					task = sprintf( __( 'Create a complete landing page composed of multiple coherent sections for: %s', 'otter-blocks' ), baseTask );
				} else if ( isCreateMode ) {
					// translators: %s: the user's prompt describing the section.
					task = sprintf( __( 'Create a single, self-contained section for: %s', 'otter-blocks' ), baseTask );
				}

				// Reset the live preview for this run; it fills in section by section.
				setLiveBlocks([]);
				setProgress({ phase: 'planning', done: 0, total: 0 });
				const accumulated: BlockProps<unknown>[] = [];

				const generation = await generateBlocksFromTask({
					task,
					blockTypes,
					onPlanReady: ( plan ) => {
						if ( isStale() ) {
							return;
						}
						setProgress({ phase: 'building', done: 0, total: plan.roots?.length ?? 0 });
					},
					onRootComplete: ({ rootIndex, blocks: rootBlocks }) => {
						if ( isStale() ) {
							return;
						}
						setProgress( ( prev ) => ({ ...prev, done: rootIndex + 1 }) );
						if ( ! rootBlocks.length ) {
							return;
						}
						accumulated.push( ...rootBlocks );
						setLiveBlocks([ ...accumulated ]);
					},
					requestCompletion: async( requestPrompt ) => {
						// Block generation ships its own catalog + strict-JSON schema in
						// the prompt, so it must NOT reuse the server `textTransformation`
						// template, whose system prompt forces plain HTML output. Use the
						// self-contained JSON endpoint instead.
						const response = await sendBlockGenerationPrompt( requestPrompt );

						if ( ! response.ok ) {
							throw new Error( response.error?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
						}

						const result = response.content;

						if ( ! result ) {
							throw new Error( __( 'Empty response from the AI service. Please try again.', 'otter-blocks' ) );
						}

						usedToken += response.usedTokens ?? 0;

						return result;
					}
				});

				if ( isStale() ) {
					return;
				}

				if ( ! generation.blocks.length ) {
					setError( __( 'Could not generate valid blocks. Please try a simpler prompt.', 'otter-blocks' ) );
					setStatus( 'error' );
					return;
				}

				const historyItem: ResultHistoryItem = {
					meta: {
						usedToken,
						prompt
					},
					generatedBlocks: generation.blocks,
					generationRationale: generation.rationale,
					generationDiagnostics: generation.diagnostics
				};

				if ( regenerate ) {
					setResultHistory( ( prev ) => {
						const next = [ ...prev, historyItem ];
						setResultHistoryIndex( next.length - 1 );
						return next;
					});
				} else {
					setResultHistory([ historyItem ]);
					setResultHistoryIndex( 0 );
				}

				setIsDirty( false );
				setStatus( 'loaded' );
				return;
			}

			const embedded = await buildEmbeddedPrompt();

			if ( isStale() ) {
				return;
			}

			if ( ! embedded ) {
				setError( __( 'Something went wrong retrieving the prompts.', 'otter-blocks' ) );
				setStatus( 'error' );
				return;
			}

			const { embeddedPrompt, resolvedPrompt } = embedded;

			window.oTrk?.add({
				feature: 'ai-generation',
				featureComponent: selectedAction?.custom ? 'ai-toolbar-custom-action' : 'ai-toolbar',
				featureValue: selectedAction?.id
			}, { consent: true });

			const sendPrompt = regenerate ? sendPromptToOpenAIWithRegenerate : sendPromptToOpenAI;
			const response = await sendPrompt(
				resolvedPrompt,
				embeddedPrompt,
				{
					otter_used_action: `textTransformation::${ selectedAction?.id }`,
					otter_user_content: resolveBlockContentForPrompt( blockContext )
				}
			);

			if ( isStale() ) {
				return;
			}

			if ( ! response.ok ) {
				setError( response.error?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
				setStatus( 'error' );
				return;
			}

			const result = response.content;

			if ( ! result ) {
				setError( __( 'Empty response from the AI service. Please try again.', 'otter-blocks' ) );
				setStatus( 'error' );
				return;
			}

			const historyItem: ResultHistoryItem = {
				result,
				meta: {
					usedToken: response.usedTokens ?? 0,
					prompt
				}
			};

			if ( regenerate ) {
				setResultHistory( ( prev ) => {
					const next = [ ...prev, historyItem ];
					setResultHistoryIndex( next.length - 1 );
					return next;
				});
			} else {
				setResultHistory([ historyItem ]);
				setResultHistoryIndex( 0 );
			}

			setIsDirty( false );
			setStatus( 'loaded' );
		} catch ( e ) {
			if ( isStale() ) {
				return;
			}

			setError( e?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
			setStatus( 'error' );
		}
	};

	// Kick off generation immediately when opened from the block's Generate button.
	useEffect( () => {
		if ( autoGenerate && hasAPIKey && canSubmit ) {
			generateContent( false );
		}

		// Run once on mount; generateContent reads the seeded prompt.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleApply = () => {
		if ( ! currentResult && ! currentGeneratedBlocks?.length ) {
			return;
		}

		const blocks = currentGeneratedBlocks?.length ?
			currentGeneratedBlocks :
			applyGeneratedContent(
				currentResult || '',
				selectedBlocks,
				selectedAction?.availability ?? 'richtext'
			);

		if ( ! blocks.length ) {
			createNotice(
				'error',
				__( 'Could not apply the generated content.', 'otter-blocks' ),
				{
					type: 'snackbar',
					isDismissible: true
				}
			);
			return;
		}

		replaceBlocks( replaceClientIds, blocks );
		onClose();
	};

	if ( ! isOpen || ! selectedAction ) {
		return null;
	}

	const toneOptions = selectedAction.tones?.length ? selectedAction.tones : DEFAULT_TONE_OPTIONS;

	// Lock the modal while generating so a stray click-outside/Esc can't discard work.
	const isGenerating = 'loading' === status;

	return (
		<Modal
			title={ selectedAction.title }
			onRequestClose={ () => {
				if ( ! isGenerating ) {
					onClose();
				}
			} }
			isDismissible={ ! isGenerating }
			shouldCloseOnClickOutside={ ! isGenerating }
			shouldCloseOnEsc={ ! isGenerating }
			overlayClassName="o-ai-content-modal"
			className="o-ai-content-modal__dialog"
		>
			<div className="o-ai-content-modal__body">
				<div className="o-ai-content-modal__scroll">
					{ ! hasAPIKey && (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Please add your OpenAI API key in the AI settings.', 'otter-blocks' ) }{ ' ' }
							<ExternalLink href={ `${ window.themeisleGutenberg?.optionsPath }#ai` }>
								{ __( 'Go to Dashboard', 'otter-blocks' ) }
							</ExternalLink>
						</Notice>
					) }

					{ actions.length > 1 && (
						<SelectControl
							label={ __( 'Action', 'otter-blocks' ) }
							value={ selectedActionId }
							options={ actions.map( ( action ) => ({
								label: action.title,
								value: action.id
							}) ) }
							onChange={ ( value ) => {
								setSelectedActionId( value );
							} }
						/>
					) }

					{ 'tone' === selectedAction.type ? (
						<div className="o-ai-content-modal__tones">
							<span className="o-ai-content-modal__label">
								{
									'translate' === selectedAction.id
										? __( 'Language', 'otter-blocks' )
										: __( 'Tone', 'otter-blocks' )
								}
							</span>
							<div className="o-ai-content-modal__tone-pills">
								{
									toneOptions.map( ( toneOption ) => (
										<Button
											key={ toneOption }
											variant={ tone === toneOption ? 'primary' : 'secondary' }
											isSmall
											onClick={ () => {
												setTone( toneOption );
												setPrompt( getActionPrompt( selectedAction, toneOption ) );
												markDirty();
											} }
										>
											{ toneOption }
										</Button>
									) )
								}
							</div>
							<Button
								variant="primary"
								className="o-ai-content-modal__generate"
								disabled={ ! hasAPIKey || 'loading' === status || ! canSubmit }
								isBusy={ 'loading' === status }
								onClick={ () => generateContent( false ) }
							>
								{ __( 'Generate', 'otter-blocks' ) }
							</Button>
						</div>
					) : (
						<div className="o-ai-content-modal__prompt-row">
							<span className="o-ai-content-modal__prompt-icon" aria-hidden="true">
								<Icon icon={ aiGeneration } />
							</span>
							<TextareaControl
								className="o-ai-content-modal__prompt-input"
								label={ __( 'Prompt', 'otter-blocks' ) }
								hideLabelFromVision
								placeholder={ __( 'Describe what you want to generate…', 'otter-blocks' ) }
								value={ prompt }
								rows={ 1 }
								onChange={ ( value ) => {
									setPrompt( value );
									markDirty();
								} }
								__nextHasNoMarginBottom
							/>
							<Button
								variant="primary"
								className="o-ai-content-modal__generate"
								disabled={ ! hasAPIKey || 'loading' === status || ! canSubmit }
								isBusy={ 'loading' === status }
								onClick={ () => generateContent( false ) }
							>
								{ __( 'Generate', 'otter-blocks' ) }
							</Button>
						</div>
					) }

					{ isBlockGeneration ? (
						<div className="o-ai-content-modal__preview">
							<div className="o-ai-content-modal__preview-header">
								<span className="o-ai-content-modal__label">{ __( 'Preview', 'otter-blocks' ) }</span>
								<div className="o-ai-content-modal__viewport">
									<Button
										icon={ desktop }
										isSmall
										isPressed={ 'desktop' === viewport }
										label={ __( 'Desktop', 'otter-blocks' ) }
										onClick={ () => setViewport( 'desktop' ) }
									/>
									<Button
										icon={ mobile }
										isSmall
										isPressed={ 'mobile' === viewport }
										label={ __( 'Mobile', 'otter-blocks' ) }
										onClick={ () => setViewport( 'mobile' ) }
									/>
								</div>
							</div>

							{ 'loading' === status && (
								<div className="o-ai-gen" role="status" aria-live="polite">
									<span className="o-ai-gen__spark" aria-hidden="true">
										<Icon icon={ aiGeneration } />
									</span>
									<div className="o-ai-gen__body">
										<span className="o-ai-gen__label">{ loadingLabel }</span>
										<div className={ `o-ai-gen__bar${ isPlanning ? ' is-indeterminate' : '' }` }>
											<span
												className="o-ai-gen__bar-fill"
												style={ isPlanning ? undefined : { width: `${ generationPercent }%` } }
											/>
										</div>
									</div>
								</div>
							) }

							{ 'error' === status && error && (
								<Notice status="error" isDismissible={ false }>{ error }</Notice>
							) }

							{ previewBlocks.length > 0 && (
								<div className="o-ai-content-modal__preview-canvas">
									<BlockPreview blocks={ previewBlocks } viewportWidth={ previewWidth } />
								</div>
							) }

							{ hasResult && Boolean( currentGenerationDiagnostics?.droppedRoots.length ) && (
								<Notice status="warning" isDismissible={ false }>
									{
										sprintf(
										// translators: %d: number of generated roots that could not be validated.
											__( '%d generated block group could not be validated and was skipped.', 'otter-blocks' ),
											currentGenerationDiagnostics?.droppedRoots.length || 0
										)
									}
								</Notice>
							) }

							{ ! hasResult && 'loading' !== status && 'error' !== status && 0 === previewBlocks.length && (
								<span className="o-ai-content-modal__placeholder">
									{ __( 'Describe a section and click Generate.', 'otter-blocks' ) }
								</span>
							) }
						</div>
					) : (
						<div className="o-ai-content-modal__panels">
							<div className="o-ai-content-modal__panel">
								<span className="o-ai-content-modal__label">{ __( 'Original', 'otter-blocks' ) }</span>
								<div
									className="o-ai-content-modal__text"
									dangerouslySetInnerHTML={{ __html: safeHTML( originalContent ) }}
								/>
							</div>

							<div className="o-ai-content-modal__panel">
								<span className="o-ai-content-modal__label">{ __( 'Suggestion', 'otter-blocks' ) }</span>
								<div className="o-ai-content-modal__text">
									{ 'loading' === status && (
										<div className="o-ai-content-modal__loading">
											<Spinner />
											<span>{ __( 'Generating…', 'otter-blocks' ) }</span>
										</div>
									) }

									{ 'error' === status && error && (
										<Notice status="error" isDismissible={ false }>
											{ error }
										</Notice>
									) }

									{ hasResult && currentResult && (
										<div dangerouslySetInnerHTML={{ __html: safeHTML( currentResult ) }} />
									) }

									{ ! hasResult && 'loading' !== status && 'error' !== status && (
										<span className="o-ai-content-modal__placeholder">
											{
												isDirty
													? __( 'Adjust the prompt and click Generate.', 'otter-blocks' )
													: __( 'Generated content will appear here.', 'otter-blocks' )
											}
										</span>
									) }
								</div>
							</div>
						</div>
					) }
				</div>

				<div className="o-ai-content-modal__footer">
					<div className="o-ai-content-modal__footer-left">
						<div className="o-ai-content-modal__footer-actions">
							<Button
								variant="primary"
								disabled={ ! hasResult || 'loading' === status }
								onClick={ handleApply }
							>
								{ __( 'Done', 'otter-blocks' ) }
							</Button>

							<Button
								variant="tertiary"
								className="o-ai-content-modal__regenerate"
								disabled={ ! hasResult || 'loading' === status }
								onClick={ () => generateContent( true ) }
							>
								{ __( 'Regenerate', 'otter-blocks' ) }
							</Button>
						</div>

						{ undefined !== tokenUsage && ! isDirty && (
							<span className="o-ai-content-modal__tokens">
								{
									sprintf(
										// translators: %d: number of used tokens.
										__( 'Used tokens: %d', 'otter-blocks' ),
										tokenUsage
									)
								}
							</span>
						) }
					</div>

					{ hasResult && ! isDirty && 1 < resultHistory.length && (
						<div className="o-ai-content-modal__history">
							<Button
								variant="tertiary"
								icon={ undo }
								label={ __( 'Previous version', 'otter-blocks' ) }
								disabled={ 0 === resultHistoryIndex }
								onClick={ () => setResultHistoryIndex( ( prev ) => Math.max( 0, prev - 1 ) ) }
							/>
							<span>
								{ resultHistoryIndex + 1 } / { resultHistory.length }
							</span>
							<Button
								variant="tertiary"
								icon={ redo }
								label={ __( 'Next version', 'otter-blocks' ) }
								disabled={ resultHistoryIndex >= resultHistory.length - 1 }
								onClick={ () => setResultHistoryIndex( ( prev ) => Math.min( resultHistory.length - 1, prev + 1 ) ) }
							/>
						</div>
					) }
				</div>
			</div>
		</Modal>
	);
};

export default AIContentModal;
