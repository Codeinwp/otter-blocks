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
const isParentContainerValid = (parent: Element, cssClasses: string[]): boolean => {
	return cssClasses.some(c => parent.classList.contains(c));
}

/**
 * Get the container for the given element
 * @param elem The sticky element
 * @return The parent container. Return `body` as default
 */
const getStickyContainer = (elem: Element, scope: `o-sticky-scope-${string}`): HTMLElement => {
	let parent = elem?.parentElement;
	const sections = [];
	while (parent) {
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


		if (isParentContainerValid(
			parent,
			[
				'wp-block-themeisle-blocks-advanced-columns',
				'wp-block-group',
				'wp-block-columns'
			]
		)) {
			if ('o-sticky-scope-section' === scope) {
				return parent;
			} else if ('o-sticky-scope-main-area' === scope) {
				/**
				 * For determening the main area, we need to up trough the hierarchy to get the root parent.
				 */
				sections.push(parent);
			}
		}
		parent = parent.parentElement;
	}
	return 'o-sticky-scope-main-area' === scope ? sections.pop() : document.body;
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
}

/**
 * Get the configuration options
 * @param elem The sticky element
 * @return The configuration
 */
const getConfigOptions = (elem: Element): Config => {
	return Array.from(elem.classList).reduce((config: Config, cssClass) => {
		if (cssClass.includes('o-sticky-pos-bottom')) {
			config.position = 'bottom';
		} else if (cssClass.includes('o-sticky-offset')) {
			config.offset = parseInt(cssClass.split('-')?.pop());
		} else if (cssClass.includes('o-sticky-scope')) {
			config.scope = cssClass as `o-sticky-scope-${string}`;
		} else if (cssClass.includes('o-sticky-bhvr')) {
			config.behaviour = cssClass as `o-sticky-bhvr-${string}`;
		} else if (cssClass.includes('o-sticky-use-mobile')) {
			config.useOnMobile = true;
		} else if (cssClass.includes('o-sticky-float')) {
			config.isFloatMode = true;
		} else if (cssClass.includes('o-sticky-width')) {
			config.width = cssClass.split('-')?.pop();
		} else if (cssClass.includes('o-sticky-opt-side-offset')) {
			config.sideOffset = cssClass.split('-')?.pop();
		} else if (cssClass.includes('o-sticky-side-right')) {
			config.side = 'right';
		}
		return config;
	}, { position: 'top', offset: 40, scope: 'o-sticky-scope-main-area', behaviour: 'o-sticky-bhvr-keep', useOnMobile: false, isFloatMode: false, width: '100%', sideOffset: '20px', side: 'left'} );
};

const positions = {
	NONE: 'none',
	TOP: 'top',
	BOTTOM: 'bottom',
	CONSTRAIN_TOP: 'constrain-top',
	CONSTRAIN_BOTTOM: 'constrain-bottom'
};

type Position = keyof typeof positions;

class StickyData {

	readonly config: Config
	readonly selector: HTMLDivElement | string
	readonly containerSelector: HTMLDivElement | string
	index: number
	status: 'active' | 'dormant' | 'inactive'
	isActive: boolean
	isDormant: boolean
	positionStatus: typeof positions[Position]
	triggerLimit: number
	elem: HTMLDivElement
	container: HTMLDivElement
	scrollTop: number
	scrollLeft: number
	elemTopPositionInPage: number
	elemLeftPositionInPage: number
	elemBottomPositionInPage: number
	containerHeight: number
	containerTopPosition: number
	containerBottomPosition: number
	offsetY: number
	activationOffset: number
	width: number
	height: number
	placeholder: HTMLDivElement

	/**
	 * Create the sticky data container for the element.
	 * 
	 * @param selector The selector for the sticky data container.
	 * @param config The configuration for the sticky data container.
	 * @param containerSelector The container selector for the sticky data container.
	 * @returns 
	 */
	constructor(selector: HTMLDivElement | string, config: Config, containerSelector: HTMLDivElement | string) {

		this.config = config;
		this.selector = selector;
		this.containerSelector = containerSelector;

		this.index = -1;
		this.isActive = false;
		this.isDormant = true;
		this.positionStatus = positions.NONE;
		this.status = 'inactive';

		this.triggerLimit = 'bottom' === config?.position ? window.innerHeight - this.offset : 0;

		// Get node reference for the element and the container
		this.elem = 'string' === typeof selector ? document.querySelector(selector) : selector;
		this.container = 'string' === typeof containerSelector ? document.querySelector(containerSelector) : containerSelector;

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

		if (this.elemBottomPositionInPage < this.triggerLimit) {
			console.groupCollapsed('Sticky Warning');
			console.warn(this.elem, 'This element needs to be position lower in the page when using position \'Bottom\'. You can use position \'Top\' as an alternative.');
			console.groupEnd();
			return;
		}

		// Calculate the container positions in the page
		this.containerHeight = this.container?.getBoundingClientRect()?.height || 0;
		this.containerTopPosition = this.container ? this.container?.getBoundingClientRect()?.top + this.scrollTop : 0;
		this.containerBottomPosition = this.containerTopPosition + (this.container?.getBoundingClientRect()?.height || 0);

		// The new positions on the screen when the sticky mod is active
		this.offsetY = this.offset;

		// We need to activate the sticky mode early for smooth transition
		this.activationOffset = this.offset + 20;

		/**
		 * By making the element sticky, we use 'fixed' positioning which removes the element from the document workflow.
		 * We need to put a placeholder with the same height and width as the element so we can keep layout flow.
		 */
		this.placeholder = document.createElement('div');
		this.placeholder.style.height = height + 'px';
		this.placeholder.style.width = width + 'px';

		// Styling
		this.elem.style.wordBreak = 'break-word';
		this.elem.classList.remove('o-sticky-float');
	}

	get position() {
		return this.config.position || 'top'
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
}

class StickyRunner {

	/**
	 * The id will be used to uniquely identify the sticky elements and their order in page.
	 */
	idGenerator: number
	stickyElems: StickyData[];

	constructor() {
		this.idGenerator = 0;
		this.stickyElems = [];
	}

	/**
	 * Register a new sticky element.
	 *
	 * @param stickyElem The sticky element to register.
	 */
	register(stickyElem: StickyData) {
		stickyElem.index = this.idGenerator;
		this.stickyElems.push(stickyElem);
		this.idGenerator++;
	}

	/**
	 * Run all the processes.
	 */
	run() {
		this.stickyElems.forEach(s => this.update(s));
		this.stickyElems.forEach(s => this.align(s));
	}

	/**
	 * Update the data for the sticky elements.
	 *
	 * @param stickyElem The sticky element to update.
	 */
	update(stickyElem: StickyData) {

		// DEBUG
		// @ts-ignore
		if (window?.debugSticky) {
			if (stickyElem.container) {
				stickyElem.container.style.border = '1px dashed black';
			}
			stickyElem.elem.style.border = '1px dashed red';
		}

		stickyElem.status = 'inactive';

		/**
		 * Check for early activation
		 * 
		 * A dormant sticky element is an element that is going to be activated very soon.
		 * This is used for making additonal preparation before the other will become active, like calculation the opacity for the fade effect (the element will go transparent before the next element is activated).
		 */
		 if (this.getCurrentPosition(stickyElem, this.calculateEarlyActivation(stickyElem))) {
			stickyElem.status = 'dormant';
		} 

		// Check if the scroll with the activation offset has passed the top of the element
		stickyElem.positionStatus = this.getCurrentPosition(stickyElem, 'o-sticky-bhvr-stack' === stickyElem.config.behaviour ? this.calculateGap(stickyElem) : 0);
		if( stickyElem.positionStatus !== positions.NONE) {
			stickyElem.status = 'active';
		}
	}

	/**
	 * Align the sticky element.
	 *
	 * @param stickyElem The sticky element to align.
	 */
	align(stickyElem: StickyData) {
		if (stickyElem.status === 'inactive') {
			stickyElem.elem.style.position = 'relative';
			stickyElem.elem.style.zIndex = (9999 + (stickyElem.index || 0)).toString();
		}

		if (stickyElem.status === 'active') {

			if( ! stickyElem.config.isFloatMode ) {
				stickyElem.elem.style.transition = 'transform 2s';
			}

			// Make de element sticky
			stickyElem.elem.classList.add('o-is-sticky');
			stickyElem.elem.style.width = stickyElem.displayWidth;
			stickyElem.elem.style.position = 'fixed';

			// Make the container height to be fixed
			if (stickyElem.container && 'BODY' !== stickyElem.container.tagName) {
				stickyElem.container.style.height = 0 < stickyElem.containerHeight ? stickyElem.containerHeight + 'px' : '';
			}

			// Calculate the gap for stacked elements
			const gap = 'o-sticky-bhvr-stack' === stickyElem.config.behaviour ? this.calculateGap(stickyElem) : 0;
			// Get the scroll values
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const scrollBottom = scrollTop + window.innerHeight;

			/**
			 * Aling on vertical axis
			 */
			if( stickyElem.config.isFloatMode ) {
				console.log(stickyElem.sideOffset,stickyElem.sideOffset.includes('%') , parseInt(stickyElem.sideOffset) >= 100)
				if( ! stickyElem.elem.classList.contains('alignfull') ) {
					if( stickyElem.side === 'left') {
						stickyElem.elem.style.left = stickyElem.sideOffset;
					} else {
						stickyElem.elem.style.right = stickyElem.sideOffset;
					}
				}
				
			} else {
				stickyElem.elem.style.left = stickyElem.elemLeftPositionInPage + 'px';
			}

			/**
			 * Align on vertical axis.
			 */
			switch (stickyElem.positionStatus) {
				case positions.TOP:
					stickyElem.elem.style.top = '0px';
					stickyElem.elem.style.transform = `translateY(${(stickyElem.offsetY + gap)}px)`;
					break;
				case positions.BOTTOM:
					stickyElem.elem.style.bottom = (stickyElem.offsetY + gap) + 'px';
					stickyElem.elem.style.transform = 'unset';
					break;
				case positions.CONSTRAIN_TOP:
					stickyElem.elem.style.top = '0px';
					stickyElem.elem.style.transform = `translateY(${stickyElem.containerBottomPosition - stickyElem.height - scrollTop}px)`;
					break;
				case positions.CONSTRAIN_BOTTOM:
					stickyElem.elem.style.bottom = '0px';
					stickyElem.elem.style.transformOrigin = 'left bottom';
					stickyElem.elem.style.transform = `translateY(${stickyElem.containerBottomPosition - scrollBottom}px)`;
					break;
				default:
					console.warn('Unknown position', stickyElem.positionStatus);
			}
			this.insertPlaceholder(stickyElem);

			if ('o-sticky-bhvr-hide' === stickyElem.config.behaviour) {
				stickyElem.elem.style.opacity = easeOutQuad(this.calculateOpacity(stickyElem)).toString();
			}
		} else {
			stickyElem.isActive = false;

			// Clean up the sticky option from the element when is not active
			stickyElem.elem.classList.remove('o-is-sticky');
			stickyElem.elem.style.top = '';
			stickyElem.elem.style.left = '';
			stickyElem.elem.style.transform = '';
			stickyElem.elem.style.opacity = '';
			stickyElem.elem.style.width = '';
			stickyElem.elem.style.transition = '';

			if (stickyElem.status !== 'inactive') {
				stickyElem.elem.style.position = '';
				stickyElem.elem.style.zIndex = '';
			}

			this.removePlaceholder(stickyElem);
		}
	}

	/**
	 * Update the left position of the sticky element.
	 */
	resize() {
		for (const sticky of this.stickyElems) {
			sticky.elemLeftPositionInPage = (sticky.isActive ? sticky.placeholder : sticky.elem).getBoundingClientRect().left + sticky.scrollLeft;
		}
	}

	/**
	 * Insert the placeholder.
	 *
	 * @param stickyElem The sticky element to insert placeholder.
	 */
	insertPlaceholder(stickyElem: StickyData) {
		if (!stickyElem.config.isFloatMode && !stickyElem.elem.parentElement.contains(stickyElem.placeholder)) {
			stickyElem.elem.parentElement.insertBefore(stickyElem.placeholder, stickyElem.elem);
		}
	}

	/**
	 * Remove the placeholder.
	 *
	 * @param stickyElem The sticky element to remove placeholder.
	 */
	removePlaceholder(stickyElem: StickyData) {
		if ( !stickyElem.config.isFloatMode && stickyElem.elem.parentElement.contains(stickyElem.placeholder)) {
			stickyElem.elem.parentElement.removeChild(stickyElem.placeholder);
		}
	}

	/**
	 * Get the sticky element current position.
	 *
	 * @param stickyElem The sticky element.
	 * @param earlyActivation Add on offset to activate eraly in case of multiple sticky elements.
	 * @returns
	 */
	getCurrentPosition(stickyElem: StickyData, earlyActivation: number = 0): string {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollBottom = scrollTop + window.innerHeight;

		if ('top' === stickyElem.position &&
			((
				(scrollTop + stickyElem.activationOffset + earlyActivation > stickyElem.elemTopPositionInPage) &&
				(!stickyElem.container || scrollTop + stickyElem.activationOffset + stickyElem.height + earlyActivation < stickyElem.containerBottomPosition)
			) || stickyElem.config.isFloatMode)
		) {
			return positions.TOP;
		}

		if ('bottom' === stickyElem.position &&
			((
				(scrollBottom - stickyElem.activationOffset - earlyActivation > stickyElem.elemBottomPositionInPage) &&
				(!stickyElem.container || scrollBottom - stickyElem.activationOffset - earlyActivation < stickyElem.containerBottomPosition)
			) || stickyElem.config.isFloatMode)
		) {
			return positions.BOTTOM;
		}

		if (stickyElem.container) {
			if ('top' === stickyElem.position && ((scrollTop + stickyElem.activationOffset + stickyElem.height + earlyActivation > stickyElem.containerBottomPosition) || stickyElem.config.isFloatMode)) {
				return positions.CONSTRAIN_TOP;
			}

			if ('bottom' === stickyElem.position && ((scrollBottom - stickyElem.activationOffset - earlyActivation >= stickyElem.containerBottomPosition) || stickyElem.config.isFloatMode)) {
				return positions.CONSTRAIN_BOTTOM;
			}
		}

		return positions.NONE;
	}

	/**
	 *
	 * Calculate the gap between sticky element and the other that are before him in the same container.
	 *
	 * @param stickyElem The sticky element.
	 */
	calculateGap(stickyElem: StickyData) {
		let gap = 0;
		const blockWidth = stickyElem.elem.getBoundingClientRect()?.width || 0;

		for (const other of this.active) {
			if (other.index !== stickyElem.index && other.container === stickyElem.container) {
				if (other.index < stickyElem.index) {
					if ('o-sticky-bhvr-stack' === other.config?.behaviour && blockWidth > Math.abs(stickyElem.elemLeftPositionInPage - other.elemLeftPositionInPage)) {
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
	 * @param stickyElem The sticky element.
	 * @returns
	 */
	calculateEarlyActivation(stickyElem: StickyData): number {
		let gap = 0;

		for (const other of this.active) {
			if (other.index !== stickyElem.index) {
				if (other.index < stickyElem.index) {
					gap += other.activationOffset + (other.elem?.getBoundingClientRect()?.height || 0);
				}
			}
		}

		return gap;
	}

	/**
	 * Calculate the opacity for the fade effect.
	 *
	 * @param stickyElem The sticky element to calculate the opacity.
	 * @returns
	 */
	calculateOpacity(stickyElem: StickyData): number {
		let opacity = 1;

		const blockHeight = stickyElem.elem.getBoundingClientRect()?.height || 0;
		const blockWidth = stickyElem.elem.getBoundingClientRect()?.width || 0;
		const currentBottomPosInPage = blockHeight + stickyElem.config.offset + (window.pageYOffset || document.documentElement.scrollTop);

		for (const other of [...this.dormant, ...this.active]) {
			if (other.index === stickyElem.index) {
				continue;
			}
			if (stickyElem.container === other.container) {
				if (other.index > stickyElem.index) {
					const otherBlockHeight = other.elem.getBoundingClientRect()?.height || 0;

					// Check if the the blocks collide / Check if the block in on top, and not left or right.
					if (blockWidth > Math.abs(stickyElem.elemLeftPositionInPage - other.elemLeftPositionInPage)) {
						const height = Math.min(blockHeight, otherBlockHeight);
						opacity = Math.min(1, Math.max(0, other.elemTopPositionInPage + height - currentBottomPosInPage) / height);
						return opacity;
					}
				}
			}
		}

		return opacity;
	}

	/**
	 * Get the active sticky elements.
	 *
	 * @returns
	 */
	get active(): StickyData[] {
		return this.stickyElems.filter(stickyElem => stickyElem.status === 'active');
	}

	/**
	 * Get the dormant sticky elements.
	 *
	 * @returns
	 */
	get dormant(): StickyData[] {
		return this.stickyElems.filter(stickyElem => stickyElem.status === 'dormant');
	}
}

domReady(() => {
	const elems = document.querySelectorAll('.o-sticky');

	let styles = `
		.o-is-sticky {
			position: fixed;
			z-index: 9999;
		}
	`;

	styles = styles.replace(/(\r\n|\n|\r|\t)/gm, '');

	let hasStyles = false;

	detectLoading(() => {

		const runner = new StickyRunner();

		elems.forEach((elem) => {
			if (!hasStyles) {
				const styleSheet = document.createElement('style');
				styleSheet.innerText = styles;
				document.head.appendChild(styleSheet);
				hasStyles = true;
			}

			const config = getConfigOptions(elem);
			const container = getStickyContainer(elem, config.scope);

			runner.register(new StickyData(
				elem as HTMLDivElement,
				config,
				container as HTMLDivElement
			));
		});

		runner.run();

		window.addEventListener('scroll', () => {
			runner.run();
		});

		window.addEventListener('resize', () => {
			runner.resize();
		});
	}, ['lottie']);
});
