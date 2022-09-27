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
	TextControl,
	BaseControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	format,
	__experimentalGetSettings
} from '@wordpress/date';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import ResponsiveControl from '../../components/responsive-control/index.js';
import { mergeBoxDefaultValues, removeBoxDefaultValues, buildResponsiveSetAttributes, buildResponsiveGetAttributes, objectCleaner } from '../../helpers/helper-functions.js';
import { Fragment } from '@wordpress/element';

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

export const onExpireHelpMsgCountdown = ( behaviour ) => {
	switch ( behaviour ) {
	case 'redirectLink':
		return __( 'Redirect the user to another URL, when the countdown reaches 0', 'otter-blocks' );
	case 'hide':
		return __( 'Hide when the countdown reaches 0', 'otter-blocks' );
	case 'restart':
		return 'The Countdown will restart when it reaches 0 and the page is refreshed';
	default:
		return __( 'The countdown remains visible when it reaches 0', 'otter-blocks' );
	}
};

export const countdownMoveHelpMsgCountdown = ( mode ) => {
	switch ( mode ) {
	case 'timer':
		return __( 'A fixed amount of time for each browser session (Evergreen Countdown)', 'otter-blocks' );
	case 'interval':
		return __( 'The countdown will be active only between the Start Date and the End Date', 'otter-blocks' );
	default:
		return __( 'A universal deadline for all visitors', 'otter-blocks' );
	}
};

const ProFeatures = ({ children }) => (
	<PanelBody
		title={ __( 'End Action', 'otter-blocks' ) }
		initialOpen={false}
	>
		<SelectControl
			label={ __( 'On Expire', 'otter-blocks' ) }
			value={ '' }
			onChange={ () => {}}
			options={[
				{
					label: __( 'No action', 'otter-blocks' ),
					value: ''
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
			help={ onExpireHelpMsgCountdown(  ) }
			disabled
		/>

		<ToggleControl
			label={ __( 'Enable Hide/Show other blocks when the Countdown ends.', 'otter-blocks' ) }
			checked={ false }
			onChange={ () => {}}
			disabled
		/>

		{ children }
	</PanelBody>
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
				title={ __( 'Time Settings', 'otter-blocks' ) }
			>

				<SelectControl
					label={ __( 'Countdown Type', 'otter-blocks' ) }
					value={  attributes.mode }
					onChange={ value => {

						const attrs = {
							mode: value ? value : undefined
						};

						if ( ! value ) {
							attrs.date = undefined;
						}

						if ( 'timer' !== value ) {
							attrs.timer = undefined;
							if ( 'restart' === attributes.behaviour ) {
								attrs.behaviour = undefined;
							}
						}

						if ( 'interval' !== value ) {
							attrs.startInterval = undefined;
							attrs.endInterval = undefined;
						}

						setAttributes( attrs );
					}

					}
					options={[
						{
							label: __( 'Static', 'otter-blocks' ),
							value: ''
						},
						{
							label: __( 'Evergeen', 'otter-blocks' ),
							value: 'timer'
						},
						{
							label: __( 'Interval', 'otter-blocks' ),
							value: 'interval'
						}
					]}
					help={ countdownMoveHelpMsgCountdown( attributes.mode )}
				/>

				{
					attributes.mode === undefined && (
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
					)
				}

				{
					'timer' === attributes.mode && (
						<Fragment>
							<TextControl
								type="number"
								label={__( 'Days', 'otter-blocks' )}
								value={ attributes?.timer?.days ?? '' }
								onChange={ ( days ) => {
									setAttributes({
										timer: objectCleaner({ ...attributes.timer, days })
									});
								}}
							/>
							<TextControl
								type="number"
								label={__( 'Hours', 'otter-blocks' )}
								value={ attributes?.timer?.hours ?? '' }
								onChange={ ( hours ) => {
									setAttributes({
										timer: objectCleaner({ ...attributes.timer, hours })
									});
								}}
							/>
							<TextControl
								type="number"
								label={__( 'Minutes', 'otter-blocks' )}
								value={ attributes?.timer?.minutes ?? '' }
								onChange={ ( minutes ) => {
									setAttributes({
										timer: objectCleaner({ ...attributes.timer, minutes })
									});
								}}
							/>
							<TextControl
								type="number"
								label={__( 'Seconds', 'otter-blocks' )}
								value={ attributes?.timer?.seconds ?? '' }
								onChange={ ( seconds ) => {
									setAttributes({
										timer: objectCleaner({ ...attributes.timer, seconds })
									});
								}}
							/>
						</Fragment>
					)
				}

				{
					'interval' === attributes.mode && (
						<Fragment>
							<BaseControl
								label={ __( 'Start Date', 'otter-blocks' ) }
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
												className="o-extend-btn"
											>
												{ attributes.startInterval ? format( settings.formats.datetime, attributes.startInterval ) : __( 'Select Start Date', 'otter-blocks' ) }
											</Button>
										</>
									) }
									renderContent={ () => (
										<DateTimePicker
											currentDate={ attributes.startInterval }
											onChange={ startInterval => setAttributes({ startInterval }) }
										/>
									) }
									className="o-extend"
								/>
							</BaseControl>

							<BaseControl
								label={ __( 'End Date', 'otter-blocks' ) }
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
												className="o-extend-btn"
											>
												{ attributes.endInterval ? format( settings.formats.datetime, attributes.endInterval ) : __( 'Select End Date', 'otter-blocks' ) }
											</Button>
										</>
									) }
									renderContent={ () => (
										<DateTimePicker
											currentDate={ attributes.endInterval }
											onChange={ endInterval => setAttributes({ endInterval }) }
										/>
									) }
									className="o-extend"
								/>
							</BaseControl>
						</Fragment>
					)
				}

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

			{ applyFilters( 'otter.countdown.controls', ProFeatures, { attributes: attributes, setAttributes: setAttributes }) }

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

		</InspectorControls>
	);
};

export default Inspector;
