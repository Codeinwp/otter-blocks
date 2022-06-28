const { render } = wp.element;

// Just some code to get me started.

// Global vars
let activeFrameId = '';
let activeFrame = '';
let activeModal = '';

jQuery( document ).ready( function( $ ) {
	var oldMediaFrame = wp.media.view.MediaFrame.Select;

	// Extending the current media library frame to add a new tab
	wp.media.view.MediaFrame.Select = oldMediaFrame.extend({

		/**
		 * overwrite router to
		 *
		 * @param {wp.media.view.Router} routerView
		 */
		browseRouter( routerView ) {
			oldMediaFrame.prototype.browseRouter.apply( this, arguments );
			routerView.set({
				otterDynamicContent: {
					text: 'Dynamic Content',
					priority: 60
				}
			});
		},

		/**
		 * Bind region mode event callbacks.
		 *
		 * @see media.controller.Region.render
		 */
		bindHandlers() {
			oldMediaFrame.prototype.bindHandlers.apply( this, arguments );
			this.on( 'content:create:otterDynamicContent', this.otterDynamicContent, this );
		},

		/**
		 * Render callback for the content region in the `browse` mode.
		 *
		 * @param {wp.media.controller.Region} contentRegion
		 */
		otterDynamicContent() {
			const state = this.state();

			// Get active frame
			if ( state ) {
				activeFrameId = state.id;
				activeFrame = state.frame.el;
			}

			activeModal = this;
		},

		getFrame( id ) {
			return this.states.findWhere({ id });
		}
	});

	// Render otter Images
	const otterImagesMediaTab = () => {
		const html = createWrapperHTML(); // Create HTML wrapper

		if ( ! activeFrame ) {
			return false; // Exit if not a frame.
		}

		const modal = activeFrame.querySelector( '.media-frame-content' ); // Get all media modals
		if ( ! modal ) {
			return false; // Exit if not modal.
		}

		modal.innerHTML = ''; // Clear any existing modals.
		modal.appendChild( html ); // Append otter Images to modal.

		const element = modal.querySelector(
			'#otter-media-router-' + activeFrameId
		);
		if ( ! element ) {
			return false; // Exit if not element.
		}

		renderPhotoList( element );
	};

	const createWrapperHTML = () => {
		const wrapper = document.createElement( 'div' );
		wrapper.classList.add( 'otter-img-container' );

		const container = document.createElement( 'div' );
		container.classList.add( 'otter-wrapper' );

		const frame = document.createElement( 'div' );
		frame.setAttribute( 'id', 'otter-media-router-' + activeFrameId );

		container.appendChild( frame );
		wrapper.appendChild( container );

		return wrapper;
	};

	const PhotoList = () => {
		return (
			<button onClick={ () => {
				const state = activeModal.state();
				const selection = state.get( 'selection' );
				selection.add({ url: 'http://www2.cnrs.fr/sites/communique/image/mona_unvarnish_web_image.jpg' });
			} }>Select Image!</button>
		);
	};

	const renderPhotoList = element => {
		render(
			<PhotoList/>,
			element
		);
	};

	wp.media.view.Modal.prototype.on( 'open', function() {
		if ( ! activeFrame ) {
			return false;
		}
		let selectedTab = activeFrame.querySelector(
			'.media-router button.media-menu-item.active'
		);
		if ( selectedTab && 'menu-item-otterDynamicContent' === selectedTab.id ) {
			otterImagesMediaTab();
		}
	});

	// Click Handler
	$( document ).on(
		'click',
		'.media-router button.media-menu-item',
		function() {
			const selectedTab = activeFrame.querySelector(
				'.media-router button.media-menu-item.active'
			);
			if ( selectedTab && 'menu-item-otterDynamicContent' === selectedTab.id ) {
				otterImagesMediaTab();
			}
		}
	);
});
