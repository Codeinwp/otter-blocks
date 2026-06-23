/**
 * WordPress dependencies.
 */
import { __, _n, sprintf } from '@wordpress/i18n';

import {
	Button,
	ExternalLink,
	Icon,
	Modal,
	Notice,
	TextareaControl
} from '@wordpress/components';

import { cloneBlock } from '@wordpress/blocks';

import { BlockPreview } from '@wordpress/block-editor';

import { chevronLeft, chevronRight, close } from '@wordpress/icons';

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
import { aiGeneration, otterMascot } from '../../helpers/icons';
import { sendBlockGenerationPrompt } from '../../helpers/prompt';
import useSettings from '../../helpers/use-settings';
import type { BlockProps } from '../../helpers/blocks';
import { AIToolbarAction } from './actions';
import {
	buildBlockContextMessage,
	blocksStructureMatches,
	cloneBlocksForPreview,
	getSelectedBlockClientIds,
	mergePreviewCloneOntoBlocks
} from './apply-content';
import {
	sanitizeGeneratedBlocks,
	validateGeneratedBlocks
} from './block-generation';
import type { BlockGenerationResult, PatternLike } from './block-generation';
import { getTrackingFeatureValue, runAgentTurn } from './agent';
import { extractPromptHistory } from './session-history';

import type { AgentMode } from './routing/types';

const EMPTY_PREVIEW_BLOCKS: BlockProps<unknown>[] = [];

type ResultHistoryItem = {
	meta: {
		usedToken: number;
		prompt: string;
	};
	generatedBlocks: BlockProps<unknown>[];
	generationRationale?: string[];
	generationDiagnostics?: BlockGenerationResult['diagnostics'];
};

type GenerationProgress = {
	phase: 'idle' | 'planning' | 'briefing' | 'selecting' | 'outlining' | 'building' | 'polishing' | 'refining';
	done: number;
	total: number;
};

type AIContentModalProps = {
	isOpen: boolean;
	onClose: () => void;
	/** When set, footer Discard uses this instead of {@link onClose}. */
	onDiscard?: () => void;
	onApplyComplete?: () => void;
	onApplyBlocks?: ( blocks: BlockProps<unknown>[] ) => void;

	/** Quick-start actions shown as chips when the canvas is empty. */
	actions: AIToolbarAction[];
	initialPrompt?: string;
	selectedBlocks: BlockProps<unknown>[];
	isMultipleSelection: boolean;
	singleClientId: string;
	selectedClientIds: string[];

	/**
	 * 'transform' (default) edits the selected block(s); on Apply the result
	 * replaces them. 'create' generates a brand-new section/page with no source
	 * selection (the AI block); on Insert the result replaces the AI block.
	 */
	mode?: 'create' | 'transform';

	/**
	 * When true, the first request is sent automatically on open using initialPrompt,
	 * so the AI block's Generate button does not require a second click.
	 */
	autoGenerate?: boolean;

	/** The generation scope chosen before opening (the block owns Section/Full page). */
	initialScope?: 'section' | 'page';
};

const AIContentModal = ({
	isOpen,
	onClose,
	onDiscard,
	onApplyComplete,
	onApplyBlocks,
	actions,
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
	const scope = initialScope;

	const [ pinnedPreviewClone, setPinnedPreviewClone ] = useState<BlockProps<unknown>[]>( EMPTY_PREVIEW_BLOCKS );
	const wasOpenRef = useRef( false );

	useEffect( () => {
		if ( isOpen && ! wasOpenRef.current ) {
			setPinnedPreviewClone(
				selectedBlocks.length ? cloneBlocksForPreview( selectedBlocks ) : EMPTY_PREVIEW_BLOCKS
			);
		}

		wasOpenRef.current = isOpen;
	}, [
		isOpen,
		selectedBlocks,
		isMultipleSelection ? selectedClientIds.join( ',' ) : singleClientId
	]);

	const hasSelection = 0 < pinnedPreviewClone.length;

	const [ getOption ] = useSettings();
	const { replaceBlocks } = useDispatch( 'core/block-editor' );
	const { createNotice } = useDispatch( 'core/notices' );

	const blockTypes = useSelect(
		select => select( 'core/blocks' )?.getBlockTypes?.() ?? [],
		[]
	);

	const themeColors = useSelect(
		select => ( select( 'core/block-editor' ) as { getSettings?: () => { colors?: { name?: string; slug: string; color: string }[] } } )?.getSettings?.()?.colors ?? [],
		[]
	);

	const blockPatterns = useSelect(
		select => ( select( 'core' ) as { getBlockPatterns?: () => PatternLike[] } )?.getBlockPatterns?.() ?? [],
		[]
	);

	const [ prompt, setPrompt ] = useState( initialPrompt ?? '' );
	const [ refineInput, setRefineInput ] = useState( '' );
	const [ status, setStatus ] = useState<'idle' | 'loading' | 'error' | 'loaded'>( 'idle' );
	const [ error, setError ] = useState<string | undefined>();
	const [ resultHistory, setResultHistory ] = useState<ResultHistoryItem[]>([]);
	const [ resultHistoryIndex, setResultHistoryIndex ] = useState( 0 );
	const [ isDirty, setIsDirty ] = useState( true );
	const [ liveBlocks, setLiveBlocks ] = useState<BlockProps<unknown>[]>([]);
	const [ progress, setProgress ] = useState<GenerationProgress>({ phase: 'idle', done: 0, total: 0 });
	const [ showContext, setShowContext ] = useState( false );

	const isMountedRef = useRef( true );
	const generationIdRef = useRef( 0 );

	useEffect( () => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const getBlockType = useMemo(
		() => ( name: string ) => blockTypes.find( ( blockType ) => blockType.name === name ),
		[ blockTypes ]
	);

	const contextMessage = useMemo(
		() => buildBlockContextMessage( pinnedPreviewClone, getBlockType ),
		[ pinnedPreviewClone, getBlockType ]
	);

	const hasAPIKey = Boolean(
		window.themeisleGutenberg?.hasOpenAiKey ||
		getOption( openAiAPIKeyName )
	);

	const currentGeneratedBlocks = resultHistory[ resultHistoryIndex ]?.generatedBlocks;
	const currentGenerationDiagnostics = resultHistory[ resultHistoryIndex ]?.generationDiagnostics;
	const currentPromptEcho = resultHistory[ resultHistoryIndex ]?.meta?.prompt;
	const hasResult = 0 < resultHistory.length && ! isDirty;
	const hasPreviousVersion = 0 < resultHistoryIndex;
	const hasNextVersion = resultHistoryIndex < resultHistory.length - 1;
	const isGenerating = 'loading' === status;
	const previewWidth = 1240;

	let previewBlocks: BlockProps<unknown>[] = [];
	if ( isGenerating && liveBlocks.length ) {
		previewBlocks = liveBlocks;
	} else if ( currentGeneratedBlocks?.length ) {
		previewBlocks = currentGeneratedBlocks;
	} else if ( liveBlocks.length ) {
		previewBlocks = liveBlocks;
	} else if ( hasSelection && ! hasResult ) {
		previewBlocks = pinnedPreviewClone;
	}

	const replaceClientIds = getSelectedBlockClientIds( isMultipleSelection, selectedClientIds, singleClientId );

	const isPlanning = 'building' !== progress.phase || 0 === progress.total;
	const phaseLabels: Record<string, string> = {
		briefing: __( 'Sketching the layout…', 'otter-blocks' ),
		selecting: __( 'Matching your patterns…', 'otter-blocks' ),
		outlining: __( 'Outlining new sections…', 'otter-blocks' ),
		polishing: __( 'Polishing the details…', 'otter-blocks' ),
		refining: __( 'Applying your changes…', 'otter-blocks' )
	};
	const loadingLabel = isPlanning
		? ( phaseLabels[ progress.phase ] ?? __( 'Thinking…', 'otter-blocks' ) )
		: sprintf(
			// translators: %1$d: current section number, %2$d: total number of sections.
			__( 'Designing section %1$d of %2$d…', 'otter-blocks' ),
			Math.min( progress.done + 1, progress.total ),
			progress.total
		);

	const markDirty = () => {
		generationIdRef.current++;
		setIsDirty( true );
		setStatus( 'idle' );
	};

	const versionControl = hasResult ? (
		<div className="o-ai-version-control">
			<Button
				className="o-ai-version-control__button"
				icon={ chevronLeft }
				label={ __( 'Previous version', 'otter-blocks' ) }
				disabled={ ! hasPreviousVersion }
				onClick={ () => setResultHistoryIndex( ( prev ) => Math.max( 0, prev - 1 ) ) }
			/>
			<span className="o-ai-version-control__count">
				{
					sprintf(
						// translators: %1$d: current version number, %2$d: total versions.
						__( 'Version %1$d of %2$d', 'otter-blocks' ),
						resultHistoryIndex + 1,
						resultHistory.length
					)
				}
			</span>
			<Button
				className="o-ai-version-control__button"
				icon={ chevronRight }
				label={ __( 'Next version', 'otter-blocks' ) }
				disabled={ ! hasNextVersion }
				onClick={ () => setResultHistoryIndex( ( prev ) => Math.min( resultHistory.length - 1, prev + 1 ) ) }
			/>
		</div>
	) : null;

	const generateContent = async(
		regenerate = false,
		overridePrompt?: string,
		refineInstruction?: string,
		forceEditRoute = false
	) => {
		const activePrompt = ( overridePrompt ?? prompt ).trim();
		const instruction = refineInstruction?.trim() || activePrompt;

		if ( ! instruction ) {
			return;
		}

		if ( ! hasAPIKey ) {
			setError( __( 'No AI provider detected. Please configure one in the AI settings.', 'otter-blocks' ) );
			setStatus( 'error' );
			return;
		}

		const generationId = ++generationIdRef.current;
		const isStale = () => ! isMountedRef.current || generationId !== generationIdRef.current;

		setStatus( 'loading' );
		setError( undefined );

		let usedToken = 0;
		const requestCompletion = async( requestPrompt: string ): Promise<string> => {
			const response = await sendBlockGenerationPrompt( requestPrompt, 'aiChat' );

			if ( ! response.ok ) {
				throw new Error( response.error?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
			}

			if ( ! response.content ) {
				throw new Error( __( 'Empty response from the AI service. Please try again.', 'otter-blocks' ) );
			}

			usedToken += response.usedTokens ?? 0;
			return response.content;
		};

		const sessionHistory = extractPromptHistory( resultHistory );
		const referenceBlocks = currentGeneratedBlocks?.length
			? currentGeneratedBlocks
			: pinnedPreviewClone;
		const accumulated: BlockProps<unknown>[] = [];
		const preferEdit = ! isCreateMode && 0 < referenceBlocks.length;
		const forceRoute: AgentMode | undefined = forceEditRoute || ( preferEdit && autoGenerate )
			? 'edit'
			: undefined;

		setLiveBlocks( referenceBlocks );

		try {
			const { generation, decision } = await runAgentTurn({
				instruction,
				activePrompt,
				refineInstruction,
				referenceBlocks,
				sessionHistory,
				blockTypes,
				themeColors,
				patterns: isCreateMode ? blockPatterns : undefined,
				isCreateMode,
				scope,
				getBlockType,
				requestCompletion,
				forceRoute,
				preferEdit,
				onPhase: ( phase ) => {
					if ( ! isStale() ) {
						setProgress( ( prev ) => ({ ...prev, phase }) );
					}
				},
				onPlanReady: ( plan ) => {
					if ( ! isStale() ) {
						setProgress({ phase: 'building', done: 0, total: plan.roots?.length ?? 0 });
					}
				},
				onRootComplete: ({ rootIndex, blocks: rootBlocks }) => {
					if ( isStale() ) {
						return;
					}
					setProgress( ( prev ) => ({ ...prev, done: rootIndex + 1 }) );
					if ( rootBlocks.length ) {
						accumulated.push( ...rootBlocks );
						setLiveBlocks([ ...accumulated ]);
					}
				}
			});

			window.oTrk?.add({
				feature: 'ai-generation',
				featureComponent: 'ai-chat',
				featureValue: getTrackingFeatureValue(
					decision,
					refineInstruction,
					Boolean( currentGeneratedBlocks?.length )
				)
			}, { consent: true });

			if ( isStale() ) {
				return;
			}

			if ( ! generation.blocks.length ) {
				setError( __( 'Could not produce a valid result. Please try rephrasing your request.', 'otter-blocks' ) );
				setStatus( 'error' );
				setLiveBlocks([]);
				return;
			}

			const historyItem: ResultHistoryItem = {
				meta: {
					usedToken,
					prompt: refineInstruction ? `${ activePrompt }\n\n${ refineInstruction }` : activePrompt
				},
				generatedBlocks: cloneBlocksForPreview( generation.blocks ),
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
			setLiveBlocks([]);
		} catch ( e ) {
			if ( isStale() ) {
				return;
			}

			const message = ( e as Error )?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' );
			setError( message );
			setStatus( 'error' );
			setLiveBlocks([]);
		}
	};

	useEffect( () => {
		if ( autoGenerate && hasAPIKey && ( initialPrompt ?? '' ).trim() ) {
			generateContent(
				false,
				undefined,
				undefined,
				hasSelection && ! isCreateMode
			);
		}

		// Run once on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleApply = () => {
		if ( ! currentGeneratedBlocks?.length ) {
			return;
		}

		const blocks = sanitizeGeneratedBlocks(
			currentGeneratedBlocks,
			( name ) => blockTypes.find( ( blockType ) => blockType.name === name )
		);

		if ( ! blocks.length ) {
			createNotice(
				'error',
				__( 'Could not apply the generated content.', 'otter-blocks' ),
				{ type: 'snackbar', isDismissible: true }
			);
			return;
		}

		const validation = validateGeneratedBlocks(
			blocks,
			( name ) => blockTypes.find( ( blockType ) => blockType.name === name ),
			{ skipRootParentChecks: ! isCreateMode }
		);

		if ( ! validation.valid ) {
			createNotice(
				'error',
				__( 'The generated content is not valid for this editor. Please regenerate it and try again.', 'otter-blocks' ),
				{ type: 'snackbar', isDismissible: true }
			);
			return;
		}

		const canMergeFromPreviewClone = ! isCreateMode &&
			! onApplyBlocks &&
			0 < pinnedPreviewClone.length &&
			blocksStructureMatches( pinnedPreviewClone, blocks );

		const blocksToInsert = canMergeFromPreviewClone
			? mergePreviewCloneOntoBlocks(
				selectedBlocks,
				blocks,
				( name ) => blockTypes.find( ( blockType ) => blockType.name === name )
			)
			: blocks.map(
				( block ) => cloneBlock( block as Parameters<typeof cloneBlock>[0] )
			);

		try {
			if ( onApplyBlocks ) {
				onApplyBlocks( blocksToInsert );
				return;
			}

			if ( ! replaceClientIds.length || replaceClientIds.some( ( clientId ) => ! clientId ) ) {
				createNotice(
					'error',
					__( 'Could not find the block to replace. Please close the modal and try again.', 'otter-blocks' ),
					{ type: 'snackbar', isDismissible: true }
				);
				return;
			}

			replaceBlocks( replaceClientIds, blocksToInsert );
			( onApplyComplete ?? onClose )();
		} catch {
			createNotice(
				'error',
				__( 'Could not insert the generated content. Please regenerate it and try again.', 'otter-blocks' ),
				{ type: 'snackbar', isDismissible: true }
			);
		}
	};

	if ( ! isOpen ) {
		return null;
	}

	const handleSectionSubmit = () => {
		if ( isGenerating ) {
			return;
		}

		if ( hasResult ) {
			const delta = refineInput.trim();
			if ( ! delta ) {
				return;
			}
			const goal = prompt;
			setPrompt( `${ prompt }\n\n${ delta }` );
			setRefineInput( '' );
			generateContent( true, goal, delta );
			return;
		}

		if ( ! prompt.trim() ) {
			return;
		}
		generateContent( false );
	};

	const showRefineQuickActions = 0 < actions.length && ! isGenerating &&
		( hasResult || hasSelection || 0 < previewBlocks.length );

	const handleClose = () => {
		if ( isGenerating ) {
			return;
		}

		onClose();
	};

	const handleDiscard = () => {
		if ( isGenerating ) {
			return;
		}

		( onDiscard ?? onClose )();
	};

	const handleQuickAction = ( action: AIToolbarAction ) => {
		if ( isGenerating || ! hasAPIKey ) {
			return;
		}

		const forceEdit = hasSelection && ! isCreateMode;

		if ( hasResult ) {
			const goal = prompt;
			setPrompt( `${ goal }\n\n${ action.prompt }` );
			setRefineInput( '' );
			generateContent( true, goal, action.prompt, forceEdit );
			return;
		}

		setPrompt( action.prompt );
		generateContent( false, action.prompt, undefined, forceEdit );
	};

	const sectionSubmitDisabled = ! hasAPIKey || isGenerating ||
		( hasResult ? ! refineInput.trim() : ! prompt.trim() );

	const sectionStatus = ( () => {
		if ( isGenerating ) {
			return { kind: 'busy', label: loadingLabel };
		}
		if ( 'error' === status ) {
			return { kind: 'error', label: __( 'Generation failed', 'otter-blocks' ) };
		}
		if ( hasResult ) {
			return { kind: 'ready', label: __( 'Ready to insert', 'otter-blocks' ) };
		}
		if ( hasSelection ) {
			return {
				kind: 'idle',
				label: sprintf(
					// translators: %d: number of selected blocks attached as context.
					_n( '%d block attached', '%d blocks attached', pinnedPreviewClone.length, 'otter-blocks' ),
					pinnedPreviewClone.length
				)
			};
		}
		return { kind: 'idle', label: __( 'Describe a section', 'otter-blocks' ) };
	} )();

	let applyLabel = __( 'Apply', 'otter-blocks' );
	if ( onApplyBlocks ) {
		applyLabel = 'page' === scope ? __( 'Insert page', 'otter-blocks' ) : __( 'Insert section', 'otter-blocks' );
	}

	const placeholderText = hasSelection
		? __( 'Describe how Otter AI should change the selected block(s), or pick a quick action below.', 'otter-blocks' )
		: __( 'Describe the section you want to generate, or pick a quick action below.', 'otter-blocks' );

	return (
		<Modal
			title={ __( 'Otter AI Section', 'otter-blocks' ) }
			onRequestClose={ handleClose }
			isDismissible={ ! isGenerating }
			shouldCloseOnClickOutside={ ! isGenerating }
			shouldCloseOnEsc={ ! isGenerating }
			overlayClassName="o-ai-content-modal"
			className="o-ai-content-modal__dialog is-section-mode"
			__experimentalHideHeader
		>
			<div className="o-ai-section">
				<div className="o-ai-section__header">
					<span className="o-ai-section__brand-icon" aria-hidden="true">
						{ otterMascot({}) }
					</span>
					<div className="o-ai-section__brand">
						<span className="o-ai-section__brand-title">{ __( 'Otter AI Section', 'otter-blocks' ) }</span>
						<span className="o-ai-section__brand-subtitle">{ __( 'Builds with your blocks & theme styles', 'otter-blocks' ) }</span>
					</div>
					<span className={ `o-ai-section__status is-${ sectionStatus.kind }` }>
						<span className="o-ai-section__status-dot" aria-hidden="true" />
						{ sectionStatus.label }
						{ Boolean( contextMessage ) && (
							<Button
								variant="link"
								className="o-ai-section__context-toggle"
								onClick={ () => setShowContext( ( prev ) => ! prev ) }
							>
								{ showContext ? __( 'Hide', 'otter-blocks' ) : __( 'View', 'otter-blocks' ) }
							</Button>
						) }
					</span>
					<Button
						icon={ close }
						label={ __( 'Close', 'otter-blocks' ) }
						className="o-ai-section__close"
						disabled={ isGenerating }
						onClick={ handleClose }
					/>
				</div>

				{ showContext && Boolean( contextMessage ) && (
					<pre className="o-ai-section__context-preview">{ contextMessage }</pre>
				) }

				<div className={ `o-ai-section__canvas${ isGenerating && ! previewBlocks.length ? ' is-loading' : '' }` }>
					{ ! hasAPIKey && (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Please add an AI provider in the AI settings.', 'otter-blocks' ) }{ ' ' }
							<ExternalLink href={ `${ window.themeisleGutenberg?.optionsPath }#ai` }>
								{ __( 'Go to Dashboard', 'otter-blocks' ) }
							</ExternalLink>
						</Notice>
					) }

					{ 'error' === status && error && (
						<Notice status="error" isDismissible={ false }>{ error }</Notice>
					) }

					{ previewBlocks.length > 0 ? (
						<div className={ `o-ai-section__frame${ isGenerating ? ' is-live' : '' }` }>
							<div className="o-ai-section__frame-inner">
								<BlockPreview blocks={ previewBlocks } viewportWidth={ previewWidth } />
							</div>
						</div>
					) : ( isGenerating ? (
						<div className="o-ai-section__loading" role="status" aria-live="polite">
							<div className="o-ai-section__loading-frame">
								<div className="o-ai-section__loading-skeleton" aria-hidden="true">
									<span className="o-ai-section__loading-bar is-title" />
									<span className="o-ai-section__loading-bar" />
									<span className="o-ai-section__loading-bar is-short" />
									<div className="o-ai-section__loading-row">
										<span className="o-ai-section__loading-block" />
										<span className="o-ai-section__loading-block" />
										<span className="o-ai-section__loading-block" />
									</div>
								</div>
								<p className="o-ai-section__loading-label">{ loadingLabel }</p>
							</div>
						</div>
					) : ( 'error' !== status && (
						<div className="o-ai-section__placeholder">
							<p>{ placeholderText }</p>
							{ 0 < actions.length && (
								<div className="o-ai-section__chips">
									{ actions.map( ( action ) => (
										<Button
											key={ action.id }
											variant="secondary"
											isSmall
											onClick={ () => handleQuickAction( action ) }
										>
											{ action.title }
										</Button>
									) ) }
								</div>
							) }
						</div>
					) ) ) }

					{ hasResult && Boolean( currentGenerationDiagnostics?.droppedRoots.length ) && (
						<Notice status="warning" isDismissible={ false }>
							{
								sprintf(
									// translators: %d: number of generated block groups skipped.
									__( '%d generated block group could not be validated and was skipped.', 'otter-blocks' ),
									currentGenerationDiagnostics?.droppedRoots.length || 0
								)
							}
						</Notice>
					) }
				</div>

				<div
					className="o-ai-section__refine"
					onKeyDown={ ( event ) => {
						if ( 'Enter' === event.key && ! event.shiftKey ) {
							event.preventDefault();
							handleSectionSubmit();
						}
					} }
				>
					{
						showRefineQuickActions && (
							<div className="o-ai-section__refine-chips">
								{ actions.map( ( action ) => (
									<Button
										key={ action.id }
										variant="secondary"
										isSmall
										disabled={ ! hasAPIKey }
										onClick={ () => handleQuickAction( action ) }
									>
										{ action.title }
									</Button>
								) ) }
							</div>
						)
					}
					<div className="o-ai-section__refine-field">
						<span className="o-ai-section__refine-icon" aria-hidden="true">
							<Icon icon={ aiGeneration } />
						</span>
						<TextareaControl
							className="o-ai-section__refine-input"
							label={ __( 'Prompt', 'otter-blocks' ) }
							hideLabelFromVision
							placeholder={
								hasResult
									? __( 'Ask Otter AI to refine — e.g. make the headline shorter, use a darker theme…', 'otter-blocks' )
									: hasSelection
										? __( 'Ask Otter AI to change the selected block(s)…', 'otter-blocks' )
										: __( 'Describe what you want to build…', 'otter-blocks' )
							}
							value={ hasResult ? refineInput : prompt }
							rows={ 1 }
							onChange={ ( value ) => {
								if ( hasResult ) {
									setRefineInput( value );
								} else {
									setPrompt( value );
									markDirty();
								}
							} }
							__nextHasNoMarginBottom
						/>
						<Button
							variant="primary"
							className="o-ai-section__refine-submit"
							disabled={ sectionSubmitDisabled }
							isBusy={ isGenerating }
							onClick={ handleSectionSubmit }
						>
							{ hasResult ? __( 'Refine', 'otter-blocks' ) : __( 'Generate', 'otter-blocks' ) }
						</Button>
					</div>
				</div>

				<div className="o-ai-section__footer">
					<div className="o-ai-section__footer-left">
						{ versionControl }
						{ currentPromptEcho && (
							<span className="o-ai-section__prompt-echo" title={ currentPromptEcho }>
								{ currentPromptEcho }
							</span>
						) }
					</div>

					<div className="o-ai-section__footer-right">
						<Button
							variant="secondary"
							disabled={ isGenerating }
							onClick={ handleDiscard }
						>
							{ __( 'Discard', 'otter-blocks' ) }
						</Button>
						<Button
							variant="primary"
							disabled={ ! hasResult || isGenerating }
							onClick={ handleApply }
						>
							{ applyLabel }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default AIContentModal;
