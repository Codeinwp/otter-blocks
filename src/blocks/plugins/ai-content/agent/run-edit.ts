import { refineGeneratedBlocks } from '../block-generation';
import type { EditTurnArgs } from './types';

/**
 * Serial edit workflow: one patch pass against the reference tree.
 */
export const runEditTurn = async( args: EditTurnArgs ) => {
	return refineGeneratedBlocks({
		task: args.activePrompt || args.instruction,
		instruction: args.instruction,
		baseBlocks: args.baseBlocks,
		blockTypes: args.blockTypes,
		themeColors: args.themeColors,
		referenceContext: args.referenceContext,
		history: args.sessionHistory,
		requestCompletion: args.requestCompletion,
		onPhase: ( phase ) => args.onPhase?.( phase )
	});
};
