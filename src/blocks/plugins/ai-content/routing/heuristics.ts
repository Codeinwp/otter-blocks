import type { ClassifyGenerationIntentArgs, GenerationRoute } from './types';

/**
 * Language-agnostic routing fallback when the tool-calling model is unavailable.
 * Prefer the AI tool-call path for all natural-language instructions.
 */
export const classifyGenerationIntent = ({
	hasReferenceBlocks,
	isCreateMode,
	isExplicitRefine
}: ClassifyGenerationIntentArgs ): GenerationRoute => {
	if ( ! hasReferenceBlocks ) {
		return 'full';
	}

	if ( isCreateMode && ! isExplicitRefine ) {
		return 'full';
	}

	if ( isExplicitRefine ) {
		return 'patch';
	}

	return 'patch';
};
