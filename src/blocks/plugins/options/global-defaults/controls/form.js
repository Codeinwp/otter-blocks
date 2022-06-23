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
	__experimentalBoxControl as BoxControl, FontSizePicker
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

			<PanelBody
				title={ __( 'Label Styling', 'otter-blocks' )}
				initialOpen={ false }
			>

				<RangeControl
					label={ __( 'Spacing', 'otter-blocks' ) }
					value={ defaults.inputGap}
					onChange={ inputGap => setDefaults({ inputGap }) }
					allowReset
					min={ 0 }
					max={ 50 }
					initialPosition={ 5 }
				/>

				<FontSizePicker
					label={ __( 'Font Size', 'otter-blocks' ) }
					fontSizes={[
						{
							name: __( 'Small', 'otter-blocks' ),
							size: 12,
							slug: 'small'
						},
						{
							name: __( 'Normal', 'otter-blocks' ),
							size: 16,
							slug: 'normal'
						},
						{
							name: __( 'Big', 'otter-blocks' ),
							size: 26,
							slug: 'big'
						}
					]}
					withReset
					value={ defaults.labelFontSize }
					onChange={ labelFontSize =>  setDefaults({ labelFontSize }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Input Styling', 'otter-blocks' )}
				initialOpen={false}
			>

				<RangeControl
					label={ __( 'Spacing', 'otter-blocks' ) }
					value={ defaults.inputsGap }
					onChange={ inputsGap => setDefaults({ inputsGap }) }
					allowReset
					min={ 0 }
					max={ 50 }
					initialPosition={ 10 }
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
					label={ __( 'Border Width', 'otter-blocks' ) }
					value={ defaults.inputBorderWidth }
					onChange={ inputBorderWidth => setDefaults({ inputBorderWidth }) }
					allowReset
					min={ 0 }
					max={ 50 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Button', 'otter-blocks' )}
				initialOpen={ false }
			>
				<FontSizePicker
					label={ __( 'Font Size', 'otter-blocks' ) }
					fontSizes={[
						{
							name: __( 'Small', 'otter-blocks' ),
							size: 12,
							slug: 'small'
						},
						{
							name: __( 'Normal', 'otter-blocks' ),
							size: 16,
							slug: 'normal'
						},
						{
							name: __( 'Big', 'otter-blocks' ),
							size: 26,
							slug: 'big'
						}
					]}
					withReset
					value={ defaults.submitFontSize }
					onChange={ submitFontSize => setDefaults({ submitFontSize }) }
				/>
			</PanelBody>
		</Fragment>
	);
};

export default Form;
