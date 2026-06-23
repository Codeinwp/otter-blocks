import type { ClassifyGenerationIntentArgs, GenerationRoute } from './types';

const FULL_INTENT_PATTERNS: RegExp[] = [
	/\b(redesign|re-?design)\b/i,
	/\bnew\s+(design|layout|section|hero|page|landing)\b/i,
	/\b(from|start)\s+scratch\b/i,
	/\bstart\s+over\b/i,
	/\b(completely|entirely|totally)\s+different\b/i,
	/\bbrand[\s-]new\b/i,
	/\bbuild\s+(a|an)\s+(new|fresh|different)\b/i,
	/\bcreate\s+(a|an)\s+(new|complete|full|fresh)\b/i,
	/\b(generate|design)\s+(a|an)\s+(new|fresh|complete)\b/i,
	/\breplace\s+(this|the)\s+(section|layout|block|design|content)\b/i,
	/\brebuild\b/i,
	/\bre-?imagine\b/i,
	/\badd\s+(?:a|another|new)\s+(?:\w+\s+){0,3}(sections?|blocks?|columns?|rows?|buttons?|images?|cards?)\b/i,
	/\b(remove|delete)\s+(the|this|a|an)\b/i,
	/\bre-?arrange\b/i,
	/\breorder\b/i,
	/\bmove\s+the\b/i,
	/\bswap\s+(the\s+)?(layout|columns|order)\b/i,
	/\bturn\s+this\s+into\s+(a|an)\s+/i,
	/\bmake\s+this\s+(a|an)\s+(hero|pricing|features|testimonial|cta|footer|header)\b/i
];

const PATCH_INTENT_PATTERNS: RegExp[] = [
	/\b(translate|shorten|expand|summarize|rewrite|rephrase|proofread|grammar|spelling|typo|simplify)\b/i,
	/\b(headline|subheading|subheadline|title|subtitle|tagline|button\s+text|cta\s+text|copy|caption)\b/i,
	/\b(color|colour|font|size|padding|margin|spacing|align(ment)?|bold|italic|underline|tone)\b/i,
	/\b(background|border|radius|shadow|opacity|weight)\b/i,
	/\bmake\s+(it|the)\s+(shorter|longer|darker|lighter|bigger|smaller|bolder)\b/i,
	/\b(change|update|edit|fix|adjust|tweak)\s+(the\s+)?(text|copy|color|colour|font|style|heading|wording|label)\b/i,
	/\bmore\s+(professional|casual|friendly|formal|playful|concise)\b/i,
	/\b(in|into)\s+(english|spanish|french|german|italian|portuguese|romanian)\b/i
];

const matchesAny = ( text: string, patterns: RegExp[] ): boolean => {
	return patterns.some( ( pattern ) => pattern.test( text ) );
};

/**
 * Regex fallback when the routing model is unavailable. Not i18n-safe — prefer
 * {@link resolveGenerationRoute} when an API key is present.
 */
export const classifyGenerationIntent = ({
	instruction,
	taskContext = '',
	hasReferenceBlocks,
	isCreateMode,
	isExplicitRefine
}: ClassifyGenerationIntentArgs ): GenerationRoute => {
	const text = `${ taskContext }\n${ instruction }`.trim();

	if ( ! hasReferenceBlocks ) {
		return 'full';
	}

	if ( matchesAny( text, FULL_INTENT_PATTERNS ) ) {
		return 'full';
	}

	if ( isCreateMode && ! isExplicitRefine ) {
		return 'full';
	}

	if ( matchesAny( instruction, PATCH_INTENT_PATTERNS ) ) {
		return 'patch';
	}

	if ( isExplicitRefine ) {
		return 'patch';
	}

	return 'patch';
};
