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
	const activationOffset = 40;

	const getScrollActivePosition = () => {
		if ( 'top' === position &&
			(
				( window.pageYOffset + activationOffset > elemTopPositionInPage ) &&
				( ! container || window.pageYOffset - activationOffset + height < containerBottomPosition )
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
			if ( 'bottom' === position && (  window.pageYOffset - activationOffset + window.innerHeight > elemBottomPositionInPage ) ) {
				return 'constrain-bottom';
			}
		}

		return '';
	};

	window.addEventListener( 'scroll', () => {

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
				elem.style.transform = `translateY(${ -( window.pageYOffset + activationOffset - containerBottomPosition ) }px)`;
				break;
			case 'constrain-bottom':
				elem.style.transform = `translateY(${ -( window.pageYOffset - activationOffset + window.innerHeight - containerBottomPosition ) }px)`;
				break;
			default:
				console.warn( 'Unknown position', pos );
			}
			console.log( pos );
		} else {
			elem.classList.remove( 'is-sticky' );
			elem.style.top = 'unset';
			elem.style.left = 'unset';
			elem.style.transform = 'unset';
		}
	});
};


// Testing purpose
// We can make elem sticky in browser for testing various scenario with different blocks
window.otterSticky = initSticky;


export default initSticky;
