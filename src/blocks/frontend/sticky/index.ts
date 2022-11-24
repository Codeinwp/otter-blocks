/**
 * Internal dependencies.
 */
import { detectLoading } from '../../helpers/detect-loading.js';

import {
	domReady,
	easeOutQuad
} from '../../helpers/frontend-helper-functions.js';


// Testing purpose
// We can make elem sticky in browser for testing various scenario with different blocks
// @ts-ignore
window.debugSticky = false;

/**
 * Check if the element can be a sticky container.
 *
 * @param parent The parent element to check.
 * @param cssClasses The CSS classes to check.
 * @returns
 */
const isParentContainerValid = ( parent: Element, cssClasses: string[]): boolean => {
	return cssClasses.some( c => parent.classList.contains( c ) );
};

/**
 * Get the container for the given element
 * @param elem The sticky element
 * @return The parent container. Return `body` as default
 */
const getStickyContainer = ( elem: Element, scope: `o-sticky-scope-${string}` ): HTMLElement => {
	let parent = elem?.parentElement;
	const sections = [];
	while ( parent ) {
		if (
			isParentContainerValid(
				parent,
				[
					'wp-block-themeisle-blocks-advanced-column',
					'wp-block-group',
					'wp-block-column'
				]
			) &&
			'o-sticky-scope-parent' === scope
		) {
			return parent;
		}


		if ( isParentContainerValid(
			parent,
			[
				'wp-block-themeisle-blocks-advanced-columns',
				'wp-block-group',
				'wp-block-columns'
			]
		) ) {
			if ( 'o-sticky-scope-section' === scope ) {
				return parent;
			} else if ( 'o-sticky-scope-main-area' === scope ) {

				/**
				 * For determening the main area, we need to up trough the hierarchy to get the root parent.
				 */
				sections.push( parent );
			}
		}
		parent = parent.parentElement;
	}
	return 'o-sticky-scope-main-area' === scope && 0 < sections.length ? sections.pop() as HTMLElement : document.body;
};

type Config = {
	position: 'top' | 'bottom'
	offset: number
	scope: `o-sticky-scope-${string}`
	behaviour: `o-sticky-bhvr-${string}`
	useOnMobile: boolean
	isFloatMode: boolean
	width: string
	sideOffset: string
	side: 'left' | 'right'
	isBannerMode: boolean
	bannerGap: string
}

/**
 * Get the configuration options
 * @param elem The sticky element
 * @return The configuration
 */
const getConfigOptions = ( elem: Element ): Config => {
	return Array.from( elem.classList ).reduce( ( config: Config, cssClass ) => {
		if ( cssClass.includes( 'o-sticky-pos-bottom' ) ) {
			config.position = 'bottom';
		} else if ( cssClass.includes( 'o-sticky-offset' ) ) {
			config.offset = parseInt( cssClass.split( '-' )?.pop() ?? '40' );
		} else if ( cssClass.includes( 'o-sticky-scope' ) ) {
			config.scope = cssClass as `o-sticky-scope-${string}`;
		} else if ( cssClass.includes( 'o-sticky-bhvr' ) ) {
			config.behaviour = cssClass as `o-sticky-bhvr-${string}`;
		} else if ( cssClass.includes( 'o-sticky-use-mobile' ) ) {
			config.useOnMobile = true;
		} else if ( cssClass.includes( 'o-sticky-float' ) ) {
			config.isFloatMode = true;
		} else if ( cssClass.includes( 'o-sticky-width' ) ) {
			config.width = cssClass.split( '-' ).pop() as string;
		} else if ( cssClass.includes( 'o-sticky-opt-side-offset' ) ) {
			config.sideOffset = cssClass.split( '-' ).pop() as string;
		} else if ( cssClass.includes( 'o-sticky-side-right' ) ) {
			config.side = 'right';
		} else if ( cssClass.includes( 'o-sticky-banner-mode' ) ) {
			config.isBannerMode = true;
		} else if ( cssClass.includes( 'o-sticky-banner-gap' ) ) {
			config.bannerGap = cssClass.split( '-' ).pop() as string;
		}
		return config;
	}, { position: 'top', offset: 40, scope: 'o-sticky-scope-main-area', behaviour: 'o-sticky-bhvr-keep', useOnMobile: false, isFloatMode: false, width: '100%', sideOffset: '20px', side: 'left', isBannerMode: false, bannerGap: '' });
};

const positions = {
	NONE: 'none',
	TOP: 'top',
	BOTTOM: 'bottom',
	CONSTRAIN_TOP: 'constrain-top',
	CONSTRAIN_BOTTOM: 'constrain-bottom'
};

type Position = keyof typeof positions;

let stickyId = 0;

class StickyData {

	readonly index: number;
	readonly config: Config;
	readonly selector: HTMLDivElement | string;
	readonly containerSelector: HTMLDivElement | string;
	orderInPage: number;
	status: 'active' | 'dormant' | 'inactive' | 'hidden';
	isActive: boolean;
	isDormant: boolean;
	positionStatus: typeof positions[Position];
	triggerLimit: number;
	elem: HTMLDivElement;
	container: HTMLDivElement;
	scrollTop: number;
	scrollLeft: number;
	elemTopPositionInPage: number;
	elemLeftPositionInPage: number;
	elemBottomPositionInPage: number;
	containerHeight: number;
	containerTopPosition: number;
	containerBottomPosition: number;
	offsetY: number;
	activationOffset: number;
	width: number;
	height: number;
	placeholder: HTMLDivElement;
	stylingNodeName: `o-sticky-node-${typeof this.index}`;
	stylingNode: HTMLStyleElement;

	/**
	 * Create the sticky data container for the element.
	 *
	 * @param selector The selector for the sticky data container.
	 * @param config The configuration for the sticky data container.
	 * @param containerSelector The container selector for the sticky data container.
	 * @returns
	 */
	constructor( selector: HTMLDivElement | string, config: Config, containerSelector: HTMLDivElement | string ) {

		this.index = stickyId++;
		this.config = config;
		this.selector = selector;
		this.containerSelector = containerSelector;

		this.orderInPage = -1;
		this.isActive = false;
		this.isDormant = true;
		this.positionStatus = positions.NONE;
		this.status = 'inactive';

		this.triggerLimit = 'bottom' === config?.position ? window.innerHeight - this.offset : 0;

		// Get node reference for the element and the container
		this.elem = 'string' === typeof selector ? document.querySelector( selector ) as HTMLDivElement  : selector;
		this.container = 'string' === typeof containerSelector ? document.querySelector( containerSelector ) as HTMLDivElement : containerSelector;

		// Calculate the element position in the page
		this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		this.scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
		const { top, left, height, width } = this.elem.
			getBoundingClientRect();

		this.width = width;
		this.height = height;

		this.elemTopPositionInPage = top + this.scrollTop;
		this.elemLeftPositionInPage = left + this.scrollLeft;
		this.elemBottomPositionInPage = this.elemTopPositionInPage + height;

		// Calculate the container positions in the page
		this.containerHeight = this.container?.getBoundingClientRect()?.height || 0;
		this.containerTopPosition = this.container ? this.container?.getBoundingClientRect()?.top + this.scrollTop : 0;
		this.containerBottomPosition = this.containerTopPosition + ( this.container?.getBoundingClientRect()?.height || 0 );

		// The new positions on the screen when the sticky mod is active
		this.offsetY = this.offset;

		// We need to activate the sticky mode early for smooth transition
		this.activationOffset = this.offset + 20;

		/**
		 * By making the element sticky, we use 'fixed' positioning which removes the element from the document workflow.
		 * We need to put a placeholder with the same height and width as the element so we can keep layout flow.
		 */
		this.placeholder = document.createElement( 'div' );
		this.placeholder.style.height = height + 'px';
		this.placeholder.style.width = width + 'px';

		// Styling
		this.elem.classList.remove( 'o-sticky-float' );

		this.stylingNodeName = `o-sticky-node-${this.index}`;
		this.stylingNode = document.createElement( 'style' );
		document.head.appendChild( this.stylingNode );

		if ( config.isBannerMode && 'top' === config.position ) {
			document.body.style.marginTop = config.bannerGap ? config.bannerGap : this.height + 'px';
		}
	}

	get canBeRun() {
		return this.elemBottomPositionInPage > this.triggerLimit;
	}

	get position() {
		return this.config.position || 'top';
	}

	get offset() {
		return this.config?.offset !== undefined ? this.config.offset : 40;
	}

	get side() {
		return this.config?.side ?? 'left';
	}

	get sideOffset() {
		return this.config.sideOffset;
	}

	get displayWidth() {
		return this.config?.isFloatMode ? this.config.width : this.width + 'px';
	}

	set styling( content: string ) {
		this.stylingNode.innerHTML = `
		.${this.stylingNodeName} {
			word-break: break-all;
			${content}
		}
	`;
	}
}

class StickyRunner {

	/**
	 * The id will be used to uniquely identify the sticky elements and their order in page.
	 */
	orderInPageCounter: number;
	items: StickyData[];

	constructor() {
		this.orderInPageCounter = 0;
		this.items = [];
	}

	/**
	 * Register a new sticky element.
	 *
	 * @param stickyElem The sticky element to register.
	 */
	register( stickyElem: StickyData ) {
		if ( ! stickyElem.elem ) {
			return;
		}

		if ( ! stickyElem.canBeRun ) {
			console.groupCollapsed( 'Sticky Warning' );
			console.warn( stickyElem.elem, 'This element needs to be position lower in the page when using position \'Bottom\'. You can use position \'Top\' as an alternative.' );
			console.groupEnd();
			return;
		}

		this.bindCloseButton( stickyElem );

		stickyElem.orderInPage = this.orderInPageCounter;
		this.items.push( stickyElem );
		this.orderInPageCounter++;
	}

	/**
	 * Run all the processes.
	 */
	run() {
		this.items.forEach( s => s.elem && this.update( s ) );
		this.items.forEach( s => s.elem && this.align( s ) );

		this.toggleGlobalClass( 0 < this.active.length );
	}

	/**
	 * Update the data for the sticky elements.
	 *
	 * @param sticky The sticky element to update.
	 */
	update( sticky: StickyData ) {

		// DEBUG
		// @ts-ignore
		if ( window?.debugSticky ) {
			if ( sticky.container ) {
				sticky.container.style.border = '1px dashed black';
			}
			sticky.elem.style.border = '1px dashed red';
		}

		if ( 'hidden' === sticky.status ) {
			return;
		}

		sticky.status = 'inactive';

		/**
		 * Check for early activation
		 *
		 * A dormant sticky element is an element that is going to be activated very soon.
		 * This is used for making additonal preparation before the other will become active, like calculation the opacity for the fade effect (the element will go transparent before the next element is activated).
		 */
		if ( this.getCurrentPosition( sticky, this.calculateEarlyActivation( sticky ) ) ) {
			sticky.status = 'dormant';
		}

		// Check if the scroll with the activation offset has passed the top of the element
		sticky.positionStatus = this.getCurrentPosition( sticky, 'o-sticky-bhvr-stack' === sticky.config.behaviour ? this.calculateGap( sticky ) : 0 );
		if ( sticky.positionStatus !== positions.NONE ) {
			sticky.status = 'active';
		}
	}

	/**
	 * Align the sticky element.
	 *
	 * @param sticky The sticky element to align.
	 */
	align( sticky: StickyData ) {

		if ( 800 > window.innerWidth && ! sticky.config.useOnMobile ) {
			return;
		}

		const cssStyling: string[] = [];

		if ( 'inactive' === sticky.status ) {
			cssStyling.push( 'position: relative !important' );
			cssStyling.push( `z-index: ${( 9999 + ( sticky.orderInPage || 0 ) ).toString()}` );
		}

		if ( 'active' === sticky.status ) {

			// Make de element sticky
			sticky.elem.classList.add( 'o-is-sticky' );


			if ( ! sticky.config.isFloatMode ) {
				cssStyling.push( 'transition: transform 2s' );
			}

			cssStyling.push( `width: ${sticky.displayWidth} !important` );
			cssStyling.push( 'position: fixed !important' );

			// Make the container height to be fixed
			if ( sticky.container && 'BODY' !== sticky.container.tagName ) {
				sticky.container.style.height = 0 < sticky.containerHeight ? sticky.containerHeight + 'px' : '';
			}

			// Calculate the gap for stacked elements
			const gap = 'o-sticky-bhvr-stack' === sticky.config.behaviour ? this.calculateGap( sticky ) : 0;

			// Get the scroll values
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const scrollBottom = scrollTop + window.innerHeight;

			/**
			 * Aling on vertical axis
			 */
			if ( sticky.config.isFloatMode ) {

				let offset = sticky.sideOffset;

				if ( sticky.elem.classList.contains( 'alignfull' ) && sticky.displayWidth.includes( '100%' )  ) {
					offset = '';

					// Execeptions
					if ( 'neve_body' === document.body.id ) {
						offset = offset = '0px';
					}
				}

				if ( '' !== offset ) {
					if ( 'left' === sticky.side ) {
						cssStyling.push( `left: ${sticky.sideOffset}` );
					} else {
						cssStyling.push( `right: ${sticky.sideOffset}` );
					}
				}
			} else {
				cssStyling.push( `left: ${sticky.elemLeftPositionInPage}px` );
			}

			/**
			 * Align on vertical axis.
			 */
			switch ( sticky.positionStatus ) {
			case positions.TOP:
				cssStyling.push( 'top: 0px' );
				cssStyling.push( `transform: translateY(${( sticky.offsetY + gap )}px)` );
				break;
			case positions.BOTTOM:
				cssStyling.push( `bottom: ${sticky.offsetY + gap}px` );
				cssStyling.push( 'transform: unset' );
				break;
			case positions.CONSTRAIN_TOP:
				cssStyling.push( 'top: 0px' );
				cssStyling.push( `transform: translateY(${( sticky.containerBottomPosition - sticky.height - scrollTop )}px)` );
				break;
			case positions.CONSTRAIN_BOTTOM:
				cssStyling.push( 'bottom: 0px' );
				cssStyling.push( 'transform-origin: left bottom' );
				cssStyling.push( `transform: translateY(${sticky.containerBottomPosition - scrollBottom}px)` );
				break;
			default:
				console.warn( 'Unknown position', sticky.positionStatus );
			}
			this.insertPlaceholder( sticky );

			if ( 'o-sticky-bhvr-hide' === sticky.config.behaviour ) {
				cssStyling.push( `opacity: ${easeOutQuad( this.calculateOpacity( sticky ) ).toString()}` );
			}

		} else {
			sticky.isActive = false;

			// Clean up the sticky option from the element when is not active
			sticky.elem.classList.remove( 'o-is-sticky' );
			this.removePlaceholder( sticky );
		}

		sticky.styling = cssStyling.join( ';\n' );

		if ( sticky.isActive || sticky.isDormant ) {
			sticky.elem.classList.add( sticky.stylingNodeName );
		} else {
			sticky.elem.classList.remove( sticky.stylingNodeName );
		}
	}

	/**
	 * Update the left position of the sticky element.
	 */
	resize() {
		for ( const sticky of this.items ) {
			sticky.elemLeftPositionInPage = ( sticky.isActive ? sticky.placeholder : sticky.elem ).getBoundingClientRect().left + sticky.scrollLeft;
		}
	}

	/**
	 * Insert the placeholder.
	 *
	 * @param sticky The sticky element to insert placeholder.
	 */
	insertPlaceholder( sticky: StickyData ) {
		if ( ! sticky.config.isFloatMode && ! sticky.elem?.parentElement?.contains( sticky.placeholder ) ) {
			sticky.elem?.parentElement?.insertBefore( sticky.placeholder, sticky.elem );
		}
	}

	/**
	 * Remove the placeholder.
	 *
	 * @param sticky The sticky element to remove placeholder.
	 */
	removePlaceholder( sticky: StickyData ) {
		if ( ! sticky.config.isFloatMode && sticky.elem?.parentElement?.contains( sticky.placeholder ) ) {
			sticky.elem.parentElement.removeChild( sticky.placeholder );
		}
	}

	/**
	 * Get the sticky element current position.
	 *
	 * @param sticky The sticky element.
	 * @param earlyActivation Add on offset to activate eraly in case of multiple sticky elements.
	 * @returns
	 */
	getCurrentPosition( sticky: StickyData, earlyActivation: number = 0 ): typeof positions[Position] {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollBottom = scrollTop + window.innerHeight;

		if ( 'top' === sticky.position &&
			( (
				( scrollTop + sticky.activationOffset + earlyActivation > sticky.elemTopPositionInPage ) &&
				( ! sticky.container || scrollTop + sticky.activationOffset + sticky.height + earlyActivation < sticky.containerBottomPosition )
			) || sticky.config.isFloatMode )
		) {
			return positions.TOP;
		}

		if ( 'bottom' === sticky.position &&
			( (
				( scrollBottom - sticky.activationOffset - earlyActivation > sticky.elemBottomPositionInPage ) &&
				( ! sticky.container || scrollBottom - sticky.activationOffset - earlyActivation < sticky.containerBottomPosition )
			) || sticky.config.isFloatMode )
		) {
			return positions.BOTTOM;
		}

		if ( sticky.container ) {
			if ( 'top' === sticky.position && ( ( scrollTop + sticky.activationOffset + sticky.height + earlyActivation > sticky.containerBottomPosition ) || sticky.config.isFloatMode ) ) {
				return positions.CONSTRAIN_TOP;
			}

			if ( 'bottom' === sticky.position && ( ( scrollBottom - sticky.activationOffset - earlyActivation >= sticky.containerBottomPosition ) || sticky.config.isFloatMode ) ) {
				return positions.CONSTRAIN_BOTTOM;
			}
		}

		return positions.NONE;
	}

	/**
	 *
	 * Calculate the gap between sticky element and the other that are before him in the same container.
	 *
	 * @param sticky The sticky element.
	 */
	calculateGap( sticky: StickyData ): number {
		let gap = 0;
		const blockWidth = sticky.elem.getBoundingClientRect()?.width || 0;

		for ( const other of this.active ) {
			if ( other.orderInPage !== sticky.orderInPage && other.container === sticky.container ) {
				if ( other.orderInPage < sticky.orderInPage ) {
					if ( 'o-sticky-bhvr-stack' === other.config?.behaviour && blockWidth > Math.abs( sticky.elemLeftPositionInPage - other.elemLeftPositionInPage ) ) {
						gap += other.offset + other?.elem.getBoundingClientRect()?.height || 0;
					}
				}
			}
		}

		return gap;
	}

	/**
	 * Calculate the gap between the sticky element and other before him that are active.
	 *
	 * @param sticky The sticky element.
	 * @returns
	 */
	calculateEarlyActivation( sticky: StickyData ): number {
		let gap = 0;

		for ( const other of this.active ) {
			if ( other.orderInPage !== sticky.orderInPage ) {
				if ( other.orderInPage < sticky.orderInPage ) {
					gap += other.activationOffset + ( other.elem?.getBoundingClientRect()?.height || 0 );
				}
			}
		}

		return gap;
	}

	/**
	 * Calculate the opacity for the fade effect.
	 *
	 * @param sticky The sticky element to calculate the opacity.
	 * @returns
	 */
	calculateOpacity( sticky: StickyData ): number {
		let opacity = 1;

		const blockHeight = sticky.elem.getBoundingClientRect()?.height || 0;
		const blockWidth = sticky.elem.getBoundingClientRect()?.width || 0;
		const currentBottomPosInPage = blockHeight + sticky.config.offset + ( window.pageYOffset || document.documentElement.scrollTop );

		for ( const other of [ ...this.dormant, ...this.active ]) {
			if ( other.orderInPage === sticky.orderInPage ) {
				continue;
			}
			if ( sticky.container === other.container ) {
				if ( other.orderInPage > sticky.orderInPage ) {
					const otherBlockHeight = other.elem.getBoundingClientRect()?.height || 0;

					// Check if the the blocks collide / Check if the block in on top, and not left or right.
					if ( blockWidth > Math.abs( sticky.elemLeftPositionInPage - other.elemLeftPositionInPage ) ) {
						const height = Math.min( blockHeight, otherBlockHeight );
						opacity = Math.min( 1, Math.max( 0, other.elemTopPositionInPage + height - currentBottomPosInPage ) / height );
						return opacity;
					}
				}
			}
		}

		return opacity;
	}

	toggleGlobalClass( value: boolean ) {
		document.body.classList.toggle( 'o-sticky-is-active', value );
	}

	bindCloseButton( sticky: StickyData ) {
		if ( ! sticky.config.isFloatMode ) {
			return;
		}

		const classes = sticky.elem.querySelectorAll( '.o-sticky-close' );
		const anchors = sticky.elem.querySelectorAll( 'a[href=\'#o-sticky-close\']' );

		[ ...Array.from( classes ), ...Array.from( anchors ) ].forEach( elm => {
			elm.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				sticky.status = 'hidden';
				sticky.elem.classList.add( 'o-is-close' );
			});
		});
	}

	/**
	 * Get the active sticky elements.
	 *
	 * @returns
	 */
	get active(): StickyData[] {
		return this.items.filter( stickyElem => 'active' === stickyElem.status );
	}

	/**
	 * Get the dormant sticky elements.
	 *
	 * @returns
	 */
	get dormant(): StickyData[] {
		return this.items.filter( stickyElem => 'dormant' === stickyElem.status );
	}

	get isEmpty(): boolean {
		return 0 === this.items.length;
	}
}

domReady( () => {
	const elems = document.querySelectorAll( '.o-sticky' );

	let styles = `
		.o-is-sticky {
			position: fixed;
			z-index: 9999;
		}
		.o-is-close {
			display: none;
		}
	`;

	styles = styles.replace( /(\r\n|\n|\r|\t)/gm, '' );

	let hasStyles = false;

	detectLoading( () => {

		const runner = new StickyRunner();

		elems.forEach( ( elem ) => {
			try {
				if ( ! hasStyles ) {
					const styleSheet = document.createElement( 'style' );
					styleSheet.innerText = styles;
					document.head.appendChild( styleSheet );
					hasStyles = true;
				}

				const config = getConfigOptions( elem );
				const container = getStickyContainer( elem, config.scope );

				runner.register( new StickyData(
					elem as HTMLDivElement,
					config,
					container as HTMLDivElement
				) );
			} catch ( error ) {
				console.error( error );
			}
		});

		if ( ! runner.isEmpty ) {
			runner.run();

			window.addEventListener( 'scroll', () => {
				runner.run();
			});

			window.addEventListener( 'resize', () => {
				runner.resize();
			});
		}
	}, [ 'lottie' ]);
});
