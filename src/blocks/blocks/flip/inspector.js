/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { clamp } from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes
}) => {

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<RangeControl
					label={ __( 'Width', 'otter-blocks' ) }
					help={ __( 'Width of the container. Make sure that the width match the size of your content.', 'otter-blocks' ) }
					value={ attributes.width }
					onChange={ width => setAttributes({ width }) }
					min={ 0 }
					max={ 1200 }
				/>

				<RangeControl
					label={ __( 'Height', 'otter-blocks' ) }
					help={ __( 'Height of the container. Make sure that the height match the size of your content.', 'otter-blocks' ) }
					value={ attributes.height }
					onChange={ height => setAttributes({ height }) }
					min={ 0 }
					max={ 1200 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Padding', 'otter-blocks' ) }
					value={ attributes.padding }
					onChange={ padding => setAttributes({ padding }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ borderRadius => setAttributes({ borderRadius }) }
					min={ 0 }
					max={ 50 }
				/>

				<ColorGradientControl
					label={ __( 'Background Color', 'otter-blocks' ) }
					colorValue={ attributes.backgroundColor }
					onColorChange={ backgroundColor => setAttributes({ backgroundColor }) }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
