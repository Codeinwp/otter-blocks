/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	const galleries = document.getElementsByClassName( 'otter-masonry' );
	const useOldContainer = Boolean( parseInt( window.themeisleOtterMetadata?.useOldMacyContainer || '0' ) );

	Array.from( galleries ).forEach( gallery => {
		const container = gallery.querySelector( '.wp-block-gallery' );
		const pattern = /columns-(\d)/;

		const margin = gallery.dataset.margin !== undefined ? Number( gallery.dataset.margin ) : 10;

		let columns = Array.from( container.classList ).find( className => {
			const res = pattern.exec( className );
			if ( null !== res ) {
				return true;
			}
		});

		columns = pattern.exec( columns );
		columns = columns ? Number( columns[1]) : 3;

		container.removeAttribute( 'class' );

		const checker = setInterval( () => {
			if ( window?.Macy ) {
				window.Macy({
					container: useOldContainer ? gallery.querySelector( '.blocks-gallery-grid' ) : container,
					trueOrder: false,
					waitForImages: false,
					margin,
					columns
				});
				clearInterval( checker );
			}
		}, 1_500 );
	});
});
