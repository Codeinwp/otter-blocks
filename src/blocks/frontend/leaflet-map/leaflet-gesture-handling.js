/* eslint-disable */

/*
* * Leaflet Gesture Handling **
* * Version 1.1.8
*/
import LanguageContent from './language-content.js';

export var GestureHandling = null;

const t = setInterval( () => {
	if ( 'L' in window ) {
		clearInterval( t );

		L.Map.mergeOptions({
			gestureHandlingOptions: {
				text: {},
				duration: 1000
			}
		});

		let draggingMap = false;

		GestureHandling = L.Handler.extend({
			addHooks() {
				this._handleTouch = this._handleTouch.bind( this );

				this._setupPluginOptions();
				this._setLanguageContent();
				this._disableInteractions();

				//Uses native event listeners instead of L.DomEvent due to issues with Android touch events
				//turning into pointer events
				this._map._container.addEventListener( 'touchstart', this._handleTouch );
				this._map._container.addEventListener( 'touchmove', this._handleTouch );
				this._map._container.addEventListener( 'touchend', this._handleTouch );
				this._map._container.addEventListener( 'touchcancel', this._handleTouch );
				this._map._container.addEventListener( 'click', this._handleTouch );

				L.DomEvent.on(
					this._map._container,
					'wheel',
					this._handleScroll,
					this
				);
				L.DomEvent.on( this._map, 'mouseover', this._handleMouseOver, this );
				L.DomEvent.on( this._map, 'mouseout', this._handleMouseOut, this );

				// Listen to these events so will not disable dragging if the user moves the mouse out the boundary of the map container whilst actively dragging the map.
				L.DomEvent.on( this._map, 'movestart', this._handleDragging, this );
				L.DomEvent.on( this._map, 'move', this._handleDragging, this );
				L.DomEvent.on( this._map, 'moveend', this._handleDragging, this );
			},

			removeHooks() {
				this._enableInteractions();

				this._map._container.removeEventListener(
					'touchstart',
					this._handleTouch
				);
				this._map._container.removeEventListener(
					'touchmove',
					this._handleTouch
				);
				this._map._container.removeEventListener( 'touchend', this._handleTouch );
				this._map._container.removeEventListener(
					'touchcancel',
					this._handleTouch
				);
				this._map._container.removeEventListener( 'click', this._handleTouch );

				L.DomEvent.off(
					this._map._container,
					'wheel',
					this._handleScroll,
					this
				);
				L.DomEvent.off( this._map, 'mouseover', this._handleMouseOver, this );
				L.DomEvent.off( this._map, 'mouseout', this._handleMouseOut, this );

				L.DomEvent.off( this._map, 'movestart', this._handleDragging, this );
				L.DomEvent.off( this._map, 'move', this._handleDragging, this );
				L.DomEvent.off( this._map, 'moveend', this._handleDragging, this );
			},

			_handleDragging( e ) {
				if ( 'movestart' === e.type || 'move' === e.type ) {
					draggingMap = true;
				} else if ( 'moveend' === e.type ) {
					draggingMap = false;
				}
			},

			_disableInteractions() {
				this._map.dragging.disable();
				this._map.scrollWheelZoom.disable();
				if ( this._map.tap ) {
					this._map.tap.disable();
				}
			},

			_enableInteractions() {
				this._map.dragging.enable();
				this._map.scrollWheelZoom.enable();
				if ( this._map.tap ) {
					this._map.tap.enable();
				}
			},

			_setupPluginOptions() {

				//For backwards compatibility, merge gestureHandlingText into the new options object
				if ( this._map.options.gestureHandlingText ) {
					this._map.options.gestureHandlingOptions.text = this._map.options.gestureHandlingText;
				}
			},

			_setLanguageContent() {
				let languageContent;

				//If user has supplied custom language, use that
				if (
					this._map.options.gestureHandlingOptions &&
					this._map.options.gestureHandlingOptions.text &&
					this._map.options.gestureHandlingOptions.text.touch &&
					this._map.options.gestureHandlingOptions.text.scroll &&
					this._map.options.gestureHandlingOptions.text.scrollMac
				) {
					languageContent = this._map.options.gestureHandlingOptions.text;
				} else {

					//Otherwise auto set it from the language files

					//Determine their language e.g fr or en-US
					let lang = this._getUserLanguage();

					//If we couldn't find it default to en
					if ( ! lang ) {
						lang = 'en';
					}

					//Lookup the appropriate language content
					if ( LanguageContent[lang]) {
						languageContent = LanguageContent[lang];
					}

					//If no result, try searching by the first part only. e.g en-US just use en.
					if ( ! languageContent && -1 !== lang.indexOf( '-' ) ) {
						lang = lang.split( '-' )[0];
						languageContent = LanguageContent[lang];
					}

					if ( ! languageContent ) {
						lang = 'en';
						languageContent = LanguageContent[lang];
					}
				}

				//TEST
				// languageContent = LanguageContent["bg"];

				//Check if they're on a mac for display of command instead of ctrl
				let mac = false;
				if ( 0 <= navigator.platform.toUpperCase().indexOf( 'MAC' ) ) {
					mac = true;
				}

				let scrollContent = languageContent.scroll;
				if ( mac ) {
					scrollContent = languageContent.scrollMac;
				}

				this._map._container.setAttribute(
					'data-gesture-handling-touch-content',
					languageContent.touch
				);
				this._map._container.setAttribute(
					'data-gesture-handling-scroll-content',
					scrollContent
				);
			},

			_getUserLanguage() {
				const lang = navigator.languages ?
					navigator.languages[0] :
					navigator.language || navigator.userLanguage;
				return lang;
			},

			_handleTouch( e ) {

				//Disregard touch events on the minimap if present
				const ignoreList = [
					'leaflet-control-minimap',
					'leaflet-interactive',
					'leaflet-popup-content',
					'leaflet-popup-content-wrapper',
					'leaflet-popup-close-button',
					'leaflet-control-zoom-in',
					'leaflet-control-zoom-out'
				];

				let ignoreElement = false;
				for ( let i = 0; i < ignoreList.length; i++ ) {
					if ( L.DomUtil.hasClass( e.target, ignoreList[i]) ) {
						ignoreElement = true;
					}
				}

				if ( ignoreElement ) {
					if (
						L.DomUtil.hasClass( e.target, 'leaflet-interactive' ) &&
						'touchmove' === e.type &&
						1 === e.touches.length
					) {
						L.DomUtil.addClass( this._map._container,
							'leaflet-gesture-handling-touch-warning'
						);
						this._disableInteractions();
					} else {
						L.DomUtil.removeClass( this._map._container,
							'leaflet-gesture-handling-touch-warning'
						);
					}
					return;
				}

				// screenLog(e.type+' '+e.touches.length);
				if ( 'touchmove' !== e.type && 'touchstart' !== e.type ) {
					L.DomUtil.removeClass( this._map._container,
						'leaflet-gesture-handling-touch-warning'
					);
					return;
				}
				if ( 1 === e.touches.length ) {
					L.DomUtil.addClass( this._map._container,
						'leaflet-gesture-handling-touch-warning'
					);
					this._disableInteractions();
				} else {
					e.preventDefault();
					this._enableInteractions();
					L.DomUtil.removeClass( this._map._container,
						'leaflet-gesture-handling-touch-warning'
					);
				}
			},

			_isScrolling: false,

			_handleScroll( e ) {
				if ( e.metaKey || e.ctrlKey ) {
					e.preventDefault();
					L.DomUtil.removeClass( this._map._container,
						'leaflet-gesture-handling-scroll-warning'
					);
					this._map.scrollWheelZoom.enable();
				} else {
					L.DomUtil.addClass( this._map._container,
						'leaflet-gesture-handling-scroll-warning'
					);
					this._map.scrollWheelZoom.disable();

					clearTimeout( this._isScrolling );

					// Set a timeout to run after scrolling ends
					this._isScrolling = setTimeout( function() {

						// Run the callback
						const warnings = document.getElementsByClassName(
							'leaflet-gesture-handling-scroll-warning'
						);
						for ( let i = 0; i < warnings.length; i++ ) {
							L.DomUtil.removeClass( warnings[i],
								'leaflet-gesture-handling-scroll-warning'
							);
						}
					}, this._map.options.gestureHandlingOptions.duration );
				}
			},

			_handleMouseOver( e ) {
				this._enableInteractions();
			},

			_handleMouseOut( e ) {
				if ( ! draggingMap ) {
					this._disableInteractions();
				}
			}

		});

		L.Map.addInitHook( 'addHandler', 'gestureHandling', GestureHandling );
	}
}, 700 );


export default GestureHandling;
