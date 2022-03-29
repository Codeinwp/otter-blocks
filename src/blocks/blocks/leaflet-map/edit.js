/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { merge } from 'lodash';

import { __ } from '@wordpress/i18n';

import { useBlockProps } from '@wordpress/block-editor';

import { ResizableBox } from '@wordpress/components';

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
import Inspector from './inspector';
import { blockInit } from '../../helpers/block-utility';

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
 * @returns
 */
const Edit = ({
	clientId,
	attributes,
	setAttributes,
	isSelected,
	toggleSelection
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const mapRef = useRef( null );
	const [ map, setMap ] = useState( null );
	const [ isAddingToLocationActive, setActiveAddingToLocation ] = useState( false );
	const [ openMarker, setOpenMarker ] = useState( null );

	const createMarker = ( markerProps, dispatch ) => {
		if ( window.L && map && dispatch && markerProps ) {
			markerProps.id ??= uuidv4();
			markerProps.latitude ??= map.getCenter().lat;
			markerProps.longitude ??= map.getCenter().lng;
			markerProps.title ??= __( 'Add a title', 'otter-blocks' );
			markerProps.description ??= '';

			const markerMap = window.L.marker([ markerProps.latitude, markerProps.longitude ] || map.getCenter(), {
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
			if ( isAddingToLocationActive ) {
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
			console.warn( __( 'The action for the leaflet block do not have a defined action in marker\'s reducer: ', 'otter-blocks' ) + action.type );
		}

		return oldState;
	};

	/**
	 * Since we are working with callbacks to interact with the Leaflet Map,
	 * all the functions used will make a snapshot of the state's value at the moment of creation and be used until we rebind them again.
	 * To avoid this, we will use a dispatch function that doesn't need to know the updated state;
	 * he will send the data and let the reducer manipulate it using the current states.
	 */
	const [ markersStore, dispatch ] = useReducer( markerReducer, []);
	const createMap = () => {
		if ( ! mapRef.current && ! window.L ) {
			return;
		}

		// Create the map
		mapRef.current.innerHTML = '';

		// Reference for mobile dragging: https://gis.stackexchange.com/questions/200189/cant-continue-scrolling-on-mobile-devices-when-a-map-occupy-all-the-screen
		const _map = window.L.map(
			mapRef.current,
			{
				gestureHandling: true,
				gestureHandlingOptions: {
					text: {
						touch: __( 'Use two fingers to move the map', 'otter-blocks' ),
						scroll: __( 'Use ctrl + scroll to zoom the map', 'otter-blocks' ),
						scrollMac: __( 'Use \u2318 + scroll to zoom the map', 'otter-blocks' )
					}
				}
			}
		);

		// Add Open Street Map as source
		window.L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: [ 'a', 'b', 'c' ]
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
		window.L.Control.AddMarker = window.L.Control.extend({
			onAdd: () => {
				const button = window.L.DomUtil.create( 'button', 'wp-block-themeisle-blocks-leaflet-map-marker-button' );
				const span = window.L.DomUtil.create( 'span', 'dashicons dashicons-sticky', button );

				window.L.DomEvent.on( button, 'click', ( event ) => {

					// Do not sent this event to the rest of the components
					window.L.DomEvent.stopPropagation( event );
					setActiveAddingToLocation( ! isAddingToLocationActive );
				});

				button.title = __( 'Add marker on the map with a click', 'otter-blocks' );
				button.appendChild( span );

				return button;
			},
			onRemove: () => { }
		});

		window.L.control.addmarker = ( opts ) => {
			return new window.L.Control.AddMarker( opts );
		};

		window.L.control.addmarker({ position: 'bottomleft' }).addTo( _map );

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
		createMap();
	}, []);

	/**
	 * Triger the update size function the map when height is changed to prevent an incorrect display on the bottom of the map.
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
			map.setView([ attributes.latitude, attributes.longitude ], attributes.zoom || 15 );
		}
	}, [ attributes.latitude, attributes.longitude, attributes.zoom, map ]);

	/**
	 * Activate the visuals for the `Add Marker` button from the map
	 */
	useEffect( () => {
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
		const container = document.createElement( 'div' );
		const title = document.createElement( 'h6' );
		const content = document.createElement( 'div' );
		const description = document.createElement( 'p' );
		const deleteButton = document.createElement( 'button' );

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
			setAttributes({ markers: markersStore.map( ({ markerProps }) => markerProps ) });

			markersStore.forEach( marker => {
				if ( ! map.hasLayer( marker ) ) {
					map.addLayer( marker );
				}
				const { markerProps } = marker;

				// Update the marker location
				marker.setLatLng([ markerProps.latitude, markerProps.longitude ]);

				// Update the title
				marker.closeTooltip();
				marker.unbindTooltip();
				marker.bindTooltip( markerProps.title, { direction: 'auto' });

				// Update the content of the Popup
				marker.closePopup();
				marker.unbindPopup();
				marker.bindPopup( createPopupContent( markerProps, dispatch ) );
			});
		}
	}, [ markersStore ]);

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
				<ResizableBox
					size={ {
						height: attributes.height
					} }
					enable={ {
						top: false,
						right: false,
						bottom: true,
						left: false
					} }
					minHeight={ 100 }
					maxHeight={ 1400 }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
					onResizeStop={ ( event, direction, elt, delta ) => {
						setAttributes({
							height: parseInt( attributes.height + delta.height, 10 )
						});
						toggleSelection( true );
					} }
					className={ classnames(
						'wp-block-themeisle-blocks-leaflet-map-resizer',
						{ 'is-focused': isSelected }
					) }
				>
					<div
						id={ attributes.id }
						ref={ mapRef }
						style={ {
							width: '100%',
							height: attributes.height || 400
						} }>
					</div>
				</ResizableBox>
			</div>
		</Fragment>
	);
};

export default Edit;
