/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import { range, linear } from './../../helpers/helper-functions.js';

domReady( () => {
	const progressBars = document.querySelectorAll( '.wp-block-themeisle-blocks-circle-counter' );

	Array.from( progressBars ).forEach( progressBar => {

		/*
			Dataset
		*/
		const duration = progressBar.dataset.duration * 1000;
		const percentage = progressBar.dataset.percentage;
		const size = progressBar.dataset.height;
		const strokeWidth = progressBar.dataset.strokeWidth;
		const fontSize = progressBar.dataset.fontSizePercent;
		const backgroundStroke = progressBar.dataset.backgroundStroke;
		const progressStroke = progressBar.dataset.progressStroke;

		const center = size / 2;
		const radius = center -  strokeWidth / 2;
		const circumference = 2 * Math.PI * radius;

		if ( 0 > radius ) {
			return;
		}


		/*
			Create SVG
		*/
		const parent = progressBar.querySelector( '.wp-block-themeisle-blocks-circle-counter__bar' );
		parent.style.height = size + 'px';
		parent.style.width = size + 'px';

		const container = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		container.classList.add( 'wp-block-themeisle-blocks-circle-counter-container' );
		container.setAttribute( 'height', size );
		container.setAttribute( 'width', size );

		const backgroundCircle = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
		backgroundCircle.classList.add( 'wp-block-themeisle-blocks-circle-counter-bg' );
		backgroundCircle.setAttribute( 'cx', center );
		backgroundCircle.setAttribute( 'cy', center );
		backgroundCircle.setAttribute( 'r', radius );
		backgroundCircle.style.stroke = backgroundStroke;
		backgroundCircle.style.strokeWidth = strokeWidth;

		const progressCircle = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
		progressCircle.classList.add( 'wp-block-themeisle-blocks-circle-counter-progress' );
		progressCircle.setAttribute( 'cx', center );
		progressCircle.setAttribute( 'cy', center );
		progressCircle.setAttribute( 'r', radius );
		progressCircle.style.stroke = progressStroke;
		progressCircle.style.strokeWidth = strokeWidth;
		progressCircle.style.strokeDasharray = circumference;

		const value = document.createElementNS( 'http://www.w3.org/2000/svg', 'text' );
		value.classList.add( 'wp-block-themeisle-blocks-circle-counter-text' );
		value.setAttribute( 'x', '50%' );
		value.setAttribute( 'y', '50%' );
		value.style.fill = progressStroke;
		value.style.fontSize = fontSize + 'px';

		/*
			Add to page
		*/
		container.appendChild( backgroundCircle );
		container.appendChild( progressCircle );
		container.appendChild( value );
		parent.appendChild( container );

		/*
			Add animation
		*/
		if ( ! duration ) {
			progressCircle.style.strokeDashoffset = ( ( 100 - percentage ) / 100 ) * circumference;
			value.innerHTML = percentage + '%';
		} else {

			progressCircle.style.strokeDashoffset = circumference;
			value.innerText = '0%';

			let options = {
				root: null,
				rootMargin: '0px',
				threshold: [ 0.6 ]
			};

			let interval;

			let observer = new IntersectionObserver( entries => {
				entries.forEach( entry => {
					if ( entry.isIntersecting ) {

						if ( 0 >= entry.intersectionRect.height ) {
							progressCircle.style.strokeDashoffset = ( ( 100 - percentage ) / 100 ) * circumference;
							value.innerHTML = percentage + '%';

							observer.unobserve( bar );
							return;
						}

						if ( interval ) {
							clearInterval( interval );
						}

						const step = 20; // for a more smother animation, decrease the value
						const totalPercent =  parseInt( percentage );
						const percentPerTime = range( 0, duration, step ).map( x => linear( x  / duration ) * totalPercent ).reverse();

						interval = setInterval( () => {
							const valuePercent =  Math.round( percentPerTime.pop() );
							progressCircle.style.strokeDashoffset = ( ( 100 - valuePercent ) / 100 ) * circumference;
							value.innerHTML = valuePercent + '%';
							if ( ! percentPerTime.length ) {
								observer.unobserve( progressBar );
								clearInterval( interval );
							}
						}, step );

					}
				});
			}, options );

			setTimeout( () => observer.observe( progressBar ), 100 );
		}
	});
});
