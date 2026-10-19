/**
 * Collect class names not compiled yet.
 *
 * @param {Iterable<Element>} elements Elements carrying a class attribute.
 * @param {Set<string>}       seen     Class names already compiled; updated in place.
 * @param {string[]}          [extra]  Candidates compiled even when absent from the elements.
 * @return {Set<string>} Class names new to `seen`.
 */
export function collectNewCandidates( elements, seen, extra = [] ) {
	const fresh = new Set();
	const add = ( name ) => {
		if ( ! seen.has( name ) ) {
			seen.add( name );
			fresh.add( name );
		}
	};

	for ( const el of elements ) {
		el.classList.forEach( add );
	}

	extra.forEach( add );

	return fresh;
}
