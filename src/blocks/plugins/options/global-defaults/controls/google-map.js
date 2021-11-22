/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	ToggleControl,
	PanelBody,
	SelectControl,
	BaseControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const GoogleMapControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>

			<PanelBody
				title={ __( 'Positioning & Zooming', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<SelectControl
					label={ __( 'Map Type', 'otter-blocks' ) }
					value={ defaults.type }
					options={ [
						{ label: __( 'Road Map', 'otter-blocks' ), value: 'roadmap' },
						{ label: __( 'Satellite View', 'otter-blocks' ), value: 'satellite' },
						{ label: __( 'Hybrid', 'otter-blocks' ), value: 'hybrid' },
						{ label: __( 'Terrain', 'otter-blocks' ), value: 'terrain' }
					] }
					onChange={ type => changeConfig( blockName, { type }) }
				/>

				<RangeControl
					label={ __( 'Height', 'otter-blocks' ) }
					help={ __( 'Slider height in pixels.', 'otter-blocks' ) }
					value={ defaults.height }
					onChange={ height => changeConfig( blockName, { height }) }
					min={ 100 }
					max={ 1400 }
					allowReset={ true }
				/>

				<RangeControl
					label={ __( 'Map Zoom Level', 'otter-blocks' ) }
					value={ defaults.zoom }
					onChange={ zoom => changeConfig( blockName, { zoom }) }
					min={ 0 }
					max={ 20 }
					allowReset={ true }
				/>

			</PanelBody>

			<PanelBody
				title={ __( 'Controls', 'otter-blocks' ) }
				initialOpen={ false }
			>

				<ToggleControl
					label={ __( 'Draggable Map', 'otter-blocks' ) }
					checked={ defaults.draggable }
					onChange={ draggable => changeConfig( blockName, { draggable }) }
				/>

				<ToggleControl
					label={ __( 'Map Type Control', 'otter-blocks' ) }
					checked={ defaults.mapTypeControl }
					onChange={ mapTypeControl => changeConfig( blockName, { mapTypeControl }) }
				/>

				<ToggleControl
					label={ __( 'Zoom Control', 'otter-blocks' ) }
					checked={ defaults.zoomControl }
					onChange={ zoomControl => changeConfig( blockName, { zoomControl }) }
				/>

				<ToggleControl
					label={ __( 'Full Screen Control', 'otter-blocks' ) }
					checked={ defaults.fullscreenControl }
					onChange={ fullscreenControl => changeConfig( blockName, { fullscreenControl }) }
				/>

				<ToggleControl
					label={ __( 'Streen View Control', 'otter-blocks' ) }
					checked={ defaults.streetViewControl }
					onChange={ streetViewControl => changeConfig( blockName, { streetViewControl }) }
				/>
			</PanelBody>
		</Fragment>
	);
};

export default GoogleMapControl;
