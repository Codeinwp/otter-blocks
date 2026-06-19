import { domReady } from '../../helpers/frontend-helper-functions.js';

const goToSlideLabel = window.themeisleGutenbergContentSlider?.goToSlide || 'Go to slide %d';

// Core motion is CSS scroll-snap; this only wires arrows, dots, autoplay, keyboard and soft-wrap loop.
const initSlider = ( slider ) => {
	const track = slider.querySelector( '.o-content-track' );

	if ( ! track ) {
		return;
	}

	const slides = Array.from( track.children );

	if ( 0 === slides.length ) {
		return;
	}

	const autoplay = 'true' === slider.dataset.autoplay;
	const loop = 'false' !== slider.dataset.loop;
	const delay = Math.max( 1, parseFloat( slider.dataset.delay ) || 5 ) * 1000;
	const reduceMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	let current = 0;

	// Slide index closest to the current scroll position (keeps dots synced on manual scroll/swipe).
	const getCurrent = () => {
		const base = track.getBoundingClientRect().left;
		let index = 0;
		let min = Infinity;

		slides.forEach( ( slide, i ) => {
			const distance = Math.abs( slide.getBoundingClientRect().left - base );

			if ( distance < min ) {
				min = distance;
				index = i;
			}
		});

		return index;
	};

	const dotsContainer = slider.querySelector( '.o-content-dots' );
	const dots = [];

	const updateDots = () => {
		dots.forEach( ( dot, i ) => dot.classList.toggle( 'o-content-dot--active', i === current ) );
	};

	const goTo = ( index ) => {
		const count = slides.length;

		if ( loop ) {
			index = ( index + count ) % count;
		} else {
			index = Math.max( 0, Math.min( index, count - 1 ) );
		}

		current = index;

		const left = slides[ index ].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;

		track.scrollTo({
			left,
			behavior: reduceMotion ? 'auto' : 'smooth'
		});

		updateDots();
	};

	// Dots are built here since the slide count is only known at runtime.
	if ( dotsContainer ) {
		slides.forEach( ( _, i ) => {
			const dot = document.createElement( 'button' );
			dot.type = 'button';
			dot.className = 'o-content-dot';
			dot.setAttribute( 'aria-label', goToSlideLabel.replace( '%d', i + 1 ) );
			dot.addEventListener( 'click', () => goTo( i ) );
			dotsContainer.appendChild( dot );
			dots.push( dot );
		});
	}

	const prevArrow = slider.querySelector( '.o-content-arrow--prev' );
	const nextArrow = slider.querySelector( '.o-content-arrow--next' );

	prevArrow?.addEventListener( 'click', () => goTo( current - 1 ) );
	nextArrow?.addEventListener( 'click', () => goTo( current + 1 ) );

	let scrollTimer;
	track.addEventListener(
		'scroll',
		() => {
			window.clearTimeout( scrollTimer );
			scrollTimer = window.setTimeout( () => {
				current = getCurrent();
				updateDots();
			}, 100 );
		},
		{ passive: true }
	);

	// Arrow keys navigate slides, but inner controls (form fields, editable
	// content, selects) need them for their own caret/option movement, so the
	// slider only claims the keys when focus is not inside such an element.
	const isFromInteractiveElement = ( target ) => {
		const el = target?.closest?.( 'input, textarea, select, [contenteditable=""], [contenteditable="true"]' );
		return Boolean( el );
	};

	slider.addEventListener( 'keydown', ( event ) => {
		if ( 'ArrowLeft' !== event.key && 'ArrowRight' !== event.key ) {
			return;
		}

		if ( isFromInteractiveElement( event.target ) ) {
			return;
		}

		event.preventDefault();
		goTo( 'ArrowLeft' === event.key ? current - 1 : current + 1 );
	});

	let timer = null;

	const stop = () => {
		if ( timer ) {
			window.clearInterval( timer );
			timer = null;
		}
	};

	const start = () => {
		if ( ! autoplay || reduceMotion ) {
			return;
		}
		stop();
		timer = window.setInterval( () => goTo( current + 1 ), delay );
	};

	if ( autoplay && ! reduceMotion ) {
		slider.addEventListener( 'mouseenter', stop );
		slider.addEventListener( 'mouseleave', start );
		slider.addEventListener( 'focusin', stop );
		slider.addEventListener( 'focusout', start );
		start();
	}

	updateDots();
};

domReady( () => {
	document
		.querySelectorAll( '.wp-block-themeisle-blocks-content-slider' )
		.forEach( ( slider ) => initSlider( slider ) );
});
