/**
 * Internal dependencies.
 */
import { buildBlockContextMessage } from '../apply-content';
import { resolveGenerationRoute } from '../routing';
import { runEditTurn } from './run-edit';
import { runGenerateTurn } from './run-generate';
import type { RunTurnArgs, RunTurnResult } from './types';

/**
 * Run one user turn serially: route → edit OR generate → result.
 */
export const runAgentTurn = async( args: RunTurnArgs ): Promise<RunTurnResult> => {
	const decision = await resolveGenerationRoute({
		instruction: args.instruction,
		taskContext: args.activePrompt,
		hasReferenceBlocks: 0 < args.referenceBlocks.length,
		isCreateMode: args.isCreateMode,
		isExplicitRefine: Boolean( args.refineInstruction ),
		sessionHistory: args.sessionHistory,
		requestCompletion: args.requestCompletion,
		forceRoute: args.forceRoute,
		preferEdit: args.preferEdit
	});

	if ( 'patch' === decision.route && args.referenceBlocks.length ) {
		args.onPhase?.( 'refining' );

		const generation = await runEditTurn({
			instruction: args.instruction,
			activePrompt: args.activePrompt,
			baseBlocks: args.referenceBlocks,
			sessionHistory: args.sessionHistory,
			blockTypes: args.blockTypes,
			themeColors: args.themeColors,
			getBlockType: args.getBlockType,
			referenceContext: buildBlockContextMessage( args.referenceBlocks, args.getBlockType ),
			requestCompletion: args.requestCompletion,
			onPhase: args.onPhase
		});

		return { generation, decision };
	}

	const generation = await runGenerateTurn({
		activePrompt: args.activePrompt,
		referenceBlocks: args.referenceBlocks,
		sessionHistory: args.sessionHistory,
		blockTypes: args.blockTypes,
		themeColors: args.themeColors,
		patterns: args.patterns,
		isCreateMode: args.isCreateMode,
		scope: args.scope,
		getBlockType: args.getBlockType,
		requestCompletion: args.requestCompletion,
		onPhase: args.onPhase,
		onPlanReady: args.onPlanReady,
		onRootComplete: args.onRootComplete
	});

	return { generation, decision };
};

export const getTrackingFeatureValue = (
	decision: RunTurnResult['decision'],
	refineInstruction?: string,
	hasGeneratedResult?: boolean
): string => {
	if ( 'patch' === decision.route ) {
		const action = refineInstruction || hasGeneratedResult ? 'refine' : 'edit';
		return `${ action }:${ decision.route }:${ decision.source }`;
	}

	return `create:${ decision.route }:${ decision.source }`;
};
