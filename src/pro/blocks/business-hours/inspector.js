/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl
} from '@wordpress/components';

/**
 *
 * @param {import('./types').BusinessHoursInspectorProps} props
 * @return
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-pro' ) }
			>
				<RangeControl
					label={ __( 'Gap', 'otter-pro' ) }
					value={ attributes.gap }
					onChange={ value => setAttributes({ gap: Number( value ) }) }
					min={ 0 }
					max={ 60 }
				/>

				<RangeControl
					label={ __( 'Title Font Size', 'otter-pro' ) }
					value={ attributes.titleFontSize }
					onChange={ value => setAttributes({ titleFontSize: Number( value ) }) }
					step={ 0.1 }
					min={ 0 }
					max={ 60 }
				/>

				<RangeControl
					label={ __( 'Items Font Size', 'otter-pro' ) }
					value={ attributes.itemsFontSize }
					onChange={ value => setAttributes({ itemsFontSize: Number( value ) }) }
					step={ 0.1 }
					min={ 0 }
					max={ 60 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-pro' ) }
					value={ attributes.borderRadius }
					onChange={ value => setAttributes({ borderRadius: Number( value ) }) }
					step={ 0.1 }
					min={ 0 }
					max={ 60 }
				/>

				<RangeControl
					label={ __( 'Border Width', 'otter-pro' ) }
					value={ attributes.borderWidth }
					onChange={ value => setAttributes({ borderWidth: Number( value ) }) }
					step={ 0.1 }
					min={ 0 }
					max={ 120 }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-pro' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.titleColor,
						onChange: titleColor => setAttributes({ titleColor }),
						label: __( 'Title', 'otter-pro' ),
						isShownByDefault: true
					},
					{
						value: attributes.backgroundColor,
						onChange: backgroundColor => setAttributes({ backgroundColor }),
						label: __( 'Background', 'otter-pro' ),
						isShownByDefault: true
					},
					{
						value: attributes.borderColor,
						onChange: borderColor => setAttributes({ borderColor }),
						label: __( 'Border', 'otter-pro' ),
						isShownByDefault: true
					}
				] }
			>
				<ContrastChecker
					{ ...{
						textColor: attributes.titleColor,
						backgroundColor: attributes.backgroundColor
					} }
				/>
			</PanelColorSettings>
		</InspectorControls>
	);
};

export default Inspector;
