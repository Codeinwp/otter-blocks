// @ts-check

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { isObjectLike } from 'lodash';

import { PanelColorSettings } from '@wordpress/block-editor';

import {
	BaseControl,
	PanelBody,
	RangeControl,
	__experimentalBoxControl as BoxControl,
	FontSizePicker
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ColorDropdownControl, ResponsiveControl, ToogleGroupControl } from '../../../../components';
import { useResponsiveAttributes } from '../../../../helpers/utility-hooks';
import { _px } from '../../../../helpers/helper-functions';
import { makeBox } from '../../../copy-paste/utils';

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

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	const [ buttonColorView, setButtonColorView ] = useState( 'normal' );

	return (
		<Fragment>
			<PanelColorSettings
				title={ __( 'Form Color', 'otter-blocks' ) }
				initialOpen={ true }
				colorSettings={ [
					{
						value: attributes.labelColor,
						onChange: labelColor => setAttributes({ labelColor }),
						label: __( 'Label', 'otter-blocks' )
					},
					{
						value: attributes.inputColor,
						onChange: inputColor => setAttributes({ inputColor }),
						label: __( 'Input Text', 'otter-blocks' )
					},
					{
						value: attributes.inputBackgroundColor,
						onChange: inputBackgroundColor => setAttributes({ inputBackgroundColor }),
						label: __( 'Input Background', 'otter-blocks' )
					},
					{
						value: attributes.inputBorderColor,
						onChange: inputBorderColor => setAttributes({ inputBorderColor }),
						label: __( 'Border', 'otter-blocks' )
					},
					{
						value: attributes.helpLabelColor,
						onChange: helpLabelColor => setAttributes({ helpLabelColor }),
						label: __( 'Helper Label', 'otter-blocks' )
					},
					{
						value: attributes.inputRequiredColor,
						onChange: inputRequiredColor => setAttributes({ inputRequiredColor }),
						label: __( 'Required Label', 'otter-blocks' )
					},
					{
						value: attributes.submitMessageColor,
						onChange: submitMessageColor => setAttributes({ submitMessageColor }),
						label: __( 'Success Message', 'otter-blocks' )
					},
					{
						value: attributes.submitMessageErrorColor,
						onChange: submitMessageErrorColor => setAttributes({ submitMessageErrorColor }),
						label: __( 'Error Message', 'otter-blocks' )
					}
				] }
			/>

			<PanelBody
				title={ __( 'Button', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<ToogleGroupControl
					value={ buttonColorView }
					onChange={ setButtonColorView }
					options={[
						{
							label: 'Normal',
							value: 'normal'
						},
						{
							label: 'Hover',
							value: 'hover'
						}
					]}
				/>

				<br/>

				{
					( 'normal' === buttonColorView && (
						<Fragment>
							<ColorDropdownControl
								label={ __( 'Text', 'otter-blocks' ) }
								colorValue={ attributes.submitColor }
								onColorChange={( /** @type {string} */ value ) => setAttributes({ submitColor: value })}
								className="is-list is-first"
							/>

							<ColorDropdownControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ attributes.submitBackgroundColor }
								onColorChange={( /** @type {string} */ value ) => setAttributes({ submitBackgroundColor: value })}
								className="is-list"
							/>
						</Fragment>
					) ) ||
					( 'hover' === buttonColorView && (
						<Fragment>
							<ColorDropdownControl
								label={ __( 'Text', 'otter-blocks' ) }
								colorValue={ attributes.submitColorHover }
								onColorChange={( /** @type {string} */ value ) => setAttributes({ submitColorHover: value })}
								className="is-list is-first"
							/>

							<ColorDropdownControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ attributes.submitBackgroundColorHover }
								onColorChange={( /** @type {string} */ value ) => setAttributes({ submitBackgroundColorHover: value })}
								className="is-list"
							/>
						</Fragment>
					) )
				}

				<br/>

				<FontSizePicker
					label={ __( 'Font Size', 'otter-blocks' ) }
					fontSizes={ defaultFontSizes }
					withReset
					value={ attributes.submitFontSize }
					onChange={ submitFontSize =>  setAttributes({ submitFontSize }) }
				/>

				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={ responsiveGetAttributes([ attributes.buttonPadding, attributes.buttonPaddingTablet, attributes.buttonPaddingMobile ]) ?? { top: '10px', bottom: '10px', right: '20px', left: '20px' }  }
						onChange={ value => responsiveSetAttributes( value, [ 'buttonPadding', 'buttonPaddingTablet', 'buttonPaddingMobile' ]) }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Labels', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<FontSizePicker
					label={ __( 'Font Size', 'otter-blocks' ) }
					fontSizes={ defaultFontSizes }
					withReset
					value={ attributes.labelFontSize }
					onChange={ labelFontSize =>  setAttributes({ labelFontSize }) }
				/>

				<RangeControl
					label={ __( 'Spacing', 'otter-blocks' ) }
					value={ attributes.inputGap ?? 10 }
					onChange={ inputGap => setAttributes({ inputGap }) }
					allowReset
					step={ 0.1 }
					min={ 0 }
					max={ 50 }
					initialPosition={ 10 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Input Fields', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<FontSizePicker
					label={ __( 'Input Font Size', 'otter-blocks' ) }
					fontSizes={ defaultFontSizes }
					withReset
					value={ attributes.inputFontSize }
					onChange={ inputFontSize =>  setAttributes({ inputFontSize }) }
				/>

				<RangeControl
					label={ __( 'Fields Spacing', 'otter-blocks' ) }
					value={ attributes.inputsGap ?? 16}
					onChange={ inputsGap => setAttributes({ inputsGap }) }
					allowReset
					min={ 0 }
					max={ 50 }
					initialPosition={ 16 }
				/>

				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
				>
					<BoxControl
						label={ __( 'Input Padding', 'otter-blocks' ) }
						values={ responsiveGetAttributes([ attributes.inputPadding, attributes.inputPaddingTablet, attributes.inputPaddingMobile  ]) ?? { 'top': '8px', 'right': '8px', 'bottom': '8px', 'left': '8px' } }
						inputProps={ {
							min: 0,
							max: 500
						} }
						onChange={ value => responsiveSetAttributes( value, [ 'inputPadding', 'inputPaddingTablet', 'inputPaddingMobile' ]) }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Border', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<BoxControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					values={ ! isObjectLike( attributes.inputBorderRadius ) ? makeBox( _px( attributes.inputBorderRadius ?? 4 ) ) : attributes.inputBorderRadius }
					onChange={ inputBorderRadius  => setAttributes({ inputBorderRadius }) }
					id="o-border-raduis-box"
				/>

				<BoxControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					values={ ! isObjectLike( attributes.inputBorderWidth ) ? makeBox( _px( attributes.inputBorderWidth ?? 1 ) ) : attributes.inputBorderWidth }
					onChange={ inputBorderWidth  => setAttributes({ inputBorderWidth }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Helper & Submit Messages', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<BaseControl
					label={ __( 'Helper Text Size', 'otter-blocks' ) }
				>
					<FontSizePicker
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.helpFontSize }
						onChange={ helpFontSize =>  setAttributes({ helpFontSize }) }
					/>
				</BaseControl>

				<BaseControl
					label={ __( 'Success/Error Message Size', 'otter-blocks' ) }
				>
					<FontSizePicker
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.messageFontSize }
						onChange={ messageFontSize =>  setAttributes({ messageFontSize }) }
					/>
				</BaseControl>
			</PanelBody>
		</Fragment>
	);
};

export default Form;
