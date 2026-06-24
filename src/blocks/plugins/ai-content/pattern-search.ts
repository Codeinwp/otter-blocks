/**
 * Local pattern library search for zero-selection generation — find a starting
 * layout from registered patterns before adapting copy and styles.
 *
 * Uses the same Fuse.js index as the Design Library (`patterns-library/smart.js`)
 * for typo-tolerant, relevance-ranked matches.
 */

import {
	createSearchIndex,
	fuzzyMatches
} from '../patterns-library/smart.js';

import type { PatternCatalogEntry, PatternLike } from './block-generation';
import { buildPatternCatalog } from './block-generation';

export const PATTERN_SEARCH_RESULT_LIMIT = 6;

export const PATTERN_PROMPT_PREVIEW_LIMIT = 20;

export type SearchPatternsArgs = {
	query?: string;
	category?: string;
};

const QUERY_STOPWORDS = new Set([
	'a', 'an', 'the', 'with', 'and', 'or', 'on', 'in', 'of', 'for', 'to', 'that'
]);

const queryTerms = ( query: string ): string[] =>
	query
		.toLowerCase()
		.split( /\s+/ )
		.map( ( word ) => word.replace( /[^\w-]/g, '' ) )
		.filter( ( word ) => 2 <= word.length && ! QUERY_STOPWORDS.has( word ) );

const buildCategoryLabels = ( patterns: PatternLike[] ): Record<string, string> => {
	const labels: Record<string, string> = {};

	patterns.forEach( ( pattern ) => {
		( pattern.categories || [] ).forEach( ( category ) => {
			if ( ! labels[ category ] ) {
				labels[ category ] = category.replace( /-/g, ' ' );
			}
		});
	});

	return labels;
};

const filterByCategory = ( patterns: PatternLike[], category: string ): PatternLike[] => {
	const normalized = category.toLowerCase().trim();

	return patterns.filter( ( pattern ) =>
		( pattern.categories || [] ).some( ( value ) => value.toLowerCase().includes( normalized ) )
	);
};

const rankPatternsByQuery = (
	patterns: PatternLike[],
	query: string
): PatternLike[] => {
	const terms = queryTerms( query );

	if ( ! terms.length ) {
		return patterns;
	}

	const index = createSearchIndex( patterns, buildCategoryLabels( patterns ) );
	const scores = fuzzyMatches( index, terms );

	if ( ! scores?.size ) {
		return [];
	}

	return [ ...scores.entries() ]
		.sort( ( a, b ) => a[ 1 ] - b[ 1 ] )
		.map( ( [ name ] ) => patterns.find( ( pattern ) => pattern.name === name ) )
		.filter( ( pattern ): pattern is PatternLike => !! pattern );
};

/**
 * Search offerable patterns by title, description, name, or category.
 */
export const searchPatternCatalog = (
	patterns: PatternLike[],
	args: SearchPatternsArgs = {}
): PatternCatalogEntry[] => {
	const catalog = buildPatternCatalog( patterns );
	const catalogByName = new Map( catalog.map( ( entry ) => [ entry.name, entry ] ) );
	const offerableNames = new Set( catalog.map( ( entry ) => entry.name ) );

	let candidates = patterns.filter( ( pattern ) => offerableNames.has( pattern.name ) );

	if ( args.category?.trim() ) {
		candidates = filterByCategory( candidates, args.category );
	}

	let rankedNames: string[];

	if ( args.query?.trim() ) {
		candidates = rankPatternsByQuery( candidates, args.query );
		rankedNames = candidates.map( ( pattern ) => pattern.name );
	} else {
		rankedNames = candidates.map( ( pattern ) => pattern.name );
	}

	return rankedNames
		.map( ( name ) => catalogByName.get( name ) )
		.filter( ( entry ): entry is PatternCatalogEntry => !! entry )
		.slice( 0, PATTERN_SEARCH_RESULT_LIMIT );
};

export const formatPatternCatalogEntry = ( entry: PatternCatalogEntry ): string => {
	const categories = entry.categories.length ? ` [${ entry.categories.join( ', ' ) }]` : '';
	return `${ entry.name }: ${ entry.title } — ${ entry.description }${ categories }`;
};

/**
 * Format pattern search hits for tool output or prompt context.
 */
export const formatPatternSearchResults = ( results: PatternCatalogEntry[] ): string => {
	if ( ! results.length ) {
		return 'No matching patterns in the library.';
	}

	return [
		'Matching patterns (use exact `name` with adapt_pattern):',
		...results.map( formatPatternCatalogEntry )
	].join( '\n' );
};

/**
 * Compact pattern preview for the tool-call prompt when starting from zero.
 */
export const formatPatternLibraryPreview = (
	patterns: PatternLike[],
	limit = PATTERN_PROMPT_PREVIEW_LIMIT
): string => {
	const catalog = buildPatternCatalog( patterns ).slice( 0, limit );

	if ( ! catalog.length ) {
		return '';
	}

	return [
		`Pattern library preview (${ catalog.length } of ${ buildPatternCatalog( patterns ).length } — use search_patterns to filter):`,
		...catalog.map( formatPatternCatalogEntry )
	].join( '\n' );
};
