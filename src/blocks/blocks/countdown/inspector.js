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

const fontWeights = [ '', '100', '200', '300', '400', '500', '600', '700', '800', '900' ].map( x => ({ label: x ? x : 'Default', value: x}) );

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

			</PanelBody>

			<PanelBody
				title={ __( 'Dimensions & Spacing', 'otter-blocks' ) }
				initialOpen={false}
			>
				<ResponsiveControl
					label={ __( 'Width', 'otter-blocks' ) }
				>
					<UnitContol
						value={ responsiveGetAttributes([ attributes.containerWidth, attributes.containerWidthTablet, attributes.containerWidthMobile ]) ?? '100%' }
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
						max={ 800 }
						allowReset
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
						allowReset
					/>
				</ResponsiveControl>

				<SelectControl
					label={__( 'Position', 'otter-blocks' )}
					value={ attributes.alingment }
					onChange={ alignment => setAttributes({ alignment: alignment || undefined })}
					options={[
						{
							label: __( 'Default', 'otter-blocks' ),
							value: ''
						},
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

				<SelectControl
					label={__( 'Time Value Font Weight', 'otter-blocks' )}
					value={ attributes.valueFontWeight }
					onChange={ valueFontWeight => setAttributes({ valueFontWeight: valueFontWeight || undefined })}
					options={fontWeights}
				/>

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

				<SelectControl
					label={__( 'Label Font Weight', 'otter-blocks' )}
					value={ attributes.labelFontWeight }
					onChange={ labelFontWeight => setAttributes({ labelFontWeight: labelFontWeight || undefined })}
					options={fontWeights}
				/>
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
						value: attributes.valueColor,
						onChange: valueColor => setAttributes({ valueColor }),
						label: __( 'Time Value', 'otter-blocks' )
					},
					{
						value: attributes.labelColor,
						onChange: labelColor => setAttributes({ labelColor }),
						label: __( 'Label', 'otter-blocks' )
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
				<SelectControl
					label={__( 'Type', 'otter-blocks' )}
					value={ attributes.borderStyle ?? 'solid' }
					onChange={ borderStyle => setAttributes({ borderStyle: borderStyle || undefined })}
					options={[
						{
							label: __( 'None', 'otter-blocks' ),
							value: ''
						},
						{
							label: __( 'Solid', 'otter-blocks' ),
							value: 'solid'
						},
						{
							label: __( 'Double', 'otter-blocks' ),
							value: 'Double'
						},
						{
							label: __( 'Dotted', 'otter-blocks' ),
							value: 'dotted'
						},
						{
							label: __( 'Dashed', 'otter-blocks' ),
							value: 'dashed'
						}
					]}
				/>

				{
					attributes.borderStyle && (
						<ResponsiveControl
							label={ __( 'Width', 'otter-blocks' ) }
						>
							<RangeControl
								value={ responsiveGetAttributes([ attributes.borderWidth, attributes.borderWidthTablet, attributes.borderWidthMobile ]) ?? 2 }
								onChange={ value => responsiveSetAttributes( value, [ 'borderWidth', 'borderWidthTablet', 'borderWidthMobile' ]) }
								min={ 0 }
								max={ 50 }
								allowReset
							/>
						</ResponsiveControl>
					)
				}


				<BoxControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					values={
						mergeBoxDefaultValues(
							attributes.borderRadiusBox,
							{ left: '0px', right: '0px', bottom: '0px', top: '0px' }
						)
					}
					onChange={ value => {
						const cleaned = removeBoxDefaultValues( value, { left: '0px', right: '0px', bottom: '0px', top: '0px' });
						setAttributes({
							borderRadiusBox: cleaned
						});
					} }
					id="o-border-raduis-box"
				/>

				{/*

				// Release in future versions

				<ResponsiveControl
					label={ __( 'Padding', 'otter-blocks' ) }
				>
					<BoxControl
						label=""
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

				</ResponsiveControl> */}
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
