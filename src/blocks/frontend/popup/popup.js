class PopupBlock {
	constructor( element ) {
		this.element = element;
		this.happened = false;
		this.storageKey = 'otter-popup-dismiss';

		const { dismiss, anchor } = element.dataset;

		if ( this.isItemDismissed() && dismiss && ! anchor && ! Boolean( window.themeisleGutenberg.isPreview ) ) {
			return false;
		}

		this.init();
	}

	init() {
		this.bindOpen();
		this.bindClose();
	}

	openModal() {
		this.element.classList.add( 'active' );
		this.happened = true;
	}

	closeModal() {
		this.element.classList.remove( 'active' );
		this.dismissModal();
	}

	dismissModal() {
		const { dismiss, anchor } = this.element.dataset;

		const { id } = this.element;

		if ( ! dismiss || ! id || anchor ) {
			return false;
		}

		const now = new Date();
		const cache = JSON.parse( localStorage.getItem( this.storageKey ) ) || [];
		const exists = cache.some( ( entry ) => entry.modalID === id );

		if ( exists ) {
			return false;
		}

		const ttl = 1000 * 60 * 60 * 24 * dismiss;

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

		const cache = JSON.parse( localStorage.getItem( this.storageKey ) ) || [];
		const inCache = cache.filter( ( entry ) => entry.modalID === id );

		if ( 0 === inCache.length ) {
			return false;
		}

		const item = inCache[ 0 ];
		const now = new Date();

		if ( item.expiry > now.getTime() ) {
			return true;
		}

		const newCache = cache.filter( ( i ) => {
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

		const buttons = document.querySelectorAll( `a[href='#${ anchor }']` );

		buttons.forEach( ( button ) => {
			button.addEventListener( 'click', ( e ) => {
				e.preventDefault();
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

			if ( parseInt( offset ) >= parseInt( this.getScrolledPercent() ) ) {
				return false;
			}

			this.openModal();
		});
	}

	bindOnLoad() {
		const { time } = this.element.dataset;

		setTimeout( () => {
			this.openModal();
		}, time * 1000 );
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
		const body = document.body;
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

		const buttons = document.querySelectorAll( `a[href='#${ anchorclose }']` );

		buttons.forEach( ( button ) => {
			button.addEventListener( 'click', ( e ) => {
				e.preventDefault();
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

		overlay.addEventListener( 'click', () => {
			this.closeModal();
		});
	}
}

export default PopupBlock;
