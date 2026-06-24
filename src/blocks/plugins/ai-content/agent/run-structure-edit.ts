import { structureEditBlocks } from '../block-generation';
import type { EditTurnArgs } from './types';

/**
 * Serial structure workflow: remove, insert, or move blocks without full regen.
 */
export const runStructureEditTurn = async( args: EditTurnArgs ) => {
	return structureEditBlocks({
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
