import domReady from '@wordpress/dom-ready';


/**
 * Make an element sticky
 * @param {HTMLDivElement|string} selector
 * @param {'top'|'bottom'} position
 * @param {HTMLDivElement|string} container
 */
const initSticky = ( selector, position = 'top', containerSelector ) => {
	const elem = 'string' === typeof selector || selector instanceof String ? document.querySelector( selector ) : selector;
	const container = 'string' === typeof containerSelector || containerSelector instanceof String ? document.querySelector( containerSelector ) : containerSelector;

	// Calculate the element position in the page
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const { top, height, width } = elem.getBoundingClientRect();
	const elemTopPositionInPage = top + scrollTop;
	const elemBottomPositionInPage = elemTopPositionInPage + height;

	console.log( width );

	// Calculate the container position in the page
	const containerTopPosition = container ? container?.getBoundingClientRect()?.top + scrollTop : 0;
	const containerBottomPosition = containerTopPosition + ( container?.getBoundingClientRect()?.height || 0 );

	// The new positions on the screen when the sticky mod is active
	const offsetY = '40px';
	const offsetX = elem.offsetLeft;

	// We need to activate the sticky mode more early for smooth transition
	const activationOffset = 60;

	// DEBUG
	if ( container ) {
		container.style.border = '1px dashed black';
	}
	elem.style.border = '1px dashed red';

	const getScrollActivePosition = () => {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollBottom = scrollTop + window.innerHeight;

		if ( 'top' === position &&
			(
				( scrollTop + activationOffset > elemTopPositionInPage ) &&
				( ! container || scrollTop + activationOffset + height < containerBottomPosition )
			)
		) {
			return 'top';
		}

		if ( 'bottom' === position &&
			(
				( scrollBottom - activationOffset > elemBottomPositionInPage ) &&
				( ! container ||  scrollBottom - activationOffset < containerBottomPosition )
			)
		) {
			return 'bottom';
		}

		if ( container ) {
			if ( 'top' === position && (  scrollTop + activationOffset + height > containerBottomPosition ) ) {
				return 'constrain-top';
			}
			if ( 'bottom' === position && (  scrollBottom - activationOffset  >= containerBottomPosition ) ) {
				return 'constrain-bottom';
			}
		}

		return '';
	};

	// @type {HTMLDivElement}
	const placeholder = document.createElement( 'div' );
	placeholder.style.height = height + 'px';

	const insertPlaceholder = () => {
		if ( ! elem.parentElement.contains( placeholder ) ) {
			elem.parentElement.insertBefore( placeholder, elem );
		}
	};

	const removePlaceholder = () => {
		if ( elem.parentElement.contains( placeholder ) ) {
			elem.parentElement.removeChild( placeholder );
		}
	};

	window.addEventListener( 'scroll', () => {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollBottom = scrollTop + window.innerHeight;

		// Check if the scroll with the activation offset has passed the top of the element
		const pos = getScrollActivePosition();
		if ( pos ) {
			elem.classList.add( 'is-sticky' );
			elem.style.left = offsetX;
			elem.style.width = width + 'px';
			switch ( pos ) {
			case 'top':
				elem.style.top = offsetY;
				elem.style.transform = 'unset';
				break;
			case 'bottom':
				elem.style.bottom = offsetY;
				elem.style.transform = 'unset';
				break;
			case 'constrain-top':
				elem.style.top = '0px';

				// TODO: improve formule
				elem.style.transform = `translateY(${ containerBottomPosition - height - scrollTop }px)`;
				break;
			case 'constrain-bottom':
				elem.style.bottom = '0px';
				elem.style.transformOrigin = 'left bottom';

				// TODO: improve formule
				elem.style.transform = `translateY(${ containerBottomPosition - scrollBottom }px)`;
				break;
			default:
				console.warn( 'Unknown position', pos );
			}
			insertPlaceholder();
			console.log( 'Position case: ' + pos );
		} else {
			elem.classList.remove( 'is-sticky' );
			elem.style.top = 'unset';
			elem.style.left = 'unset';
			elem.style.transform = 'unset';
			removePlaceholder();
		}
	});
};

// Testing purpose
// We can make elem sticky in browser for testing various scenario with different blocks
window.otterSticky = initSticky;

/**
 *
 * @param {HTMLDivElement} elem
 */
const getStickyContainer = ( elem ) => {
	let parent = elem?.parentElement;

	while ( parent ) {
		if ( parent.classList.contains( 'o-is-sticky-container' ) ) {
			return parent;
		}
		parent = parent.parentElement;
	}
	return document.body;
};

/**
 *
 * @param {HTMLDivElement} elem
 */
const getPositionByClass = ( elem ) => {
	if ( elem.classList.contains( 'o-sticky-bottom' ) ) {
		return 'bottom';
	}
	return 'top';
};

domReady( () => {
	const elems = document.querySelectorAll( '.o-is-sticky' );

	elems.forEach( ( elem, index ) => {

		initSticky(
			elem,
			getPositionByClass( elem ),
			getStickyContainer( elem )
		);
	});
});
