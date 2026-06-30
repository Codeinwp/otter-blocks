/**
 * One user turn, reduced to three predictable paths:
 *
 *   GENERATE   — no selection (or create / forced generate). Builds new blocks
 *                with the catalog pipeline (plan → construct → quality). This is
 *                the proven path.
 *   TEXT edit  — a selection whose request only changes wording. We send just
 *                the text fragments and splice them back; layout and styles are
 *                never sent and cannot change. No "huge chunks".
 *   BLOCK edit — a selection whose request changes styling/layout ('style') or
 *                rebuilds it ('redesign'). Full-markup rewrite, rebuilt through
 *                the same validate/repair/quality machinery as generation.
 *
 * A single cheap DECIDE_EDIT step classifies a selection into text/style/
 * redesign. There is no tool-calling layer, no routing layer, and no search/
 * replan loop — the path is decided directly from the request and whether a
 * selection exists.
 */
import { decideEditKind } from './decide-edit';
import { runGenerateTurn } from './run-generate';
import { runBlockRewriteTurn } from './run-rewrite';
import { runTextEditTurn } from './run-text-edit';
import { aiDebug } from '../debug';
import type { RouteDecision, RunTurnArgs, RunTurnResult } from './types';

/**
 * Run one user turn. Picks GENERATE for net-new content, or classifies a
 * selection edit into a text splice or a block rewrite.
 */
export const runAgentTurn = async( args: RunTurnArgs ): Promise<RunTurnResult> => {
	const hasSelection = Boolean( args.referenceBlocks?.length );

	// GENERATE — net-new content, create mode, or an explicit generate request.
	if ( ! hasSelection || args.isCreateMode || 'generate' === args.forceRoute ) {
		aiDebug( 'route: generate', { hasSelection, isCreateMode: args.isCreateMode, forceRoute: args.forceRoute } );

		const generation = await runGenerateTurn({
			activePrompt: args.activePrompt,
			referenceBlocks: args.referenceBlocks,
			sessionHistory: args.sessionHistory,
			blockTypes: args.blockTypes,
			themeColors: args.themeColors,
			patterns: args.patterns,
			pageStyleDigest: args.pageStyleDigest,
			isCreateMode: args.isCreateMode,
			scope: args.scope,
			getBlockType: args.getBlockType,
			requestCompletion: args.requestCompletion,
			onPhase: args.onPhase,
			onPlanReady: args.onPlanReady,
			onRootComplete: args.onRootComplete
		});

		return {
			generation,
			decision: { mode: 'generate', route: 'full', source: 'model' },
			toolCall: { tool: 'generate', reason: '' }
		};
	}

	// Selection edit — classify what actually changes, then route.
	const { kind } = await decideEditKind( {
		instruction: args.instruction,
		taskContext: args.activePrompt,
		requestCompletion: args.requestCompletion
	} );

	aiDebug( `route: edit → ${ kind }`, { instruction: args.instruction } );

	if ( 'text' === kind ) {
		const textResult = await runTextEditTurn( args );

		// Selection had no editable text — fall back to a full rewrite so the
		// request still does something useful.
		if ( textResult.generation.blocks.length ) {
			return textResult;
		}

		aiDebug( 'route: text produced nothing → falling back to redesign rewrite' );
		return runBlockRewriteTurn( args, 'redesign' );
	}

	return runBlockRewriteTurn( args, 'style' === kind ? 'style' : 'redesign' );
};

/**
 * Tracking feature value for analytics. Routes after the collapse are: full
 * (generate), text, style, and rewrite (redesign).
 */
export const getTrackingFeatureValue = (
	decision: RouteDecision,
	refineInstruction?: string,
	hasGeneratedResult?: boolean
): string => {
	const prefix = 'model' === decision.source ? 'tool' : 'tool-fallback';

	if ( 'text' === decision.route ) {
		return `${ prefix }:text`;
	}

	if ( 'style' === decision.route ) {
		return `${ prefix }:style`;
	}

	if ( 'rewrite' === decision.route ) {
		const action = refineInstruction || hasGeneratedResult ? 'refine' : 'edit';
		return `${ prefix }:${ action }:rewrite`;
	}

	return `${ prefix }:generate`;
};
