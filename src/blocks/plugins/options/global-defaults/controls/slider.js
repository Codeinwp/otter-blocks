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


const SliderControl = ({
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
			/>

			<ToggleControl
				label={ __( 'Hide Arrows', 'otter-blocks' ) }
				help={ __( 'Hide navigation arrows.', 'otter-blocks' ) }
				checked={ defaults.hideArrows }
				onChange={ hideArrows => changeConfig( blockName, { hideArrows }) }
			/>

			<ToggleControl
				label={ __( 'Hide Bullets', 'otter-blocks' ) }
				help={ __( 'Hide navigation bullets.', 'otter-blocks' ) }
				checked={ defaults.hideBullets }
				onChange={ hideBullets => changeConfig( blockName, { hideBullets }) }
			/>

		</Fragment>
	);
};

export default SliderControl;
