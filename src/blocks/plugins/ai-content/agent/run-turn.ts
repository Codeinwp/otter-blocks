/**
 * One user turn, reduced to a few predictable paths:
 *
 *   GENERATE   — no selection (or create / forced generate). Builds new blocks via
 *                the catalog pipeline (plan → construct → quality).
 *   TEXT edit  — request only changes wording. Sends just the text fragments and
 *                splices them back; layout and styles never change.
 *   STYLE edit — request only changes the look. Sends just each block's style
 *                attributes and splices them back; markup/text/structure never
 *                change. Falls back to a full rewrite when a block has no style attrs.
 *   BLOCK edit — request rebuilds the selection ('redesign'). Full-markup rewrite
 *                through the same validate/repair/quality machinery as generation.
 *
 * A single cheap DECIDE_EDIT step classifies the selection; no tool-calling,
 * routing, or search/replan layer.
 */
import { decideEditKind } from './decide-edit';
import { runGenerateTurn } from './run-generate';
import { runBlockRewriteTurn } from './run-rewrite';
import { runStyleEditTurn } from './run-style-edit';
import { runTextEditTurn } from './run-text-edit';
import type { RouteDecision, RunTurnArgs, RunTurnResult } from './types';

/**
 * Run one user turn. Picks GENERATE for net-new content, or classifies a
 * selection edit into a text splice or a block rewrite.
 * @param args
 */
export const runAgentTurn = async( args: RunTurnArgs ): Promise<RunTurnResult> => {
	const hasSelection = Boolean( args.referenceBlocks?.length );

	// GENERATE — net-new content: no reference blocks, or an explicit generate
	// request. We do NOT force-generate every create-mode turn: a follow-up in the
	// same modal carries the generated result as reference blocks and must fall
	// through to the edit classifier, not silently rebuild from the original prompt.
	if ( ! hasSelection || 'generate' === args.forceRoute ) {
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

	if ( 'text' === kind ) {
		const textResult = await runTextEditTurn( args );

		// No editable text — fall back to a full rewrite.
		if ( textResult.generation.blocks.length ) {
			return textResult;
		}

		return runBlockRewriteTurn( args, 'redesign' );
	}

	if ( 'style' === kind ) {
		const styleResult = await runStyleEditTurn( args );

		// No className to restyle — fall back to the full-markup style rewrite (copy preserved).
		if ( styleResult.generation.blocks.length ) {
			return styleResult;
		}

		return runBlockRewriteTurn( args, 'style' );
	}

	return runBlockRewriteTurn( args, 'redesign' );
};

/**
 * Tracking feature value for analytics. Routes after the collapse are: full
 * (generate), text, style, and rewrite (redesign).
 * @param decision
 * @param refineInstruction
 * @param hasGeneratedResult
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
