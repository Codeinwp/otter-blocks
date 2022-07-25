/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { select } from '@wordpress/data';

import { render } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import MediaContent from './media-content.js';

// Global vars
let activeFrameId = '';
let activeFrame = false;
let activeModal = '';

const replaceMediaUpload = InitialMediaUpload => {
	return class OtterMediaUpload extends InitialMediaUpload {
		constructor( props ) {
			super( props );
			window.otterCurrentMediaProps = props;
		}
	};
};

addFilter(
	'editor.MediaUpload',
	'themeisle-blocks/dynamic-content/media-library',
	replaceMediaUpload
);

jQuery( document ).ready( function( $ ) {
	const oldMediaFrame = wp.media.view.MediaFrame.Select;

	// Extending the current media library frame to add a new tab
	wp.media.view.MediaFrame.Select = oldMediaFrame.extend({

		/**
		 * overwrite router to
		 *
		 * @param {wp.media.view.Router} routerView
		 */
		browseRouter( routerView ) {
			oldMediaFrame.prototype.browseRouter.apply( this, arguments );
			const showDynamicMedia = select( 'core/block-editor' ).getSelectedBlock();

			if ( showDynamicMedia ) {
				routerView.set({
					otterDynamicContent: {
						text: __( 'Dynamic Content', 'otter-blocks' ),
						priority: 60
					}
				});
			}
		},

		/**
		 * Bind region mode event callbacks.
		 *
		 * @see media.controller.Region.render
		 */
		bindHandlers() {
			oldMediaFrame.prototype.bindHandlers.apply( this, arguments );
			const showDynamicMedia = wp.data.select( 'core/block-editor' ).getSelectedBlock();

			if ( showDynamicMedia ) {
				this.on( 'content:create:otterDynamicContent', this.otterDynamicContent, this );
			}
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
			window.omodal = this;
		},

		getFrame( id ) {
			return this.states.findWhere({ id });
		}
	});

	// Render Otter Tab
	const otterImagesMediaTab = () => {
		const html = createWrapperHTML();

		if ( ! activeFrame ) {
			return false;
		}

		const modal = activeFrame.querySelector( '.media-frame-content' );
		if ( ! modal ) {
			return false;
		}

		modal.innerHTML = '';
		modal.appendChild( html );

		const element = modal.querySelector( '#otter-media-router-' + activeFrameId );
		if ( ! element ) {
			return false;
		}

		renderPhotoList( element );
	};

	const createWrapperHTML = () => {
		const wrapper = document.createElement( 'div' );
		wrapper.classList.add( 'o-media-container' );

		const container = document.createElement( 'div' );
		container.classList.add( 'media-frame-content', 'o-media-wrapper' );

		const frame = document.createElement( 'div' );
		frame.setAttribute( 'id', 'otter-media-router-' + activeFrameId );

		container.appendChild( frame );
		wrapper.appendChild( container );

		return wrapper;
	};

	const renderPhotoList = element => {
		const state = activeModal.state();
		const selection = state.get( 'selection' );

		const onSelectImage = ({ id, url }) => {
			if ( selection?._single?.attributes?.url === url ) {
				return selection.reset();
			}

			selection.add({
				id,
				url,
				alt: '',
				'media_type': 'image',
				width: 500
			});
		};

		render(
			<MediaContent
				state={ state }
				onSelectImage={ onSelectImage }
			/>,
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
			if ( ! activeFrame ) {
				return;
			}

			const selectedTab = activeFrame.querySelector(
				'.media-router button.media-menu-item.active'
			);

			if ( selectedTab && 'menu-item-otterDynamicContent' === selectedTab.id ) {
				otterImagesMediaTab();
			}
		}
	);
});
