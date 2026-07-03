/**
 * Keeps a small sliding window of session turns so prompts stay focused without
 * blowing the model context on long refine chains.
 */

export const SESSION_HISTORY_LIMIT = 3;

/**
 * Keep only the most recent entries (oldest dropped first).
 *
 * @param entries History entries in chronological order.
 * @param limit   Maximum entries to retain.
 */
export const trimSessionHistory = <T>( entries: T[], limit = SESSION_HISTORY_LIMIT ): T[] => {
	if ( entries.length <= limit ) {
		return entries;
	}

	return entries.slice( -limit );
};

/**
 * Build prompt strings for the model from modal version history.
 *
 * @param items Version items that store the user prompt in meta.
 * @param limit How many prior turns to include.
 */
export const extractPromptHistory = (
	items: { meta: { prompt: string } }[],
	limit = SESSION_HISTORY_LIMIT
): string[] => {
	return trimSessionHistory(
		items.map( ( item ) => item.meta.prompt ).filter( Boolean ),
		limit
	);
};

/**
 * Format trimmed session history for inclusion in generation/refine prompts.
 *
 * @param prompts User prompts, oldest first within the window.
 */
export const formatSessionHistoryForPrompt = ( prompts?: string[] ): string[] => {
	const history = trimSessionHistory( ( prompts || [] ).filter( Boolean ) );

	if ( ! history.length ) {
		return [];
	}

	return [
		[
			'Conversation so far — the user\'s earlier requests in this session (last few only), oldest first. Use them to stay consistent and resolve follow-up references:',
			history.map( ( entry, index ) => `${ index + 1 }. ${ entry }` ).join( '\n' )
		].join( '\n' )
	];
};
