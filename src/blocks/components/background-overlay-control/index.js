/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BackgroundSelectorControl from '../background-selector-control/index.js';
import ControlPanelControl from '../control-panel-control/index.js';

const BackgroundOverlayControl = ({
	backgroundType,
	backgroundColor,
	image,
	gradient,
	backgroundAttachment,
	backgroundRepeat,
	backgroundSize,
	focalPoint,
	backgroundOpacity,
	backgroundFilterBlur,
	backgroundFilterBrightness,
	backgroundFilterContrast,
	backgroundFilterGrayscale,
	backgroundFilterHue,
	backgroundFilterSaturate,
	backgroundBlend,
	changeImage,
	changeColor,
	removeImage,
	changeBackgroundType,
	changeGradient,
	changeBackgroundAttachment,
	changeBackgroundRepeat,
	changeBackgroundSize,
	changeFocalPoint,
	changeOpacity,
	changeFilterBlur,
	changeFilterBrightness,
	changeFilterContrast,
	changeFilterGrayscale,
	changeFilterHue,
	changeFilterSaturate,
	changeBlend
}) => {
	return (
		<Fragment>
			<BackgroundSelectorControl
				backgroundType={ backgroundType }
				backgroundColor={ backgroundColor }
				image={ image }
				gradient={ gradient }
				focalPoint={ focalPoint }
				backgroundAttachment={ backgroundAttachment }
				backgroundRepeat={ backgroundRepeat }
				backgroundSize={ backgroundSize }
				changeBackgroundType={ changeBackgroundType }
				changeImage={ changeImage }
				removeImage={ removeImage }
				changeColor={ changeColor }
				changeGradient={ changeGradient }
				changeBackgroundAttachment={ changeBackgroundAttachment }
				changeBackgroundRepeat={ changeBackgroundRepeat }
				changeFocalPoint={ changeFocalPoint }
				changeBackgroundSize={ changeBackgroundSize }
			/>

			<RangeControl
				label={ __( 'Overlay Opacity', 'otter-blocks' ) }
				value={ backgroundOpacity }
				onChange={ changeOpacity }
				min={ 0 }
				max={ 100 }
			/>

			<SelectControl
				label={ __( 'Blend Mode', 'otter-blocks' ) }
				value={ backgroundBlend }
				options={ [
					{ label: __( 'Normal', 'otter-blocks' ), value: 'normal' },
					{ label: __( 'Multiply', 'otter-blocks' ), value: 'multiply' },
					{ label: __( 'Screen', 'otter-blocks' ), value: 'screen' },
					{ label: __( 'Overlay', 'otter-blocks' ), value: 'overlay' },
					{ label: __( 'Darken', 'otter-blocks' ), value: 'darken' },
					{ label: __( 'Lighten', 'otter-blocks' ), value: 'lighten' },
					{ label: __( 'Color Dodge', 'otter-blocks' ), value: 'color-dodge' },
					{ label: __( 'Color Burn', 'otter-blocks' ), value: 'color-burn' },
					{ label: __( 'Hard Light', 'otter-blocks' ), value: 'hard-light' },
					{ label: __( 'Soft Light', 'otter-blocks' ), value: 'soft-light' },
					{ label: __( 'Difference', 'otter-blocks' ), value: 'difference' },
					{ label: __( 'Exclusion', 'otter-blocks' ), value: 'exclusion' },
					{ label: __( 'Hue', 'otter-blocks' ), value: 'hue' },
					{ label: __( 'Saturation', 'otter-blocks' ), value: 'saturation' },
					{ label: __( 'Color', 'otter-blocks' ), value: 'color' },
					{ label: __( 'Luminosity', 'otter-blocks' ), value: 'luminosity' }
				] }
				onChange={ changeBlend }
			/>

			<ControlPanelControl
				label={ __( 'Opacity & Filters', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Blur', 'otter-blocks' ) }
					value={ backgroundFilterBlur }
					onChange={ changeFilterBlur }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Brightness', 'otter-blocks' ) }
					value={ backgroundFilterBrightness }
					onChange={ changeFilterBrightness }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Contrast', 'otter-blocks' ) }
					value={ backgroundFilterContrast }
					onChange={ changeFilterContrast }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Grayscale', 'otter-blocks' ) }
					value={ backgroundFilterGrayscale }
					onChange={ changeFilterGrayscale }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Hue', 'otter-blocks' ) }
					value={ backgroundFilterHue }
					onChange={ changeFilterHue }
					min={ 0 }
					max={ 360 }
				/>

				<RangeControl
					label={ __( 'Saturation', 'otter-blocks' ) }
					value={ backgroundFilterSaturate }
					onChange={ changeFilterSaturate }
					min={ 0 }
					max={ 100 }
				/>
			</ControlPanelControl>
		</Fragment>
	);
};

export default BackgroundOverlayControl;
