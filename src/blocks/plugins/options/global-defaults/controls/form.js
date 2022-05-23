/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const Form = ({
	blockName,
	defaults,
	changeConfig
}) => {

	const setDefaults = x => changeConfig( blockName, x );

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Setting', 'otter-blocks' )}
			>
				<RangeControl
					label={ __( 'Button Font Size', 'otter-blocks' ) }
					value={ defaults.submitFontSize }
					onChange={ submitFontSize => setDefaults({ submitFontSize }) }
					allowReset
					min={ 0 }
					max={ 50 }
				/>

				<RangeControl
					label={ __( 'Fields Spacing', 'otter-blocks' ) }
					value={ defaults.inputsGap || 10 }
					onChange={ inputsGap => setDefaults({ inputsGap }) }
					allowReset
					min={ 0 }
					max={ 50 }
				/>

				<BoxControl
					label={ __( 'Input Padding', 'otter-blocks' ) }
					values={ defaults.inputPadding }
					inputProps={ {
						min: 0,
						max: 500
					} }
					onChange={ inputPadding => setDefaults({ inputPadding }) }
				/>

				<RangeControl
					label={ __( 'Label Spacing', 'otter-blocks' ) }
					value={ defaults.inputGap || 5}
					onChange={ inputGap => setDefaults({ inputGap }) }
					allowReset
					min={ 0 }
					max={ 50 }
				/>

				<RangeControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					value={ defaults.inputBorderWidth }
					onChange={ inputBorderWidth => setDefaults({ inputBorderWidth }) }
					allowReset
					min={ 0 }
					max={ 50 }
				/>

				<RangeControl
					label={ __( 'Label Font Size', 'otter-blocks' ) }
					value={ defaults.labelFontSize }
					onChange={ labelFontSize => setDefaults({ labelFontSize }) }
					allowReset
					min={ 0 }
					max={ 50 }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: defaults.labelColor,
						onChange: labelColor => setDefaults({ labelColor }),
						label: __( 'Label Color', 'otter-blocks' )
					},
					{
						value: defaults.inputBorderColor,
						onChange: inputBorderColor => setDefaults({ inputBorderColor }),
						label: __( 'Border Color', 'otter-blocks' )
					},
					{
						value: defaults.submitColor,
						onChange: submitColor => setDefaults({ submitColor }),
						label: __( 'Submit Text Color', 'otter-blocks' )
					},
					{
						value: defaults.submitBackgroundColor,
						onChange: submitBackgroundColor => setDefaults({ submitBackgroundColor }),
						label: __( 'Button Background Color', 'otter-blocks' )
					},
					{
						value: defaults.submitBackgroundColorHover,
						onChange: submitBackgroundColorHover => setDefaults({ submitBackgroundColorHover }),
						label: __( 'Button Background Color on Hover', 'otter-blocks' )
					},
					{
						value: defaults.submitMessageColor,
						onChange: submitMessageColor => setDefaults({ submitMessageColor }),
						label: __( 'Successful Message Color', 'otter-blocks' )
					},
					{
						value: defaults.submitMessageErrorColor,
						onChange: submitMessageErrorColor => setDefaults({ submitMessageErrorColor }),
						label: __( 'Error Message Color', 'otter-blocks' )
					}
				] }
			>
			</PanelColorSettings>
		</Fragment>
	);
};

export default Form;
