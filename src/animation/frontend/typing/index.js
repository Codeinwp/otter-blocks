/**
 * Internal dependencies
 */
import {
	domReady,
	makeInterval
} from '../../utils.js';

const MAX_PARENT_SEARCH = 3;

/**
 * This is the speed per characher and not the total one like in the other animations.
 */
const speedConfig = {
	'none': undefined,
	'o-typing-slower': 0.4,
	'o-typing-slow': 0.25,
	'o-typing-fast': 0.05,
	'o-typing-faster': 0.01
};

/**
 * Get the configuration option from the element CSS classes.
 * @param {HTMLDivElement} elem
 * @return Configuration options.
 */
const getConfiguration = ( elem ) => {
	const parent = elem.parentElement;
	for ( let i = 0; i < MAX_PARENT_SEARCH; ++i ) {
		if ( Array.from( parent.classList ).some( o => o.includes( 'o-typing-' ) ) ) {
			const arr = Array.from( parent.classList );

			const delay = arr.filter( x => x.includes( 'o-typing-delay-' ) ).pop();
			const number = parseInt( delay?.split( '-' )?.[3] || '0' );
			const isMS = delay?.includes( 'ms' );

			const speedOptions = Object.keys( speedConfig );
			const speed = arr?.filter( x => speedOptions.includes( x ) )?.pop() || 'fast';

			return {
				speed: speedConfig[speed],
				delay: number * ( isMS ? 0 : 1000 )
			};
		}
	}
	return undefined;
};


/**
 * Start the count animation.
 * @param {HTMLDivElement} elem The HTML element.
 * @return {Function} Start the typing animation.
 */
const initTyping = ( elem ) => {
	const text = elem?.innerHTML || '';
	const config = getConfiguration( elem );

	if ( ! text?.length ) {
		returnl;
	}

	const len = text.length;
	const totalTime = ( config?.speed || 0.1 ) * len;
	const { start, steps, stop } = makeInterval( totalTime, config?.speed || 0.1 );

	const typingPlaceholder = document.createElement( 'span' );
	typingPlaceholder.classList.add( 'o-anim-typing-caret' );
	typingPlaceholder.style.whiteSpace = 'pre-wrap';

	const fillPlaceholder = document.createElement( 'span' );
	fillPlaceholder.style.whiteSpace = 'pre-wrap';
	fillPlaceholder.style.visibility = 'hidden';

	const originalContent = elem.innerHTML;

	elem.innerHTML = '';
	elem.appendChild( typingPlaceholder );
	elem.appendChild( fillPlaceholder );
	typingPlaceholder.innerHTML = text.slice( 0, 0 );
	fillPlaceholder.innerHTML = text.slice( 0 );

	return () => {
		setTimeout( () => {
			start( ( i ) => {
				typingPlaceholder.innerHTML = text.slice( 0, i );
				if ( i < len ) {
					fillPlaceholder.innerHTML = text.slice( i );
				}
				if ( len >= steps ) {
					stop();
				}
			}, () => {
				elem.innerHTML = originalContent;
			});

		}, config?.delay || 0 );
	};
};

domReady( () => {
	const options = {
		root: null,
		rootMargin: '0px',
		threshold: [ 0.6 ]
	};

	let styles = `
		.o-anim-typing-caret::after {
			font-weight: 100;
			content: '|';
			animation: 1s blink step-end infinite;
		}

		@keyframes blink {
			from, to {
			  color: transparent;
		   }
			50% {
			  color: inherit;
		   }
		}
	`;

	styles = styles.replace( /(\r\n|\n|\r|\t)/gm, '' );

	let hasStyles = false;

	setTimeout( () => {
		const anims = document.querySelectorAll( 'o-anim-typing' );
		anims.forEach( ( elem ) => {
			if ( ! hasStyles ) {
				const styleSheet = document.createElement( 'style' );
				styleSheet.innerText = styles;
				document.head.appendChild( styleSheet );
				hasStyles = true;
			}

			const startTyping = initTyping( elem );
			const observer = new IntersectionObserver( ( entries ) => {
				entries.forEach( entry => {
					if ( entry.isIntersecting && 0 < entry.intersectionRect.height ) {
						observer.unobserve( elem );
						startTyping();
					}
				});
			}, options );
			observer.observe( elem );
		});
	}, 100 );

});
