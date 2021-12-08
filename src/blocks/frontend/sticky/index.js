import domReady from '@wordpress/dom-ready';

const createObserver = () => {
	const blocks = {};
	const activeIndex = new Set();

	let indexBlock = 0;

	const activate = ( index ) => {
		activeIndex.add( index );
	};

	const deactivate = ( index ) => {
		activeIndex.delete( index );
	};

	const register = ( block, config, container ) => {
		indexBlock += 1;
		blocks[indexBlock.toString()] = {block, config, container};
		return indexBlock;
	};

	const calculateGap = ( index ) => {
		const { container } = blocks[index.toString()];
		let gap = 0;
		console.group( 'Gap calculation for #' + index );
		activeIndex.forEach( otherIndex => {
			if ( container === blocks[otherIndex.toString()].container ) {
				if ( otherIndex < index ) {
					const {config, block} = blocks[otherIndex.toString()];
					gap += 60 + block?.getBoundingClientRect()?.height || 0;
					console.log( 'Found ' + otherIndex + ' -- Gap: ' + ( 60 + block?.getBoundingClientRect()?.height || 0 ) );
				}
			}
		});
		console.log( 'Total gap is ' + gap );
		console.groupEnd();

		return gap;
	};


	return {
		register,
		activate,
		deactivate,
		calculateGap
	};
};

/**
 * Make an element sticky
 * @param {HTMLDivElement|string} selector
 * @param {Object} config
 * @param {HTMLDivElement|string} container
 */
const makeElementSticky = ( selector, config, containerSelector, observer ) => {
	const position = config?.position || 'top';
	const offset = config?.offset || 40;


	const elem = 'string' === typeof selector || selector instanceof String ? document.querySelector( selector ) : selector;
	const container = 'string' === typeof containerSelector || containerSelector instanceof String ? document.querySelector( containerSelector ) : containerSelector;

	// Calculate the element position in the page
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const { top, height, width } = elem.getBoundingClientRect();
	const elemTopPositionInPage = top + scrollTop;
	const elemBottomPositionInPage = elemTopPositionInPage + height;

	// Calculate the container position in the page
	const containerTopPosition = container ? container?.getBoundingClientRect()?.top + scrollTop : 0;
	const containerBottomPosition = containerTopPosition + ( container?.getBoundingClientRect()?.height || 0 );

	// The new positions on the screen when the sticky mod is active
	const offsetY = offset;
	const offsetX = elem.offsetLeft;

	// We need to activate the sticky mode more early for smooth transition
	const activationOffset = 60;

	let activate, deactivate, calculateGap;

	if ( observer ) {
		const index = observer.register( elem, config, container );
		activate = () => observer.activate( index );
		deactivate = () => observer.deactivate( index );
		calculateGap = () => observer.calculateGap( index );
	}

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

		return undefined;
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
		console.log( 'Position case: ' + pos );

		if ( pos ) {

			elem.classList.add( 'is-sticky' );
			elem.style.left = offsetX;
			elem.style.width = width + 'px';
			console.warn( calculateGap() || 0 );
			switch ( pos ) {
			case 'top':
				elem.style.top = ( offsetY + calculateGap() || 0 ) + 'px';
				elem.style.transform = 'unset';
				break;
			case 'bottom':
				elem.style.bottom = ( offsetY + calculateGap() || 0 ) + 'px';
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
			activate?.();
		} else {
			elem.classList.remove( 'is-sticky' );
			elem.style.top = 'unset';
			elem.style.left = 'unset';
			elem.style.transform = 'unset';
			removePlaceholder();
			deactivate?.();
		}
	});

	return {
		elem,
		container,
		config
	};
};

// Testing purpose
// We can make elem sticky in browser for testing various scenario with different blocks
window.otterSticky = makeElementSticky;

/**
 * Get the container for the given element
 * @param {HTMLDivElement} elem The sticky element
 * @return {HTMLDivElement} The parent container. Return `body` as default
 */
const getStickyContainer = ( elem, scope ) => {
	let parent = elem?.parentElement;
	const sections = [];
	while ( parent ) {
		if ( parent.classList.contains( 'wp-block-themeisle-blocks-advanced-column' ) && 'o-sticky-scope-row' === scope ) {
			return parent;
		}
		if ( parent.classList.contains( 'wp-block-themeisle-blocks-advanced-columns' ) ) {
			if ( 'o-sticky-scope-section' === scope ) {
				return parent;
			} else if ( 'o-sticky-scope-main-area' ) {
				sections.push( parent );
			}
		}
		parent = parent.parentElement;
	}
	return sections.pop() || document.body;
};

/**
 * Get the configuration options
 * @param {HTMLDivElement} elem The sticky element
 * @return {Object} The configuration
 */
const getConfigOptions = ( elem ) => {
	return Array.from( elem.classList ).reduce( ( config, cssClass ) => {
		if ( cssClass.includes( 'o-sticky-pos-bottom' ) ) {
			config.position = 'bottom';
		} else if ( cssClass.includes( 'o-sticky-offset' ) ) {
			config.offset = parseInt( cssClass.split( '-' )?.pop() ) || config.offset;
		} else if ( cssClass.includes( 'o-sticky-scope' ) ) {
			config.scope = cssClass;
		}
		return config;
	}, { position: 'top', offset: 40, scope: '' });
};

domReady( () => {
	const elems = document.querySelectorAll( '.o-sticky' );
	const observer = createObserver();

	elems.forEach( ( elem ) => {
		const config = getConfigOptions( elem );
		const container = getStickyContainer( elem, config.scope );

		makeElementSticky(
			elem,
			config,
			container,
			observer
		);
	});
});
