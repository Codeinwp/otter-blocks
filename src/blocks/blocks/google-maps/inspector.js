/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { InspectorControls } from '@wordpress/block-editor';

import { useRef } from '@wordpress/element';

import { StyleSwitcherInspectorControl } from '../../components/style-switcher-control/index.js';
import MarkerWrapper from './components/marker-wrapper.js';

const Inspector = ({
	attributes,
	setAttributes,
	map,
	changeStyle,
	isPlaceAPIAvailable,
	isMarkerOpen,
	setMarkerOpen,
	removeMarker,
	changeMarkerProp,
	addMarkerManual,
	api,
	isSaving,
	changeAPI,
	saveAPIKey
}) => {
	const searchRef = useRef( null );

	const initSearch = () => {
		const elements = document.getElementsByClassName( 'pac-container' );

		Object.keys( elements ).forEach( e => elements[e].remove() );

		const searchBox = new google.maps.places.SearchBox( searchRef.current );

		searchBox.addListener( 'places_changed', () => {
			const places = searchBox.getPlaces();

			if ( places && ( 0 < places.length ) ) {
				places.forEach( place => {
					const latitude = place.geometry.location.lat();
					const longitude = place.geometry.location.lng();
					const latLng = new google.maps.LatLng( latitude, longitude );
					map.setCenter( latLng );
					setAttributes({
						location: place.formatted_address || place.name,
						latitude: latitude.toString(),
						longitude: longitude.toString()
					});
				});
			}
		});
	};

	const changeLocation = value => {
		setAttributes({ location: value.target.value });
	};

	const changeLatitude = value => {
		setAttributes({ latitude: value.toString() });
		const latitude = Number( value );
		const longitude = attributes.longitude;
		const latLng = new google.maps.LatLng( latitude, longitude );
		map.setCenter( latLng );
	};

	const changeLongitude = value => {
		setAttributes({ longitude: value.toString() });
		const latitude = attributes.latitude;
		const longitude = Number( value );
		const latLng = new google.maps.LatLng( latitude, longitude );
		map.setCenter( latLng );
	};

	const changeMapType = value => {
		setAttributes({ type: value });
		map.setMapTypeId( google.maps.MapTypeId[ value.toUpperCase() ]);
	};

	const changeZoom = value => {
		setAttributes({ zoom: value });
		map.setZoom( value );
	};

	const changeHeight = value => {
		setAttributes({ height: value });
	};

	const toggleDraggable = () => {
		setAttributes({ draggable: ! attributes.draggable });
	};

	const toggleMapTypeControl = () => {
		setAttributes({ mapTypeControl: ! attributes.mapTypeControl });
	};

	const toggleZoomControl = () => {
		setAttributes({ zoomControl: ! attributes.zoomControl });
	};

	const toggleFullScreenControl = () => {
		setAttributes({ fullscreenControl: ! attributes.fullscreenControl });
	};

	const toggleStreetViewControl = () => {
		setAttributes({ streetViewControl: ! attributes.streetViewControl });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Styles', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<StyleSwitcherInspectorControl
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
			</PanelBody>

			<PanelBody
				title={ __( 'Location', 'otter-blocks' ) }
			>
				<BaseControl
					label={ __( 'Location' ) }
					id="wp-block-themeisle-blocks-google-map-search"
				>
					<input
						type="text"
						id="wp-block-themeisle-blocks-google-map-search"
						placeholder={ __( 'Enter a location…', 'otter-blocks' ) }
						value={ attributes.location }
						className="wp-block-themeisle-blocks-google-map-search"
						ref={ searchRef }
						onFocus={ initSearch }
						onChange={ changeLocation }
						disabled={ ! isPlaceAPIAvailable }
					/>

					{ ! isPlaceAPIAvailable && (
						<p>
							{ __( 'To enable locations earch, please ensure Places API is activated in the Google Developers Console.', 'otter-blocks' ) + ' ' }
							<ExternalLink href="https://developers.google.com/places/web-service/intro">
								{ __( 'More info.', 'otter-blocks' ) }
							</ExternalLink>
						</p>
					) }
				</BaseControl>

				<TextControl
					label={ __( 'Latitude', 'otter-blocks' ) }
					type="text"
					placeholder={ __( 'Enter latitude…', 'otter-blocks' ) }
					value={ attributes.latitude }
					onChange={ changeLatitude }
				/>

				<TextControl
					label={ __( 'Longitude', 'otter-blocks' ) }
					type="text"
					placeholder={ __( 'Enter longitude', 'otter-blocks' ) }
					value={ attributes.longitude }
					onChange={ changeLongitude }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Positioning & Zooming', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Map Type', 'otter-blocks' ) }
					value={ attributes.type }
					options={ [
						{ label: __( 'Road Map', 'otter-blocks' ), value: 'roadmap' },
						{ label: __( 'Satellite View', 'otter-blocks' ), value: 'satellite' },
						{ label: __( 'Hybrid', 'otter-blocks' ), value: 'hybrid' },
						{ label: __( 'Terrain', 'otter-blocks' ), value: 'terrain' }
					] }
					onChange={ changeMapType }
				/>

				<RangeControl
					label={ __( 'Map Zoom Level', 'otter-blocks' ) }
					value={ attributes.zoom }
					onChange={ changeZoom }
					min={ 0 }
					max={ 20 }
				/>

				<RangeControl
					label={ __( 'Map Height', 'otter-blocks' ) }
					value={ attributes.height }
					onChange={ changeHeight }
					min={ 100 }
					max={ 1400 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Controls', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<BaseControl>
					{ __( 'The following changes will not affect block preview during the editing process. You can click outside the block to see the changes take effect.', 'otter-blocks' ) }
				</BaseControl>

				<ToggleControl
					label={ __( 'Draggable Map', 'otter-blocks' ) }
					checked={ attributes.draggable }
					onChange={ toggleDraggable }
				/>

				<ToggleControl
					label={ __( 'Map Type Control', 'otter-blocks' ) }
					checked={ attributes.mapTypeControl }
					onChange={ toggleMapTypeControl }
				/>

				<ToggleControl
					label={ __( 'Zoom Control', 'otter-blocks' ) }
					checked={ attributes.zoomControl }
					onChange={ toggleZoomControl }
				/>

				<ToggleControl
					label={ __( 'Full Screen Control', 'otter-blocks' ) }
					checked={ attributes.fullscreenControl }
					onChange={ toggleFullScreenControl }
				/>

				<ToggleControl
					label={ __( 'Streen View Control', 'otter-blocks' ) }
					checked={ attributes.streetViewControl }
					onChange={ toggleStreetViewControl }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Markers', 'otter-blocks' ) }
				initialOpen={ false }
				opened={ false !== isMarkerOpen ? true : undefined }
				onToggle={ () => {
					if ( false !== isMarkerOpen ) {
						setMarkerOpen( true );
					}
				} }
			>
				<MarkerWrapper
					markers={ attributes.markers }
					removeMarker={ removeMarker }
					changeMarkerProp={ changeMarkerProp }
					addMarker={ addMarkerManual }
					isPlaceAPIAvailable={ isPlaceAPIAvailable }
					initialOpen={ isMarkerOpen }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Global Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Google Maps API Key', 'otter-blocks' ) }
					type="text"
					placeholder={ __( 'Google Maps API Key', 'otter-blocks' ) }
					value={ api }
					className="components-placeholder__input"
					onChange={ changeAPI }
					help={ __( 'Changing the API key effects all Google Map Embed blocks. You will have to refresh the page after changing your API keys.', 'otter-blocks' ) }
				/>

				<Button
					isLarge
					isSecondary
					type="submit"
					onClick={ saveAPIKey }
					isBusy={ isSaving }
				>
					{ __( 'Save API Key', 'otter-blocks' ) }
				</Button>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
