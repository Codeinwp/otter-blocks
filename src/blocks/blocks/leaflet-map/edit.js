/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import {
	isEqual,
	isNumber,
	merge
} from 'lodash';

import { __, sprintf } from '@wordpress/i18n';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useState,
	useRef,
	useReducer
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import {
	blockInit,
	copyScriptAssetToIframe,
	getBlockDocument,
	getBlockWindow,
	getEditorIframe
} from '../../helpers/block-utility.js';

import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import { _px } from '../../helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

/**
 * Definition of the action type for the marker reducer
 */
export const ActionType = {
	ADD: 'ADD',
	ADD_MANUAL: 'ADD_MANUAL',
	REMOVE: 'REMOVE',
	UPDATE: 'UPDATE',
	INIT: 'INIT'
};

/**
 * Leaflet Map component
 * @param {import('./type').LeafletMapProps} props
 * @return
 */
const Edit = ({
	clientId,
	attributes,
	setAttributes
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const { responsiveGetAttributes } = useResponsiveAttributes();

	const mapRef = useRef( null );
	const mapInstanceRef = useRef( null );
	const [ map, setMap ] = useState( null );
	const [ isAddingToLocationActive, setActiveAddingToLocation ] = useState( false );

	// Read by the once-bound Leaflet handlers in `createMap`, which would otherwise
	// capture the initial `isAddingToLocationActive` value via a stale closure.
	const isAddingRef = useRef( false );
	const [ openMarker, setOpenMarker ] = useState( null );

	/**
	 * Resolve the Leaflet global from the window that owns the map node.
	 *
	 * In the iframed editor (`apiVersion: 3`, FSE, Tablet/Mobile preview) the map
	 * lives in the canvas iframe, so Leaflet is loaded into the iframe window —
	 * use that instance instead of the top-level `window.L` so a single Leaflet
	 * instance manages both the map and its markers.
	 */
	const getLeaflet = () => getBlockWindow( mapRef ).L;

	const createMarker = ( sourceProps, dispatch ) => {
		const L = getLeaflet();
		if ( L && map && dispatch && sourceProps ) {

			// Own a private copy so reducer mutations (e.g. a drag's `moveend`) don't
			// silently mutate the `attributes.markers` objects, which would hide the
			// change from the persistence diff below.
			const markerProps = { ...sourceProps };
			markerProps.id ??= uuidv4();
			markerProps.latitude ??= map.getCenter().lat;
			markerProps.longitude ??= map.getCenter().lng;
			markerProps.title ??= __( 'Add a title', 'otter-blocks' );
			markerProps.description ??= '';

			const markerMap = L.marker([ markerProps.latitude, markerProps.longitude ], {
				draggable: true
			});

			markerMap.on( 'movestart', () => {
				markerMap.closeTooltip();
				markerMap.closePopup();
			});

			markerMap.on( 'moveend', () => {
				const latlng = markerMap.getLatLng();

				dispatch({
					type: ActionType.UPDATE,
					ids: [ markerProps.id ],
					updatedProps: {
						latitude: latlng.lat,
						longitude: latlng.lng
					}
				});
			});

			markerMap.on( 'click', () => {
				setOpenMarker( markerProps.id );
			});

			// Hide the hover tooltip while the click popup is open so the same title
			// isn't shown twice (no-op when no tooltip is bound).
			markerMap.on( 'popupopen', () => markerMap.closeTooltip() );

			markerMap.markerProps = markerProps;

			return markerMap;
		}

		return null;
	};

	const markerReducer = ( oldState, action ) => {
		switch ( action.type ) {
		case ActionType.ADD:
			const newMarker = createMarker( action.marker, action.dispatch );
			return [ ...oldState, newMarker ];

		case ActionType.ADD_MANUAL:
			if ( isAddingRef.current ) {
				const newMarker = createMarker( action.marker, action.dispatch );
				return [ ...oldState, newMarker ];
			}
			return oldState;

		case ActionType.REMOVE:
			oldState.filter( ({ markerProps }) => action.ids.includes( markerProps.id ) ).forEach( marker => {
				if ( map.hasLayer( marker ) ) {
					map.removeLayer( marker );
				}
			});
			return oldState.filter( ({ markerProps }) => ! action.ids.includes( markerProps.id ) );

		case ActionType.INIT:
			const storedMarkers = action.markers.map(
				marker => {
					return createMarker( marker, action.dispatch );
				}
			);

			return [ ...oldState, ...storedMarkers ];

		case ActionType.UPDATE:
			return oldState.map( marker => {
				const props = marker.markerProps;

				if ( action.ids.includes( props.id ) ) {
					marker.markerProps = merge( marker.markerProps, action.updatedProps );
				}

				return marker;
			});

		default:
			// translators: %s is the action type that is not defined in the marker's reducer
			console.warn( sprintf( __( 'The action for the leaflet block do not have a defined action in marker\'s reducer: %s', 'otter-blocks' ), action.type ) );
		}

		return oldState;
	};

	/**
	 * Since we are working with callbacks to interact with the Leaflet Map,
	 * all the functions used will make a snapshot of the state's value at the moment of creation and be used until we rebind them again.
	 * To avoid this, we will use a dispatch function that doesn't need to know the updated state;
	 * he will send the data and let the reducer manipulate it using the current states.
	 */
	const [ markersStore, dispatch ] = useReducer( markerReducer, [], () => []);
	const createMap = () => {

		// Bail if the container is gone or a map already owns it. `copyScriptAssetToIframe`
		// can flush its load callback more than once (e.g. React StrictMode double-invokes
		// the init effect, queueing the callback twice), and Leaflet throws
		// "Map container is already initialized" if `L.map()` runs on the same node twice.
		if ( ! mapRef.current || mapInstanceRef.current ) {
			return;
		}

		const L = getLeaflet();

		if ( ! L ) {
			return ;
		}

		// Leaflet's CSS path-guessing heuristic is unreliable inside the iframed
		// editor, so point the default marker icon at the bundled images explicitly.
		const assetsPath = window.themeisleGutenberg?.assetsPath;
		if ( assetsPath ) {
			L.Icon.Default.imagePath = `${ assetsPath }/leaflet/images/`;
		}

		// `scrollZoom` defaults to true for blocks saved before the attribute existed.
		const scrollZoom = false !== attributes.scrollZoom;

		// Create the map
		mapRef.current.innerHTML = '';

		// Reference for mobile dragging: https://gis.stackexchange.com/questions/200189/cant-continue-scrolling-on-mobile-devices-when-a-map-occupy-all-the-screen
		const _map = L.map(
			mapRef.current,
			{
				maxZoom: 21,
				scrollWheelZoom: scrollZoom,

				// Gesture handling enforces the Ctrl/\u2318 + scroll requirement; turn it off
				// together with scrollWheelZoom when scroll zoom is disabled.
				gestureHandling: scrollZoom,
				gestureHandlingOptions: {
					text: {
						touch: __( 'Use two fingers to move the map', 'otter-blocks' ),
						scroll: __( 'Use ctrl + scroll to zoom the map', 'otter-blocks' ),
						scrollMac: __( 'Use \u2318 + scroll to zoom the map', 'otter-blocks' )
					}
				}
			}
		);


		// Add Open Street Map as source. OSM serves tiles up to zoom 19; allow a
		// couple of extra levels via overzoom (maxNativeZoom) so users can zoom in
		// as far as other OSM plugins, upscaling the level-19 tiles past that point.
		L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: [ 'a', 'b', 'c' ],
			maxNativeZoom: 19,
			maxZoom: 21
		}).addTo( _map );

		/**
		 * Defines event handlers
		 */
		_map.on( 'zoom', () => {
			setAttributes({
				zoom: _map.getZoom()
			});
		});

		_map.on( 'moveend', () => {
			const latlng = _map.getCenter();
			setAttributes({
				latitude: latlng.lat.toString(),
				longitude: latlng.lng.toString()
			});
		});

		_map.on( 'click', event => {
			dispatch({
				type: ActionType.ADD_MANUAL,
				marker: { latitude: event.latlng.lat, longitude: event.latlng.lng },
				dispatch
			});
			setActiveAddingToLocation( false );
		});

		/**
		 * Create the Add Marker button on the map
		 * Reference: https://leafletjs.com/examples/extending/extending-3-controls.html
		 */
		L.Control.AddMarker = L.Control.extend({
			onAdd: () => {
				const button = L.DomUtil.create( 'button', 'wp-block-themeisle-blocks-leaflet-map-marker-button' );
				button.type = 'button';

				// Render an inline SVG marker icon instead of a Dashicon: the iframed
				// editor canvas (apiVersion 3) does not load the Dashicons font, so a
				// `dashicons` glyph renders as an empty box.
				button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" /></svg>';

				L.DomEvent.on( button, 'click', ( event ) => {

					// Do not sent this event to the rest of the components
					L.DomEvent.stopPropagation( event );
					setActiveAddingToLocation( ! isAddingRef.current );
				});

				button.title = __( 'Add marker on the map with a click', 'otter-blocks' );
				button.setAttribute( 'aria-label', __( 'Add marker on the map with a click', 'otter-blocks' ) );

				return button;
			},
			onRemove: () => { }
		});

		L.control.addmarker = ( opts ) => {
			return new L.Control.AddMarker( opts );
		};

		L.control.addmarker({ position: 'bottomleft' }).addTo( _map );

		mapInstanceRef.current = _map;
		setMap( _map );

		// Render the saved markers
		dispatch({
			type: ActionType.INIT,
			markers: attributes.markers,
			dispatch
		});
	};

	/**
	 * Initialize the map.
	 */
	useEffect( () => {
		if ( getEditorIframe() ) {
			copyScriptAssetToIframe( '#leaflet-js', () => {
				createMap();
			});
			copyScriptAssetToIframe( '#leaflet-gesture-handling-js', () => { });
		} else {
			createMap();
		}

		// Tear down the Leaflet instance so the container can be re-initialized on a
		// remount (StrictMode, device-preview iframe swap) without throwing.
		return () => {
			mapInstanceRef.current?.remove();
			mapInstanceRef.current = null;
		};
	}, []);

	/**
	 * Trigger the update size function the map when height is changed to prevent an incorrect display on the bottom of the map.
	 */
	useEffect( () => {
		if ( attributes.height && map ) {
			map.invalidateSize( true );
		}
	}, [ attributes.height, map ]);

	/**
	 * Set View location on the map
	 */
	useEffect( () => {
		if ( attributes.latitude && attributes.longitude && map ) {
			map.setView([ attributes.latitude, attributes.longitude ], attributes.zoom ?? 15 );
		}
	}, [ attributes.latitude, attributes.longitude, attributes.zoom, map ]);

	/**
	 * Activate the visuals for the `Add Marker` button from the map
	 */
	useEffect( () => {
		isAddingRef.current = isAddingToLocationActive;
		mapRef.current?.classList.toggle( 'is-selecting-location', isAddingToLocationActive );
	}, [ isAddingToLocationActive ]);

	/**
	 * Get the bounding box information everytime when change the coords of the map
	 * This will be used for embeding in AMP
	 */
	useEffect( () => {
		if ( attributes.latitude && attributes.longitude && map ) {
			setAttributes({
				bbox: map.getBounds().toBBoxString()
			});
		}
	}, [ attributes.latitude, attributes.longitude, map ]);

	const createPopupContent = ( markerProps, dispatch ) => {

		/**
		 * The Popup can take a string or a HTMLElement
		 * For simple use, a string is enough.
		 * But we need interaction, in our case, to remove the marker.
		 * So, creating an HTMLElement will allow us to bind function very easily.
		 */
		// Build popup nodes in the document that owns the map (the iframe document
		// when iframed) so they belong to the same tree as the Leaflet popup.
		const ownerDocument = getBlockDocument( mapRef );
		const container = ownerDocument.createElement( 'div' );
		const title = ownerDocument.createElement( 'h6' );
		const content = ownerDocument.createElement( 'div' );
		const description = ownerDocument.createElement( 'p' );
		const deleteButton = ownerDocument.createElement( 'button' );

		title.innerHTML = markerProps.title;
		description.innerHTML = markerProps.description;
		deleteButton.onclick = () => dispatch({ type: ActionType.REMOVE, ids: [ markerProps.id ] });
		deleteButton.innerHTML = __( 'Delete Marker', 'otter-blocks' );

		container.classList.add( 'wp-block-themeisle-blocks-map-overview' );
		content.classList.add( 'wp-block-themeisle-blocks-map-overview-content' );
		title.classList.add( 'wp-block-themeisle-blocks-map-overview-title' );
		deleteButton.classList.add( 'wp-block-themeisle-blocks-map-overview-delete' );

		container.appendChild( title );
		container.appendChild( content );
		container.appendChild( deleteButton );

		content.appendChild( description );

		return container;
	};

	useEffect( () => {
		if ( markersStore ) {
			markersStore.forEach( marker => {
				if ( ! map.hasLayer( marker ) ) {
					map.addLayer( marker );
				}
				const { markerProps } = marker;

				// Update the marker location
				marker.setLatLng([ markerProps.latitude, markerProps.longitude ]);

				// Update the hover tooltip
				marker.closeTooltip();
				marker.unbindTooltip();
				if ( attributes.showMarkerTooltip && markerProps.title ) {
					marker.bindTooltip( markerProps.title, { direction: 'auto' });
				}

				// Always bind the popup in the editor: it hosts the Delete Marker control.
				marker.closePopup();
				marker.unbindPopup();
				marker.bindPopup( createPopupContent( markerProps, dispatch ) );
			});


			// Persist any marker change — add, remove, or a drag that moved a pin —
			// not just count changes, so dragged positions survive a save/reload.
			const nextMarkers = markersStore.map( ({ markerProps }) => ({ ...markerProps }) );
			if ( map && ! isEqual( attributes.markers, nextMarkers ) ) {
				setAttributes({ markers: nextMarkers });
			}
		}
	}, [ markersStore, map, attributes.markers, attributes.showMarkerTooltip ]);

	const blockProps = useBlockProps();

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				dispatch={ dispatch }
				markersInteraction={ {
					openMarker,
					setOpenMarker
				} }
			/>

			<div { ...blockProps }>
				<div
					id={ attributes.id }
					ref={ mapRef }
					style={ {
						width: '100%',
						height: responsiveGetAttributes([ _px( attributes.height ?? 400 ), attributes.heightTablet, attributes.heightMobile ])
					} }>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
