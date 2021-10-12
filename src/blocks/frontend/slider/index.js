/**
 * WordPress dependencies
 */
import { omit } from 'lodash';

import domReady from '@wordpress/dom-ready';

const SliderArrows = '<div class="glide__arrows" data-glide-el="controls"><button class="glide__arrow glide__arrow--left" data-glide-dir="<"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewbox="0 0 100 100" role="img" aria-hidden="true"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z"></path></svg></button><button class="glide__arrow glide__arrow--right" data-glide-dir="&gt;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewbox="0 0 100 100" role="img" aria-hidden="true"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z"></path></svg></button></div>';

domReady( () => {
	const sliders = document.querySelectorAll( '.wp-block-themeisle-blocks-slider' );

	sliders.forEach( slider => {
		const track = slider.querySelector( '.glide__slides' );
		const options = omit({ ...slider.dataset }, [ 'autoplay', 'height', 'hideArrows' ]);
		const autoplay = 'false' === slider.dataset.autoplay ? false : ( 'true' === slider.dataset.autoplay ? 2000 : slider.dataset.autoplay );
		const hideArrows = 'true' === slider.dataset.hideArrows ? true : false;

		if ( ! hideArrows ) {
			const el = document.createElement( 'div' );
			el.innerHTML = SliderArrows;
			slider.appendChild( el.firstElementChild );
		}

		Object.keys( options ).map( option => options[option] = Number( options[option]) );

		new Glide( `#${ slider.id }`, {
			type: 'carousel',
			keyboard: true,
			autoplay,
			hoverpause: true,
			...options,
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
	});
});
