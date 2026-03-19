import './style.css';

const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

function initCountUp( el, delay ) {
	const raw = el.textContent;
	const match = raw.match( /^([^\d-]*)([-]?[\d,]+\.?\d*)(.*)$/ );

	if ( ! match ) {
		return;
	}

	const prefix = match[ 1 ];
	const numberStr = match[ 2 ].replace( /,/g, '' );
	const suffix = match[ 3 ];
	const target = parseFloat( numberStr );

	if ( isNaN( target ) ) {
		return;
	}

	const hasCommas = match[ 2 ].includes( ',' );
	const decimals = numberStr.includes( '.' )
		? numberStr.split( '.' )[ 1 ].length
		: 0;

	if ( prefersReducedMotion ) {
		return;
	}

	const duration = 1500;
	const delayMs = delay && delay !== '0' ? parseInt( delay, 10 ) : 0;

	function formatNumber( n ) {
		const fixed = n.toFixed( decimals );
		if ( ! hasCommas ) {
			return fixed;
		}
		const parts = fixed.split( '.' );
		parts[ 0 ] = parts[ 0 ].replace( /\B(?=(\d{3})+(?!\d))/g, ',' );
		return parts.join( '.' );
	}

	function easeOutQuart( t ) {
		return 1 - Math.pow( 1 - t, 4 );
	}

	setTimeout( () => {
		const start = performance.now();

		function step( now ) {
			const elapsed = now - start;
			const progress = Math.min( elapsed / duration, 1 );
			const value = target * easeOutQuart( progress );

			el.textContent = prefix + formatNumber( value ) + suffix;

			if ( progress < 1 ) {
				requestAnimationFrame( step );
			}
		}

		requestAnimationFrame( step );
	}, delayMs );
}

document.addEventListener( 'DOMContentLoaded', () => {
	const elements = document.querySelectorAll( '[data-animation]' );

	if ( ! elements.length ) {
		return;
	}

	elements.forEach( ( el ) => {
		el.classList.add( 'aw-animate-hidden' );

		const delay = el.dataset.animationDelay;
		if ( delay && delay !== '0' ) {
			el.classList.add( `aw-delay-${ delay }` );
		}
	} );

	const observer = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( ! entry.isIntersecting ) {
					return;
				}

				const el = entry.target;
				const type = el.dataset.animation;

				el.classList.remove( 'aw-animate-hidden' );

				if ( type === 'count-up' ) {
					el.classList.add( 'aw-animate-count-up' );
					initCountUp( el, el.dataset.animationDelay );
				} else {
					el.classList.add( `aw-animate-${ type }` );
				}

				observer.unobserve( el );
			} );
		},
		{ threshold: 0.35 }
	);

	elements.forEach( ( el ) => observer.observe( el ) );
} );
