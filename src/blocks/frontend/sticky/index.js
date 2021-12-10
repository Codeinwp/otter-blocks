import domReady from '@wordpress/dom-ready';
import { easeOutQuad } from '../../helpers/helper-functions';

const createObserver = () => {
	const blocks = {};
	const activeIndex = new Set();
	const dormantIndex = new Set();

	let indexBlock = 0;

	const isEarlyActivated = ( index ) => dormantIndex.has( index );

	const isActive = ( index ) => activeIndex.has( index );

	const activate = ( index ) => {
		activeIndex.add( index );
	};

	const earlyActivate = ( index ) => {
		dormantIndex.add( index );
	};

	const deactivate = ( index ) => {
		activeIndex.delete( index );
	};

	const earlyDeactivate = ( index ) => {
		dormantIndex.delete( index );
	};

	const register = ( block, config, container, metadata ) => {
		indexBlock += 1;
		blocks[indexBlock.toString()] = {block, config, container, metadata};
		return indexBlock;
	};

	const calculateEarlyActivation = ( index ) => {
		const { container } = blocks[index.toString()];
		let earlyActivation = 0;

		//console.groupCollapsed( 'Early calculation for #' + index );
		activeIndex.forEach( otherIndex => {
			if ( container === blocks[otherIndex.toString()].container ) {
				if ( otherIndex < index ) {
					const {block, metadata} = blocks[otherIndex.toString()];
					earlyActivation += metadata.activationOffset + ( block?.getBoundingClientRect()?.height || 0 );

					//console.log( 'Found ' + otherIndex + ' -- EarlyActivation: ' + ( metadata.activationOffset + block?.getBoundingClientRect()?.height || 0 ) );
				}
			}
		});

		//console.log( 'Early activation is ' + earlyActivation );
		//console.groupEnd();

		return earlyActivation;
	};

	const calculateGap = ( index ) => {
		const { container } = blocks[index.toString()];
		let gap = 0;

		//console.groupCollapsed( 'Gap calculation for #' + index );
		activeIndex.forEach( otherIndex => {
			if ( container === blocks[otherIndex.toString()].container ) {
				if ( otherIndex < index ) {
					const {config, block} = blocks[otherIndex.toString()];
					if ( 'stack' === config?.behaviour ) {
						gap += config.offset + block?.getBoundingClientRect()?.height || 0;

						//console.log( 'Found ' + otherIndex + ' -- Gap: ' + ( config.offset + block?.getBoundingClientRect()?.height || 0 ) );
					}
				}
			}
		});

		//console.log( 'Total gap is ' + gap );
		//console.groupEnd();

		return gap;
	};

	const calculateOpacity = ( index ) => {
		const { block, container, config, metadata } = blocks[index.toString()];
		let opacity = 1;

		const blockHeight = block.getBoundingClientRect()?.height || 0;
		const blockWidth = block.getBoundingClientRect()?.width || 0;
		const currentBottomPosInPage =  blockHeight + config.offset + ( window.pageYOffset || document.documentElement.scrollTop );

		for ( let otherIndex of ( new Set( dormantIndex, activeIndex ) ) ) {
			if ( container === blocks[otherIndex.toString()].container ) {
				if ( otherIndex > index ) {
					const { block: otherBlock, metadata: otherMetadata} = blocks[otherIndex.toString()];
					const otherBlockHeight = otherBlock.getBoundingClientRect()?.height || 0;

					if ( blockWidth > Math.abs( metadata.elemLeftPositionInPage - otherMetadata.elemLeftPositionInPage ) ) {
						const height = Math.min( blockHeight, otherBlockHeight );
						opacity = Math.min( 1, Math.max( 0, otherMetadata.elemTopPositionInPage + height - currentBottomPosInPage ) / height  );
						return opacity;
					}
				}
			}
		}

		return opacity;
	};

	return {
		register,
		isActive,
		isEarlyActivated,
		activate,
		deactivate,
		earlyActivate,
		earlyDeactivate,
		calculateEarlyActivation,
		calculateGap,
		calculateOpacity
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

	// Get node reference for the element and the container
	const elem = 'string' === typeof selector || selector instanceof String ? document.querySelector( selector ) : selector;
	const container = 'string' === typeof containerSelector || containerSelector instanceof String ? document.querySelector( containerSelector ) : containerSelector;

	// Calculate the element position in the page
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	const { top, left, height, width } = elem.getBoundingClientRect();
	const elemTopPositionInPage = top + scrollTop;
	const elemLeftPositionInPage = left + scrollLeft;
	const elemBottomPositionInPage = elemTopPositionInPage + height;

	// Calculate the container position in the page
	const containerHeight = container?.getBoundingClientRect()?.height || 0;
	const containerTopPosition = container ? container?.getBoundingClientRect()?.top + scrollTop : 0;
	const containerBottomPosition = containerTopPosition + ( container?.getBoundingClientRect()?.height || 0 );

	// The new positions on the screen when the sticky mod is active
	const offsetY = offset;

	// We need to activate the sticky mode more early for smooth transition
	const activationOffset = offset + 20;

	console.log( ({activationOffset}) );

	/*
		OBSERVER

		Register the element in observer so that it can be aware of the other sticky elements.
		The observer must be optional. The usage need to take in considaration in the case in which this is
		not defined.
	*/
	let activate, deactivate, calculateGap, calculateOpacity, earlyActivate, earlyDeactivate, calculateEarlyActivation, isActive, isEarlyActivated, index;

	if ( observer ) {
		index = observer.register( elem, config, container, { elemTopPositionInPage, elemBottomPositionInPage, elemLeftPositionInPage, activationOffset });
		isActive = () => observer.isActive( index );
		isEarlyActivated = () => observer.isEarlyActivated( index );
		activate = () => observer.activate( index );
		deactivate = () => observer.deactivate( index );
		calculateGap = () => observer.calculateGap( index );
		calculateOpacity = () => observer.calculateOpacity( index );
		earlyActivate = () => observer.earlyActivate( index );
		earlyDeactivate = () => observer.earlyDeactivate( index );
		calculateEarlyActivation = () => observer.calculateEarlyActivation( index );
	}

	/**
	 * This function will compute the position case in which the element must be.
	 * @param {number} earlyActivation An offset that activate the position earlier or later (if the number is negative).
	 * @returns {'top'|'bottom'|'constrain-top'|'constrain-bottom'|undefined} The position case in which the block must be.
	 */
	const getScrollActivePosition = ( earlyActivation = 0 ) => {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollBottom = scrollTop + window.innerHeight;

		if ( 'top' === position &&
			(
				( scrollTop + activationOffset + earlyActivation > elemTopPositionInPage ) &&
				( ! container || scrollTop + activationOffset + height + earlyActivation < containerBottomPosition )
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
			if ( 'top' === position && (  scrollTop + activationOffset + height + earlyActivation > containerBottomPosition ) ) {
				return 'constrain-top';
			}
			if ( 'bottom' === position && (  scrollBottom - activationOffset  >= containerBottomPosition ) ) {
				return 'constrain-bottom';
			}
		}

		return undefined;
	};

	/**
	 * By making the element sticky, we use 'fixed' positioning which removes the element from the document workflow.
	 * We need to put a placeholder with the same height and width as the element so we can keep layout flow.
	 */
	// @type {HTMLDivElement}
	const placeholder = document.createElement( 'div' );
	placeholder.style.height = height + 'px';
	placeholder.style.width = width + 'px';

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

	/**
	 * Listen to the scroll event and compute the position of the element.
	 */
	window.addEventListener( 'scroll', () => {

		// DEBUG
		if ( window?.debugSticky ) {
			if ( container ) {
				container.style.border = '1px dashed black';
			}
			elem.style.border = '1px dashed red';
		}

		// Get the scroll values
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollBottom = scrollTop + window.innerHeight;

		// Check if the scroll with the activation offset has passed the top of the element
		const stickyPosition = 'o-sticky-bhvr-stack' === config.behaviour ? getScrollActivePosition( calculateGap() ) : getScrollActivePosition() ;

		// console.log( 'Position case: ' + pos );

		// Check for early activation
		if ( getScrollActivePosition( calculateEarlyActivation?.() ) ) {
			earlyActivate?.();
		} else {
			earlyDeactivate?.();
		}

		if ( isEarlyActivated?.() && ! isActive?.() ) {
			elem.style.position = 'relative';
			elem.style.zIndex = 9999 + ( index || 0 );
		}

		if ( stickyPosition ) {

			// Make de element sticky
			elem.classList.add( 'is-sticky' );
			elem.style.left = elemLeftPositionInPage + 'px';
			elem.style.width = width + 'px';
			elem.style.position = 'fixed';

			// Make the container height to be fixed
			if ( container ) {
				container.style.height = 0 < containerHeight ? containerHeight + 'px' : '';
			}

			// Compute the position of the element
			switch ( stickyPosition ) {
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
				console.warn( 'Unknown position', stickyPosition );
			}
			insertPlaceholder();
			activate?.();
			if ( 'o-sticky-bhvr-hide' === config.behaviour ) {
				elem.style.opacity = easeOutQuad( calculateOpacity?.() );
			}
		} else {
			elem.classList.remove( 'is-sticky' );
			elem.style.top = '';
			elem.style.left = '';
			elem.style.transform = '';
			elem.style.opacity = '';

			if ( ! isEarlyActivated?.() ) {
				console.log( 'Clean' );
				elem.style.position = '';
				elem.style.zIndex = '';
			}

			removePlaceholder();
			deactivate?.();
		}

		// if ( ! isEarlyActivated?.() && ! isActive?.() ) {
		// 	console.log( 'Clean' );
		// 	elem.style.position = '';
		// 	elem.style.zIndex = '';
		// 	container.style.height = '';
		// }
	});


	return {
		elem,
		container,
		config
	};
};

// Testing purpose
// We can make elem sticky in browser for testing various scenario with different blocks
window.debugSticky = false;
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
		if (
			(
				parent.classList.contains( 'wp-block-themeisle-blocks-advanced-column' ) ||
				parent.classList.contains( 'wp-block-group' ) ||
				parent.classList.contains( 'wp-block-column' )
			) &&
			'o-sticky-scope-parent' === scope
		) {
			return parent;
		}
		if (
			parent.classList.contains( 'wp-block-themeisle-blocks-advanced-columns' ) ||
			parent.classList.contains( 'wp-block-group' ) ||
			parent.classList.contains( 'wp-block-columns' )
		) {
			if ( 'o-sticky-scope-section' === scope ) {
				return parent;
			} else if ( 'o-sticky-scope-main-area' === scope ) {
				sections.push( parent );
			}
		}
		parent = parent.parentElement;
	}
	return 'o-sticky-scope-main-area' === scope ? sections.pop() : document.body;
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
		} else if ( cssClass.includes( 'o-sticky-bhvr' ) ) {
			config.behaviour = cssClass;
		}
		return config;
	}, { position: 'top', offset: 40, scope: 'o-sticky-scope-main-area', behaviour: 'o-sticky-bhvr-keep' });
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
