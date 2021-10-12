/**
 * External dependencies
 */
import classnames from 'classnames';
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { ResizableBox } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Placeholder from './placeholder.js';
import Inspector from './inspector.js';
import { StyleSwitcherBlockControl } from '../../components/style-switcher-control/index.js';
import MarkerModal from './components/marker-modal.js';
import Map from './components/map.js';
import styles from './components/styles.js';
import defaultAttributes from './attributes.js';
import { blockInit } from '../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId,
	isSelected,
	toggleSelection
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	useEffect( () => {

		const setApi = async() => {
			await wp.api.loadPromise.then( () => {
				settingsRef.current = new wp.api.models.Settings();
			});

			if ( false === Boolean( window.themeisleGutenberg.mapsAPI ) ) {
				if ( ! isAPILoaded ) {
					settingsRef.current.fetch().then( response => {
						setAPI( response.themeisle_google_map_block_api_key );
						setAPILoaded( true );

						if ( '' !== response.themeisle_google_map_block_api_key ) {
							setAPISaved( true );
							enqueueScript( response.themeisle_google_map_block_api_key );
						}
					});
				}
			} else {
				if ( ! isAPILoaded ) {
					setAPI( window.themeisleGutenberg.mapsAPI );
					setAPILoaded( true );
					setAPISaved( true );
					enqueueScript( window.themeisleGutenberg.mapsAPI );
				}
			}
		};

		setApi();

		window.isMapLoaded = window.isMapLoaded || false;
		window[`removeMarker_${ clientId.substr( 0, 8 ) }`] = removeMarker;

		linkRef.current = document.createElement( 'script' );
		linkRef.current.type = 'text/javascript';
		linkRef.current.async = true;
		linkRef.current.defer = true;
		linkRef.current.id = 'themeisle-google-map-api-loading';
	}, []);

	useEffect( () => {
		if ( false !== isAPISaved && undefined !== window.google ) {
			mapRef.current.setOptions({
				mapTypeControl: isSelected ? true : attributes.mapTypeControl,
				zoomControl: isSelected ? true : attributes.zoomControl,
				fullscreenControl: isSelected ? true : attributes.fullscreenControl,
				streetViewControl: isSelected ? true : attributes.streetViewControl
			});
		}
	}, [ isSelected ]);

	useEffect( () => {
		markersAttrRef.current = [ ...attributes.markers ];
	}, [ attributes.markers ]);

	const markersRef = useRef([]);
	const settingsRef = useRef( null );
	const linkRef = useRef( null );
	const mapRef = useRef( null );
	const lastInfoWindowRef = useRef( null );
	const markersAttrRef = useRef([ ...attributes.markers ]);

	const [ api, setAPI ] = useState( '' );
	const [ isAPILoaded, setAPILoaded ] = useState( false );
	const [ isAPISaved, setAPISaved ] = useState( false );
	const [ isMapLoaded, setMapLoaded ] = useState( false );
	const [ isSaving, setSaving ] = useState( false );
	const [ isPlaceAPIAvailable, setPlaceAPIAvailable ] = useState( true );
	const [ displayMap, setDisplayMap ] = useState( false );
	const [ isMarkerOpen, setMarkerOpen ] = useState( false );
	const [ isSelectingMarker, setSelectingMarker ] = useState( false );
	const [ isModalOpen, setModalOpen ] = useState( false );
	const [ isAdvanced, setAdvanced ] = useState( false );
	const [ selectedMarker, setSelectedMarker ] = useState({});

	const enqueueScript = api => {
		if ( ! window.isMapLoaded ) {
			window.isMapLoaded = true;
			linkRef.current.onload = () => {
				const script = document.getElementById( 'themeisle-google-map-api-loading' );
				script.id = 'themeisle-google-map-api';
				setDisplayMap( true );
			};
			linkRef.current.src = `https://maps.googleapis.com/maps/api/js?key=${ api }&libraries=places&cache=${ Math.random() }`;
			document.head.appendChild( linkRef.current );
		}

		const loaded = document.getElementById( 'themeisle-google-map-api' );

		if ( loaded ) {
			setDisplayMap( true );
		}
	};

	const initMap = () => {
		mapRef.current = new google.maps.Map( document.getElementById( attributes.id ), {
			center: {
				lat: Number( attributes.latitude ) || 41.4036299,
				lng: Number( attributes.longitude ) || 2.1743558000000576
			},
			gestureHandling: 'cooperative',
			zoom: attributes.zoom,
			mapTypeId: attributes.type,
			styles: styles[ attributes.style ]
		});

		if ( attributes.location && ( undefined === attributes.latitude && undefined === attributes.longitude ) ) {
			const request = {
				query: attributes.location,
				fields: [ 'name', 'geometry' ]
			};

			const service = new google.maps.places.PlacesService( mapRef.current );

			service.findPlaceFromQuery( request, ( results, status ) => {
				if ( status === google.maps.places.PlacesServiceStatus.OK ) {
					if ( 0 < results.length ) {
						mapRef.current.setCenter( results[0].geometry.location );
					}
				}
			});
		}

		google.maps.event.addListenerOnce( mapRef.current, 'idle', () => {
			setMapLoaded( true );
		});

		mapRef.current.addListener( 'zoom_changed', () => {
			const zoom = mapRef.current.getZoom();
			setAttributes({ zoom });
		});

		mapRef.current.addListener( 'maptypeid_changed', () => {
			const type = mapRef.current.getMapTypeId();
			setAttributes({ type });
		});

		mapRef.current.addListener( 'bounds_changed', () => {
			const location = mapRef.current.getCenter();
			const latitude = location.lat();
			const longitude = location.lng();
			setAttributes({
				latitude: latitude.toString(),
				longitude: longitude.toString()
			});
		});

		if ( 0 < attributes.markers.length ) {
			cycleMarkers( attributes.markers );
		}

		const request = {
			query: attributes.location,
			fields: [ 'name', 'geometry' ]
		};

		const service = new google.maps.places.PlacesService( mapRef.current );

		service.findPlaceFromQuery( request, ( results, status ) => {
			if ( 'REQUEST_DENIED' === status ) {
				setPlaceAPIAvailable( false );
			}
		});
	};

	const addMarker = ( location, title, icon, description, latitude, longitude ) => {
		const latLng = new google.maps.LatLng( latitude, longitude );

		const id = uuidv4();

		const mark = new google.maps.Marker({
			position: latLng,
			map: mapRef.current,
			title,
			draggable: true,
			icon
		});

		google.maps.event.addListener( mark, 'dragend', event => {
			const lat = event.latLng.lat();
			const lng = event.latLng.lng();

			changeMarkerProp( id, 'latitude', lat );
			changeMarkerProp( id, 'longitude', lng );
		});

		markersRef.current.push( mark );

		const markers = [ ...attributes.markers ];

		const marker = {
			id,
			location,
			title,
			icon,
			description,
			latitude,
			longitude
		};

		markers.push( marker );

		setAttributes({ markers });

		google.maps.event.addListener( mark, 'click', () => {
			if ( lastInfoWindowRef.current ) {
				lastInfoWindowRef.current.close();
			}
		});

		addInfoWindow( mark, marker.id, title, description );
		setModalOpen( false );
		setSelectingMarker( false );
	};

	const addInfoWindow = ( marker, id, title, description ) => {
		const contentString = `<div class="wp-block-themeisle-blocks-map-overview"><h6 class="wp-block-themeisle-blocks-map-overview-title">${ title }</h6><div class="wp-block-themeisle-blocks-map-overview-content">${ description ? `<p>${ description }</p>` : '' }<a class="wp-block-themeisle-blocks-map-overview-delete" onclick="removeMarker_${ clientId.substr( 0, 8 ) }( '${ id }' )">${ __( 'Delete Marker', 'otter-blocks' ) }</a></div></div>`;

		const infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		marker.addListener( 'click', () => {
			lastInfoWindowRef.current = infowindow;
			infowindow.open( mapRef.current, marker );
		});

		google.maps.event.addListener( infowindow, 'domready', () => {
			setMarkerOpen( id );
		});

		google.maps.event.addListener( infowindow, 'closeclick', () => {
			setMarkerOpen( false );
		});
	};

	const cycleMarkers = markers => {
		markers.forEach( marker => {
			const latitude = marker.latitude;
			const longitude = marker.longitude;
			const position = new google.maps.LatLng( latitude, longitude );

			let mark = new google.maps.Marker({
				position,
				map: mapRef.current,
				title: marker.title,
				draggable: true,
				icon: marker.icon || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
			});

			google.maps.event.addListener( mark, 'dragend', event => {
				const lat = event.latLng.lat();
				const lng = event.latLng.lng();

				changeMarkerProp( marker.id, 'latitude', lat );
				changeMarkerProp( marker.id, 'longitude', lng );
			});

			markersRef.current.push( mark );

			google.maps.event.addListener( mark, 'click', () => {
				if ( lastInfoWindowRef.current ) {
					lastInfoWindowRef.current.close();
				}
			});

			addInfoWindow( mark, marker.id, marker.title, marker.description );
		});
	};

	const selectMarker = () => {
		setSelectingMarker( ! isSelectingMarker );

		if ( ! isSelectingMarker ) {
			mapRef.current.addListener( 'click', e => {
				google.maps.event.clearListeners( mapRef.current, 'click' );

				const id = uuidv4();
				const title = __( 'Custom Marker', 'otter-blocks' );
				const latitude = e.latLng.lat();
				const longitude = e.latLng.lng();

				setModalOpen( true );
				setAdvanced( false );
				setSelectedMarker({
					id,
					location: '',
					title,
					icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
					description: '',
					latitude,
					longitude
				});
			});
		} else {
			google.maps.event.clearListeners( mapRef.current, 'click' );
		}
	};

	const addMarkerManual = () => {
		const id = uuidv4();
		const title = __( 'Custom Marker', 'otter-blocks' );
		const location = mapRef.current.getCenter();
		const latitude = location.lat();
		const longitude = location.lng();

		setModalOpen( true );
		setAdvanced( true );
		setSelectedMarker({
			id,
			location: '',
			title,
			icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
			description: '',
			latitude,
			longitude
		});
	};

	const changeMarkerProp = ( id, prop, value ) => {
		const markers = [ ...markersAttrRef.current ];
		markers.map( marker => {
			if ( marker.id === id ) {
				return marker[ prop ] = value.toString();
			}
		});

		removeMarkers();
		cycleMarkers( markers );
		setAttributes({ markers });
	};

	const removeMarker = id => {
		let markers = [ ...markersAttrRef.current ];
		markers = markers.filter( marker => marker.id !== id );
		setAttributes({ markers });
		removeMarkers();
		setMarkerOpen( false );

		if ( 0 < markers.length ) {
			cycleMarkers( markers );
		}
	};

	const removeMarkers = () => {
		for ( let i = 0; i < markersRef.current.length; i++ ) {
			markersRef.current[i].setMap( null );
		}

		markersRef.current = [];
	};

	const saveAPIKey = () => {
		if ( false === Boolean( window.themeisleGutenberg.mapsAPI ) ) {
			setSaving( true );

			const model = new wp.api.models.Settings({
				// eslint-disable-next-line camelcase
				themeisle_google_map_block_api_key: api
			});

			model.save().then( response => {
				let saved = false;

				if ( '' !== response.themeisle_google_map_block_api_key ) {
					saved = true;
				}

				setSaving( false );
				setAPISaved( saved );

				if ( '' !== response.themeisle_google_map_block_api_key ) {
					window.isMapLoaded = false;
					enqueueScript( response.themeisle_google_map_block_api_key );
				}
			});
		}
	};

	const changeStyle = value => {
		setAttributes({ style: value });
		mapRef.current.setOptions({ styles: styles[ value ] });
	};

	if ( ! isAPILoaded || ! isAPISaved ) {
		return (
			<Placeholder
				className={ className }
				api={ api }
				isAPILoaded={ isAPILoaded }
				isAPISaved={ isAPISaved }
				changeAPI={ setAPI }
				saveAPIKey={ saveAPIKey }
			/>
		);
	}

	return (
		<Fragment>
			<StyleSwitcherBlockControl
				label={ __( 'Block Styles', 'otter-blocks' ) }
				value={ attributes.style }
				options={ [
					{
						label: __( 'Standard', 'otter-blocks' ),
						value: 'standard',
						image: window.themeisleGutenberg.assetsPath + '/icons/map-standard.png'
					},
					{
						label: __( 'Silver', 'otter-blocks' ),
						value: 'silver',
						image: window.themeisleGutenberg.assetsPath + '/icons/map-silver.png'
					},
					{
						label: __( 'Retro', 'otter-blocks' ),
						value: 'retro',
						image: window.themeisleGutenberg.assetsPath + '/icons/map-retro.png'
					},
					{
						label: __( 'Dark', 'otter-blocks' ),
						value: 'dark',
						image: window.themeisleGutenberg.assetsPath + '/icons/map-dark.png'
					},
					{
						label: __( 'Night', 'otter-blocks' ),
						value: 'night',
						image: window.themeisleGutenberg.assetsPath + '/icons/map-night.png'
					},
					{
						label: __( 'Aubergine', 'otter-blocks' ),
						value: 'aubergine',
						image: window.themeisleGutenberg.assetsPath + '/icons/map-aubergine.png'
					}
				] }
				onChange={ changeStyle }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				map={ mapRef.current }
				changeStyle={ changeStyle }
				isPlaceAPIAvailable={ isPlaceAPIAvailable }
				isMarkerOpen={ isMarkerOpen }
				setMarkerOpen={ setMarkerOpen }
				removeMarker={ removeMarker }
				changeMarkerProp={ changeMarkerProp }
				addMarkerManual={ addMarkerManual }
				api={ api }
				isSaving={ isSaving }
				changeAPI={ setAPI }
				saveAPIKey={ saveAPIKey }
			/>

			{ isModalOpen && (
				<MarkerModal
					marker={ selectedMarker }
					isAdvanced={ isAdvanced }
					isPlaceAPIAvailable={ isPlaceAPIAvailable }
					close={ () => setModalOpen( false ) }
					addMarker={ addMarker }
				/>
			) }

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
					'wp-block-themeisle-blocks-google-map-resizer',
					{ 'is-focused': isSelected }
				) }
			>
				<Map
					attributes={ attributes }
					className={ className }
					initMap={ initMap }
					displayMap={ displayMap }
					isMapLoaded={ isMapLoaded }
					selectMarker={ selectMarker }
					isSelectingMarker={ isSelectingMarker }
				/>
			</ResizableBox>
		</Fragment>
	);
};

export default Edit;
