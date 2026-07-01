/**
 * One-line headers prepended to user prompts so each model call knows its role
 * in the serial pipeline. Two flows: GENERATE (plan → construct) and
 * EDIT (decide → text | rewrite).
 */
export const PIPELINE_STEP = {
	// GENERATE
	PLAN: 'Pipeline step: OUTLINE (catalog) — plan block slugs and nesting only; attributes are filled in a later CONSTRUCT step.',
	CONSTRUCT: 'Pipeline step: CONSTRUCT — fill attributes and copy for this section; keep slugs and nesting exactly as given.',

	// GENERATE — full page. The page is planned as lightweight section briefs first
	// (no blocks), then each section's structure is outlined on its own call, so no
	// single request has to serialize the entire page tree at once.
	PAGE_OUTLINE: 'Pipeline step: PAGE_OUTLINE — plan the page: mission, a shared design direction, and an ordered list of section briefs (title + intent). Do NOT choose blocks or nesting yet.',
	SECTION_OUTLINE: 'Pipeline step: SECTION_OUTLINE — given one section brief, choose block slugs and nesting for that single section only; attributes are filled in a later CONSTRUCT step.',

	// EDIT
	DECIDE_EDIT: 'Pipeline step: DECIDE_EDIT — classify whether the request changes the text, the styling/layout, or needs a full redesign. Return only the classification.',
	TEXT_EDIT: 'Pipeline step: TEXT_EDIT — you are given an ordered list of text fragments from one block selection; apply the requested change to each and return the same number of fragments in the same order. Do not touch layout or styles.',
	STYLE_EDIT: 'Pipeline step: STYLE_EDIT — you are given an ordered list of elements with their current CSS classNames from one block selection; apply the requested styling change to each and return the same number of classNames in the same order. Do not touch the text or the block structure.',
	REWRITE: 'Pipeline step: REWRITE — you are given the complete current block markup; return the complete updated block markup with the requested change applied.'
} as const;
