import { formatSessionHistoryForPrompt } from '../session-history';
import { PIPELINE_STEP } from './phases';
import type { ResolveGenerationRouteArgs } from '../routing/types';

/**
 * User prompt for the routing step (edit vs generate).
 */
export const buildRoutePrompt = ( args: ResolveGenerationRouteArgs ): string => {
	const historyBlock = formatSessionHistoryForPrompt( args.sessionHistory );
	const contextLines = [
		`hasReferenceBlocks: ${ args.hasReferenceBlocks ? 'true' : 'false' }`,
		`isCreateMode: ${ args.isCreateMode ? 'true' : 'false' }`,
		`isFollowUpRefine: ${ args.isExplicitRefine ? 'true' : 'false' }`,
		`transformEditPreferred: ${ args.preferEdit ? 'true' : 'false' }`
	];

	if ( args.taskContext && args.taskContext !== args.instruction ) {
		contextLines.push( `taskContext: ${ args.taskContext }` );
	}

	return [
		PIPELINE_STEP.ROUTE,
		'',
		'Return strict JSON: { "mode": "edit" | "generate", "reason": "short explanation" }',
		'',
		'Choose "edit" when the user wants small, local changes (text, tone, translate, colors, attributes) on existing blocks.',
		'Choose "generate" when they need new layout/structure (new sections, redesign, add/remove blocks, first build, major restructuring).',
		'When transformEditPreferred is true, choose "edit" unless the user explicitly asks for a new layout or redesign.',
		'When unsure on an existing selection, prefer "edit" if the structure can stay the same.',
		'',
		'Context:',
		...contextLines,
		...historyBlock,
		'',
		`User instruction: ${ args.instruction }`
	].join( '\n' );
};
