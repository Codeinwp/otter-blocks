/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import { range, linear } from './../../helpers/helper-functions.js';

domReady( () => {
	const progressBars = document.querySelectorAll( '.wp-block-themeisle-blocks-progress-bar' );

	Array.from( progressBars ).forEach( progressBar => {
		const duration = progressBar.dataset.duration * 1000;
		const bar = progressBar.querySelector( '.wp-block-themeisle-blocks-progress-bar__area__bar' );
		let borderRadius = window.getComputedStyle( bar ).borderTopLeftRadius.replace( 'px', '' ) || 0;
		const number = progressBar.querySelector( '.wp-block-themeisle-blocks-progress-bar__number' );
		const tooltip = progressBar.querySelector( '.wp-block-themeisle-blocks-progress-bar__area__tooltip' );
		const append = progressBar.querySelector( '.wp-block-themeisle-blocks-progress-bar__progress__append' );
		const outerTitle = progressBar.querySelector( '.wp-block-themeisle-blocks-progress-bar__outer__title' );
		const innerTitle = progressBar.querySelector( '.wp-block-themeisle-blocks-progress-bar__area__title' );

		let titleWidth;
		if ( outerTitle ) {
			titleWidth = outerTitle.getBoundingClientRect().width;
		} else if ( innerTitle ) {
			titleWidth = innerTitle.getBoundingClientRect().width;
		}

		const numberWidth = window.getComputedStyle( bar ).height.replace( 'px', '' ) * 0.5;

		if ( tooltip && ! outerTitle ) {
			tooltip.style.opacity = 1;
		}


		if ( 0 === duration ) {
			bar.style.width = `${ parseInt( progressBar.dataset.percent ) }%`;
			number.innerHTML = `${ parseInt( progressBar.dataset.percent ) }%`;
			bar.style.opacity = 1;

			if ( tooltip ) {
				tooltip.style.opacity = 1;
			}
			if ( append ) {
				append.style.opacity = 1;
			}
		} else {

			if ( number ) {
				number.innerText = '0%';
			}

			if ( innerTitle && innerTitle.classList.contains( 'highlight' ) ) {
				borderRadius *= 2;
			}

			let options = {
				root: null,
				rootMargin: '0px',
				threshold: [ 0.6 ]
			};

			let observer = new IntersectionObserver( entries => {
				entries.forEach( entry => {
					if ( entry.isIntersecting ) {

						if ( 0 >= entry.intersectionRect.height ) {
							bar.style.width = `${ parseInt( progressBar.dataset.percent ) }%`;
							number.innerHTML = `${ parseInt( progressBar.dataset.percent ) }%`;
							bar.style.opacity = 1;

							if ( tooltip ) {
								tooltip.style.opacity = 1;
							}
							if ( append ) {
								append.style.opacity = 1;
							}

							observer.unobserve( bar );
							return;
						}

						let interval;

						if ( interval ) {
							clearInterval( interval );
						}

						const step = 20; // for a more smother animation, decrease the value
						const totalPercent =  parseInt( progressBar.dataset.percent );
						const percentPerTime = range( 0, duration, step ).map( x => linear( x  / duration ) * totalPercent ).reverse();

						interval = setInterval( () => {
							const value = percentPerTime.pop();
							bar.style.width = `${ value }%`;

							if ( number ) {
								number.innerText = `${ Math.ceil( value ) }%`;
							}

							const currentWidth = bar.getBoundingClientRect().width;

							if ( currentWidth > borderRadius ) {
								bar.style.opacity = 1;
							}

							if ( tooltip && outerTitle ) {

								if ( currentWidth > titleWidth + 10 ) {
									tooltip.style.opacity = 1;
								}

							}

							if ( append ) {
								if ( innerTitle ) {
									if ( currentWidth > titleWidth + numberWidth * 1.5 ) {
										append.style.opacity = 1;
									}
								} else {
									if ( currentWidth > numberWidth * 1.8 ) {
										append.style.opacity = 1;
									}
								}
							}

							if ( ! percentPerTime.length ) {
								observer.unobserve( bar );
								clearInterval( interval );
							}
						}, step );

					}
				});
			}, options );

			setTimeout( () => observer.observe( bar ), 100 );
		}
	});
});
