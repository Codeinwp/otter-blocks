/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

const leftLabel = window.themeisleGutenbergSlider.isRTL ? window.themeisleGutenbergSlider.next : window.themeisleGutenbergSlider.prev;
const rightLabel = window.themeisleGutenbergSlider.isRTL ? window.themeisleGutenbergSlider.prev : window.themeisleGutenbergSlider.next;

const SliderArrows = '<div class="glide__arrows" data-glide-el="controls"><button class="glide__arrow glide__arrow--left" data-glide-dir="<" aria-label="' + leftLabel + '"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewbox="0 0 100 100" role="img" aria-hidden="true"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z"></path></svg></button><button class="glide__arrow glide__arrow--right" data-glide-dir="&gt;" aria-label="' + rightLabel + '"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewbox="0 0 100 100" role="img" aria-hidden="true"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z"></path></svg></button></div>';

const init = () => {
	const sliders = document.querySelectorAll( '.wp-block-themeisle-blocks-slider' );

	const options = {
		root: null,
		rootMargin: '0px',
		threshold: [ 0.0 ]
	};

	sliders.forEach( slider => {
		const track = slider.querySelector( '.glide__slides' );

		if ( ! Boolean( track.childElementCount ) ) {
			return false;
		}

		Object.keys( options ).map( option => options[option] = Number( options[option]) );

		const observer = new IntersectionObserver( entries => {
			entries.forEach( entry => {
				if ( entry.isIntersecting && 0 <= entry.intersectionRect.height ) {
					const autoplay = 'false' === slider.dataset.autoplay ? false : ( 'true' === slider.dataset.autoplay ? 2000 : slider.dataset.autoplay );
					const hideArrows = 'true' === slider.dataset.hideArrows;

					if ( ! hideArrows ) {
						const el = document.createElement( 'div' );
						el.innerHTML = SliderArrows;
						slider.appendChild( el.firstElementChild );
					}

					new window.Glide( slider, {
						...slider.dataset,
						type: 'carousel',
						keyboard: true,
						autoplay,
						hoverpause: true,
						animationTimingFunc: slider.dataset?.transition || 'ease',
						direction: window.themeisleGutenbergSlider.isRTL ? 'rtl' : 'ltr',
						breakpoints: {
							800: {
								perView: 1,
								peek: 0,
								gap: 0
							}
						}
					}).mount();

					if ( track ) {
						track.style.height = slider.dataset.height;
					}

					observer.unobserve( slider );
				}
			}, options );

		});

		observer.observe( slider );
	});
};


domReady( () => {
	const t = setInterval( () => {
		if ( window?.Glide !== undefined ) {
			clearInterval( t );
			init();
		}
	}, 500 );
});
