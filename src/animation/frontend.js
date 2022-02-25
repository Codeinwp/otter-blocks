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
	for ( const element of elements ) {
		classes = element.classList;
		element.animationClasses = [];

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
	}

	window.addEventListener( 'scroll', () => {
		for ( const element of elements ) {
			if (
				element.getBoundingClientRect().top <=
					window.innerHeight * 0.95 &&
				0 < element.getBoundingClientRect().top
			) {
				if (
					element.animationClasses &&
					0 < element.animationClasses.length
				) {
					const classes = element.animationClasses;
					classes.forEach( ( i ) => element.classList.add( i ) );
					element.classList.remove( 'hidden-animated' );
					delete element.animationClasses;
				}
			}
		}
	});
});

const isElementInViewport = ( el ) => {
	const scroll = window.scrollY || window.pageYOffset;
	const boundsTop = el.getBoundingClientRect().top + scroll;

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
