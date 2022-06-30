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
	__experimentalBoxControl as BoxControl, FontSizePicker, TextControl, SelectControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';
import SyncControl from '../../../../components/sync-control';

const defaultFontSizes = [
	{
		name: __( 'Small', 'otter-blocks' ),
		size: '0.875em',
		slug: 'small'
	},
	{
		name: __( 'Medium', 'otter-blocks' ),
		size: '1em',
		slug: 'medium'
	},
	{
		name: __( 'Large', 'otter-blocks' ),
		size: '1.125em',
		slug: 'large'
	},
	{
		name: __( 'XL', 'otter-blocks' ),
		size: '1.25em',
		slug: 'xl'
	}
];

const Form = ({
	blockName,
	defaults: attributes,
	changeConfig
}) => {

	const setAttributes = x => changeConfig( blockName, x );

	return (
		<Fragment>
			<PanelColorSettings
				title={ __( 'Form Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.labelColor,
						onChange: labelColor => setAttributes({ labelColor }),
						label: __( 'Label', 'otter-blocks' )
					},
					{
						value: attributes.helpLabelColor,
						onChange: helpLabelColor => setAttributes({ helpLabelColor }),
						label: __( 'Help Label', 'otter-blocks' )
					},
					{
						value: attributes.inputBorderColor,
						onChange: inputBorderColor => setAttributes({ inputBorderColor }),
						label: __( 'Border', 'otter-blocks' )
					},
					{
						value: attributes.inputRequiredColor,
						onChange: inputRequiredColor => setAttributes({ inputRequiredColor }),
						label: __( 'Label Required', 'otter-blocks' )
					},
					{
						value: attributes.inputColor,
						onChange: inputColor => setAttributes({ inputColor }),
						label: __( 'Input', 'otter-blocks' )
					}
				] }
			/>

			<PanelColorSettings
				title={ __( 'Button Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.submitColor,
						onChange: submitColor => setAttributes({ submitColor }),
						label: __( 'Submit Text', 'otter-blocks' )
					},
					{
						value: attributes.submitBackgroundColor,
						onChange: submitBackgroundColor => setAttributes({ submitBackgroundColor }),
						label: __( 'Button Background', 'otter-blocks' )
					},
					{
						value: attributes.submitBackgroundColorHover,
						onChange: submitBackgroundColorHover => setAttributes({ submitBackgroundColorHover }),
						label: __( 'Button Background on Hover', 'otter-blocks' )
					},
					{
						value: attributes.submitMessageColor,
						onChange: submitMessageColor => setAttributes({ submitMessageColor }),
						label: __( 'Successful Message', 'otter-blocks' )
					},
					{
						value: attributes.submitMessageErrorColor,
						onChange: submitMessageErrorColor => setAttributes({ submitMessageErrorColor }),
						label: __( 'Error Message', 'otter-blocks' )
					}
				] }
			/>

			<PanelBody
				title={ __( 'Label Styling', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SyncControl
					field={ 'inputGap' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<RangeControl
						label={ __( 'Spacing', 'otter-blocks' ) }
						value={ attributes.inputGap ?? 16 }
						onChange={ inputGap => setAttributes({ inputGap }) }
						allowReset
						min={ 0 }
						max={ 50 }
						initialPositino={ 5 }
					/>
				</SyncControl>

				<SyncControl
					field={ 'labelFontSize' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<FontSizePicker
						label={ __( 'Font Size', 'otter-blocks' ) }
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.labelFontSize }
						onChange={ labelFontSize =>  setAttributes({ labelFontSize }) }
					/>
				</SyncControl>

			</PanelBody>

			<PanelBody
				title={ __( 'Input Styling', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SyncControl
					field={ 'inputFontSize' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<FontSizePicker
						label={ __( 'Input Font Size', 'otter-blocks' ) }
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.inputFontSize }
						onChange={ inputFontSize =>  setAttributes({ inputFontSize }) }
					/>
				</SyncControl>

				<SyncControl
					field={ 'inputsGap' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<RangeControl
						label={ __( 'Fields Spacing', 'otter-blocks' ) }
						value={ attributes.inputsGap ?? 10}
						onChange={ inputsGap => setAttributes({ inputsGap }) }
						allowReset
						min={ 0 }
						max={ 50 }
						initialPosition={ 10 }
					/>
				</SyncControl>

				<SyncControl
					field={ 'inputPadding' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<BoxControl
						label={ __( 'Input Padding', 'otter-blocks' ) }
						values={ attributes.inputPadding ?? {'top': '8px', 'right': '8px', 'bottom': '8px', 'left': '8px'} }
						inputProps={ {
							min: 0,
							max: 500
						} }
						onChange={ inputPadding => setAttributes({ inputPadding }) }
					/>
				</SyncControl>

				<SyncControl
					field={ 'inputsBorderRadius' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<RangeControl
						label={ __( 'Border Radius', 'otter-blocks' ) }
						value={ attributes.inputBorderRadius ?? 4 }
						onChange={ inputBorderRadius => setAttributes({ inputBorderRadius }) }
						allowReset
						min={ 0 }
						max={ 50 }
					/>
				</SyncControl>

				<SyncControl
					field={ 'inputsBorderWidth' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<RangeControl
						label={ __( 'Border Width', 'otter-blocks' ) }
						value={ attributes.inputBorderWidth ?? 1 }
						onChange={ inputBorderWidth => setAttributes({ inputBorderWidth }) }
						allowReset
						min={ 0 }
						max={ 50 }
					/>
				</SyncControl>

				<SyncControl
					field={ 'helpFontSize' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<h2>{__( 'Help Text Font Size', 'otter-blocks' )}</h2>

					<FontSizePicker
						label={ __( 'Help Font Size', 'otter-blocks' ) }
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.helpFontSize }
						onChange={ helpFontSize =>  setAttributes({ helpFontSize }) }
					/>
				</SyncControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Button', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					placeholder={ __( 'Submit', 'otter-blocks' ) }
					value={ attributes.submitLabel }
					onChange={ submitLabel => setAttributes({ submitLabel }) }
					help={ __( 'Set the label for the submit button.', 'otter-blocks' ) }
				/>

				<SyncControl
					field={ 'submitFontSize' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<FontSizePicker
						label={ __( 'Font Size', 'otter-blocks' ) }
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.submitFontSize }
						onChange={ submitFontSize =>  setAttributes({ submitFontSize }) }
					/>
				</SyncControl>

				<SelectControl
					label={ __( 'Alignment', 'otter-blocks' ) }
					value={ attributes.submitStyle }
					options={[
						{
							label: 'Default',
							value: ''
						},
						{
							label: 'Right',
							value: 'right'
						},
						{
							label: 'Full',
							value: 'full'
						}
					]}
					onChange={ submitStyle => setAttributes({ submitStyle}) }
				/>

				<SyncControl
					field={ 'messageFontSize' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<h2>{__( 'Message Font Size', 'otter-blocks' )}</h2>

					<FontSizePicker
						label={ __( 'Message Font Size', 'otter-blocks' ) }
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.messageFontSize }
						onChange={ messageFontSize =>  setAttributes({ messageFontSize }) }
					/>
				</SyncControl>
			</PanelBody>
		</Fragment>
	);
};

export default Form;
