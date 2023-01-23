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
	__experimentalUnitControl as UnitContol,
	ExternalLink
} from '@wordpress/components';

import {
	format,
	__experimentalGetSettings
} from '@wordpress/date';

import {
	Fragment,
	useState
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import InspectorHeader from '../../components/inspector-header/index.js';
import { InspectorExtensions } from '../../components/inspector-slot-fill/index.js';
import ResponsiveControl from '../../components/responsive-control/index.js';
import { mergeBoxDefaultValues, removeBoxDefaultValues, setUtm } from '../../helpers/helper-functions.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import Notice from '../../components/notice/index.js';

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

const fontWeights = [ '', '100', '200', '300', '400', '500', '600', '700', '800', '900' ].map( x => ({ label: x ? x : 'Default', value: x }) );

const SettingsPanel = ({ attributes }) => (
	<Fragment>
		<SelectControl
			label={ __( 'Countdown Type', 'otter-blocks' ) }
			value={  attributes.mode }
			options={[
				{
					label: __( 'Static', 'otter-blocks' ),
					value: ''
				},
				{
					label: __( 'Evergreen (Pro)', 'otter-blocks' ),
					value: 'timer',
					disabled: true
				},
				{
					label: __( 'Interval (Pro)', 'otter-blocks' ),
					value: 'interval',
					disabled: true
				}
			]}
			help={ __( 'An universal deadline for all visitors', 'otter-blocks' )}
		/>

		{ ! Boolean( window.themeisleGutenberg?.hasPro ) && (
			<Notice
				notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'countdownfeature' ) }>{ __( 'Get more options with Otter Pro.', 'otter-blocks' ) }</ExternalLink> }
				variant="upsell"
			/>
		) }
	</Fragment>
);

const EndActionPanel = () => (
	<Fragment>
		<SelectControl
			label={ __( 'On Expire', 'otter-blocks' ) }
			value={ 'default' }
			onChange={ () => {}}
			options={[
				{
					label: __( 'No action', 'otter-blocks' ),
					value: 'default'
				},
				{
					label: __( 'Hide the Countdown', 'otter-blocks' ),
					value: 'hide'
				},
				{
					label: __( 'Redirect to link', 'otter-blocks' ),
					value: 'redirectLink'
				}
			]}
			help={ __( 'The countdown remains visible when it reaches 0', 'otter-blocks' ) }
			disabled
		/>

		<ToggleControl
			label={ __( 'Hide/Show Blocks When the Countdown Ends', 'otter-blocks' ) }
			help={ __( 'Enable Hide/Show other blocks when the Countdown ends.', 'otter-blocks' ) }
			checked={ false }
			onChange={ () => {}}
			disabled
		/>

		{ ! Boolean( window.themeisleGutenberg?.hasPro ) && (
			<Notice
				notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'countdownfeature' ) }>{ __( 'Get more options with Otter Pro.', 'otter-blocks' ) }</ExternalLink> }
				variant="upsell"
			/>
		) }
	</Fragment>
);

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
	} = useResponsiveAttributes( setAttributes );

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

	const [ tab, setTab ] = useState( 'settings' );

	const settings = __experimentalGetSettings();

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			{ 'settings' === tab && (
				<Fragment>

					<PanelBody
						title={ __( 'Time Settings', 'otter-blocks' ) }
					>
						{ applyFilters( 'otter.countdown.controls.settings', <SettingsPanel attributes={ attributes }/>, { attributes: attributes, setAttributes: setAttributes }) }

						{ attributes.mode === undefined && (
							<Dropdown
								position="bottom left"
								headerTitle={ __( 'Select the date for the deadline', 'otter-blocks' ) }
								renderToggle={ ({ onToggle, isOpen }) => (
									<>
										<Button
											onClick={ onToggle }
											isSecondary
											aria-expanded={ isOpen }
											className="o-extend-btn"
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
								className="o-extend"
							/>
						) }
					</PanelBody>

					<PanelBody
						title={ __( 'Display', 'otter-blocks' ) }
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

						<ResponsiveControl
							label={ __( 'Space Between boxes', 'otter-blocks' ) }
						>
							<RangeControl
								value={ responsiveGetAttributes([ attributes.gap, attributes.gapTablet, attributes.gapMobile ]) ?? 6 }
								onChange={ value => responsiveSetAttributes( value, [ 'gap', 'gapTablet', 'gapMobile' ]) }
								min={ 0 }
								max={ 100 }
								allowReset
							/>
						</ResponsiveControl>

					</PanelBody>

					<PanelBody
						title={ __( 'End Action', 'otter-blocks' ) }
						initialOpen={false}
					>
						{ applyFilters( 'otter.countdown.controls.end', <EndActionPanel />, { attributes: attributes, setAttributes: setAttributes }) }
					</PanelBody>

					<InspectorExtensions/>
				</Fragment>
			) }

			{ 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Dimensions', 'otter-blocks' ) }
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

						{ attributes.hasSeparators && (
							<SelectControl
								label={ __( 'Separator Alignment', 'otter-blocks' ) }
								value={ attributes.separatorAlignment }
								onChange={ separatorAlignment => {
									if ( ! separatorAlignment ) {
										setAttributes({ separatorAlignment: undefined });
									} else {
										setAttributes({ separatorAlignment });
									}
								}}
								options={[
									{
										label: __( 'Default', 'otter-blocks' ),
										value: ''
									},
									{
										label: __( 'Center', 'otter-blocks' ),
										value: 'center'
									}
								]}
							/>
						) }
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
								label: __( 'Background', 'otter-blocks' ),
								isShownByDefault: true
							},
							{
								value: attributes.valueColor,
								onChange: valueColor => setAttributes({ valueColor }),
								label: __( 'Time Value', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.labelColor,
								onChange: labelColor => setAttributes({ labelColor }),
								label: __( 'Label', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.separatorColor,
								onChange: separatorColor => setAttributes({ separatorColor }),
								label: __( 'Separator', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.borderColor,
								onChange: borderColor => setAttributes({ borderColor }),
								label: __( 'Border', 'otter-blocks' ),
								isShownByDefault: false
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
							onChange={ borderStyle => setAttributes({ borderStyle: 'solid' === borderStyle ? undefined : borderStyle })}
							options={[
								{
									label: __( 'None', 'otter-blocks' ),
									value: 'none'
								},
								{
									label: __( 'Solid', 'otter-blocks' ),
									value: 'solid'
								},
								{
									label: __( 'Double', 'otter-blocks' ),
									value: 'double'
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

						{ 'none' !== attributes.borderStyle && (
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
						) }

						<BoxControl
							label={ __( 'Border Radius', 'otter-blocks' ) }
							values={
								mergeBoxDefaultValues(
									attributes.borderRadiusBox,
									{ left: '0px', right: '0px', bottom: '0px', top: '0px' }
								)
							}
							onChange={ value => {
								setAttributes({
									borderRadiusBox: removeBoxDefaultValues( value, { left: '0px', right: '0px', bottom: '0px', top: '0px' })
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
				</Fragment>
			) }

		</InspectorControls>
	);
};

export default Inspector;
