/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	FontSizePicker,
	__experimentalUnitControl as UnitControl,
	BaseControl,
	Placeholder,
	Spinner,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment,
	Suspense,
	useState
} from '@wordpress/element';

import { alignCenter, alignLeft, alignRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	ButtonToggleControl,
	IconPickerControl,
	InspectorExtensions,
	InspectorHeader,
	ResponsiveControl,
	ToogleGroupControl
} from '../../components/index.js';

import { _px } from '../../helpers/helper-functions.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';

/**
 *
 * @param {import('./types.js').IconsListInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const [ tab, setTab ] = useState( 'settings' );

	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const changeLibrary = value => {
		setAttributes({
			defaultLibrary: value,
			defaultIcon: undefined,
			defaultPrefix: 'fas'
		});
	};

	const changeIcon = value => {
		if ( 'image' === attributes.defaultLibrary && value?.url ) {
			return setAttributes({ defaultIcon: value.url });
		}

		if ( 'object' === typeof value ) {
			setAttributes({
				defaultIcon: value.name,
				defaultPrefix: value.prefix
			});
		} else {
			setAttributes({ defaultIcon: value });
		}
	};

	const changeStructure = value => {
		const classes = attributes?.className?.split( ' ' ) || [];

		if ( 'default' === value && classes.includes( 'is-style-horizontal' ) ) {
			classes.splice( classes.indexOf( 'is-style-horizontal' ), 1 );
		} else if ( 'is-style-horizontal' === value && ! classes.includes( 'is-style-horizontal' ) ) {
			classes.push( 'is-style-horizontal' );
		}

		setAttributes({ className: classes.join( ' ' ) });
	};

	return (
		<InspectorControls>
			<div>
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
							title={ __( 'Layout', 'otter-blocks' ) }
						>
							<ButtonToggleControl
								label={ __( 'List Orientation', 'otter-blocks' ) }
								options={[
									{
										label: __( 'Vertical', 'otter-blocks' ),
										value: 'default'
									},
									{
										label: __( 'Horizontal', 'otter-blocks' ),
										value: 'is-style-horizontal'
									}
								]}
								value={ attributes?.className?.includes( 'is-style-horizontal' ) ? 'is-style-horizontal' : 'default' }
								onChange={ changeStructure }
							/>
							<ResponsiveControl
								label={ __( 'Alignment', 'otter-blocks' ) }
							>
								<ToogleGroupControl
									value={ responsiveGetAttributes([ attributes.horizontalAlign, attributes.alignmentTablet, attributes.alignmentMobile  ]) ?? 'flex-start' }
									onChange={ ( value ) => {
										responsiveSetAttributes(
											value,
											[ 'horizontalAlign', 'alignmentTablet', 'alignmentMobile' ]
										);
									} }
									options={[
										{
											icon: alignLeft,
											label: __( 'Left', 'otter-blocks' ),
											value: 'flex-start'
										},
										{
											icon: alignCenter,
											label: __( 'Center', 'otter-blocks' ),
											value: 'center'
										},
										{
											icon: alignRight,
											label: __( 'Right', 'otter-blocks' ),
											value: 'flex-end'
										}
									]}
									hasIcon={ true }
								/>

							</ResponsiveControl>

							<ToggleControl
								label={ __( 'Hide Labels', 'otter-blocks' ) }
								checked={ Boolean( attributes.hideLabels ) }
								onChange={ () => setAttributes({ hideLabels: ! attributes.hideLabels }) }
							/>

						</PanelBody>
						<PanelBody
							title={ __( 'Icons', 'otter-blocks' ) }
						>
							<Suspense fallback={ <Placeholder><Spinner /></Placeholder> }>
								<IconPickerControl
									label={ __( 'Icon Picker', 'otter-blocks' ) }
									library={ attributes.defaultLibrary }
									prefix={ attributes.defaultPrefix }
									icon={ attributes.defaultIcon }
									changeLibrary={ changeLibrary }
									onChange={ changeIcon }
									allowImage
								/>
							</Suspense>
						</PanelBody>

						<InspectorExtensions/>
					</Fragment>
				) }

				{ 'style' === tab && (
					<Fragment>
						<PanelColorSettings
							title={ __( 'Color', 'otter-blocks' ) }
							initialOpen={ false }
							colorSettings={ [
								{
									value: attributes.defaultIconColor,
									onChange: defaultIconColor => setAttributes({ defaultIconColor }),
									label: __( 'Icon', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.defaultContentColor,
									onChange: defaultContentColor => setAttributes({ defaultContentColor }),
									label: __( 'Text', 'otter-blocks' ),
									isShownByDefault: false
								},
								...( attributes.hasDivider ? [
									{
										value: attributes.dividerColor,
										onChange: dividerColor => setAttributes({ dividerColor }),
										label: __( 'Divider', 'otter-blocks' ),
										isShownByDefault: false
									}
								] : [])
							] }
						/>
						<PanelBody
							title={ __( 'Size', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BaseControl
								label={ __( 'Font Size', 'otter-blocks' ) }
								__nextHasNoMarginBottom={ true }

								// help={ __( 'The size of the font size of the content and icon.', 'otter-blocks' ) }
							>
								<FontSizePicker
									value={ _px( attributes.defaultSize ) ?? '16px' }
									onChange={ defaultSize => setAttributes({ defaultSize }) }
									fontSizes={[
										{
											name: 'Small',
											size: '12px',
											slug: 'small'
										},
										{
											name: 'Normal',
											size: '16px',
											slug: 'Normal'
										},
										{
											name: 'Medium',
											size: '20px',
											slug: 'medium'
										},
										{
											name: 'Large',
											size: '36px',
											slug: 'large'
										}
									]}
									withReset={ true }
								/>
							</BaseControl>

							<BaseControl
								label={ __( 'Icon Size', 'otter-blocks' ) }
								__nextHasNoMarginBottom={ true }

								//help={ __( 'The size of the font size of the content and icon.', 'otter-blocks' ) }
							>
								<FontSizePicker
									value={ attributes.defaultIconSize ?? _px( attributes.defaultSize ) ?? '16px' }
									onChange={ defaultIconSize => setAttributes({ defaultIconSize }) }
									fontSizes={[
										{
											name: 'Small',
											size: '12px',
											slug: 'small'
										},
										{
											name: 'Normal',
											size: '16px',
											slug: 'Normal'
										},
										{
											name: 'Medium',
											size: '20px',
											slug: 'medium'
										},
										{
											name: 'Large',
											size: '36px',
											slug: 'large'
										}
									]}
									withReset={ true }
								/>
							</BaseControl>
						</PanelBody>
						<PanelBody
							title={ __( 'Dimensions', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<UnitControl
								label={ __( 'Space between List items', 'otter-blocks' ) }
								value={ attributes.gap ?? '5px' }
								onChange={ gap => setAttributes({ gap }) }
								units={[
									{
										a11yLabel: 'Pixels (px)',
										label: 'px',
										step: 1,
										value: 'px'
									}
								]}
							/>

							<br/>

							<UnitControl
								label={ __( 'Space between Icon and Label', 'otter-blocks' ) }
								value={ attributes.gapIconLabel ?? '16px' }
								onChange={ gapIconLabel => setAttributes({ gapIconLabel }) }
								units={[
									{
										a11yLabel: 'Pixels (px)',
										label: 'px',
										step: 1,
										value: 'px'
									}
								]}
							/>
						</PanelBody>
						<PanelBody
							title={ __( 'Divider', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ToggleControl
								label={ __( 'Enable Divider', 'otter-blocks' ) }
								checked={ Boolean( attributes.hasDivider ) }
								onChange={ () => setAttributes({ hasDivider: ! attributes.hasDivider }) }
							/>

							{
								attributes.hasDivider && (
									<Fragment>
										<UnitControl
											label={ __( 'Width', 'otter-blocks' ) }
											value={ attributes.dividerWidth ?? '2px' }
											onChange={ dividerWidth => setAttributes({ dividerWidth }) }
											units={[
												{
													a11yLabel: 'Pixels (px)',
													label: 'px',
													step: 1,
													value: 'px'
												}
											]}
											max={5}
										/>

										<br />

										<UnitControl
											label={ __( 'Length', 'otter-blocks' ) }
											value={ attributes.dividerLength ?? '100%' }
											onChange={ dividerLength => setAttributes({ dividerLength }) }
											isResetValueOnUnitChange

										/>
									</Fragment>
								)
							}
						</PanelBody>
					</Fragment>
				) }
			</div>
		</InspectorControls>
	);
};

export default Inspector;
