/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	ButtonGroup,
	Modal,
	SelectControl,
	TextControl
} from '@wordpress/components';

import {
	useEffect,
	useRef,
	useState,
	Fragment
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import MarkerEditor from './marker-editor.js';

const MarkerModal = ({
	marker,
	isAdvanced,
	isPlaceAPIAvailable,
	addMarker,
	close
}) => {
	useEffect( () => {
		setID( marker.id );
		setLocation( marker.location );
		setTitle( marker.title );
		setIcon( marker.icon );
		setDescription( marker.description );
		setLatitude( marker.latitude );
		setLongitude( marker.longitude );
	}, [ marker ]);

	const searchRef = useRef( null );

	const [ id, setID ] = useState( marker.id );
	const [ location, setLocation ] = useState( marker.location );
	const [ title, setTitle ] = useState( marker.title );
	const [ icon, setIcon ] = useState( marker.icon );
	const [ description, setDescription ] = useState( marker.description );
	const [ latitude, setLatitude ] = useState( marker.latitude );
	const [ longitude, setLongitude ] = useState( marker.longitude );

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
					setLocation( location );
					setLatitude( latitude );
					setLongitude( longitude );
				});
			}
		});
	};

	return (
		<Modal
			title={ __( 'Add Marker', 'otter-blocks' ) }
			onRequestClose={ close }
			shouldCloseOnClickOutside={ false }
		>
			{ isAdvanced && (
				<Fragment>
					<BaseControl
						label={ __( 'Location', 'otter-blocks' ) }
						id={ `themeisle-location-search-${ marker.id }` }
					>
						<input
							type="text"
							id={ `themeisle-location-search-${ id }` }
							placeholder={ __( 'Enter a location…', 'otter-blocks' ) }
							value={ location }
							className="wp-block-themeisle-blocks-google-map-search"
							ref={ searchRef }
							onFocus={ initSearch }
							onChange={ e => setLocation( e.target.value ) }
							disabled={ ! isPlaceAPIAvailable }
						/>
					</BaseControl>

					<TextControl
						label={ __( 'Latitude', 'otter-blocks' ) }
						type="text"
						value={ latitude }
						onChange={ setLatitude }
					/>

					<TextControl
						label={ __( 'Longitude', 'otter-blocks' ) }
						type="text"
						value={ longitude }
						onChange={ setLongitude }
					/>
				</Fragment>
			) }

			<TextControl
				label={ __( 'Title', 'otter-blocks' ) }
				type="text"
				value={ title }
				onChange={ setTitle }
			/>

			<MarkerEditor
				label={ __( 'Description', 'otter-blocks' ) }
				type="text"
				value={ description }
				onChange={ setDescription }
			/>

			<SelectControl
				label={ __( 'Map Icon', 'otter-blocks' ) }
				value={ icon || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }
				options={ [
					{ label: __( 'Red', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
					{ label: __( 'Blue', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
					{ label: __( 'Yellow', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
					{ label: __( 'Green', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
					{ label: __( 'Orange', 'otter-blocks' ), value: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' }
				] }
				onChange={ setIcon }
			/>

			<ButtonGroup>
				<Button
					isLarge
					isPrimary
					onClick={ () => addMarker( location, title, icon, description, latitude, longitude  ) }
				>
					{ __( 'Add', 'otter-blocks' ) }
				</Button>

				<Button
					isLarge
					isSecondary
					onClick={ close }
				>
					{ __( 'Cancel', 'otter-blocks' ) }
				</Button>
			</ButtonGroup>
		</Modal>
	);
};

export default MarkerModal;
