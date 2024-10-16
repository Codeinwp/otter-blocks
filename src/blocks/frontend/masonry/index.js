/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

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

			if ( window?.Macy ) {
				const targetContainer = gallery.querySelector( '.blocks-gallery-grid' ) || container;

				const observer = new IntersectionObserver( entries => {
					entries.forEach( entry => {
						if ( entry.isIntersecting && 0 <= entry.intersectionRect.height ) {
							const pattern = /columns-(\d)/;

							const margin = gallery.dataset.margin !== undefined ? Number( gallery.dataset.margin ) : 10;

							let columns = Array.from( container.classList ).find( className => {
								const res = pattern.exec( className );
								return null !== res;
							});

							columns = pattern.exec( columns );
							columns = columns ? Number( columns[1]) : 3;

							container.removeAttribute( 'class' );

							window.Macy({
								container: targetContainer,
								trueOrder: false,
								waitForImages: false,
								margin,
								columns,
								breakAt: {
									1200: Math.min( columns, 4 ),
									840: Math.min( columns, 3 ),
									740: Math.min( columns, 2 ),
									640: Math.min( columns, 1 )
								}
							});

							observer.unobserve( targetContainer );
						}
					});
				}, options );

				observer.observe( targetContainer );
				clearInterval( checker );
			}
		}, 1_500 );
	});
});
