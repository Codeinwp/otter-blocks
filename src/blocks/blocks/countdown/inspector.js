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
	SelectControl
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


/**
 *
 * @param {import('./types.js').CountdownInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const getView = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
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

	const onBackgroundColorChange = value => {
		setAttributes({ backgroundColor: value });
	};

	const onLabelColorChange = value => {
		setAttributes({ labelColor: value });
	};

	const onValueColorChange = value => {
		setAttributes({ valueColor: value });
	};

	const onGapChange = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ gap: Number( value )});
		}
		if ( 'Tablet' === getView ) {
			setAttributes({ gapTablet: Number( value )});
		}
		if ( 'Mobile' === getView ) {
			setAttributes({ gapMobile: Number( value )});
		}
	};

	const onWidthChange = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ containerWidth: Number( value )});
		}
		if ( 'Tablet' === getView ) {
			setAttributes({ containerWidthTablet: Number( value )});
		}
		if ( 'Mobile' === getView ) {
			setAttributes({ containerWidthMobile: Number( value )});
		}
	};

	const onHeightChange = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ height: Number( value )});
		}
		if ( 'Tablet' === getView ) {
			setAttributes({ heightTablet: Number( value )});
		}
		if ( 'Mobile' === getView ) {
			setAttributes({ heightMobile: Number( value )});
		}
	};

	const onValueFontSizeChange = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ valueFontSize: value });
		}
		if ( 'Tablet' === getView ) {
			setAttributes({ valueFontSizeTablet: value });
		}
		if ( 'Mobile' === getView ) {
			setAttributes({ valueFontSizeMobile: value });
		}
	};

	const onLabelFontSizeChange = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ labelFontSize: value });
		}
		if ( 'Tablet' === getView ) {
			setAttributes({ labelFontSizeTablet: value });
		}
		if ( 'Mobile' === getView ) {
			setAttributes({ labelFontSizeMobile: value });
		}
	};

	const onBorderWidthChange = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ borderWidth: Number( value ) });
		}
		if ( 'Tablet' === getView ) {
			setAttributes({ borderWidthTablet: Number( value )});
		}
		if ( 'Mobile' === getView ) {
			setAttributes({ borderWidthMobile: Number( value )});
		}
	};

	const onBorderColorChange = value => {
		setAttributes({ borderColor: value });
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

	const borderRadiusDirection = {
		'top-right': 'borderRadiusTopRight',
		'top-left': 'borderRadiusTopLeft',
		'bottom-left': 'borderRadiusBottomLeft',
		'bottom-right': 'borderRadiusBottomRight'
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
					<RangeControl
						value={ 'Mobile' === getView ? attributes.containerWidthMobile : 'Tablet' === getView ? attributes.containerWidthTablet : attributes.containerWidth }
						onChange={ onWidthChange }
						min={ 100 }
						max={ 2400 }
					/>
				</ResponsiveControl>\\<ResponsiveControl
					label={ __( 'Height', 'otter-blocks' ) }
				>
					<RangeControl
						value={ ( 'Mobile' === getView ? attributes.heightMobile : 'Tablet' === getView ? attributes.heightTablet : attributes.height ) ?? 100 }
						onChange={ onHeightChange }
						min={ 50 }
						max={ 2400 }
					/>
				</ResponsiveControl>

				<ResponsiveControl
					label={ __( 'Space Between', 'otter-blocks' ) }
				>
					<RangeControl
						value={ ( 'Mobile' === getView ? attributes.gapMobile : 'Tablet' === getView ? attributes.gapTablet : attributes.gap ) ?? 6 }
						onChange={ onGapChange }
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
						value={ 'Mobile' === getView ? attributes.valueFontSizeMobile : 'Tablet' === getView ? attributes.valueFontSizeTablet : attributes.valueFontSize }
						onChange={ onValueFontSizeChange }
					/>
				</ResponsiveControl>

				<ResponsiveControl
					label={ __( 'Label Font Size', 'otter-blocks' ) }
				>
					<FontSizePicker
						fontSizes={ defaultFontSizes }
						withReset
						value={ 'Mobile' === getView ? attributes.labelFontSizeMobile : 'Tablet' === getView ? attributes.labelFontSizeTablet : attributes.labelFontSize }
						onChange={ onLabelFontSizeChange }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.backgroundColor,
						onChange: onBackgroundColorChange,
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: attributes.labelColor,
						onChange: onLabelColorChange,
						label: __( 'Label', 'otter-blocks' )
					},
					{
						value: attributes.valueColor,
						onChange: onValueColorChange,
						label: __( 'Value', 'otter-blocks' )
					},
					{
						value: attributes.borderColor,
						onChange: onBorderColorChange,
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
						value={ ( 'Mobile' === getView ? attributes.borderWidthMobile : 'Tablet' === getView ? attributes.borderWidthTablet : attributes.borderWidth ) ?? 2 }
						onChange={ onBorderWidthChange }
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
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
