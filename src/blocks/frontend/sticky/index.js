import domReady from '@wordpress/dom-ready';
import { detectLoading } from '../../helpers/detect-loading';
import { easeOutQuad } from '../../helpers/helper-functions';

const createObserver = () => {
	const blocks = {};

	/**
	 * The index of the active blocks
	 */
	const activeIndex = new Set();

	/**
	 * The index of the blocks that are close to being active.
	 */
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

	/**
	 * Calculate how much space the active blocks is occupying in the screen, use this for detecting the block that are close to be activated.
	 * @param {number} index The registration index.
	 * @returns {number} The space occupied.
	 */
	const calculateEarlyActivation = ( index ) => {
		const { container } = blocks[index.toString()];
		let earlyActivation = 0;

		activeIndex.forEach( otherIndex => {
			if ( container === blocks[otherIndex.toString()].container ) {
				if ( otherIndex < index ) {
					const {block, metadata} = blocks[otherIndex.toString()];
					earlyActivation += metadata.activationOffset + ( block?.getBoundingClientRect()?.height || 0 );
				}
			}
		});

		return earlyActivation;
	};

	/**
	 * Calculate the space occupied by other block with the `stack` option, and the same container.
	 * @param {number} index The registration index.
	 * @returns {number} The space occupied by other active blocks.
	 */
	const calculateGap = ( index ) => {
		const { block, container, metadata } = blocks[index.toString()];
		let gap = 0;
		const blockWidth = block.getBoundingClientRect()?.width || 0;

		activeIndex.forEach( otherIndex => {
			if ( container === blocks[otherIndex.toString()].container ) {
				if ( otherIndex < index ) {
					const {config: otherConfig, block: otherBlock, metadata: otherMetadata} = blocks[otherIndex.toString()];

					if ( 'o-sticky-bhvr-stack' === otherConfig?.behaviour &&  blockWidth > Math.abs( metadata.elemLeftPositionInPage - otherMetadata.elemLeftPositionInPage ) ) {
						gap += otherConfig.offset + otherBlock?.getBoundingClientRect()?.height || 0;
					}
				}
			}
		});

		return gap;
	};

	/**
	 * Calculate the opacity taken in the consideration the blocks after this one.
	 * @param {number} index The registration index.
	 * @returns {number} The opacity.
	 */
	const calculateOpacity = ( index ) => {
		const { block, container, config, metadata } = blocks[index.toString()];
		let opacity = 1;

		const blockHeight = block.getBoundingClientRect()?.height || 0;
		const blockWidth = block.getBoundingClientRect()?.width || 0;
		const currentBottomPosInPage =  blockHeight + config.offset + ( window.pageYOffset || document.documentElement.scrollTop );

		for ( let otherIndex of ( new Set([ ...dormantIndex, ...activeIndex ]) ) ) {
			if ( container === blocks[otherIndex.toString()].container ) {
				if ( otherIndex > index ) {
					const { block: otherBlock, metadata: otherMetadata} = blocks[otherIndex.toString()];
					const otherBlockHeight = otherBlock.getBoundingClientRect()?.height || 0;

					// Check if the the blocks collide / Check if the block in on top, and not left or right.
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
 * @param {HTMLDivElement|string} containerSelector
 * @param {Object} observer
 */
const makeElementSticky = ( selector, config, containerSelector, observer ) => {

	if ( 800 > window.innerWidth && ! config.useOnMobile ) {
		return ;
	}

	const position = config?.position || 'top';
	const offset = config?.offset !== undefined ? config.offset : 40;
	const triggerLimit = 'bottom' === config?.position ? window.innerHeight - offset : 0;

	// Get node reference for the element and the container
	const elem = 'string' === typeof selector || selector instanceof String ? document.querySelector( selector ) : selector;
	const container = 'string' === typeof containerSelector || containerSelector instanceof String ? document.querySelector( containerSelector ) : containerSelector;

	// Calculate the element position in the page
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	const { top, left, height, width } = elem.getBoundingClientRect();
	const elemTopPositionInPage = top + scrollTop;
	let elemLeftPositionInPage = left + scrollLeft;
	const elemBottomPositionInPage = elemTopPositionInPage + height;

	if ( elemBottomPositionInPage < triggerLimit ) {
		console.groupCollapsed( 'Sticky Warning' );
		console.warn( elem, 'This element needs to be position lower in the page when using position \'Bottom\'. You can use position \'Top\' as an alternative.' );
		console.groupEnd();
		return;
	}

	// Calculate the container positions in the page
	const containerHeight = container?.getBoundingClientRect()?.height || 0;
	const containerTopPosition = container ? container?.getBoundingClientRect()?.top + scrollTop : 0;
	const containerBottomPosition = containerTopPosition + ( container?.getBoundingClientRect()?.height || 0 );

	// The new positions on the screen when the sticky mod is active
	const offsetY = offset;

	// We need to activate the sticky mode early for smooth transition
	const activationOffset = offset + 20;

	/*
		OBSERVER

		Register the element in observer so that it can be aware of the other sticky elements.
		The observer must be optional. The usage need to take in considaration the case in which this is
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
				( scrollBottom - activationOffset - earlyActivation > elemBottomPositionInPage ) &&
				( ! container ||  scrollBottom - activationOffset - earlyActivation < containerBottomPosition )
			)
		) {
			return 'bottom';
		}

		if ( container ) {
			if ( 'top' === position && (  scrollTop + activationOffset + height + earlyActivation > containerBottomPosition ) ) {
				return 'constrain-top';
			}

			if ( 'bottom' === position && (  scrollBottom - activationOffset - earlyActivation  >= containerBottomPosition ) ) {
				return 'constrain-bottom';
			}
		}

		return undefined;
	};

	/**
	 * By making the element sticky, we use 'fixed' positioning which removes the element from the document workflow.
	 * We need to put a placeholder with the same height and width as the element so we can keep layout flow.
	 */
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
		const stickyPosition = 'o-sticky-bhvr-stack' === config.behaviour ? getScrollActivePosition( calculateGap() ) : getScrollActivePosition();

		// Check for early activation
		if ( getScrollActivePosition( calculateEarlyActivation?.() ) ) {
			earlyActivate?.();
		} else {
			earlyDeactivate?.();
		}

		// Make the element to be over the previous one
		if ( isEarlyActivated?.() && ! isActive?.() ) {
			elem.style.position = 'relative';
			elem.style.zIndex = 9999 + ( index || 0 );
		}

		if ( stickyPosition ) {

			// Make de element sticky
			elem.classList.add( 'o-is-sticky' );
			elem.style.left = elemLeftPositionInPage + 'px';
			elem.style.width = width + 'px';
			elem.style.position = 'fixed';

			// Make the container height to be fixed
			if ( container && 'BODY' !== container.tagName ) {
				container.style.height = 0 < containerHeight ? containerHeight + 'px' : '';
			}

			// Calculate the gap for stacked elements
			const gap = 'o-sticky-bhvr-stack' === config.behaviour ? calculateGap() : 0;

			// Set the position of the element
			switch ( stickyPosition ) {
			case 'top':
				elem.style.top = ( offsetY + gap ) + 'px';
				elem.style.transform = 'unset';
				break;
			case 'bottom':
				elem.style.bottom = ( offsetY + gap ) + 'px';
				elem.style.transform = 'unset';
				break;
			case 'constrain-top':
				elem.style.top = '0px';
				elem.style.transform = `translateY(${ containerBottomPosition - height - scrollTop }px)`;
				break;
			case 'constrain-bottom':
				elem.style.bottom = '0px';
				elem.style.transformOrigin = 'left bottom';
				elem.style.transform = `translateY(${ containerBottomPosition  - scrollBottom }px)`;
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

			// Clean up the sticky option from the element when is not active
			elem.classList.remove( 'o-is-sticky' );
			elem.style.top = '';
			elem.style.left = '';
			elem.style.transform = '';
			elem.style.opacity = '';

			if ( ! isEarlyActivated?.() ) {
				elem.style.position = '';
				elem.style.zIndex = '';
			}

			removePlaceholder();
			deactivate?.();
		}

	});

	/**
	 * Update the lef position when resizing.
	 */
	window.addEventListener( 'resize', () => {
		elemLeftPositionInPage = ( isActive?.() ? placeholder : elem ).getBoundingClientRect().left + scrollLeft;
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
 * @return The configuration
 */
const getConfigOptions = ( elem ) => {
	return Array.from( elem.classList ).reduce( ( config, cssClass ) => {
		if ( cssClass.includes( 'o-sticky-pos-bottom' ) ) {
			config.position = 'bottom';
		} else if ( cssClass.includes( 'o-sticky-offset' ) ) {
			config.offset = parseInt( cssClass.split( '-' )?.pop() );
		} else if ( cssClass.includes( 'o-sticky-scope' ) ) {
			config.scope = cssClass;
		} else if ( cssClass.includes( 'o-sticky-bhvr' ) ) {
			config.behaviour = cssClass;
		} else if ( cssClass.includes( 'o-sticky-use-mobile' ) ) {
			config.useOnMobile = true;
		}
		return config;
	}, { position: 'top', offset: 40, scope: 'o-sticky-scope-main-area', behaviour: 'o-sticky-bhvr-keep', useOnMobile: false});
};

domReady( () => {
	const elems = document.querySelectorAll( '.o-sticky' );
	const observer = createObserver();

	detectLoading( () => {
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
	}, [ 'lottie' ]);


});
