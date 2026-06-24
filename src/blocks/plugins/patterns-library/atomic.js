/**
 * WordPress dependencies.
 */
import {
	useEffect,
	useState
} from '@wordpress/element';

// Atomic Wind blocks are styled by Tailwind classes, and their CSS is
// JIT-generated against the editor canvas — preview iframes never get it
// reliably (they clone a one-time snapshot of the canvas stylesheet, which
// is stale or empty if the generator hasn't run, and never covers classes
// that only exist in pattern markup). Generate the CSS for the pattern's
// own markup instead, through the API the Tailwind generator script exposes,
// and pass it into the preview alongside its content.

// Generated CSS per pattern, cached for the session.
const cache = new Map();

// vh units break inside BlockPreview: the iframe's height is continuously
// fitted to its content, so a viewport-height section measures against
// itself and inflates the preview (100vh never converges at all). Resolve
// vh lengths against a fixed virtual viewport height instead, overridable
// per preview through --parent-vh. Selectors are safe from the regex: in
// arbitrary-value class names ( .min-h-\[90vh\] ) the unit is always
// followed by an escaped bracket, dash or underscore, which the lookahead
// rejects — in declaration values it ends the token.
const VH_LENGTH = /(\d*\.?\d+)(?:[sdl])?vh(?![\w\\[-])/g;

const rewritePreviewVh = ( css ) =>
	css.replace( VH_LENGTH, ( match, amount ) => `calc(var(--parent-vh, 850px) * ${ amount } / 100)` );

// Pull every class token out of serialized pattern markup. Tailwind ignores
// tokens that aren't utilities, so over-collecting (block classes, layout
// classes) is harmless.
const extractClasses = ( content ) => {
	const classes = new Set();

	for ( const [ , value ] of content.matchAll( /\bclass="([^"]*)"/g ) ) {
		value.split( /\s+/ ).forEach( token => token && classes.add( token ) );
	}

	return Array.from( classes );
};

// Returns { css, isReady } for a pattern. isReady is immediately true for
// patterns without Atomic Wind blocks (and when the generator script isn't
// loaded, e.g. the blocks are disabled — they'd preview as missing anyway);
// for the rest it flips once the Tailwind CSS has been generated, so callers
// can hold the skeleton until the preview can paint fully styled.
export const useAtomicCss = ( pattern ) => {
	const needsAtomic = pattern.content.includes( 'atomic-wind/' ) &&
		Boolean( window.atomicWindGenerateCss );

	const [ css, setCss ] = useState( () => cache.get( pattern.name ) );

	useEffect( () => {
		const cached = cache.get( pattern.name );
		setCss( cached );

		if ( ! needsAtomic || undefined !== cached ) {
			return;
		}

		let cancelled = false;

		window.atomicWindGenerateCss( extractClasses( pattern.content ) )
			.then( ( generated ) => {
				const rewritten = rewritePreviewVh( generated );
				cache.set( pattern.name, rewritten );

				if ( ! cancelled ) {
					setCss( rewritten );
				}
			})

			// Don't cache failures: show the preview unstyled rather than
			// skeleton forever, but let a remount retry.
			.catch( () => {
				if ( ! cancelled ) {
					setCss( '' );
				}
			});

		return () => {
			cancelled = true;
		};
	}, [ pattern.name, needsAtomic ]);

	return {
		css: css || '',
		isReady: ! needsAtomic || undefined !== css
	};
};
