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
	ToggleControl,
	RangeControl,
	Dropdown,
	Button,
	DateTimePicker,
	FontSizePicker,
	__experimentalBoxControl as BoxControl,
	SelectControl,
	__experimentalUnitControl as UnitContol
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	format,
	__experimentalGetSettings
} from '@wordpress/date';

/**
 * Internal dependencies
 */
import ResponsiveControl from '../../components/responsive-control/index.js';
import SizingControl from '../../components/sizing-control/index.js';
import { mergeBoxDefaultValues, removeBoxDefaultValues, buildResponsiveSetAttributes, buildResponsiveGetAttributes } from '../../helpers/helper-functions.js';

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

const borderRadiusDirection = {
	'top-right': 'borderRadiusTopRight',
	'top-left': 'borderRadiusTopLeft',
	'bottom-left': 'borderRadiusBottomLeft',
	'bottom-right': 'borderRadiusBottomRight'
};


/**
 *
 * @param {import('./types.js').CountdownInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveSetAttributes: buildResponsiveSetAttributes( setAttributes, view ),
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	const excludeComponent = ( value, componentName ) => {
		if ( value ) {
			setAttributes({
				exclude: attributes?.exclude?.filter( name => name !== componentName )
			});
		} else {
			setAttributes({
				exclude: attributes?.exclude ? [ ...attributes?.exclude, componentName ] : [ componentName ]
			});
		}
	};

	const changeBorderRadiusType = value => {
		setAttributes({ borderRadiusType: value });
	};

	const getBorderRadius = type => {
		let value;

		if ( 'top-right' === type ) {
			value = 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusTopRight;
		}

		if ( 'top-left' === type ) {
			value = 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusTopLeft;
		}

		if ( 'bottom-right' === type ) {
			value = 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusBottomRight;
		}

		if ( 'bottom-left' === type ) {
			value = 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusBottomLeft;
		}

		return value;
	};


	const changeBorderRadius = ( type, value ) => {
		if ( 'linked' === attributes.borderRadiusType ) {
			setAttributes({ borderRadius: value });
		} else {
			setAttributes({ [borderRadiusDirection[type]]: value });
		}
	};

	const settings = __experimentalGetSettings();

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Time', 'otter-blocks' ) }
			>
				<Dropdown
					position="bottom left"
					headerTitle={ __( 'Select the date for the deadline', 'otter-blocks' ) }
					renderToggle={ ({ onToggle, isOpen }) => (
						<>
							<Button
								onClick={ onToggle }
								isSecondary
								aria-expanded={ isOpen }
							>
								{ attributes.date ? format( settings.formats.datetime, attributes.date ) : __( 'Select Date', 'otter-blocks' ) }
							</Button>
						</>
					) }
					renderContent={ () => (
						<DateTimePicker
							currentDate={ attributes.date }
							onChange={ date => setAttributes({ date }) }
						/>
					) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Display Days', 'otter-blocks' ) }
					checked={ ! attributes?.exclude?.includes( 'day' ) }
					onChange={ value => excludeComponent( value, 'day' ) }
				/>

				<ToggleControl
					label={ __( 'Display Hours', 'otter-blocks' ) }
					checked={ ! attributes?.exclude?.includes( 'hour' ) }
					onChange={ value => excludeComponent( value, 'hour' ) }
				/>

				<ToggleControl
					label={ __( 'Display Minutes', 'otter-blocks' ) }
					checked={ ! attributes?.exclude?.includes( 'minute' ) }
					onChange={ value => excludeComponent( value, 'minute' ) }
				/>

				<ToggleControl
					label={ __( 'Display Seconds', 'otter-blocks' ) }
					checked={ ! attributes?.exclude?.includes( 'second' ) }
					onChange={ value => excludeComponent( value, 'second' ) }
				/>

				<ToggleControl
					label={ __( 'Display Separators', 'otter-blocks' ) }
					checked={ attributes?.hasSeparators }
					onChange={ hasSeparators => setAttributes({ hasSeparators }) }
				/>

				<SelectControl
					label={__( 'Alignment', 'otter-blocks' )}
					value={ attributes.alingment }
					onChange={ alignment => setAttributes({ alignment })}
					options={[
						{
							label: __( 'Left', 'otter-blocks' ),
							value: 'flex-start'
						},
						{
							label: __( 'Center', 'otter-blocks' ),
							value: 'center'
						},
						{
							label: __( 'Right', 'otter-blocks' ),
							value: 'flex-end'
						}
					]}
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Sizing', 'otter-blocks' ) }
				initialOpen={false}
			>
				<ResponsiveControl
					label={ __( 'Width', 'otter-blocks' ) }
				>
					<UnitContol
						value={ responsiveGetAttributes([ attributes.containerWidth, attributes.containerWidthTablet, attributes.containerWidthMobile ]) ?? 100 }
						onChange={ value => responsiveSetAttributes( value, [ 'containerWidth', 'containerWidthTablet', 'containerWidthMobile' ]) }

					/>
				</ResponsiveControl>
				<ResponsiveControl
					label={ __( 'Height', 'otter-blocks' ) }
				>
					<RangeControl
						value={ responsiveGetAttributes([ attributes.height, attributes.heightTablet, attributes.heightMobile ]) ?? 100 }
						onChange={ value => responsiveSetAttributes( value, [ 'height', 'heightTablet', 'heightMobile' ]) }
						min={ 50 }
						max={ 2400 }
					/>
				</ResponsiveControl>

				<ResponsiveControl
					label={ __( 'Space Between', 'otter-blocks' ) }
				>
					<RangeControl
						value={ responsiveGetAttributes([ attributes.gap, attributes.gapTablet, attributes.gapMobile ]) ?? 6 }
						onChange={ value => responsiveSetAttributes( value, [ 'gap', 'gapTablet', 'gapMobile' ]) }
						min={ 0 }
						max={ 100 }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Typography', 'otter-blocks' ) }
				initialOpen={false}
			>
				<ResponsiveControl
					label={ __( 'Time Value Font Size', 'otter-blocks' ) }
				>
					<FontSizePicker
						fontSizes={ defaultFontSizes }
						withReset
						value={ responsiveGetAttributes([ attributes.valueFontSize, attributes.valueFontSizeTablet, attributes.valueFontSizeMobile ]) }
						onChange={ value => responsiveSetAttributes( value, [ 'valueFontSize', 'valueFontSizeTablet', 'valueFontSizeMobile' ]) }
					/>
				</ResponsiveControl>

				<ResponsiveControl
					label={ __( 'Label Font Size', 'otter-blocks' ) }
				>
					<FontSizePicker
						fontSizes={ defaultFontSizes }
						withReset
						value={ responsiveGetAttributes([ attributes.labelFontSize, attributes.labelFontSizeTablet, attributes.labelFontSizeMobile ]) }
						onChange={ value => responsiveSetAttributes( value, [ 'labelFontSize', 'labelFontSizeTablet', 'labelFontSizeMobile' ]) }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.backgroundColor,
						onChange: backgroundColor => setAttributes({ backgroundColor }),
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: attributes.labelColor,
						onChange: labelColor => setAttributes({ labelColor }),
						label: __( 'Label', 'otter-blocks' )
					},
					{
						value: attributes.valueColor,
						onChange: valueColor => setAttributes({ valueColor }),
						label: __( 'Value', 'otter-blocks' )
					},
					{
						value: attributes.separatorColor,
						onChange: separatorColor => setAttributes({ separatorColor }),
						label: __( 'Separator', 'otter-blocks' )
					},
					{
						value: attributes.borderColor,
						onChange: borderColor => setAttributes({ borderColor }),
						label: __( 'Border', 'otter-blocks' )
					}
				] }
			>
				<ContrastChecker
					{ ...{
						textColor: attributes.backgroundColor,
						backgroundColor: attributes.valueColor
					} }
				/>
			</PanelColorSettings>

			<PanelBody
				title={ __( 'Border', 'otter-blocks' ) }
				initialOpen={false}
			>
				<ResponsiveControl
					label={ __( 'Border Width', 'otter-blocks' ) }
				>
					<RangeControl
						value={ responsiveGetAttributes([ attributes.borderWidth, attributes.borderWidthTablet, attributes.borderWidthMobile ]) ?? 2 }
						onChange={ value => responsiveSetAttributes( value, [ 'borderWidth', 'borderWidthTablet', 'borderWidthMobile' ]) }
						min={ 0 }
						max={ 50 }
					/>
				</ResponsiveControl>


				<SizingControl
					label={ __( 'Border Radius (%)', 'otter-blocks' ) }
					type={ attributes.borderRadiusType }
					min={ 0 }
					max={ 100 }
					changeType={ changeBorderRadiusType }
					onChange={ changeBorderRadius }
					options={ [
						{
							label: __( 'Top Left', 'otter-blocks' ),
							type: 'top-left',
							value: getBorderRadius( 'top-left' )
						},
						{
							label: __( 'Top Right', 'otter-blocks' ),
							type: 'top-right',
							value: getBorderRadius( 'top-right' )
						},
						{
							label: __( 'Bottom Right', 'otter-blocks' ),
							type: 'bottom-right',
							value: getBorderRadius( 'bottom-right' )
						},
						{
							label: __( 'Bottom Left', 'otter-blocks' ),
							type: 'bottom-left',
							value: getBorderRadius( 'bottom-left' )
						}
					] }
				/>

				<ResponsiveControl
					label={ __( 'Padding', 'otter-blocks' ) }
				>

					<BoxControl
						values={
							mergeBoxDefaultValues(
								responsiveGetAttributes([ attributes.padding, attributes.paddingTablet, attributes.paddingMobile ]),
								{ left: '0px', right: '0px', bottom: '0px', top: '0px' }
							)
						}
						onChange={ value => {
							const cleaned = removeBoxDefaultValues( value, { left: '0px', right: '0px', bottom: '0px', top: '0px' });
							responsiveSetAttributes( cleaned, [ 'padding', 'paddingTablet', 'paddingMobile' ]);
						} }
					/>

				</ResponsiveControl>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
