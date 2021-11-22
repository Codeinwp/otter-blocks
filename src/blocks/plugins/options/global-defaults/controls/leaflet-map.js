/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const LeafletMapControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>

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

			<ToggleControl
				label={ __( 'Draggable Map', 'otter-blocks' ) }
				checked={ defaults.draggable }
				onChange={ draggable => changeConfig( blockName, { draggable }) }
			/>

			<ToggleControl
				label={ __( 'Zoom Control', 'otter-blocks' ) }
				checked={ defaults.zoomControl }
				onChange={ zoomControl => changeConfig( blockName, { zoomControl }) }
			/>

		</Fragment>
	);
};

export default LeafletMapControl;
