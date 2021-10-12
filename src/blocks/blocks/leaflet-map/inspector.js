/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useState } from '@wordpress/element';

import {
	PanelBody,
	TextControl,
	RangeControl,
	BaseControl,
	ToggleControl
} from '@wordpress/components';

import { InspectorControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { getLocation } from './utility';

import MarkerWrapper from './components/marker-wrapper.js';

const Inspector = ({
	attributes,
	setAttributes,
	dispatch,
	markersInteraction
}) => {
	const [ location, setLocation ] = useState( attributes.location );

	const [ error, setError ] = useState({
		target: '',
		reason: ''
	});

	const search = async() => {
		setAttributes({ location });

		const LngLat = await getLocation( location );

		if ( LngLat ) {
			setAttributes({
				latitude: LngLat.latitude.toString(),
				longitude: LngLat.longitude.toString()
			});

			if ( 'LOCATION' === error.target ) {
				setError({});
			}
		} else {
			setError({
				target: 'LOCATION',
				reason: __( 'Location couldn\'t been found!', 'otter-blocks' )
			});
		}
	};

	const changeLatitude = value => {
		setAttributes({ latitude: value.toString() });
	};

	const changeLongitude = value => {
		setAttributes({ longitude: value.toString() });
	};

	const changeHeight = value => {
		setAttributes({ height: value });
	};

	const changeZoom = value => {
		setAttributes({ zoom: value });
	};

	const toggleDraggable = () => {
		setAttributes({ draggable: ! attributes.draggable });
	};

	const toggleZoomControl = () => {
		setAttributes({ zoomControl: ! attributes.zoomControl });
	};

	const searchOnPress = ( event, key ) => {
		if ( event.key === key ) {
			search();
		}
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Location', 'otter-blocks' ) }
			>
				<TextControl
					label={ __( 'Location', 'otter-blocks' ) }
					type="text"
					className={ classnames(
						{ 'wp-block-themeisle-blocks-leaflet-map-input-error': 'LOCATION' === error.target }
					) }
					placeholder={ __( 'Enter location. E.g: La Sagrada Familia, Barcelona, Spain', 'otter-blocks' ) }
					help={ __( 'Press Enter to search the location', 'otter-blocks' ) }
					value={ location }
					onChange={ setLocation }
					onKeyDown={ event => searchOnPress( event, 'Enter' ) }
				/>

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
					label={ __( 'Zoom Control', 'otter-blocks' ) }
					checked={ attributes.zoomControl }
					onChange={ toggleZoomControl }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Markers', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<MarkerWrapper
					markers={ attributes.markers }
					dispatch={ dispatch }
					markersInteraction={ markersInteraction }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
