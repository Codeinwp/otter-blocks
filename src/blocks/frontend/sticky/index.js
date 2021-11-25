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
	const { top, height } = elem.getBoundingClientRect();
	const elemTopPositionInPage = top + scrollTop;
	const elemBottomPositionInPage = elemTopPositionInPage + height;

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
		if ( 'top' === position &&
			(
				( window.pageYOffset + activationOffset > elemTopPositionInPage ) &&
				( ! container || window.pageYOffset + activationOffset + height < containerBottomPosition )
			)
		) {
			return 'top';
		}

		if ( 'bottom' === position &&
			(
				( window.pageYOffset - activationOffset + window.innerHeight > elemBottomPositionInPage ) &&
				( ! container ||  window.pageYOffset - activationOffset + window.innerHeight < containerBottomPosition )
			)
		) {
			return 'bottom';
		}

		if ( container ) {
			if ( 'top' === position && (  window.pageYOffset + activationOffset + height > containerBottomPosition ) ) {
				return 'constrain-top';
			}
			if ( 'bottom' === position && (  window.pageYOffset - activationOffset + window.innerHeight > containerBottomPosition ) ) {
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
				elem.style.transform = `translateY(${ containerBottomPosition - height - scrollTop }px)`;
				break;
			case 'constrain-bottom':
				elem.style.bottom = '0px';
				elem.style.transformOrigin = 'left bottom';
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


export default initSticky;
