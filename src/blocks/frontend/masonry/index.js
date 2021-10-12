/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	const galleries = document.getElementsByClassName( 'otter-masonry' );

	Array.from( galleries ).forEach( gallery => {
		const container = gallery.querySelector( '.wp-block-gallery' );
		const pattern = /columns-(\d)/;

		const margin = Number( gallery.dataset.margin ) || 0;

		let columns = Array.from( container.classList ).find( className => {
			const res = pattern.exec( className );
			if ( null !== res ) {
				return true;
			}
		});

		columns = pattern.exec( columns );
		columns = columns ? Number( columns[1]) : 3;

		container.removeAttribute( 'class' );

		Macy({
			container: gallery.querySelector( '.blocks-gallery-grid' ),
			trueOrder: false,
			waitForImages: false,
			margin,
			columns
		});
	});
});
