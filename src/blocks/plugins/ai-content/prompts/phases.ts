/**
 * One-line headers prepended to user prompts so each model call knows its role
 * in the serial pipeline.
 */
export const PIPELINE_STEP = {
	ROUTE: 'Pipeline step: ROUTE — decide whether this request needs a fast EDIT (patch existing blocks) or full GENERATE (layout pipeline).',
	PLAN: 'Pipeline step: OUTLINE (catalog) — plan block slugs and nesting only; attributes are filled in a later CONSTRUCT step.',
	BRIEF: 'Pipeline step: OUTLINE — plan conceptual sections and shared design direction only; no block slugs or content yet.',
	PATTERN_SEARCH: 'Pipeline step: SEARCH — choose at most one pattern per section from the library catalog; use exact pattern names only.',
	STRUCTURE_GAPS: 'Pipeline step: STRUCTURE GAPS — outline block slugs and nesting for sections without a pattern; no attributes yet.',
	CONSTRUCT: 'Pipeline step: CONSTRUCT — fill attributes and copy for this section; keep slugs and nesting exactly as given.',
	PATTERN_REWRITE: 'Pipeline step: CONSTRUCT (pattern) — rewrite text in place; preserve structure and non-text attributes.',
	EDIT: 'Pipeline step: EDIT — return minimal attribute patches only; do not rebuild or restructure the tree.',
	POLISH: 'Pipeline step: POLISH — patch only the listed quality issues; change nothing else.'
} as const;
