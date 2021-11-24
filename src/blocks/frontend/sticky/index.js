/**
 * Make an element sticky
 * @param {HTMLDivElement} elem
 */
const initSticky = ( elem ) => {

	// Calculate the element's position in page
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const { top, height } = elem.getBoundingClientRect();
	const elemTopPositionInPage = top + scrollTop;
	const elemBottomPositionInPage = elemTopPositionInPage + height;

	// The new positions on the screen when the sticky mod is active
	const offsetY = '40px';
	const offsetX = elem.offsetLeft;

	// We need to activate the sticky mode more early for smooth transition
	const activationOffset = 40;

	window.addEventListener( 'scroll', () => {

		// Check if the scroll with the activation offset has passed the top of the element
		if ( window.pageYOffset + activationOffset > elemTopPositionInPage ) {
			elem.classList.add( 'is-sticky' );
			elem.style.top = offsetY;
			elem.style.left = offsetX;
		} else {
			elem.classList.remove( 'is-sticky' );
			elem.style.top = 'unset';
			elem.style.left = 'unset';
		}
	});
};

// Testing purpose
// We can make elem sticky in browser for testing various scenario with different blocks
window.otterSticky = initSticky;


export default initSticky;
