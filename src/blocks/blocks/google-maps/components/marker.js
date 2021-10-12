/**
 * WordPress dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	ExternalLink,
	SelectControl,
	TextControl
} from '@wordpress/components';

import { useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import MarkerEditor from './marker-editor.js';

const Marker = ({
	marker,
	isOpen,
	isPlaceAPIAvailable,
	openMarker,
	removeMarker,
	changeMarkerProp
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
					const location = place.formatted_address || place.name;
					const latitude = place.geometry.location.lat();
					const longitude = place.geometry.location.lng();
					changeMarkerProp( marker.id, 'location', location );
					changeMarkerProp( marker.id, 'latitude', latitude );
					changeMarkerProp( marker.id, 'longitude', longitude );
				});
			}
		});
	};

	return (
		<div className="wp-block-themeisle-blocks-google-map-marker">
			<div className="wp-block-themeisle-blocks-google-map-marker-title-area">
				<Button
					className="wp-block-themeisle-blocks-google-map-marker-title"
					onClick={ () => openMarker( marker.id ) }
				>
					{ marker.title || __( 'Custom Marker', 'otter-blocks' ) }
				</Button>

				<Button
					icon="no-alt"
					label={ __( 'Remove Marker', 'otter-blocks' ) }
					showTooltip={ true }
					className="wp-block-themeisle-blocks-google-map-marker-remove"
					onClick={ () => removeMarker( marker.id ) }
				/>
			</div>

			<div
				className={ classnames(
					'wp-block-themeisle-blocks-google-map-marker-control-area',
					{ 'opened': marker.id === isOpen }
				) }
			>
				<BaseControl
					label={ __( 'Location', 'otter-blocks' ) }
					id={ `themeisle-location-search-${ marker.id }` }
				>
					<input
						type="text"
						id={ `themeisle-location-search-${ marker.id }` }
						placeholder={ __( 'Enter a location…', 'otter-blocks' ) }
						value={ marker.location }
						className="wp-block-themeisle-blocks-google-map-search"
						ref={ searchRef }
						onFocus={ initSearch }
						onChange={ e => changeMarkerProp( marker.id, 'location', e.target.value ) }
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
					value={ marker.latitude }
					onChange={ e => changeMarkerProp( marker.id, 'latitude', e ) }
				/>

				<TextControl
					label={ __( 'Longitude', 'otter-blocks' ) }
					type="text"
					value={ marker.longitude }
					onChange={ e => changeMarkerProp( marker.id, 'longitude', e ) }
				/>

				<SelectControl
					label={ __( 'Map Icon', 'otter-blocks' ) }
					value={ marker.icon || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }
					options={ [
						{ label: __( 'Red', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
						{ label: __( 'Blue', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
						{ label: __( 'Yellow', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
						{ label: __( 'Green', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
						{ label: __( 'Orange', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' }
					] }
					onChange={ e => changeMarkerProp( marker.id, 'icon', e ) }
				/>

				<TextControl
					label={ __( 'Title', 'otter-blocks' ) }
					type="text"
					value={ marker.title }
					onChange={ e => changeMarkerProp( marker.id, 'title', e ) }
				/>

				<MarkerEditor
					label={ __( 'Description', 'otter-blocks' ) }
					type="text"
					value={ marker.description }
					onChange={ e => changeMarkerProp( marker.id, 'description', e ) }
				/>
			</div>
		</div>
	);
};

export default Marker;
