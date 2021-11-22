/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	ToggleControl,
	PanelBody
} from '@wordpress/components';

import {
	__experimentalColorGradientControl as ColorGradientControl
} from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const PopupControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>

			<ToggleControl
				label={ __( 'Show Close Button', 'otter-blocks' ) }
				checked={ defaults.showClose }
				onChange={ showClose => changeConfig( blockName, { showClose }) }
			/>

			<ToggleControl
				label={ __( 'Close on Click Outside', 'otter-blocks' ) }
				checked={ defaults.outsideClose }
				onChange={ outsideClose => changeConfig( blockName, { outsideClose }) }
			/>
			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Minimum Width', 'otter-blocks' ) }
					min={ 100 }
					max={ 1000 }
					value={ defaults.minWidth }
					onChange={ minWidth => changeConfig( blockName, { minWidth }) }
				/>

				<ColorGradientControl
					label={ __( 'Background', 'otter-blocks' ) }
					colorValue={ defaults.backgroundColor }
					onColorChange={ backgroundColor => changeConfig( blockName, { backgroundColor }) }
				/>

				{ defaults.showClose && (
					<ColorGradientControl
						label={ __( 'Close Button', 'otter-blocks' ) }
						colorValue={ defaults.closeColor }
						onColorChange={ closeColor => changeConfig( blockName, { closeColor }) }
					/>
				) }

				<ColorGradientControl
					label={ __( 'Overlay', 'otter-blocks' ) }
					colorValue={ defaults.overlayColor }
					onColorChange={ overlayColor => changeConfig( blockName, { overlayColor }) }
				/>

				<RangeControl
					label={ __( 'Overlay Opacity', 'otter-blocks' ) }
					value={ defaults.overlayOpacity }
					onChange={ overlayOpacity => changeConfig( blockName, { overlayOpacity }) }
					allowReset={ true }
				/>
			</PanelBody>

		</Fragment>
	);
};

export default PopupControl;
