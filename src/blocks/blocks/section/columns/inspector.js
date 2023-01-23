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
	__experimentalUnitControl as UnitContol,
	BaseControl,
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
import LayoutControl from './../components/layout-control/index.js';

import {
	isNullObject,
	removeBoxDefaultValues
} from '../../../helpers/helper-functions.js';

import {
	BackgroundOverlayControl,
	BackgroundSelectorControl,
	ButtonDropdownControl,
	ButtonToggleControl,
	ClearButton,
	ColorDropdownControl,
	ControlPanelControl,
	HTMLAnchorControl,
	InspectorHeader,
	InspectorExtensions,
	ResponsiveControl,
	SyncControlDropdown,
	ToogleGroupControl
} from '../../../components/index.js';

import { useResponsiveAttributes } from '../../../helpers/utility-hooks.js';

/**
 *
 * @param {import('../column/types.js').SectionColumnInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	getValue,
	updateColumnsWidth,
	dividerViewType,
	setDividerViewType,
	changeColumnsNumbers
}) => {
	const getView = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	const { responsiveSetAttributes } = useResponsiveAttributes( setAttributes );

	const [ tab, setTab ] = useState( 'settings' );

	const changeColumns = value => {
		if ( 6 >= value ) {
			setAttributes({
				layout: 'equal',
				layoutTablet: 'equal',
				layoutMobile: 'collapsedRows'
			});
		}

		if ( 6 < value ) {
			setAttributes({
				layout: 'equal',
				layoutTablet: 'equal',
				layoutMobile: 'collapsedRows'
			});
		}

		if ( 1 >= value ) {
			setAttributes({
				layout: 'equal',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			});
		}

		changeColumnsNumbers( value );
	};

	const changeLayout = value => {
		switch ( getView ) {
		case 'Desktop':
			setAttributes({ layout: value });
			updateColumnsWidth( attributes.columns, value );
			break;
		case 'Tablet':
			setAttributes({ layoutTablet: value });
			break;
		case 'Mobile':
			setAttributes({ layoutMobile: value });
			break;
		}
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
			return merge({ ...getValue( 'padding' ) }, getValue( 'paddingTablet' ), getValue( 'paddingMobile' ) ) ;
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

		if ( 'object' === typeof value ) {
			value = Object.fromEntries( Object.entries( value ).filter( ([ _, v ]) => null !== v ) );
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

	const getColumnsWidthField = () => {
		switch ( getView ) {
		case 'Desktop':
			return 'columnsWidth';
		case 'Tablet':
			return 'columnsWidthTablet';
		case 'Mobile':
			return 'columnsWidthMobile';
		default:
			return undefined;
		}
	};

	let getColumnsWidth = () => {
		switch ( getView ) {
		case 'Desktop':
			return getValue( 'columnsWidth' );
		case 'Tablet':
			return getValue( 'columnsWidthTablet' ) ?? getValue( 'columnsWidth' );
		case 'Mobile':
			return getValue( 'columnsWidthMobile' ) ?? getValue( 'columnsWidthTablet' ) ?? getValue( 'columnsWidth' );
		default:
			return undefined;
		}
	};

	getColumnsWidth = getColumnsWidth();

	const changeHorizontalAlign = value => {
		if ( attributes.horizontalAlign === value ) {
			return setAttributes({ horizontalAlign: 'unset' });
		}

		setAttributes({ horizontalAlign: value });
	};

	let getColumnsHeightCustom = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.columnsHeightCustom;
		case 'Tablet':
			return attributes.columnsHeightCustomTablet ?? attributes.columnsHeightCustom;
		case 'Mobile':
			return attributes.columnsHeightCustomMobile ?? attributes.columnsHeightCustomTablet ?? attributes.columnsHeightCustom;
		default:
			return undefined;
		}
	};

	getColumnsHeightCustom = getColumnsHeightCustom();

	const changeColumnsHeightCustom = value => {
		switch ( getView ) {
		case 'Desktop':
			setAttributes({ columnsHeightCustom: value });
			break;
		case 'Tablet':
			setAttributes({ columnsHeightCustomTablet: value });
			break;
		case 'Mobile':
			setAttributes({ columnsHeightCustomMobile: value });
			break;
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

	const getDividerType = () => {
		if ( 'top' == dividerViewType ) {
			return attributes.dividerTopType;
		} else if ( 'bottom' == dividerViewType ) {
			return attributes.dividerBottomType;
		}

		return undefined;
	};

	const dividerType = getDividerType();

	const changeDividerType = value => {
		if ( 'top' == dividerViewType ) {
			setAttributes({ dividerTopType: value });
		} else if ( 'bottom' == dividerViewType ) {
			setAttributes({ dividerBottomType: value });
		}
	};

	const getDividerColor = () => {
		if ( 'top' == dividerViewType ) {
			return attributes.dividerTopColor;
		} else if ( 'bottom' == dividerViewType ) {
			return attributes.dividerBottomColor;
		}

		return undefined;
	};

	const changeDividerColor = value => {
		if ( 'top' == dividerViewType ) {
			setAttributes({ dividerTopColor: value });
		} else if ( 'bottom' == dividerViewType ) {
			setAttributes({ dividerBottomColor: value });
		}
	};

	const getDividerWidth = () => {
		if ( 'top' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				return attributes.dividerTopWidth ?? 100;
			case 'Tablet':
				return attributes.dividerTopWidthTablet ?? attributes.dividerTopWidth ?? 100;
			case 'Mobile':
				return attributes.dividerTopWidthMobile ?? attributes.dividerTopWidthTablet ?? attributes.dividerTopWidth ?? 100;
			}
		} else if ( 'bottom' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				return attributes.dividerBottomWidth ?? 100;
			case 'Tablet':
				return attributes.dividerBottomWidthTablet ?? attributes.dividerBottomWidth ?? 100;
			case 'Mobile':
				return attributes.dividerBottomWidthMobile ?? attributes.dividerBottomWidthTablet ?? attributes.dividerBottomWidth ?? 100;
			}
		}

		return undefined;
	};

	const changeDividerWidth = value => {
		if ( 'top' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				setAttributes({ dividerTopWidth: value });
				break;
			case 'Tablet':
				setAttributes({ dividerTopWidthTablet: value });
				break;
			case 'Mobile':
				setAttributes({ dividerTopWidthMobile: value });
				break;
			}
		} else if ( 'bottom' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				setAttributes({ dividerBottomWidth: value });
				break;
			case 'Tablet':
				setAttributes({ dividerBottomWidthTablet: value });
				break;
			case 'Mobile':
				setAttributes({ dividerBottomWidthMobile: value });
				break;
			}
		}
	};

	const getDividerHeight = () => {
		if ( 'top' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				return attributes.dividerTopHeight;
			case 'Tablet':
				return attributes.dividerTopHeightTablet;
			case 'Mobile':
				return attributes.dividerTopHeightMobile;
			}
		} else if ( 'bottom' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				return  attributes.dividerBottomHeight;
			case 'Tablet':
				return attributes.dividerBottomHeightTablet;
			case 'Mobile':
				return attributes.dividerBottomHeightMobile;
			}
		}

		return undefined;
	};

	const changeDividerHeight = value => {
		if ( 'top' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				setAttributes({ dividerTopHeight: value });
				break;
			case 'Tablet':
				setAttributes({ dividerTopHeightTablet: value });
				break;
			case 'Mobile':
				setAttributes({ dividerTopHeightMobile: value });
				break;
			}
		} else if ( 'bottom' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				setAttributes({ dividerBottomHeight: value });
				break;
			case 'Tablet':
				setAttributes({ dividerBottomHeightTablet: value });
				break;
			case 'Mobile':
				setAttributes({ dividerBottomHeightMobile: value });
				break;
			}
		}
	};

	const getDividerInvert = () => {
		switch ( dividerViewType ) {
		case 'top':
			return attributes.dividerTopInvert;
		case 'bottom':
			return attributes.dividerBottomInvert;
		default:
			return undefined;
		}
	};

	const changeDividerInvert = () => {
		switch ( dividerViewType ) {
		case 'top':
			setAttributes({ dividerTopInvert: ! attributes.dividerTopInvert });
			break;
		case 'bottom':
			setAttributes({ dividerBottomInvert: ! attributes.dividerBottomInvert });
			break;
		}
	};

	const changeHideStatus = ( value, type ) => {
		switch ( type ) {
		case 'Desktop':
			setAttributes({ hide: value });
			break;
		case 'Tablet':
			setAttributes({ hideTablet: value });
			break;
		case 'Mobile':
			setAttributes({ hideMobile: value });
			break;
		}
	};

	const changeReverseColumns = ( value, type ) => {
		if ( 'Tablet' === type ) {
			setAttributes({ reverseColumnsTablet: value });
		} else if ( 'Mobile' === type ) {
			setAttributes({ reverseColumnsMobile: value });
		}
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
		<Fragment>
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
							title={ __( 'Columns & Layout', 'otter-blocks' ) }
						>
							<RangeControl
								label={ __( 'Columns', 'otter-blocks' ) }
								value={ attributes.columns }
								onChange={ changeColumns }
								min={ 1 }
								max={ 6 }
							/>

							<LayoutControl
								label={ __( 'Layout', 'otter-blocks' ) }
								columns={ attributes.columns }
								layout={ attributes.layout }
								layoutTablet={ attributes.layoutTablet }
								layoutMobile={ attributes.layoutMobile }
								onClick={ changeLayout }
							/>
						</PanelBody>

						<PanelBody
							title={ __( 'Section Structure', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SyncControlDropdown
								isSynced={ attributes.isSynced }
								options={ [
									{
										label: __( 'Maximum Content Width', 'otter-blocks' ),
										value: getColumnsWidthField()
									},
									{
										label: __( 'Horizontal Align', 'otter-blocks' ),
										value: 'horizontalAlign',
										isHidden: undefined === getValue( 'columnsWidth' )
									}
								] }
								setAttributes={ setAttributes }
							/>

							<Disabled
								isDisabled={ attributes.isSynced?.includes( getColumnsWidthField() ) || false }
								className="o-disabled"
							>
								<ResponsiveControl
									label={ __( 'Maximum Content Width', 'otter-blocks' ) }
								>
									<UnitContol
										value={ getColumnsWidth }
										onChange={ value => responsiveSetAttributes( value, [ 'columnsWidth', 'columnsWidthTablet', 'columnsWidthMobile' ]) }
									/>

									<ClearButton
										values={[ 'columnsWidth', 'columnsWidthTablet', 'columnsWidthMobile' ]}
										setAttributes={ setAttributes }
									/>
								</ResponsiveControl>
							</Disabled>

							{ undefined !== getValue( 'columnsWidth' ) && (
								<Disabled
									isDisabled={ attributes.isSynced?.includes( 'horizontalAlign' ) || false }
									className="o-disabled"
								>
									<BaseControl
										label={ __( 'Horizontal Align', 'otter-blocks' ) }
									>
										<ToogleGroupControl
											value={ getValue( 'horizontalAlign' ) }
											options={[
												{
													icon: 'editor-alignleft',
													label: __( 'Left', 'otter-blocks' ),
													value: 'flex-start'
												},
												{
													icon: 'editor-aligncenter',
													label: __( 'Center', 'otter-blocks' ),
													value: 'center'
												},
												{
													icon: 'editor-alignright',
													label: __( 'Right', 'otter-blocks' ),
													value: 'flex-end'
												}
											]}
											onChange={ align => changeHorizontalAlign( align ) }
											hasIcon
										/>
									</BaseControl>
								</Disabled>
							) }

							<SelectControl
								label={ __( 'Minimum Height', 'otter-blocks' ) }
								value={ attributes.columnsHeight }
								options={ [
									{ label: __( 'Default', 'otter-blocks' ), value: 'auto' },
									{ label: __( 'Fit to Screen', 'otter-blocks' ), value: '100vh' },
									{ label: __( 'Custom', 'otter-blocks' ), value: 'custom' }
								] }
								onChange={ value => setAttributes({ columnsHeight: value }) }
							/>

							{ 'custom' === attributes.columnsHeight && (
								<ResponsiveControl
									label={ __( 'Custom Height', 'otter-blocks' ) }
								>
									<UnitContol
										value={ getColumnsHeightCustom }
										onChange={ changeColumnsHeightCustom }
									/>

									<ClearButton
										values={[ 'columnsHeightCustom', 'columnsHeightCustomTablet', 'columnsHeightCustomMobile' ]}
										setAttributes={ setAttributes }
									/>
								</ResponsiveControl>
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

						<PanelBody
							title={ __( 'Responsive', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ToggleControl
								label={ __( 'Hide this section on Desktop devices?', 'otter-blocks' ) }
								checked={ attributes.hide }
								onChange={ e => changeHideStatus( e, 'Desktop' ) }
							/>

							<ToggleControl
								label={ __( 'Hide this section on Tablet devices?', 'otter-blocks' ) }
								checked={ attributes.hideTablet }
								onChange={ e => changeHideStatus( e, 'Tablet' ) }
							/>

							<ToggleControl
								label={ __( 'Hide this section on Mobile devices?', 'otter-blocks' ) }
								checked={ attributes.hideMobile }
								onChange={ e => changeHideStatus( e, 'Mobile' ) }
							/>

							<hr/>

							{ ( ! attributes.hideTablet && 'collapsedRows' === attributes.layoutTablet ) && (
								<ToggleControl
									label={ __( 'Reverse Columns in Tablet devices?', 'otter-blocks' ) }
									checked={ attributes.reverseColumnsTablet }
									onChange={ e => changeReverseColumns( e, 'Tablet' ) }
								/>
							) }

							{ ( ! attributes.hideMobile && 'collapsedRows' === attributes.layoutMobile ) && (
								<ToggleControl
									label={ __( 'Reverse Columns in Mobile devices?', 'otter-blocks' ) }
									checked={ attributes.reverseColumnsMobile }
									onChange={ e => changeReverseColumns( e, 'Mobile' ) }
								/>
							) }
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
										sides={ [ 'top', 'bottom' ] }
										onChange={ changeMargin }
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
								id="o-border-raduis-box"
								onChange={ changeBorderRadius }
							/>

							<ToggleControl
								label={ __( 'Box Shadow', 'otter-blocks' ) }
								checked={ attributes.boxShadow }
								onChange={ () => setAttributes({ boxShadow: ! attributes.boxShadow }) }
							/>

							{ attributes.boxShadow && (
								<ControlPanelControl
									label={ __( 'Border Shadow', 'otter-blocks' ) }
								>
									<ColorGradientControl
										label={ __( 'Shadow Color', 'otter-blocks' ) }
										colorValue={ attributes.boxShadowColor }
										onColorChange={ value => setAttributes({ boxShadowColor: value }) }
									/>

									<RangeControl
										label={ __( 'Opacity', 'otter-blocks' ) }
										value={ attributes.boxShadowColorOpacity }
										onChange={ value => setAttributes({ boxShadowColorOpacity: value }) }
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

						<PanelBody
							title={ __( 'Shape Divider', 'otter-blocks' ) }
							initialOpen={ false }
							className="wp-block-themeisle-shape-divider"
						>
							<ButtonToggleControl
								label={ __( 'Sides', 'otter-blocks' ) }
								options={[
									{
										label: __( 'Top', 'otter-blocks' ),
										value: 'top'
									},
									{
										label: __( 'Bottom', 'otter-blocks' ),
										value: 'bottom'
									}
								]}
								value={ dividerViewType }
								onChange={ setDividerViewType }
							/>

							<SelectControl
								label={ __( 'Type', 'otter-blocks' ) }
								value={ dividerType }
								options={ [
									{ label: __( 'None', 'otter-blocks' ), value: 'none' },
									{ label: __( 'Triangle', 'otter-blocks' ), value: 'bigTriangle' },
									{ label: __( 'Right Curve', 'otter-blocks' ), value: 'rightCurve' },
									{ label: __( 'Curve', 'otter-blocks' ), value: 'curve' },
									{ label: __( 'Slant', 'otter-blocks' ), value: 'slant' },
									{ label: __( 'Cloud', 'otter-blocks' ), value: 'cloud' }
								] }
								onChange={ changeDividerType }
							/>

							{ 'none' !== dividerType && (
								<Fragment>
									<ColorDropdownControl
										label={ __( 'Color', 'otter-blocks' ) }
										colorValue={ getDividerColor() }
										onColorChange={ changeDividerColor }
									/>

									<ResponsiveControl
										label={ __( 'Width', 'otter-blocks' ) }
									>
										<RangeControl
											value={ getDividerWidth() }
											onChange={ changeDividerWidth }
											step={ 0.1 }
											min={ 0 }
											max={ 500 }
										/>
									</ResponsiveControl>

									<ResponsiveControl
										label={ __( 'Height', 'otter-blocks' ) }
									>
										<RangeControl
											value={ getDividerHeight() }
											onChange={ changeDividerHeight }
											step={ 0.1 }
											min={ 0 }
											max={ 500 }
										/>
									</ResponsiveControl>

									{ ( 'curve' !== dividerType && 'cloud' !== dividerType ) && (
										<ToggleControl
											label={ __( 'Invert Shape Divider', 'otter-blocks' ) }
											checked={ getDividerInvert() }
											onChange={ changeDividerInvert }
										/>
									) }
								</Fragment>
							) }
						</PanelBody>
					</Fragment>
				) }
			</InspectorControls>

			<HTMLAnchorControl
				value={ attributes.id }
				onChange={ value => setAttributes({ id: value }) }
			/>
		</Fragment>
	);
};

export default Inspector;
