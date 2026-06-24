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
import { sendBlockGenerationPrompt, isPromptAborted } from '../../helpers/prompt';
import useSettings from '../../helpers/use-settings';
import type { BlockProps } from '../../helpers/blocks';
import { AIToolbarAction } from './actions';
import {
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
import { buildSessionMemory, summarizeToolOperation } from './session-memory';
import { extractPromptHistory } from './session-history';
import type { AgentToolName } from './operations/types';
import type { SessionOperationLog } from './session-memory';

import { buildAgentContext } from './agent-context';
import type { AgentContextEntry } from './agent-context';
import type { GenerationRoute } from './routing/types';

const EMPTY_PREVIEW_BLOCKS: BlockProps<unknown>[] = [];

type Turn = {
	meta: {
		usedToken: number;
		prompt: string;
		route: GenerationRoute;
		tool?: AgentToolName;
		operation?: SessionOperationLog;
		removedBlocks?: Record<string, import('./block-generation').GeneratedBlockTree>;
		contextEntry?: AgentContextEntry;
	};
	generatedBlocks: BlockProps<unknown>[];
	generationRationale?: string[];
	generationDiagnostics?: BlockGenerationResult['diagnostics'];
};

type GenerationProgress = {
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

	const [ instruction, setInstruction ] = useState( () => {
		if ( autoGenerate ) {
			return '';
		}

		return initialPrompt?.trim() ?? '';
	} );
	const [ status, setStatus ] = useState<'idle' | 'loading' | 'error' | 'loaded'>( 'idle' );
	const [ error, setError ] = useState<string | undefined>();
	const [ turns, setTurns ] = useState<Turn[]>([]);
	const [ activeTurnIndex, setActiveTurnIndex ] = useState( 0 );
	const [ liveBlocks, setLiveBlocks ] = useState<BlockProps<unknown>[]>([]);
	const [ progress, setProgress ] = useState<GenerationProgress>({ done: 0, total: 0 });

	const isMountedRef = useRef( true );
	const generationIdRef = useRef( 0 );
	const abortControllerRef = useRef<AbortController | null>( null );
	const previousTurnIndexRef = useRef( activeTurnIndex );

	useEffect( () => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
			abortControllerRef.current?.abort();
		};
	}, []);

	useEffect( () => {
		if ( previousTurnIndexRef.current === activeTurnIndex ) {
			return;
		}

		previousTurnIndexRef.current = activeTurnIndex;
		setInstruction( '' );
	}, [ activeTurnIndex ] );

	const getBlockType = useMemo(
		() => ( name: string ) => blockTypes.find( ( blockType ) => blockType.name === name ),
		[ blockTypes ]
	);

	const hasAPIKey = Boolean(
		window.themeisleGutenberg?.hasOpenAiKey ||
		getOption( openAiAPIKeyName )
	);

	const currentTurn = turns[ activeTurnIndex ];
	const currentGeneratedBlocks = currentTurn?.generatedBlocks;
	const currentGenerationDiagnostics = currentTurn?.generationDiagnostics;
	const hasTurns = 0 < turns.length;
	const canUndoTurn = 0 < activeTurnIndex;
	const canRedoTurn = activeTurnIndex < turns.length - 1;
	const isGenerating = 'loading' === status;
	const previewWidth = 1240;

	let previewBlocks: BlockProps<unknown>[] = [];
	if ( isGenerating && liveBlocks.length ) {
		previewBlocks = liveBlocks;
	} else if ( currentGeneratedBlocks?.length ) {
		previewBlocks = currentGeneratedBlocks;
	} else if ( liveBlocks.length ) {
		previewBlocks = liveBlocks;
	} else if ( hasSelection ) {
		previewBlocks = pinnedPreviewClone;
	}

	const replaceClientIds = getSelectedBlockClientIds( isMultipleSelection, selectedClientIds, singleClientId );

	const loadingLabel = __( 'Updating…', 'otter-blocks' );

	const abortInFlightGeneration = () => {
		generationIdRef.current++;
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;

		if ( isGenerating ) {
			setStatus( 0 < turns.length ? 'loaded' : 'idle' );
			setLiveBlocks([]);
			setProgress({ done: 0, total: 0 });
		}
	};

	const stopGeneration = () => {
		abortInFlightGeneration();
		setError( undefined );
	};

	const turnNavigation = hasTurns ? (
		<div className="o-ai-version-control">
			<Button
				className="o-ai-version-control__button"
				icon={ chevronLeft }
				label={ __( 'Undo', 'otter-blocks' ) }
				disabled={ ! canUndoTurn || isGenerating }
				onClick={ () => setActiveTurnIndex( ( prev ) => Math.max( 0, prev - 1 ) ) }
			/>
			<span className="o-ai-version-control__count">
				{
					sprintf(
						// translators: %1$d: current step number, %2$d: total steps.
						__( 'Step %1$d of %2$d', 'otter-blocks' ),
						activeTurnIndex + 1,
						turns.length
					)
				}
			</span>
			<Button
				className="o-ai-version-control__button"
				icon={ chevronRight }
				label={ __( 'Redo', 'otter-blocks' ) }
				disabled={ ! canRedoTurn || isGenerating }
				onClick={ () => setActiveTurnIndex( ( prev ) => Math.min( turns.length - 1, prev + 1 ) ) }
			/>
		</div>
	) : null;

	const generateContent = async(
		instructionOverride?: string,
		forceEditRoute = false
	) => {
		const turnInstruction = ( instructionOverride ?? instruction ).trim();

		if ( ! turnInstruction ) {
			return;
		}

		setInstruction( '' );

		const priorTurns = turns.slice( 0, activeTurnIndex + 1 );
		const isFollowUp = 0 < priorTurns.length;
		const refineInstruction = isFollowUp ? turnInstruction : undefined;
		const activePrompt = isFollowUp
			? ( priorTurns[ 0 ]?.meta.prompt ?? turnInstruction )
			: turnInstruction;
		const routeInstruction = refineInstruction || activePrompt;

		if ( ! hasAPIKey ) {
			setError( __( 'No AI provider detected. Please configure one in the AI settings.', 'otter-blocks' ) );
			setStatus( 'error' );
			return;
		}

		const generationId = ++generationIdRef.current;
		const isStale = () => ! isMountedRef.current || generationId !== generationIdRef.current;

		abortControllerRef.current?.abort();
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		setStatus( 'loading' );
		setError( undefined );

		let usedToken = 0;
		const requestCompletion = async( requestPrompt: string ): Promise<string> => {
			if ( abortController.signal.aborted || isStale() ) {
				throw new DOMException( 'Aborted', 'AbortError' );
			}

			const response = await sendBlockGenerationPrompt( requestPrompt, 'aiChat', {
				signal: abortController.signal
			});

			if ( abortController.signal.aborted || isStale() || isPromptAborted( response ) ) {
				throw new DOMException( 'Aborted', 'AbortError' );
			}

			if ( ! response.ok ) {
				throw new Error( response.error?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
			}

			if ( ! response.content ) {
				throw new Error( __( 'Empty response from the AI service. Please try again.', 'otter-blocks' ) );
			}

			usedToken += response.usedTokens ?? 0;
			return response.content;
		};

		const sessionHistory = extractPromptHistory( priorTurns );
		const sessionMemory = buildSessionMemory( priorTurns );
		const agentContext = buildAgentContext( priorTurns );
		const referenceBlocks = currentGeneratedBlocks?.length
			? currentGeneratedBlocks
			: pinnedPreviewClone;
		const accumulated: BlockProps<unknown>[] = [];
		const preferEdit = ! isCreateMode && 0 < referenceBlocks.length;
		const forceRoute = forceEditRoute || ( preferEdit && autoGenerate )
			? 'edit' as const
			: undefined;

		setLiveBlocks( referenceBlocks );

		try {
			const { generation, decision, toolCall, removedBlocks, contextEntry } = await runAgentTurn({
				instruction: routeInstruction,
				activePrompt,
				refineInstruction,
				referenceBlocks,
				sessionHistory,
				sessionMemory,
				agentContext,
				blockTypes,
				themeColors,
				patterns: isCreateMode || ! referenceBlocks.length ? blockPatterns : undefined,
				isCreateMode,
				scope,
				getBlockType,
				requestCompletion,
				forceRoute,
				preferEdit,
				onPhase: () => {
					// Single loading state in the UI — phases are internal only.
				},
				onPlanReady: ( plan ) => {
					if ( ! isStale() ) {
						setProgress({ done: 0, total: plan.roots?.length ?? 0 });
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

			const turn: Turn = {
				meta: {
					usedToken,
					prompt: turnInstruction,
					route: decision.route,
					tool: toolCall.tool,
					operation: summarizeToolOperation( toolCall.tool, toolCall.args ),
					removedBlocks,
					contextEntry
				},
				generatedBlocks: cloneBlocksForPreview( generation.blocks ),
				generationRationale: generation.rationale,
				generationDiagnostics: generation.diagnostics
			};

			setTurns( ( prev ) => {
				const base = prev.slice( 0, activeTurnIndex + 1 );
				const next = [ ...base, turn ];
				setActiveTurnIndex( next.length - 1 );
				return next;
			});

			setInstruction( '' );
			setStatus( 'loaded' );
			setLiveBlocks([]);
			abortControllerRef.current = null;
		} catch ( e ) {
			if ( isStale() || 'AbortError' === ( e as Error )?.name ) {
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
				( initialPrompt ?? '' ).trim(),
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

		const turnInstruction = instruction.trim();
		if ( ! turnInstruction ) {
			return;
		}

		setInstruction( '' );
		generateContent( turnInstruction );
	};

	const showRefineQuickActions = 0 < actions.length && ! isGenerating &&
		( hasTurns || hasSelection || 0 < previewBlocks.length );

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

	const insertQuickAction = ( action: AIToolbarAction ) => {
		if ( isGenerating || ! hasAPIKey ) {
			return;
		}

		setInstruction( action.prompt );
	};

	const quickActionsRow = 0 < actions.length ? (
		<div className="o-ai-section__quick-actions">
			{ actions.map( ( action ) => (
				<button
					key={ action.id }
					type="button"
					className="o-ai-section__quick-action"
					disabled={ ! hasAPIKey || isGenerating }
					onClick={ () => insertQuickAction( action ) }
				>
					{ action.title }
				</button>
			) ) }
		</div>
	) : null;

	const sectionSubmitDisabled = ! hasAPIKey || isGenerating || ! instruction.trim();

	const sectionStatus = ( () => {
		if ( isGenerating ) {
			return { kind: 'busy', label: loadingLabel };
		}
		if ( 'error' === status ) {
			return { kind: 'error', label: __( 'Update failed', 'otter-blocks' ) };
		}
		if ( hasTurns ) {
			const route = currentTurn?.meta.route;
			let readyLabel = __( 'Updated — ready to apply', 'otter-blocks' );

			if ( 'patch' === route ) {
				readyLabel = __( 'Edited — ready to apply', 'otter-blocks' );
			} else if ( 'structure' === route ) {
				readyLabel = __( 'Restructured — ready to apply', 'otter-blocks' );
			} else if ( 'list' === route ) {
				readyLabel = __( 'Block list ready', 'otter-blocks' );
			} else if ( 'history' === route ) {
				readyLabel = __( 'Session history ready', 'otter-blocks' );
			} else if ( 'pattern' === route ) {
				readyLabel = __( 'Pattern match ready', 'otter-blocks' );
			}

			return {
				kind: 'ready',
				label: readyLabel
			};
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

	const placeholderPrompt = currentTurn?.meta?.prompt?.trim() ?? '';
	const inputPlaceholder = placeholderPrompt
		? placeholderPrompt
		: hasSelection
			? __( 'Ask Otter AI to change the selected block(s)…', 'otter-blocks' )
			: __( 'Describe what you want to build…', 'otter-blocks' );

	const emptyCanvasText = hasSelection
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
					</span>
					<Button
						icon={ close }
						label={ __( 'Close', 'otter-blocks' ) }
						className="o-ai-section__close"
						disabled={ isGenerating }
						onClick={ handleClose }
					/>
				</div>

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

					{ ( 'list' === currentTurn?.meta.route || 'history' === currentTurn?.meta.route || 'pattern' === currentTurn?.meta.route ) && Boolean( currentTurn?.generationRationale?.length ) && (
						<Notice status="info" isDismissible={ false } className="o-ai-section__block-list">
							{ currentTurn?.generationRationale?.join( '\n' ) }
						</Notice>
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
							<p>{ emptyCanvasText }</p>
							{ quickActionsRow }
						</div>
					) ) ) }

					{ hasTurns && Boolean( currentGenerationDiagnostics?.droppedRoots.length ) && (
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
						showRefineQuickActions && quickActionsRow
					}
					<div className="o-ai-section__refine-field">
						<span className="o-ai-section__refine-icon" aria-hidden="true">
							<Icon icon={ aiGeneration } />
						</span>
						<TextareaControl
							key={ `o-ai-input-${ turns.length }-${ activeTurnIndex }` }
							className="o-ai-section__refine-input"
							label={ __( 'Prompt', 'otter-blocks' ) }
							hideLabelFromVision
							placeholder={ inputPlaceholder }
							value={ instruction }
							rows={ 1 }
							onChange={ ( value ) => {
								setInstruction( value );

								if ( ! hasTurns && isGenerating ) {
									abortInFlightGeneration();
								}
							} }
							__nextHasNoMarginBottom
						/>
						<Button
							variant={ isGenerating ? 'secondary' : 'primary' }
							className={ isGenerating ? 'o-ai-section__refine-stop' : 'o-ai-section__refine-submit' }
							disabled={ ! isGenerating && sectionSubmitDisabled }
							isBusy={ false }
							onClick={ isGenerating ? stopGeneration : handleSectionSubmit }
						>
							{ isGenerating ? __( 'Stop', 'otter-blocks' ) : __( 'Run', 'otter-blocks' ) }
						</Button>
					</div>
				</div>

				<div className="o-ai-section__footer">
					<div className="o-ai-section__footer-left">
						{ turnNavigation }
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
							disabled={ ! hasTurns || isGenerating }
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
