/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	const galleries = document.getElementsByClassName( 'otter-masonry' );

	const options = {
		root: null,
		rootMargin: '0px',
		threshold: [ 0.0 ]
	};

	Array.from( galleries ).forEach( gallery => {

		const checker = setInterval( () => {
			const container = gallery.querySelector( '.wp-block-gallery' );

			if (window?.Macy) {
				const targetContainer = gallery.querySelector( '.blocks-gallery-grid' ) || container;

				const observer = new IntersectionObserver( entries => {
					entries.forEach( entry => {
						if (entry.isIntersecting && 0 <= entry.intersectionRect.height) {
							const pattern = /columns-(\d)/;

							const margin = gallery.dataset.margin !== undefined ? Number( gallery.dataset.margin ) : 10;

							let columns = Array.from( container.classList ).find( className => {
								const res = pattern.exec( className );
								if (null !== res) {
									return true;
								}
							} );

							columns = pattern.exec( columns );
							columns = columns ? Number( columns[1] ) : 3;

							container.removeAttribute( 'class' );

							console.log("Initiate")

							window.Macy( {
								container: targetContainer,
								trueOrder: false,
								waitForImages: false,
								margin,
								columns
							} );

							observer.unobserve( targetContainer );
						}
					} );
				}, options );

				observer.observe( targetContainer );
				clearInterval( checker );
			}
		}, 1_500 );
	} );
} );
