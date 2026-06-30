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
	Spinner,
	TextareaControl
} from '@wordpress/components';

import { cloneBlock, serialize } from '@wordpress/blocks';

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
import { aiDebug, aiDebugGroup, detectPipelineStep } from './debug';
import {
	sanitizeGeneratedBlocks,
	validateGeneratedBlocks
} from './block-generation';
import type { BlockGenerationResult } from './block-generation';
import { getTrackingFeatureValue, runAgentTurn } from './agent';
import type { AgentToolName, GenerationRoute } from './agent';
import { extractPromptHistory } from './session-history';
import { buildPageStyleDigest } from './page-style';
import { LivePreview } from '../patterns-library/template';
import { useAtomicCssForContent } from '../patterns-library/atomic';

const EMPTY_PREVIEW_BLOCKS: BlockProps<unknown>[] = [];

/** Cheap stable hash (djb2) so identical preview markup reuses its generated CSS. */
const hashString = ( value: string ): string => {
	let hash = 5381;

	for ( let index = 0; index < value.length; index++ ) {
		hash = ( ( hash << 5 ) + hash + value.charCodeAt( index ) ) | 0;
	}

	return ( hash >>> 0 ).toString( 36 );
};

type Turn = {
	meta: {
		usedToken: number;
		prompt: string;
		route: GenerationRoute;
		tool?: AgentToolName;
		/**
		 * The unedited selection captured when an edit session opens, kept as the
		 * first history step so the user can step back and compare before/after.
		 */
		isOriginal?: boolean;
		/** Stable key for the live preview crossfade — see previewKey below. */
		previewKey?: string;
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

	/**
	 * Whether the theme's color palette is sent to the model. When false the
	 * palette is withheld and the model picks its own colors. Defaults to true.
	 */
	includeThemeColors?: boolean;

	/**
	 * Whether a digest of the current page's Atomic Wind style conventions is sent
	 * to the model so a newly created section matches the existing page. Only
	 * applies to create mode; no-ops when the page has too little signal. Defaults
	 * to true.
	 */
	includePageContext?: boolean;
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
	initialScope = 'section',
	includeThemeColors = true,
	includePageContext = true
}: AIContentModalProps ) => {
	const isCreateMode = 'create' === mode;
	const scope = initialScope;

	const [ pinnedPreviewClone, setPinnedPreviewClone ] = useState<BlockProps<unknown>[]>( EMPTY_PREVIEW_BLOCKS );
	const wasOpenRef = useRef( false );

	useEffect( () => {
		if ( isOpen && ! wasOpenRef.current ) {
			const clone = selectedBlocks.length ? cloneBlocksForPreview( selectedBlocks ) : EMPTY_PREVIEW_BLOCKS;
			setPinnedPreviewClone( clone );

			// Edit session — seed an "Original" baseline as history step 1 so the
			// user can step back to the unedited selection and compare it against
			// each generated version. (Create mode has no original to compare to.)
			if ( ! isCreateMode && clone.length ) {
				setTurns([ {
					meta: { usedToken: 0, prompt: '', route: 'rewrite', isOriginal: true, previewKey: 'original' },
					generatedBlocks: clone
				} ]);
			} else {
				setTurns([]);
			}
			setActiveTurnIndex( 0 );
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

	// The current page's top-level blocks, used to derive the style digest so a
	// freshly created section matches what is already on the page. Only read in
	// create mode (an edit already has the live section as context).
	const pageBlocks = useSelect(
		select => ( isCreateMode ? ( select( 'core/block-editor' ) as { getBlocks?: () => BlockProps<unknown>[] } )?.getBlocks?.() ?? [] : [] ),
		[ isCreateMode ]
	);

	// Built once per turn-open from the live page, excluding the in-place
	// generator block so its placeholder never feeds back into its own digest.
	const pageStyleDigest = useMemo(
		() => {
			if ( ! isCreateMode || ! includePageContext || ! pageBlocks.length ) {
				return undefined;
			}

			return buildPageStyleDigest( pageBlocks, { excludeClientIds: singleClientId ? [ singleClientId ] : [] } ) ?? undefined;
		},
		[ isCreateMode, includePageContext, pageBlocks, singleClientId ]
	);

	const [ instruction, setInstruction ] = useState( () => {
		if ( autoGenerate ) {
			return '';
		}

		return initialPrompt?.trim() ?? '';
	} );
	const [ status, setStatus ] = useState<'idle' | 'loading' | 'error' | 'loaded'>( 'idle' );
	// The prompt currently being generated — shown (read-only) in the input while
	// the request is in flight so the user sees what's running instead of an empty
	// field they can type into. Cleared whenever generation stops.
	const [ runningPrompt, setRunningPrompt ] = useState( '' );
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

	// Drop the read-only running prompt the moment generation stops (done, error,
	// or aborted) so the field returns to a normal, editable state.
	useEffect( () => {
		if ( 'loading' !== status ) {
			setRunningPrompt( '' );
		}
	}, [ status ] );

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
	// The seeded "Original" baseline (edit sessions) is a history step but not a
	// generated result — distinguish it so the ready/apply UI reflects real edits.
	const hasOriginalTurn = Boolean( turns[ 0 ]?.meta.isOriginal );
	const hasRealTurns = turns.some( ( turn ) => ! turn.meta.isOriginal );
	const isViewingOriginal = Boolean( currentTurn?.meta.isOriginal );
	const canUndoTurn = 0 < activeTurnIndex;
	const canRedoTurn = activeTurnIndex < turns.length - 1;
	const isGenerating = 'loading' === status;
	const previewWidth = 1400;

	const previewBlocks = useMemo<BlockProps<unknown>[]>( () => {
		if ( isGenerating && liveBlocks.length ) {
			return liveBlocks;
		}
		if ( currentGeneratedBlocks?.length ) {
			return currentGeneratedBlocks;
		}
		if ( liveBlocks.length ) {
			return liveBlocks;
		}
		if ( hasSelection ) {
			return pinnedPreviewClone;
		}
		return EMPTY_PREVIEW_BLOCKS;
	}, [ isGenerating, liveBlocks, currentGeneratedBlocks, hasSelection, pinnedPreviewClone ]);

	// A live preview, like the pattern library's: hold a shimmer skeleton over
	// the BlockPreview until its iframe has actually painted, then crossfade
	// (see LivePreview). The key stays stable across a generation's live→done
	// transition (the finished turn stores the same id), so completing a build
	// updates in place instead of remounting and flashing the skeleton; undo /
	// redo to another turn keys differently and crossfades cleanly.
	const previewKey = isGenerating
		? `g${ generationIdRef.current }`
		: ( currentTurn?.meta.previewKey ?? ( hasSelection ? 'selection' : 'preview' ) );

	// Atomic Wind blocks are styled by JIT-generated Tailwind CSS that a preview
	// iframe never gets on its own — generate it from the live markup and inject
	// it, exactly as the pattern library does for Atomic Wind patterns.
	const atomicContent = useMemo(
		() => ( previewBlocks.length ? serialize( previewBlocks as unknown as Parameters<typeof serialize>[0] ) : '' ),
		[ previewBlocks ]
	);
	const atomicCacheKey = useMemo( () => `ai-live:${ hashString( atomicContent ) }`, [ atomicContent ] );
	const { css: atomicCss, isReady: atomicReady } = useAtomicCssForContent( atomicContent, atomicCacheKey );

	// Keep the last generated stylesheet on screen while the next chunk's CSS is
	// still generating, so streaming roots never strobe between styled and
	// unstyled. Reset when the shown preview changes (new turn / undo / redo).
	const lastAtomicCssRef = useRef( '' );
	if ( atomicCss ) {
		lastAtomicCssRef.current = atomicCss;
	}

	useEffect( () => {
		lastAtomicCssRef.current = '';
	}, [ previewKey ] );

	const needsAtomic = atomicContent.includes( 'atomic-wind/' );
	const displayAtomicCss = atomicCss || lastAtomicCssRef.current;

	// Reveal once there is something to show; for Atomic Wind, hold the skeleton
	// until the first stylesheet is ready so the section never paints unstyled.
	const showPreview = 0 < previewBlocks.length &&
		( ! needsAtomic || atomicReady || Boolean( lastAtomicCssRef.current ) );

	const replaceClientIds = getSelectedBlockClientIds( isMultipleSelection, selectedClientIds, singleClientId );

	// Every edit rewrites the COMPLETE selected markup — including everything
	// nested inside a selected container. The top-level count ("1 block") hides
	// that, so a Translate on a section silently rewrites its whole subtree. Walk
	// the selection to report the real scope (total blocks + a type breakdown) so
	// applying to a container is explicit, never a surprise.
	const selectionScope = useMemo( () => {
		const counts: Record<string, number> = {};
		let total = 0;

		const walk = ( list: BlockProps<unknown>[] ) => {
			list.forEach( ( block ) => {
				if ( ! block?.name ) {
					return;
				}

				total++;
				counts[ block.name ] = ( counts[ block.name ] ?? 0 ) + 1;

				if ( block.innerBlocks?.length ) {
					walk( block.innerBlocks as BlockProps<unknown>[] );
				}
			} );
		};

		walk( pinnedPreviewClone );

		const rootCount = pinnedPreviewClone.length;
		const blockTitle = ( name: string ) => getBlockType( name )?.title ?? name;

		const breakdown = Object.entries( counts )
			.sort( ( a, b ) => b[ 1 ] - a[ 1 ] )
			.map( ( [ name, count ] ) => ( 1 < count ? `${ count } × ${ blockTitle( name ) }` : blockTitle( name ) ) );

		return {
			total,
			rootCount,
			nestedCount: Math.max( 0, total - rootCount ),
			breakdown,
			rootTitle: 1 === rootCount ? blockTitle( pinnedPreviewClone[ 0 ]?.name ?? '' ) : __( 'selection', 'otter-blocks' )
		};
	}, [ pinnedPreviewClone, getBlockType ] );

	const scopeNoun = 'page' === scope
		? __( 'page', 'otter-blocks' )
		: __( 'section', 'otter-blocks' );

	// A label that tracks what's actually happening: editing existing content,
	// outlining a fresh build, or filling each section of it in turn.
	const loadingLabel = useMemo( () => {
		// Editing — a selection tweak, or a follow-up change to a built result.
		if ( hasTurns || ( hasSelection && ! isCreateMode ) ) {
			return __( 'Updating…', 'otter-blocks' );
		}

		// Fresh build: before the plan lands there are no roots yet (planning);
		// after, we report progress as each section is filled.
		if ( 0 < progress.total ) {
			return sprintf(
				// translators: %1$d: current section number; %2$d: total sections.
				__( 'Building section %1$d of %2$d…', 'otter-blocks' ),
				Math.min( progress.done + 1, progress.total ),
				progress.total
			);
		}

		return sprintf(
			// translators: %s: "page" or "section".
			__( 'Planning your %s…', 'otter-blocks' ),
			scopeNoun
		);
	}, [ hasTurns, hasSelection, isCreateMode, progress.total, progress.done, scopeNoun ] );

	const modalTitle = 'page' === scope
		? __( 'Otter AI Page', 'otter-blocks' )
		: __( 'Otter AI Section', 'otter-blocks' );

	// A structured "section forming" skeleton — eyebrow, title, two text lines and
	// a couple of buttons, centered like a real hero. Reused as the live preview's
	// boot placeholder and as the first-build loading state.
	const sectionSkeleton = (
		<div className="o-ai-section__skeleton" aria-hidden="true">
			<span className="o-ai-section__sk-bar o-ai-section__sk-eyebrow" />
			<span className="o-ai-section__sk-bar o-ai-section__sk-title" />
			<span className="o-ai-section__sk-bar o-ai-section__sk-line" />
			<span className="o-ai-section__sk-bar o-ai-section__sk-line is-short" />
			<span className="o-ai-section__sk-actions">
				<span className="o-ai-section__sk-bar o-ai-section__sk-btn" />
				<span className="o-ai-section__sk-bar o-ai-section__sk-btn is-ghost" />
			</span>
		</div>
	);

	const abortInFlightGeneration = () => {
		generationIdRef.current++;
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;

		if ( isGenerating ) {
			setStatus( hasRealTurns ? 'loaded' : 'idle' );
			setLiveBlocks([]);
			setProgress({ done: 0, total: 0 });
		}
	};

	const stopGeneration = () => {
		abortInFlightGeneration();
		setError( undefined );
	};

	// The original sits at index 0 (edit sessions); number the real edits from 1 so
	// the stepper reads "Original ‹ › Edit 1 of N" rather than counting the baseline.
	const editStepOffset = hasOriginalTurn ? 1 : 0;
	const stepLabel = isViewingOriginal
		? __( 'Original', 'otter-blocks' )
		: sprintf(
			// translators: %1$d: current step number, %2$d: total steps.
			__( 'Step %1$d of %2$d', 'otter-blocks' ),
			activeTurnIndex + 1 - editStepOffset,
			turns.length - editStepOffset
		);

	const turnNavigation = hasRealTurns ? (
		<div className="o-ai-version-control">
			<Button
				className="o-ai-version-control__button"
				icon={ chevronLeft }
				label={ __( 'Previous', 'otter-blocks' ) }
				disabled={ ! canUndoTurn || isGenerating }
				onClick={ () => setActiveTurnIndex( ( prev ) => Math.max( 0, prev - 1 ) ) }
			/>
			<span className="o-ai-version-control__count">
				{ stepLabel }
			</span>
			<Button
				className="o-ai-version-control__button"
				icon={ chevronRight }
				label={ __( 'Next', 'otter-blocks' ) }
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

		// The seeded "Original" baseline is history, not a prior generation — exclude
		// it so the first real edit is treated as an initial edit, not a refine.
		const priorTurns = turns
			.slice( 0, activeTurnIndex + 1 )
			.filter( ( turn ) => ! turn.meta.isOriginal );
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
		setRunningPrompt( turnInstruction );
		setError( undefined );

		let usedToken = 0;
		let callIndex = 0;
		const requestCompletion = async( requestPrompt: string ): Promise<string> => {
			if ( abortController.signal.aborted || isStale() ) {
				throw new DOMException( 'Aborted', 'AbortError' );
			}

			const step = detectPipelineStep( requestPrompt );
			const thisCall = ++callIndex;
			aiDebugGroup( `→ call #${ thisCall } prompt [${ step }]`, () => {
				// eslint-disable-next-line no-console
				console.log( requestPrompt );
			} );

			const response = await sendBlockGenerationPrompt( requestPrompt, 'aiChat', {
				signal: abortController.signal
			});

			if ( abortController.signal.aborted || isStale() || isPromptAborted( response ) ) {
				throw new DOMException( 'Aborted', 'AbortError' );
			}

			if ( ! response.ok ) {
				aiDebug( `✗ call #${ thisCall } error [${ step }]`, response.error );
				throw new Error( response.error?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
			}

			if ( ! response.content ) {
				aiDebug( `✗ call #${ thisCall } empty response [${ step }]` );
				throw new Error( __( 'Empty response from the AI service. Please try again.', 'otter-blocks' ) );
			}

			aiDebugGroup( `← call #${ thisCall } response [${ step }] · ${ response.usedTokens ?? 0 } tokens`, () => {
				// eslint-disable-next-line no-console
				console.log( response.content );
			} );

			usedToken += response.usedTokens ?? 0;
			return response.content;
		};

		const sessionHistory = extractPromptHistory( priorTurns );
		const referenceBlocks = currentGeneratedBlocks?.length
			? currentGeneratedBlocks
			: pinnedPreviewClone;
		// Sections can finish out of order (the page flow builds them concurrently),
		// so hold each completed section in its own slot keyed by rootIndex and
		// rebuild the live preview in section order — never in completion order.
		const sectionSlots: BlockProps<unknown>[][] = [];
		const preferEdit = ! isCreateMode && 0 < referenceBlocks.length;

		// A fresh create (not a follow-up refine) always runs through the generate
		// pipeline so the build starts from a clean plan rather than editing.
		const forceGenerate = isCreateMode && ! isFollowUp;

		let forceRoute: 'edit' | 'generate' | undefined;
		if ( forceEditRoute || ( preferEdit && autoGenerate ) ) {
			forceRoute = 'edit';
		} else if ( forceGenerate ) {
			forceRoute = 'generate';
		}

		setLiveBlocks( referenceBlocks );

		aiDebugGroup( `▶ turn start · ${ referenceBlocks.length } selected block(s) · ${ isCreateMode ? 'create' : 'edit' } mode`, () => {
			aiDebug( 'instruction', routeInstruction );
			aiDebug( 'activePrompt', activePrompt );
			aiDebug( 'forceRoute', forceRoute ?? '(auto)' );
			aiDebug( 'pageStyleDigest', pageStyleDigest ?? '(none)' );
			// eslint-disable-next-line no-console
			console.log( '%cselected markup:', 'font-weight:600', '\n' + serialize( referenceBlocks as unknown as Parameters<typeof serialize>[0] ) );
		} );

		try {
			const { generation, decision, toolCall } = await runAgentTurn({
				instruction: routeInstruction,
				activePrompt,
				refineInstruction,
				referenceBlocks,
				sessionHistory,
				blockTypes,
				themeColors: includeThemeColors ? themeColors : [],
				pageStyleDigest,
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
				onRootComplete: ({ rootIndex, totalRoots, blocks: rootBlocks }) => {
					if ( isStale() ) {
						return;
					}
					// Count finished sections (success or dropped); they may arrive in
					// any order under concurrent builds.
					setProgress( ( prev ) => ({ done: prev.done + 1, total: totalRoots || prev.total }) );
					sectionSlots[ rootIndex ] = rootBlocks;
					// flat() skips empty slots and dropped ([]) sections, leaving the
					// completed sections concatenated in section order.
					const ordered = sectionSlots.flat();
					if ( ordered.length ) {
						setLiveBlocks( ordered );
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

			aiDebugGroup( `■ turn result · route=${ decision.route } · tool=${ toolCall.tool } · ${ generation.blocks.length } block(s)`, () => {
				aiDebug( 'rationale', generation.rationale );
				const dropped = generation.diagnostics?.droppedRoots ?? [];
				if ( dropped.length ) {
					aiDebug( '⚠ INVALID MARKUP — validation errors', dropped );
				} else {
					aiDebug( '✓ markup valid', true );
				}
				// eslint-disable-next-line no-console
				console.log( '%cresult markup:', 'font-weight:600', '\n' + ( generation.blocks.length ? serialize( generation.blocks as unknown as Parameters<typeof serialize>[0] ) : '(empty)' ) );
			} );

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
					previewKey: `g${ generationId }`
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

	// Auto-run for toolbar quick actions (autoGenerate). We must NOT fire on the
	// raw mount: `pinnedPreviewClone` is populated by the sibling effect above and
	// its setState hasn't committed yet on the first render, so `hasSelection`
	// would still be false and the turn would wrongly route to GENERATE (building
	// new content) instead of editing the selection. Wait until the selection
	// clone has settled, then fire exactly once.
	const autoRanRef = useRef( false );
	useEffect( () => {
		if ( autoRanRef.current ) {
			return;
		}

		if ( ! autoGenerate || ! hasAPIKey || ! ( initialPrompt ?? '' ).trim() ) {
			return;
		}

		// There is a selection to edit but its clone hasn't committed yet — wait
		// for the next render rather than running against an empty reference.
		if ( ! isCreateMode && 0 < selectedBlocks.length && ! hasSelection ) {
			return;
		}

		autoRanRef.current = true;
		generateContent(
			( initialPrompt ?? '' ).trim(),
			hasSelection && ! isCreateMode
		);

		// generateContent is intentionally omitted; the ref guards single-firing.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ autoGenerate, hasAPIKey, initialPrompt, isCreateMode, hasSelection, selectedBlocks.length ]);

	const handleApply = () => {
		// The "Original" step is the unedited baseline for comparison — there's
		// nothing to apply from it.
		if ( isViewingOriginal || ! currentGeneratedBlocks?.length ) {
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

		// The rewrite / text / style paths already return complete, canonical blocks
		// for the whole selection (text & style are clones of the original with only
		// copy or styling changed), so replace wholesale — skip the positional
		// clone-merge, which matches by index and would overwrite the AI's changes
		// with the original attributes.
		const wholesaleRoutes = [ 'rewrite', 'text', 'style' ];
		const isRewriteResult = wholesaleRoutes.includes( currentTurn?.meta.route ?? '' );
		const canMergeFromPreviewClone = ! isCreateMode &&
			! onApplyBlocks &&
			! isRewriteResult &&
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
		if ( 'error' === status ) {
			return { kind: 'error', label: __( 'Update failed', 'otter-blocks' ) };
		}
		if ( isViewingOriginal ) {
			return {
				kind: 'idle',
				label: __( 'Original — before your edits', 'otter-blocks' )
			};
		}
		if ( hasRealTurns ) {
			const route = currentTurn?.meta.route;
			const readyLabel = 'full' === route
				? __( 'Generated — ready to apply', 'otter-blocks' )
				: __( 'Updated — ready to apply', 'otter-blocks' );

			return {
				kind: 'ready',
				label: readyLabel
			};
		}
		if ( hasSelection ) {
			return {
				kind: 'idle',
				label: sprintf(
					// translators: %d: total number of blocks (including nested) in scope.
					_n( '%d block in scope', '%d blocks in scope', selectionScope.total, 'otter-blocks' ),
					selectionScope.total
				)
			};
		}
		return { kind: 'idle', label: __( 'Describe a section', 'otter-blocks' ) };
	} )();

	let applyLabel = __( 'Apply', 'otter-blocks' );
	if ( onApplyBlocks ) {
		applyLabel = 'page' === scope ? __( 'Insert page', 'otter-blocks' ) : __( 'Insert section', 'otter-blocks' );
	} else if ( hasSelection && ! isCreateMode && 0 < selectionScope.nestedCount ) {
		// Reinforce that Apply replaces the whole selected container, not just the
		// block the user clicked into.
		applyLabel = sprintf(
			// translators: %s: selected block title (e.g. "Group", "selection").
			__( 'Apply to %s', 'otter-blocks' ),
			selectionScope.rootTitle
		);
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

	// When editing a real selection, the header carries the scope context instead
	// of a standalone notice: the title reads "Otter AI · Editing the selected X
	// (N blocks)" and the subtitle explains what edits do. Otherwise it stays the
	// plain create branding.
	const isEditingSelection = hasSelection && ! isCreateMode && 0 < selectionScope.nestedCount;

	const brandTitle = isEditingSelection
		? sprintf(
			// translators: %1$s: product name "Otter AI"; %2$s: selected block title (e.g. "Group"); %3$d: total block count.
			_n(
				'%1$s · Editing the selected %2$s (%3$d block)',
				'%1$s · Editing the selected %2$s (%3$d blocks)',
				selectionScope.total,
				'otter-blocks'
			),
			__( 'Otter AI', 'otter-blocks' ),
			selectionScope.rootTitle,
			selectionScope.total
		)
		: modalTitle;

	const brandSubtitle = isEditingSelection
		? __( 'Text & styling edits keep the layout; only a redesign changes the structure.', 'otter-blocks' )
		: __( 'Builds with your blocks & theme styles', 'otter-blocks' );

	return (
		<Modal
			title={ modalTitle }
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
						<span className="o-ai-section__brand-title" title={ brandTitle }>{ brandTitle }</span>
						<span className="o-ai-section__brand-subtitle" title={ brandSubtitle }>{ brandSubtitle }</span>
					</div>
					{ /* While generating, the centered overlay pill owns the progress
					     status — so the header chip would just echo it. Keep the chip
					     for the resting states only. */ }
					{ ! isGenerating && (
						<span className={ `o-ai-section__status is-${ sectionStatus.kind }` }>
							<span className="o-ai-section__status-dot" aria-hidden="true" />
							{ sectionStatus.label }
						</span>
					) }
					<Button
						icon={ close }
						label={ __( 'Close', 'otter-blocks' ) }
						className="o-ai-section__close"
						disabled={ isGenerating }
						onClick={ handleClose }
					/>
				</div>

				<div className="o-ai-section__canvas">
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

					{ showPreview ? (
						<div className={ `o-ai-section__frame${ isGenerating ? ' is-live' : '' }${ 'page' === scope ? ' is-page' : '' }` }>
							<LivePreview
								blocks={ previewBlocks }
								previewKey={ previewKey }
								css={ displayAtomicCss ? [ displayAtomicCss ] : [] }
								viewportWidth={ previewWidth }
								className="o-ai-section__live"
								normalizeViewport
								placeholder={ sectionSkeleton }
							/>

							{ /* Translucent shimmer over the current preview while the
							     update is in flight — the existing layout stays visible
							     underneath so the change reads as an in-place edit. */ }
							{ isGenerating && (
								<div className="o-ai-section__updating" role="status" aria-live="polite">
									<span className="o-ai-section__updating-label">{ loadingLabel }</span>
								</div>
							) }
						</div>
					) : ( isGenerating ? (
						<div className="o-ai-section__loading">
							<div className={ `o-ai-section__frame is-live${ 'page' === scope ? ' is-page' : '' }` }>
								{ sectionSkeleton }

								{ /* Same centered "updating" pill as the in-place edit
								     overlay, so the very first build matches every
								     later step instead of dropping the label below. */ }
								<div className="o-ai-section__updating" role="status" aria-live="polite">
									<span className="o-ai-section__updating-label">{ loadingLabel }</span>
								</div>
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
					<div className={ `o-ai-section__refine-field${ isGenerating ? ' is-busy' : '' }` }>
						<span className="o-ai-section__refine-icon" aria-hidden="true">
							{ isGenerating ? <Spinner /> : <Icon icon={ aiGeneration } /> }
						</span>
						<TextareaControl
							key={ `o-ai-input-${ turns.length }-${ activeTurnIndex }` }
							className="o-ai-section__refine-input"
							label={ __( 'Prompt', 'otter-blocks' ) }
							hideLabelFromVision
							placeholder={ inputPlaceholder }
							value={ isGenerating ? runningPrompt : instruction }
							rows={ 2 }
							disabled={ isGenerating }
							readOnly={ isGenerating }
							onChange={ ( value ) => setInstruction( value ) }
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
							disabled={ ! hasRealTurns || isGenerating || isViewingOriginal }
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
