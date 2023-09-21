const animations = [
	'none',
	'bounce',
	'flash',
	'pulse',
	'rubberBand',
	'shakeX',
	'shakeY',
	'headShake',
	'swing',
	'tada',
	'wobble',
	'jello',
	'heartBeat',
	'hinge',
	'jackInTheBox',
	'backInDown',
	'backInLeft',
	'backInRight',
	'backInUp',
	'backOutDown',
	'backOutLeft',
	'backOutRight',
	'backOutUp',
	'bounceIn',
	'bounceInDown',
	'bounceInLeft',
	'bounceInRight',
	'bounceInUp',
	'bounceOut',
	'bounceOutDown',
	'bounceOutLeft',
	'bounceOutRight',
	'bounceOutUp',
	'fadeIn',
	'fadeInDown',
	'fadeInDownBig',
	'fadeInLeft',
	'fadeInLeftBig',
	'fadeInRight',
	'fadeInRightBig',
	'fadeInUp',
	'fadeInTopLeft',
	'fadeInTopRight',
	'fadeInBottomLeft',
	'fadeInBottomRight',
	'fadeOut',
	'fadeOutDown',
	'fadeOutDownBig',
	'fadeOutLeft',
	'fadeOutLeftBig',
	'fadeOutRight',
	'fadeOutRightBig',
	'fadeOutUp',
	'fadeOutUpBig',
	'fadeOutTopLeft',
	'fadeOutTopRight',
	'fadeOutBottomRight',
	'fadeOutBottomLeft',
	'flip',
	'flipInX',
	'flipInY',
	'flipOutX',
	'flipOutY',
	'lightSpeedInRight',
	'lightSpeedInLeft',
	'lightSpeedOutRight',
	'lightSpeedOutLeft',
	'rotateIn',
	'rotateInDownLeft',
	'rotateInDownRight',
	'rotateInUpLeft',
	'rotateInUpRight',
	'rotateOut',
	'rotateOutDownLeft',
	'rotateOutDownRight',
	'rotateOutUpLeft',
	'rotateOutUpRight',
	'slideInDown',
	'slideInLeft',
	'slideInRight',
	'slideInUp',
	'slideOutDown',
	'slideOutLeft',
	'slideOutRight',
	'slideOutUp',
	'zoomIn',
	'zoomInDown',
	'zoomInLeft',
	'zoomInRight',
	'zoomInUp',
	'zoomOut',
	'zoomOutDown',
	'zoomOutLeft',
	'zoomOutRight',
	'zoomOutUp',
	'rollIn',
	'rollOut'
];

const outAnimation = [
	'backOutDown',
	'backOutLeft',
	'backOutRight',
	'backOutUp',
	'bounceOut',
	'bounceOutDown',
	'bounceOutLeft',
	'bounceOutRight',
	'bounceOutUp',
	'fadeOut',
	'fadeOutDown',
	'fadeOutDownBig',
	'fadeOutLeft',
	'fadeOutLeftBig',
	'fadeOutRight',
	'fadeOutRightBig',
	'fadeOutUp',
	'fadeOutUpBig',
	'fadeOutTopLeft',
	'fadeOutTopRight',
	'fadeOutBottomRight',
	'fadeOutBottomLeft',
	'flipOutX',
	'flipOutY',
	'lightSpeedOutRight',
	'lightSpeedOutLeft',
	'rotateOut',
	'rotateOutDownLeft',
	'rotateOutDownRight',
	'rotateOutUpLeft',
	'rotateOutUpRight',
	'slideOutDown',
	'slideOutLeft',
	'slideOutRight',
	'slideOutUp',
	'zoomOut',
	'zoomOutDown',
	'zoomOutLeft',
	'zoomOutRight',
	'zoomOutUp',
	'rollOut'
];

const delay = [
	'none',
	'delay-100ms',
	'delay-200ms',
	'delay-500ms',
	'delay-1s',
	'delay-2s',
	'delay-3s',
	'delay-4s',
	'delay-5s'
];

const speed = [ 'none', 'slow', 'slower', 'fast', 'faster' ];

window.addEventListener( 'load', () => {
	const elements = document.querySelectorAll( '.animated' );

	createCustomAnimationNode( elements );

	for ( const element of elements ) {
		classes = element.classList;
		element.animationClasses = [];

		classes.add( 'o-anim-ready' );

		if ( ! isElementInViewport( element ) ) {
			const animationClass = animations.find( ( i ) => {
				return Array.from( classes ).find( ( o ) => o === i );
			});

			const delayClass = delay.find( ( i ) => {
				return Array.from( classes ).find( ( o ) => o === i );
			});

			const speedClass = speed.find( ( i ) => {
				return Array.from( classes ).find( ( o ) => o === i );
			});

			element.classList.add( 'hidden-animated' );

			if ( animationClass ) {
				element.animationClasses.push( animationClass );
				element.classList.remove( animationClass );
			}

			if ( delayClass ) {
				element.animationClasses.push( delayClass );
				element.classList.remove( delayClass );
			}

			if ( speedClass ) {
				element.animationClasses.push( speedClass );
				element.classList.remove( speedClass );
			}
		}

		outAnimation.forEach( ( i ) => {
			const isOut = element.className.includes( i );

			if ( isOut ) {
				element.addEventListener( 'animationend', () => {
					element.classList.remove( i );
				});
			}
		});

		if ( classes.contains( 'o-anim-hover' ) ) {
			element.classList.remove( 'hidden-animated' ); // We asume that elements with hover animation are visible by default.
			element.classList.remove( 'animated' );

			element.addEventListener( 'mouseenter', () => {
				element.classList.add( 'animated' );
			});
		}
	}

	/** @type {Array<HTMLDivElement>} */
	const elementsScroll = [];

	for ( const element of elements ) {
		if (
			element.animationClasses &&
			0 < element.animationClasses.length
		) {
			elementsScroll.push({ element, triggerOffset: getTriggerOffset( element ) });
		}
	}

	window.addEventListener( 'scroll', () => {
		requestAnimationFrame( () => {
			const elemtsToRemove = [];

			for ( const e of elementsScroll ) {
				const { element, triggerOffset } = e;

				const { top } = element.getBoundingClientRect();

				const offset = calculateOffset( triggerOffset );

				const isVisible = ( top + offset ) <= window.innerHeight * 0.95 && 0 < top;

				if ( ! isVisible ) {
					continue;
				}

				const classes = element.animationClasses;
				classes.forEach( ( i ) => element.classList.add( i ) );

				element.classList.remove( 'hidden-animated' );
				delete element.animationClasses;
				elemtsToRemove.push( e );
			}

			elemtsToRemove.forEach( ( e ) => {
				const index = elementsScroll.indexOf( e );
				elementsScroll.splice( index, 1 );
			});
		});
	});
});

const isElementInViewport = ( el ) => {
	let scroll = window.scrollY || window.pageYOffset;
	const offset = calculateOffset( getTriggerOffset( el ) );

	const boundsTop = el.getBoundingClientRect().top + scroll + offset;

	const viewport = {
		top: scroll,
		bottom: scroll + window.innerHeight
	};

	const bounds = {
		top: boundsTop,
		bottom: boundsTop + el.clientHeight
	};

	return (
		( bounds.bottom >= viewport.top && bounds.bottom <= viewport.bottom ) ||
		( bounds.top <= viewport.bottom && bounds.top >= viewport.top )
	);
};

const createCustomAnimationNode = ( elements ) => {
	let customDelays = [];
	let customSpeeds = [];

	for ( const element of elements ) {
		const classes = element.classList;

		if ( classes.contains( 'o-anim-custom-delay' ) ) {
			let delay;
			for ( const className of classes ) {
				if ( className.includes( 'o-anim-value-delay-' ) ) {
					delay = className;
					break;
				}
			}
			if ( delay ) {
				customDelays.push( delay );
			}
		}

		if ( classes.contains( 'o-anim-custom-speed' ) ) {
			let speed;
			for ( const className of classes ) {
				if ( className.includes( 'o-anim-value-speed-' ) ) {
					speed = className;
					break;
				}
			}
			if ( speed ) {
				customSpeeds.push( speed );
			}
		}
	}


	// Remove duplicate values
	customDelays = [ ...new Set( customDelays ) ];
	customSpeeds = [ ...new Set( customSpeeds ) ];

	if ( 0 < customDelays.length || 0 < customSpeeds.length ) {
		const customValuesNode = document.createElement( 'style' );
		customValuesNode.id = 'o-anim-custom-values';
		customValuesNode.innerHTML = customDelays.reduce(
			( accumulator, cssClass ) => {
				const delayValue = cssClass.replace( 'o-anim-value-delay-', '' );

				return (
					accumulator +
					`.animated.${ cssClass } { animation-delay: ${ delayValue }; -webkit-animation-delay: ${ delayValue }; }`
				);
			},
			''
		) + '\n' + customSpeeds.reduce(
			( accumulator, cssClass ) => {
				const speedValue = cssClass.replace( 'o-anim-value-speed-', '' );

				return (
					accumulator +
					`.animated.${ cssClass } { animation-duration: ${ speedValue }; -webkit-animation-duration: ${ speedValue }; }`
				);
			},
			''
		);

		document.body.appendChild( customValuesNode );
	}
};

const getTriggerOffset = ( element ) => {
	let triggerOffset = 0;

	for ( const className of element.classList.entries() ) {
		if ( className[1].includes( 'o-anim-offset-' ) ) {
			const rawValue = className[1].replace( 'o-anim-offset-', '' );

			// Check if it starts with a number.
			if ( isNaN( rawValue.charAt( 0 ) ) ) {
				continue;
			}

			// If raw values ends with px parse it to float.
			triggerOffset = rawValue.endsWith( 'px' ) ? parseFloat( rawValue ) : rawValue;
			break;
		}
	}

	return triggerOffset;
};

const calculateOffset = ( offset ) => {
	if ( 'string' === typeof offset ) {
		offset = parseFloat( offset ) ?? 0;

		// Clamp the value between 0 and 100.
		offset = Math.min( Math.max( offset, 0 ), 100 );
		offset = window.innerHeight * ( offset / 100 );
	} else if ( 'number' !== typeof offset ) {
		offset = 0;
	}

	return offset;
};
