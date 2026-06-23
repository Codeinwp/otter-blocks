/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { buildBlockContextMessage } from '../apply-content';
import { generateBlocksFromTask } from '../block-generation';
import type { GenerateTurnArgs } from './types';

const buildGenerateTask = ( args: GenerateTurnArgs ): string => {
	let task = args.activePrompt;

	if ( args.isCreateMode && 'page' === args.scope ) {
		task = sprintf(
			// translators: %s: the user's prompt describing the page.
			__( 'Create a complete landing page composed of multiple coherent sections for: %s', 'otter-blocks' ),
			args.activePrompt
		);
	} else if ( args.isCreateMode ) {
		task = sprintf(
			// translators: %s: the user's prompt describing the section.
			__( 'Create a single, self-contained section for: %s', 'otter-blocks' ),
			args.activePrompt
		);
	}

	const referenceContext = buildBlockContextMessage( args.referenceBlocks, args.getBlockType );

	if ( referenceContext ) {
		task = `${ task }\n\nReference — current block markup and schema:\n${ referenceContext }`;
	}

	return task;
};

/**
 * Serial generate workflow: outline → search → construct → validate.
 */
export const runGenerateTurn = async( args: GenerateTurnArgs ) => {
	args.onPhase?.( 'planning' );

	return generateBlocksFromTask({
		task: buildGenerateTask( args ),
		blockTypes: args.blockTypes,
		themeColors: args.themeColors,
		patterns: args.isCreateMode ? args.patterns : undefined,
		history: args.sessionHistory,
		requestCompletion: args.requestCompletion,
		onPhase: ( phase ) => args.onPhase?.( phase ),
		onPlanReady: args.onPlanReady,
		onRootComplete: args.onRootComplete
	});
};
