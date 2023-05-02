/**
 * External dependencies
 */
import {
	alignCenter,
	alignLeft,
	alignRight
} from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	isEmpty,
	isNumber,
	pick
} from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
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
import {
	BackgroundSelectorControl,
	ButtonToggleControl,
	ControlPanelControl,
	InspectorExtensions,
	InspectorHeader,
	ResponsiveControl,
	ToogleGroupControl
} from '../../components/index.js';

import {
	mergeBoxDefaultValues,
	removeBoxDefaultValues,
	stringToBox,
	_i,
	_px,
	numberToBox
} from '../../helpers/helper-functions.js';

import { alignBottom, alignTop, alignCenter as oAlignCenter } from '../../helpers/icons.js';

import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';

const defaultFontSizes = [
	{
		name: '14',
		size: '14px',
		slug: '14'
	},
	{
		name: '16',
		size: '16px',
		slug: '16'
	},
	{
		name: '18',
		size: '18px',
		slug: '18'
	},
	{
		name: '24',
		size: '24px',
		slug: '24'
	}
];

/**
 *
 * @param {import('./types.js').FlipInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	currentSide,
	setSide
}) => {
	const [ tab, setTab ] = useState( 'settings' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	const changeBoxShadowColor = value => {
		setAttributes({
			boxShadowColor: ( 100 > attributes.boxShadowColorOpacity && attributes.boxShadowColor?.includes( 'var(' ) ) ?
				getComputedStyle( document.documentElement, null ).getPropertyValue( value?.replace( 'var(', '' )?.replace( ')', '' ) ) :
				value
		});
	};

	const changeBoxShadowColorOpacity = value => {
		const changes = { boxShadowColorOpacity: value };
		if ( 100 > value && attributes.boxShadowColor?.includes( 'var(' ) ) {
			changes.boxShadowColor = getComputedStyle( document.documentElement, null ).getPropertyValue( attributes.boxShadowColor.replace( 'var(', '' ).replace( ')', '' ) );
		}
		setAttributes( changes );
	};

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

			<div>
				{ 'settings' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Flip Settings', 'otter-blocks' ) }
						>
							<SelectControl
								label={ __( 'Flip Direction', 'otter-blocks' )}
								value={ attributes.animType }
								options={ [
									{ label: __( 'Bottom to Top', 'otter-blocks' ), value: 'flipX' },
									{ label: __( 'Top to Bottom', 'otter-blocks' ), value: 'flipX-rev' },
									{ label: __( 'Left to Right', 'otter-blocks' ), value: 'flipY' },
									{ label: __( 'Right to Left', 'otter-blocks' ), value: 'flipY-rev' }
								]}
								onChange={ animType => setAttributes({ animType })}
							/>

							<ToggleControl
								label={ __( 'Invert the Sides', 'otter-blocks' ) }
								checked={ attributes.isInverted }
								onChange={ isInverted => setAttributes({ isInverted })}
								help={ __( 'Use this to display the back side first.', 'otter-blocks' ) }
							/>
						</PanelBody>

						<PanelBody
							title={ __( 'Front Side Content', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ButtonToggleControl
								label={ __( 'Content Type', 'otter-blocks' ) }
								options={[
									{
										label: __( 'None', 'otter-blocks' ),
										value: 'none'
									},
									{
										label: __( 'Image', 'otter-blocks' ),
										value: 'image'
									}
								]}
								value={ attributes?.frontContentType ?? 'none' }
								onChange={ v => {

									const attrs = { frontContentType: ! isEmpty( v ) && 'none' !== v ? v : undefined };
									if ( isEmpty( v ) || 'none' === v ) {
										attrs.frontMedia = undefined;
									}

									setAttributes( attrs );
								} }
							/>

							{
								'image' === attributes.frontContentType && (
									<Fragment>
										<BaseControl
											label={ __( 'Media Image', 'otter-blocks' ) }
											help={ __( 'Set an image as showcase.', 'otter-blocks' ) }
										>
											{ ! ( attributes.frontMedia?.url ) ? (
												<MediaPlaceholder
													labels={ {
														title: __( 'Media Image', 'otter-blocks' )
													} }
													accept="image/*"
													allowedTypes={ [ 'image' ] }
													value={ attributes.frontMedia }
													onSelect={
														value => {
															setAttributes({
																frontMedia: pick( value, [ 'id', 'alt', 'url' ]),
																frontMediaHeight: _px( value?.sizes?.medium.height ),
																frontMediaWidth: _px( value?.sizes?.medium.width )
															});
														}
													}
												/>
											) : (
												<BaseControl
												>
													<img
														src={ attributes.frontMedia.url }
														alt={ attributes.frontMedia.alt }
														style={{
															border: '2px solid var( --wp-admin-theme-color)',
															maxHeight: '250px'
														}}
													/>

													<Button
														isSecondary
														onClick={ () => setAttributes({ frontMedia: undefined }) }
													>
														{ __( 'Remove image', 'otter-blocks' ) }
													</Button>
												</BaseControl>
											) }
										</BaseControl>

										<UnitControl
											onChange={ frontMediaWidth => setAttributes({ frontMediaWidth }) }
											label={ __( 'Media Width', 'otter-blocks' ) }
											isUnitSelectTabbable
											isResetValueOnUnitChange
											value={ _px( attributes.frontMediaWidth ) }
										/>

										<br />

										<UnitControl
											onChange={ frontMediaHeight => setAttributes({ frontMediaHeight }) }
											label={ __( 'Media Height', 'otter-blocks' ) }
											isUnitSelectTabbable
											isResetValueOnUnitChange
											value={ _px( attributes.frontMediaHeight ) }
										/>
									</Fragment>
								)
							}
						</PanelBody>

						<PanelBody
							title={ __( 'Alignment', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ButtonToggleControl
								label={ __( 'Sides', 'otter-blocks' ) }
								options={[
									{
										label: __( 'Front', 'otter-blocks' ),
										value: 'front'
									},
									{
										label: __( 'Back', 'otter-blocks' ),
										value: 'back'
									}
								]}
								value={ currentSide }
								onChange={ setSide }
							/>

							{
								( 'front' === currentSide && ! Boolean( attributes.isInverted ) ) || ( 'back' === currentSide && Boolean( attributes.isInverted ) ) ? (
									<Fragment>
										<BaseControl
											label={ __( 'Vertical Alignment', 'otter-blocks' ) }
										>
											<ToogleGroupControl

												options={[
													{
														icon: alignTop,
														value: 'flex-start'
													},
													{
														icon: oAlignCenter,
														value: 'center'
													},
													{
														icon: alignBottom,
														value: 'flex-end'
													}
												]}
												value={ attributes.frontVerticalAlign ?? 'center' }
												onChange={ frontVerticalAlign => setAttributes({ frontVerticalAlign }) }
											/>
										</BaseControl>

										<BaseControl
											label={ __( 'Horizontal Alignment', 'otter-blocks' ) }
										>
											<ToogleGroupControl
												options={[
													{
														icon: alignLeft,
														value: 'flex-start'
													},
													{
														icon: alignCenter,
														value: 'center'
													},
													{
														icon: alignRight,
														value: 'flex-end'
													}
												]}
												value={ attributes.frontHorizontalAlign ?? 'center' }
												onChange={ frontHorizontalAlign => setAttributes({ frontHorizontalAlign }) }
											/>

										</BaseControl>
									</Fragment>
								) : (
									<BaseControl
										label={ __( 'Vertical Alignment', 'otter-blocks' ) }
									>
										<ToogleGroupControl

											options={[
												{
													icon: alignTop,
													value: 'flex-start'
												},
												{
													icon: oAlignCenter,
													value: 'center'
												},
												{
													icon: alignBottom,
													value: 'flex-end'
												}
											]}
											value={ attributes.backVerticalAlign ?? 'center' }
											onChange={ backVerticalAlign => setAttributes({ backVerticalAlign }) }
										/>
									</BaseControl>

								)
							}
						</PanelBody>

						<InspectorExtensions/>
					</Fragment>
				) }

				{ 'style' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Dimensions', 'otter-blocks' ) }
						>
							<ResponsiveControl
								label={ __( 'Screen Type', 'otter-blocks' ) }
							>
								<UnitControl
									label={ __( 'Width', 'otter-blocks' ) }
									value={ responsiveGetAttributes([ isNumber( attributes.width ) ? _px( attributes.width ) : attributes?.width, attributes.widthTablet, attributes?.widthMobile ]) ?? '100%' }
									onChange={ width => responsiveSetAttributes( width, [ 'width', 'widthTablet', 'widthMobile' ], attributes.width ) }
									isUnitSelectTabbable
									isResetValueOnUnitChange
									allowReset={ true }
								/>
								<br />
								<UnitControl
									label={ __( 'Height', 'otter-blocks' ) }
									value={ responsiveGetAttributes([ isNumber( attributes.height ) ? _px( attributes.height ) : attributes?.height, attributes.heightTablet, attributes?.heightMobile ]) ?? '300px' }
									onChange={ height => responsiveSetAttributes( height, [ 'height', 'heightTablet', 'heightMobile' ], attributes.height ) }
									isUnitSelectTabbable
									isResetValueOnUnitChange
									allowReset={ true }
									units={[
										{
											default: 300,
											label: 'px',
											value: 'px'
										},
										{
											default: 20,
											label: 'em',
											value: 'em'
										},
										{
											default: 20,
											label: 'rem',
											value: 'rem'
										},
										{
											default: 30,
											label: 'vw',
											value: 'vw'
										},
										{
											default: 35,
											label: 'vh',
											value: 'vh'
										}
									]}
								/>

								<br />
								<BoxControl
									label={ __( 'Padding', 'otter-blocks' ) }
									values={
										responsiveGetAttributes([ attributes?.padding, attributes.paddingTablet, attributes?.paddingMobile ]) ?? ( isNumber( attributes.padding ) ? stringToBox( _px( attributes.padding ) ) : stringToBox( '20px' ) )
									}
									onChange={ value => {

										let result = {};
										if ( 'object' === typeof value ) {
											result = Object.fromEntries( Object.entries( pick( value, [ 'top', 'bottom', 'left', 'right' ]) ).filter( ([ _, v ]) => null !== v && undefined !== v ) );
										}

										if ( isEmpty( result ) ) {
											result = undefined;
										}

										responsiveSetAttributes(
											result,
											[ 'padding', 'paddingTablet', 'paddingMobile' ]
										);
									} }
									allowReset
								/>
							</ResponsiveControl>

						</PanelBody>

						<PanelBody
							title={ __( 'Typography Front Side', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BaseControl
								label={ __( 'Title', 'otter-blocks' ) }
							>
								<FontSizePicker
									value={ _px( attributes.titleFontSize ) }
									onChange={ titleFontSize => setAttributes({ titleFontSize }) }
									fontSizes={[ ...defaultFontSizes, { name: '32', size: '32px', slug: '32' }]}
									allowReset
								/>
							</BaseControl>

							<BaseControl
								label={ __( 'Description', 'otter-blocks' ) }
							>
								<FontSizePicker
									value={ numberToBox( attributes.descriptionFontSize ) }
									onChange={ descriptionFontSize => setAttributes({ descriptionFontSize }) }
									fontSizes={[ ...defaultFontSizes, { name: '28', size: '28px', slug: '28' }]}
									allowReset
								/>
							</BaseControl>

						</PanelBody>

						<PanelBody
							title={ __( 'Front Side', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BackgroundSelectorControl
								backgroundType={ attributes.frontBackgroundType }
								backgroundColor={ attributes.frontBackgroundColor }
								image={ attributes.frontBackgroundImage }
								gradient={ attributes.frontBackgroundGradient }
								focalPoint={ attributes.frontBackgroundPosition }
								backgroundAttachment={ attributes.frontBackgroundAttachment }
								backgroundRepeat={ attributes.frontBackgroundRepeat }
								backgroundSize={ attributes.frontBackgroundSize }
								changeBackgroundType={ frontBackgroundType => setAttributes({ frontBackgroundType }) }
								changeImage={ media => {
									setAttributes({
										frontBackgroundImage: pick( media, [ 'id', 'url' ])
									});
								}}
								removeImage={ () => setAttributes({ frontBackgroundImage: undefined })}
								changeColor={ frontBackgroundColor => setAttributes({ frontBackgroundColor })}
								changeGradient={ frontBackgroundGradient => setAttributes({ frontBackgroundGradient }) }
								changeBackgroundAttachment={ frontBackgroundAttachment => setAttributes({ frontBackgroundAttachment })}
								changeBackgroundRepeat={ frontBackgroundRepeat => setAttributes({ frontBackgroundRepeat })}
								changeFocalPoint={ frontBackgroundPosition => setAttributes({ frontBackgroundPosition }) }
								changeBackgroundSize={ frontBackgroundSize => setAttributes({ frontBackgroundSize }) }
							/>
						</PanelBody>

						<PanelBody
							title={ __( 'Back Side', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BackgroundSelectorControl
								backgroundType={ attributes.backBackgroundType }
								backgroundColor={ attributes.backBackgroundColor }
								image={ attributes.backBackgroundImage }
								gradient={ attributes.backBackgroundGradient }
								focalPoint={ attributes.backBackgroundPosition }
								backgroundAttachment={ attributes.backBackgroundAttachment }
								backgroundRepeat={ attributes.backBackgroundRepeat }
								backgroundSize={ attributes.backBackgroundSize }
								changeBackgroundType={ backBackgroundType => setAttributes({ backBackgroundType }) }
								changeImage={ media => {
									setAttributes({
										backBackgroundImage: pick( media, [ 'id', 'url' ])
									});
								}}
								removeImage={ () => setAttributes({ backBackgroundImage: undefined })}
								changeColor={ backBackgroundColor => setAttributes({ backBackgroundColor })}
								changeGradient={ backBackgroundGradient => setAttributes({ backBackgroundGradient }) }
								changeBackgroundAttachment={ backBackgroundAttachment => setAttributes({ backBackgroundAttachment })}
								changeBackgroundRepeat={ backBackgroundRepeat => setAttributes({ backBackgroundRepeat })}
								changeFocalPoint={ backBackgroundPosition => setAttributes({ backBackgroundPosition }) }
								changeBackgroundSize={ backBackgroundSize => setAttributes({ backBackgroundSize }) }
							/>
						</PanelBody>

						<PanelColorSettings
							title={ __( 'Color', 'otter-blocks' ) }
							initialOpen={ false }
							colorSettings={ [
								{
									value: attributes.borderColor,
									onChange: borderColor => setAttributes({ borderColor }),
									label: __( 'Border Color', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.titleColor,
									onChange: titleColor => setAttributes({ titleColor }),
									label: __( 'Title Color', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.descriptionColor,
									onChange: descriptionColor => setAttributes({ descriptionColor }),
									label: __( 'Description Color', 'otter-blocks' ),
									isShownByDefault: false
								}
							] }
						/>

						<PanelBody
							title={ __( 'Border', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BoxControl
								label={ __( 'Border Width', 'otter-blocks' ) }
								values={
									mergeBoxDefaultValues(
										numberToBox( attributes.borderWidth ),
										stringToBox( '3px' )
									)
								}
								onChange={ value => {
									setAttributes({
										borderWidth: removeBoxDefaultValues( value, { left: '3px', right: '3px', bottom: '3px', top: '3px' })
									});
								} }
								allowReset
							/>

							<BoxControl
								id="o-border-raduis-box"
								label={ __( 'Border Radius', 'otter-blocks' ) }
								values={
									mergeBoxDefaultValues(
										numberToBox( attributes.borderRadius ),
										stringToBox( '10px' )
									)
								}
								onChange={ value => {
									setAttributes({
										borderRadius: removeBoxDefaultValues( value, { left: '10px', right: '10px', bottom: '10px', top: '10px' })
									});
								} }
								allowReset
							/>

							<ToggleControl
								label={ __( 'Shadow Properties', 'otter-blocks' ) }
								checked={ attributes.boxShadow }
								onChange={ boxShadow => setAttributes({ boxShadow }) }
							/>

							{ attributes.boxShadow && (
								<Fragment>
									<ColorGradientControl
										label={ __( 'Color', 'otter-blocks' ) }
										colorValue={ attributes.boxShadowColor }
										onColorChange={ changeBoxShadowColor }
									/>

									<ControlPanelControl
										label={ __( 'Shadow Properties', 'otter-blocks' ) }
									>
										<RangeControl
											label={ __( 'Opacity', 'otter-blocks' ) }
											value={ attributes.boxShadowColorOpacity }
											onChange={ changeBoxShadowColorOpacity }
											min={ 0 }
											max={ 100 }
											allowReset
										/>

										<RangeControl
											label={ __( 'Blur', 'otter-blocks' ) }
											value={ attributes.boxShadowBlur }
											onChange={ boxShadowBlur => setAttributes({ boxShadowBlur }) }
											min={ 0 }
											max={ 100 }
											allowReset
										/>

										<RangeControl
											label={ __( 'Horizontal', 'otter-blocks' ) }
											value={ attributes.boxShadowHorizontal }
											onChange={ boxShadowHorizontal => setAttributes({ boxShadowHorizontal })}
											min={ -100 }
											max={ 100 }
											allowReset
										/>

										<RangeControl
											label={ __( 'Vertical', 'otter-blocks' ) }
											value={ attributes.boxShadowVertical }
											onChange={ boxShadowVertical => setAttributes({ boxShadowVertical }) }
											min={ -100 }
											max={ 100 }
											allowReset
										/>
									</ControlPanelControl>
								</Fragment>
							) }
						</PanelBody>
					</Fragment>
				) }
			</div>
		</InspectorControls>
	);
};

export default Inspector;
