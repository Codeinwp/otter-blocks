class PopupBlock {

	element: HTMLDivElement;
	happened: boolean;
	storageKey: string;
	canLock: boolean = false;

	constructor( element: HTMLDivElement ) {
		this.element = element;
		this.happened = false;
		this.storageKey = 'otter-popup-dismiss';

		const { dismiss = 0, anchor } = element.dataset;

		if ( this.isItemDismissed() && 0 <= dismiss && ! anchor && ! Boolean( window.themeisleGutenberg?.isPreview ) ) {
			return;
		}

		this.canLock = Boolean( this.element.dataset.lockScrolling );


		if ( ! this.isDisabled() ) {
			this.init();
		}
	}

	init() {
		this.bindOpen();
		this.bindClose();
		this.bindEscClose();
	}

	isDisabled() {
		const { disableOn } = this.element.dataset;

		return 'mobile' === disableOn && window.matchMedia( '(max-width: 600px)' ).matches;
	}

	openModal() {
		this.element.classList.add( 'active' );
		this.happened = true;

		this.lockScrolling();
	}

	closeModal() {
		this.element.classList.remove( 'active' );
		this.dismissModal();
		this.unlockScrolling();
	}

	dismissModal() {
		const { dismiss = 0, anchor } = this.element.dataset;

		const { id } = this.element;

		if ( 0 < dismiss || ! id || anchor ) {
			return false;
		}

		const now = new Date();
		const cache = JSON.parse( localStorage.getItem( this.storageKey ) ?? '[]' ) || [];
		const exists = cache.some( ( entry: { modalID: string; }) => entry.modalID === id );

		if ( exists ) {
			return false;
		}

		const ttl = 1000 * 60 * 60 * 24 * parseInt( dismiss );

		const item = {
			expiry: now.getTime() + ttl,
			modalID: id
		};

		localStorage.setItem(
			this.storageKey,
			JSON.stringify([ ...cache, item ])
		);
	}

	isItemDismissed() {
		const { id } = this.element;
		const { dismiss = 0 } = this.element.dataset;

		const cache = JSON.parse( localStorage.getItem( this.storageKey ) ?? '[]' ) || [];
		const inCache = cache.filter( ( entry: { modalID: string; }) => entry.modalID === id );
		if ( 0 === inCache.length ) {
			return false;
		}

		if ( 0 === parseInt( dismiss ) && 0 < inCache.length ) {
			return true;
		}

		const item = inCache[ 0 ];
		const now = new Date();

		if ( item.expiry > now.getTime() ) {
			return true;
		}

		const newCache = cache.filter( ( i: any ) => {
			return i !== inCache[ 0 ];
		});

		localStorage.setItem( this.storageKey, JSON.stringify( newCache ) );

		return false;
	}

	bindOpen() {
		const { open } = this.element.dataset;

		switch ( open ) {
		case 'onClick':
			this.bindAnchors();
			break;
		case 'onScroll':
			this.bindOpenAfterScroll();
			break;
		case 'onExit':
			this.bindExitIntent();
			break;
		case 'none':
			// Do nothing
			break;
		default:
		case 'onLoad':
			this.bindOnLoad();
			break;
		}
	}

	bindAnchors() {
		const { anchor } = this.element.dataset;

		if ( ! anchor ) {
			return false;
		}

		const buttons = document.querySelectorAll( `a[href='#${ anchor }'], #${ anchor }` );

		buttons.forEach( ( button ) => {
			button.addEventListener( 'click', ( e ) => {

				// do not prevent default if href is a URL
				if ( ( e.target as HTMLAnchorElement )?.href === `#${ anchor }` ) {
					e.preventDefault();
				}

				this.openModal();
			});
		});
	}

	bindOpenAfterScroll() {
		window.document.addEventListener( 'scroll', () => {
			if ( this.happened ) {
				return false;
			}

			const { offset } = this.element.dataset;

			if ( parseInt( offset ?? '0' ) >= this.getScrolledPercent() ) {
				return false;
			}

			this.openModal();
		});
	}

	bindOnLoad() {
		const { time } = this.element.dataset;

		setTimeout( () => {
			this.openModal();
		}, parseInt( time ?? '0' ) * 1000 );
	}

	bindExitIntent() {
		document.body.addEventListener( 'mouseleave', ( e ) => {
			if ( this.happened ) {
				return false;
			}

			if ( 0 > e.clientY ) {
				this.openModal();
			}
		});
	}

	getScrolledPercent() {
		const height = document.documentElement;
		const { body } = document;
		const st = 'scrollTop';
		const sh = 'scrollHeight';

		return (
			( ( height[ st ] || body[ st ]) /
				( ( height[ sh ] || body[ sh ]) - height.clientHeight ) ) *
			100
		);
	}

	bindClose() {
		this.bindCloseButtons();
		this.bindAnchorClose();
		this.bindOverlayClosing();
	}

	bindAnchorClose() {
		const { anchorclose } = this.element.dataset;

		if ( ! anchorclose ) {
			return false;
		}

		const buttons = document.querySelectorAll( `a[href='#${ anchorclose }'], #${ anchorclose }` );

		buttons.forEach( ( button ) => {
			button.addEventListener( 'click', ( e ) => {

				// do not prevent default if href is a URL
				if ( ( e.target as HTMLAnchorElement )?.href === `#${ anchorclose }` ) {
					e.preventDefault();
				}

				this.closeModal();
			});
		});
	}

	bindCloseButtons() {
		const modal = this.element;
		const closes = modal.querySelectorAll( '.otter-popup__modal_header .components-button' );

		closes.forEach( ( close ) => {
			close.addEventListener( 'click', () => {
				this.closeModal();
			});
		});
	}

	bindOverlayClosing() {
		const { outside } = this.element.dataset;

		if ( ! outside ) {
			return false;
		}

		const overlay = this.element.querySelector( '.otter-popup__modal_wrap_overlay' );

		overlay?.addEventListener( 'click', () => {
			this.closeModal();
		});
	}

	lockScrolling() {
		if ( this.canLock ) {
			document.body.classList.add( 'o-lock-body' );
		}
	}

	unlockScrolling() {
		if ( this.canLock ) {
			document.body.classList.remove( 'o-lock-body' );
		}
	}

	bindEscClose() {
		document.addEventListener( 'keydown', ( event ) => {
			if ( 'Escape' === event.key && this.happened ) {
				this.closeModal();
			}
		});
	}
}

export default PopupBlock;
