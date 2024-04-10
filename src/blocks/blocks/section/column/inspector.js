/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	merge,
	pick
} from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	__experimentalBoxControl as BoxControl,
	Disabled,
	PanelBody,
	ToggleControl,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */

import {
	BackgroundOverlayControl,
	BackgroundSelectorControl,
	ButtonDropdownControl,
	ColorDropdownControl,
	ControlPanelControl,
	InspectorHeader,
	InspectorExtensions,
	ResponsiveControl,
	SyncControlDropdown
} from '../../../components/index.js';
import metadata from './block.json';

import {
	isNullObject,
	removeBoxDefaultValues
} from '../../../helpers/helper-functions.js';
import { useTabSwitch } from '../../../helpers/block-utility';

/**
 *
 * @param {import('./types.js').SectionColumnInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	getValue,
	parentBlock,
	updateBlockAttributes,
	currentBlockWidth,
	nextBlock,
	nextBlockWidth
}) => {
	const getView = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	const [ tab, setTab ] = useTabSwitch( attributes.id, 'layout' );

	const changeColumnWidth = value => {
		const width = value || 10;
		const nextWidth = ( Number( currentBlockWidth.current ) - width ) + Number( nextBlockWidth.current );
		currentBlockWidth.current = width;
		nextBlockWidth.current = nextWidth;
		setAttributes({ columnWidth: width.toFixed( 2 ) });
		updateBlockAttributes( nextBlock.current, {
			columnWidth: nextWidth.toFixed( 2 )
		});
	};

	const getPaddingField = () => {
		switch ( getView ) {
		case 'Desktop':
			return 'padding';
		case 'Tablet':
			return 'paddingTablet';
		case 'Mobile':
			return 'paddingMobile';
		default:
			return undefined;
		}
	};

	const getPadding = () => {
		switch ( getView ) {
		case 'Desktop':
			return getValue( 'padding' );
		case 'Tablet':
			return merge({ ...getValue( 'padding' ) }, getValue( 'paddingTablet' ) );
		case 'Mobile':
			return merge({ ...getValue( 'padding' ) }, getValue( 'paddingTablet' ), getValue( 'paddingMobile' ) );
		default:
			return undefined;
		}
	};

	const changePadding = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		switch ( getView ) {
		case 'Desktop':
			return setAttributes({ padding: value });
		case 'Tablet':
			return setAttributes({ paddingTablet: removeBoxDefaultValues( value, attributes.padding ) });
		case 'Mobile':
			return setAttributes({ paddingMobile: removeBoxDefaultValues( value, { ...attributes.padding, ...attributes.paddingTablet }) });
		default:
			return undefined;
		}
	};

	const getMarginField = () => {
		switch ( getView ) {
		case 'Desktop':
			return 'margin';
		case 'Tablet':
			return 'marginTablet';
		case 'Mobile':
			return 'marginMobile';
		default:
			return undefined;
		}
	};

	const getMargin = () => {
		switch ( getView ) {
		case 'Desktop':
			return getValue( 'margin' );
		case 'Tablet':
			return merge({ ...getValue( 'margin' ) }, getValue( 'marginTablet' ) );
		case 'Mobile':
			return merge({ ...getValue( 'margin' ) }, getValue( 'marginTablet' ), getValue( 'marginMobile' ) );
		default:
			return undefined;
		}
	};

	const changeMargin = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		switch ( getView ) {
		case 'Desktop':
			return setAttributes({ margin: value });
		case 'Tablet':
			return setAttributes({ marginTablet: removeBoxDefaultValues( value, attributes.margin ) });
		case 'Mobile':
			return setAttributes({ marginMobile: removeBoxDefaultValues( value, { ...attributes.margin, ...attributes.marginTablet }) });
		default:
			return undefined;
		}
	};

	const changeBorder = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		setAttributes({ border: value });
	};

	const changeBorderRadius = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		setAttributes({ borderRadius: value });
	};

	const getBackgroundIndicator = ( type, color, image, gradient ) => {
		if ( 'color' === type && color ) {
			return color;
		} else if ( 'image' === type && image ) {
			return `url( ${ image } )`;
		} else if ( 'gradient' === type && gradient ) {
			return gradient;
		}

		return undefined;
	};

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Layout', 'otter-blocks' ),
						value: 'layout'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			{ 'layout' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Column Structure', 'otter-blocks' ) }
					>
						{ ( 1 < parentBlock.innerBlocks.length ) && (
							<RangeControl
								label={ __( 'Column Width', 'otter-blocks' ) }
								value={ Number( attributes.columnWidth ) }
								onChange={ changeColumnWidth }
								step={ 0.1 }
								min={ 10 }
								max={ ( Number( attributes.columnWidth ) + Number( nextBlockWidth.current ) ) - 10 }
							/>
						) }

						<SelectControl
							label={ __( 'HTML Tag', 'otter-blocks' ) }
							value={ attributes.columnsHTMLTag }
							options={ [
								{ label: __( 'Default (div)', 'otter-blocks' ), value: 'div' },
								{ label: 'section', value: 'section' },
								{ label: 'header', value: 'header' },
								{ label: 'footer', value: 'footer' },
								{ label: 'article', value: 'article' },
								{ label: 'main', value: 'main' }
							] }
							onChange={ value => setAttributes({ columnsHTMLTag: value }) }
						/>
					</PanelBody>

					<InspectorExtensions/>
				</Fragment>
			) || 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Dimensions', 'otter-blocks' ) }
					>
						<SyncControlDropdown
							isSynced={ attributes.isSynced }
							options={ [
								{
									label: __( 'Padding', 'otter-blocks' ),
									value: getPaddingField()
								},
								{
									label: __( 'Margin', 'otter-blocks' ),
									value: getMarginField()
								}
							] }
							setAttributes={ setAttributes }
						/>

						<ResponsiveControl
							label={ __( 'Screen Type', 'otter-blocks' ) }
						>
							<Disabled
								isDisabled={ attributes.isSynced?.includes( getPaddingField() ) || false }
								className="o-disabled"
							>
								<BoxControl
									label={ __( 'Padding', 'otter-blocks' ) }
									values={ getPadding() }
									inputProps={ {
										min: 0,
										max: 500
									} }
									onChange={ changePadding }
									resetValues={ metadata.attributes.padding.default }
								/>
							</Disabled>

							<Disabled
								isDisabled={ attributes.isSynced?.includes( getMarginField() ) || false }
								className="o-disabled"
							>
								<BoxControl
									label={ __( 'Margin', 'otter-blocks' ) }
									values={ getMargin() }
									inputProps={ {
										min: -500,
										max: 500
									} }
									onChange={ changeMargin }
									resetValues={ metadata.attributes.margin.default }
								/>
							</Disabled>
						</ResponsiveControl>
					</PanelBody>

					<PanelBody
						title={ __( 'Background & Content', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<ColorDropdownControl
							label={ __( 'Text', 'otter-blocks' ) }
							colorValue={ attributes.color }
							onColorChange={ color => setAttributes({ color }) }
							className="is-list is-first"
						/>

						<ColorDropdownControl
							label={ __( 'Link', 'otter-blocks' ) }
							colorValue={ attributes.linkColor }
							onColorChange={ linkColor => setAttributes({ linkColor }) }
							className="is-list"
						/>

						<ButtonDropdownControl
							label={ __( 'Background', 'otter-blocks' ) }
							indicator={ getBackgroundIndicator( attributes.backgroundType, attributes.backgroundColor, attributes.backgroundImage?.url, attributes.backgroundGradient ) }
						>
							<BackgroundSelectorControl
								backgroundType={ attributes.backgroundType }
								backgroundColor={ attributes.backgroundColor }
								image={ attributes.backgroundImage }
								gradient={ attributes.backgroundGradient }
								focalPoint={ attributes.backgroundPosition }
								backgroundAttachment={ attributes.backgroundAttachment }
								backgroundRepeat={ attributes.backgroundRepeat }
								backgroundSize={ attributes.backgroundSize }
								changeBackgroundType={ value => setAttributes({ backgroundType: value }) }
								changeImage={ media => {
									setAttributes({
										backgroundImage: pick( media, [ 'id', 'url' ])
									});
								}}
								removeImage={ () => setAttributes({ backgroundImage: undefined })}
								changeColor={ value => setAttributes({ backgroundColor: value })}
								changeGradient={ value => setAttributes({ backgroundGradient: value }) }
								changeBackgroundAttachment={ value => setAttributes({ backgroundAttachment: value })}
								changeBackgroundRepeat={ value => setAttributes({ backgroundRepeat: value })}
								changeFocalPoint={ value => setAttributes({ backgroundPosition: value }) }
								changeBackgroundSize={ value => setAttributes({ backgroundSize: value }) }
							/>
						</ButtonDropdownControl>

						<ButtonDropdownControl
							label={ __( 'Background Overlay', 'otter-blocks' ) }
							indicator={ getBackgroundIndicator( attributes.backgroundOverlayType, attributes.backgroundOverlayColor, attributes.backgroundOverlayImage?.url, attributes.backgroundOverlayGradient ) }
						>
							<BackgroundOverlayControl
								backgroundType={ attributes.backgroundOverlayType }
								backgroundColor={ attributes.backgroundOverlayColor }
								image={ attributes.backgroundOverlayImage }
								gradient={ attributes.backgroundOverlayGradient }
								focalPoint={ attributes.backgroundOverlayPosition }
								backgroundAttachment={ attributes.backgroundOverlayAttachment }
								backgroundRepeat={ attributes.backgroundOverlayRepeat }
								backgroundSize={ attributes.backgroundOverlaySize }
								backgroundOpacity={ attributes.backgroundOverlayOpacity }
								backgroundFilterBlur={ attributes.backgroundOverlayFilterBlur }
								backgroundFilterBrightness={ attributes.backgroundOverlayFilterBrightness }
								backgroundFilterContrast={ attributes.backgroundOverlayFilterContrast }
								backgroundFilterGrayscale={ attributes.backgroundOverlayFilterGrayscale }
								backgroundFilterHue={ attributes.backgroundOverlayFilterHue }
								backgroundFilterSaturate={ attributes.backgroundOverlayFilterSaturate }
								backgroundBlend={ attributes.backgroundOverlayBlend }
								changeBackgroundType={ value => setAttributes({ backgroundOverlayType: value }) }
								changeImage={ media => {
									setAttributes({
										backgroundOverlayImage: pick( media, [ 'id', 'url' ])
									});
								}}
								removeImage={ () => setAttributes({ backgroundOverlayImage: undefined })}
								changeColor={ value => setAttributes({ backgroundOverlayColor: value })}
								changeGradient={ value => setAttributes({ backgroundOverlayGradient: value }) }
								changeBackgroundAttachment={ value => setAttributes({ backgroundOverlayAttachment: value })}
								changeBackgroundRepeat={ value => setAttributes({ backgroundOverlayRepeat: value })}
								changeFocalPoint={ value => setAttributes({ backgroundOverlayPosition: value }) }
								changeBackgroundSize={ value => setAttributes({ backgroundOverlaySize: value }) }
								changeOpacity={ value => setAttributes({ backgroundOverlayOpacity: value }) }
								changeFilterBlur={ value => setAttributes({ backgroundOverlayFilterBlur: value }) }
								changeFilterBrightness={ value => setAttributes({ backgroundOverlayFilterBrightness: value }) }
								changeFilterContrast={ value => setAttributes({ backgroundOverlayFilterContrast: value }) }
								changeFilterGrayscale={ value => setAttributes({ backgroundOverlayFilterGrayscale: value }) }
								changeFilterHue={ value => setAttributes({ backgroundOverlayFilterHue: value }) }
								changeFilterSaturate={ value => setAttributes({ backgroundOverlayFilterSaturate: value }) }
								changeBlend={ value => setAttributes({ backgroundOverlayBlend: value }) }
							/>
						</ButtonDropdownControl>

						<ColorDropdownControl
							label={ __( 'Text Hover', 'otter-blocks' ) }
							colorValue={ attributes.colorHover }
							onColorChange={ colorHover => setAttributes({ colorHover }) }
							className="is-list"
						/>

						<ColorDropdownControl
							label={ __( 'Background Hover', 'otter-blocks' ) }
							colorValue={ attributes.backgroundColorHover }
							onColorChange={ backgroundColorHover => setAttributes({ backgroundColorHover }) }
							className="is-list"
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Border', 'otter-blocks' ) }
						className="o-section-border-container"
						initialOpen={ false }
					>
						<ColorDropdownControl
							label={ __( 'Border Color', 'otter-blocks' ) }
							colorValue={ attributes.borderColor }
							onColorChange={ value => setAttributes({ borderColor: value }) }
						/>

						<BoxControl
							label={ __( 'Border Width', 'otter-blocks' ) }
							values={ attributes.border }
							inputProps={ {
								min: 0,
								max: 500
							} }
							units={ [
								{
									value: 'px',
									label: 'px'
								}
							] }
							onChange={ changeBorder }
						/>

						<BoxControl
							label={ __( 'Border Radius', 'otter-blocks' ) }
							values={ attributes.borderRadius }
							inputProps={ {
								min: 0,
								max: 500
							} }
							units={ [
								{
									value: 'px',
									label: 'px'
								},
								{
									value: '%',
									label: '%'
								}
							] }
							onChange={ changeBorderRadius }
						/>

						<ToggleControl
							label={ __( 'Box Shadow', 'otter-blocks' ) }
							checked={ attributes.boxShadow }
							onChange={ () => setAttributes({ boxShadow: ! attributes.boxShadow }) }
						/>

						{ attributes.boxShadow && (
							<ControlPanelControl
								label={ __( 'Shadow Properties', 'otter-blocks' ) }
							>
								<ColorGradientControl
									label={ __( 'Shadow Color', 'otter-blocks' ) }
									colorValue={ attributes.boxShadowColor }
									onColorChange={ value => setAttributes({
										boxShadowColor: ( 100 > attributes.boxShadowColorOpacity && value?.includes( 'var(' ) ) ?
											getComputedStyle( document.documentElement, null ).getPropertyValue( value?.replace( 'var(', '' )?.replace( ')', '' ) ) :
											value
									}) }
								/>

								<RangeControl
									label={ __( 'Opacity', 'otter-blocks' ) }
									value={ attributes.boxShadowColorOpacity }
									onChange={ value => {
										const changes = { boxShadowColorOpacity: value };

										/**
										 * If the value is less than 100 and the color is CSS a variable, then replace the CSS variable with the computed value.
										 * This is needed because the way calculate the opacity of the color is by using the HEX value since we are doing in the server side.
										 */
										if ( 100 > value && attributes.boxShadowColor?.includes( 'var(' ) ) {
											changes.boxShadowColor = getComputedStyle( document.documentElement, null ).getPropertyValue( attributes.boxShadowColor.replace( 'var(', '' ).replace( ')', '' ) );
										}

										setAttributes( changes );
									} }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Blur', 'otter-blocks' ) }
									value={ attributes.boxShadowBlur }
									onChange={ value => setAttributes({ boxShadowBlur: value }) }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Spread', 'otter-blocks' ) }
									value={ attributes.boxShadowSpread }
									onChange={ value => setAttributes({ boxShadowSpread: value }) }
									min={ -100 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Horizontal', 'otter-blocks' ) }
									value={ attributes.boxShadowHorizontal }
									onChange={ value => setAttributes({ boxShadowHorizontal: value }) }
									min={ -100 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Vertical', 'otter-blocks' ) }
									value={ attributes.boxShadowVertical }
									onChange={ value => setAttributes({ boxShadowVertical: value }) }
									min={ -100 }
									max={ 100 }
								/>
							</ControlPanelControl>
						) }
					</PanelBody>
				</Fragment>
			) }
		</InspectorControls>
	);
};

export default Inspector;
