/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { pick } from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	__experimentalBoxControl as BoxControl,
	BaseControl,
	Button,
	ButtonGroup,
	Dashicon,
	PanelBody,
	ToggleControl,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import LayoutControl from './../components/layout-control/index.js';
import ResponsiveControl from '../../../components/responsive-control/index.js';
import ControlPanelControl from '../../../components/control-panel-control/index.js';
import HTMLAnchorControl from '../../../components/html-anchor-control/index.js';
import BackgroundSelectorControl from '../../../components/background-selector-control/index.js';
import SyncControl from '../../../components/sync-control/index.js';
import { isNullObject } from '../../../helpers/helper-functions.js';
import ToogleGroupControl from '../../../components/toogle-group-control/index.js';

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

	const [ tab, setTab ] = useState( 'layout' );

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
			return getValue( 'paddingTablet' ) ?? getValue( 'padding' );
		case 'Mobile':
			return getValue( 'paddingMobile' ) ?? getValue( 'paddingTablet' ) ?? getValue( 'padding' );
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
			return setAttributes({ paddingTablet: value });
		case 'Mobile':
			return setAttributes({ paddingMobile: value });
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
			return getValue( 'marginTablet' ) ?? getValue( 'margin' );
		case 'Mobile':
			return getValue( 'marginMobile' ) ?? getValue( 'marginTablet' ) ?? getValue( 'margin' );
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
			return setAttributes({ marginTablet: value });
		case 'Mobile':
			return setAttributes({ marginMobile: value });
		default:
			return undefined;
		}
	};

	const changeColumnsWidth = value => {
		if ( ( 0 <= value && 2400 >= value ) || undefined === value ) {
			setAttributes({ columnsWidth: value });
		}
	};

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

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody className="o-section-header-panel">
					<Button
						className={ classnames(
							'header-tab',
							{ 'is-selected': 'layout' === tab }
						) }
						onClick={ () => setTab( 'layout' ) }
					>
						<span>
							<Dashicon icon="editor-table"/>
							{ __( 'Layout', 'otter-blocks' ) }
						</span>
					</Button>

					<Button
						className={ classnames(
							'header-tab',
							{ 'is-selected': 'style' === tab }
						) }
						onClick={ () => setTab( 'style' ) }
					>
						<span>
							<Dashicon icon="admin-customizer"/>
							{ __( 'Style', 'otter-blocks' ) }
						</span>
					</Button>

					<Button
						className={ classnames(
							'header-tab',
							{ 'is-selected': 'advanced' === tab }
						) }
						onClick={ () => setTab( 'advanced' ) }
					>
						<span>
							<Dashicon icon="admin-generic"/>
							{ __( 'Advanced', 'otter-blocks' ) }
						</span>
					</Button>
				</PanelBody>

				{ 'layout' === tab && (

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
							title={ __( 'Spacing', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ResponsiveControl
								label={ __( 'Screen Type', 'otter-blocks' ) }
								className="otter-section-padding-responsive-control"
							>
								<SyncControl
									field={ getPaddingField() }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
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
								</SyncControl>

								<SyncControl
									field={ getMarginField() }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
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
								</SyncControl>
							</ResponsiveControl>
						</PanelBody>

						<PanelBody
							title={ __( 'Section Structure', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SyncControl
								field="columnsWidth"
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Maximum Content Width', 'otter-blocks' ) }
									value={ getValue( 'columnsWidth' ) || '' }
									allowReset
									onChange={ changeColumnsWidth }
									min={ 0 }
									max={ 2400 }
								/>
							</SyncControl>

							{ getValue( 'columnsWidth' ) && (
								<SyncControl
									field="horizontalAlign"
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<BaseControl
										label={ __( 'Horizontal Align', 'otter-blocks' ) }
									>
										<ToogleGroupControl
											value={ attributes.horizontalAlign }
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
											hideLabels
										/>
									</BaseControl>
								</SyncControl>
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
									<RangeControl
										value={ getColumnsHeightCustom || '' }
										onChange={ changeColumnsHeightCustom }
										min={ 0 }
										max={ 1000 }
									/>
								</ResponsiveControl>
							) }
						</PanelBody>
					</Fragment>

				) || 'style' === tab && (

					<Fragment>
						<PanelBody
							title={ __( 'Background Settings', 'otter-blocks' ) }
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
						</PanelBody>

						<PanelBody
							title={ __( 'Background Overlay', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BackgroundSelectorControl
								backgroundType={ attributes.backgroundOverlayType }
								backgroundColor={ attributes.backgroundOverlayColor }
								image={ attributes.backgroundOverlayImage }
								gradient={ attributes.backgroundOverlayGradient }
								focalPoint={ attributes.backgroundOverlayPosition }
								backgroundAttachment={ attributes.backgroundOverlayAttachment }
								backgroundRepeat={ attributes.backgroundOverlayRepeat }
								backgroundSize={ attributes.backgroundOverlaySize }
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
							/>

							<RangeControl
								label={ __( 'Overlay Opacity', 'otter-blocks' ) }
								value={ attributes.backgroundOverlayOpacity }
								onChange={ value => setAttributes({ backgroundOverlayOpacity: value }) }
								min={ 0 }
								max={ 100 }
							/>

							<ControlPanelControl
								label={ __( 'CSS Filters', 'otter-blocks' ) }
							>
								<RangeControl
									label={ __( 'Blur', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterBlur }
									onChange={ value => setAttributes({ backgroundOverlayFilterBlur: value }) }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Brightness', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterBrightness }
									onChange={ value => setAttributes({ backgroundOverlayFilterBrightness: value }) }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Contrast', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterContrast }
									onChange={ value => setAttributes({ backgroundOverlayFilterContrast: value }) }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Grayscale', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterGrayscale }
									onChange={ value => setAttributes({ backgroundOverlayFilterGrayscale: value }) }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Hue', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterHue }
									onChange={ value => setAttributes({ backgroundOverlayFilterHue: value }) }
									min={ 0 }
									max={ 360 }
								/>

								<RangeControl
									label={ __( 'Saturation', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterSaturate }
									onChange={ value => setAttributes({ backgroundOverlayFilterSaturate: value }) }
									min={ 0 }
									max={ 100 }
								/>
							</ControlPanelControl>

							<SelectControl
								label={ __( 'Blend Mode', 'otter-blocks' ) }
								value={ attributes.backgroundOverlayBlend }
								options={ [
									{ label: __( 'Normal', 'otter-blocks' ), value: 'normal' },
									{ label: __( 'Multiply', 'otter-blocks' ), value: 'multiply' },
									{ label: __( 'Screen', 'otter-blocks' ), value: 'screen' },
									{ label: __( 'Overlay', 'otter-blocks' ), value: 'overlay' },
									{ label: __( 'Darken', 'otter-blocks' ), value: 'darken' },
									{ label: __( 'Lighten', 'otter-blocks' ), value: 'lighten' },
									{ label: __( 'Color Dodge', 'otter-blocks' ), value: 'color-dodge' },
									{ label: __( 'Color Burn', 'otter-blocks' ), value: 'color-burn' },
									{ label: __( 'Hard Light', 'otter-blocks' ), value: 'hard-light' },
									{ label: __( 'Soft Light', 'otter-blocks' ), value: 'soft-light' },
									{ label: __( 'Difference', 'otter-blocks' ), value: 'difference' },
									{ label: __( 'Exclusion', 'otter-blocks' ), value: 'exclusion' },
									{ label: __( 'Hue', 'otter-blocks' ), value: 'hue' },
									{ label: __( 'Saturation', 'otter-blocks' ), value: 'saturation' },
									{ label: __( 'Color', 'otter-blocks' ), value: 'color' },
									{ label: __( 'Luminosity', 'otter-blocks' ), value: 'luminosity' }
								] }
								onChange={ value => setAttributes({ backgroundOverlayBlend: value }) }
							/>
						</PanelBody>

						<PanelBody
							title={ __( 'Border', 'otter-blocks' ) }
							className="o-section-border-container"
							initialOpen={ false }
						>
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

							<ColorGradientControl
								label={ __( 'Border Color', 'otter-blocks' ) }
								colorValue={ attributes.borderColor }
								onColorChange={ value => setAttributes({ borderColor: value }) }
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
								<Fragment>
									<ColorGradientControl
										label={ __( 'Shadow Color', 'otter-blocks' ) }
										colorValue={ attributes.boxShadowColor }
										onColorChange={ value => setAttributes({ boxShadowColor: value }) }
									/>

									<ControlPanelControl
										label={ __( 'Border Shadow', 'otter-blocks' ) }
									>
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
								</Fragment>
							) }
						</PanelBody>

						<PanelBody
							title={ __( 'Shape Divider', 'otter-blocks' ) }
							initialOpen={ false }
							className="wp-block-themeisle-shape-divider"
						>
							<ButtonGroup>
								<Button
									isSmall
									isSecondary={ 'top' !== dividerViewType }
									isPrimary={ 'top' === dividerViewType }
									onClick={ () => setDividerViewType( 'top' ) }
								>
									{ __( 'Top', 'otter-blocks' ) }
								</Button>

								<Button
									isSmall
									isSecondary={ 'bottom' !== dividerViewType }
									isPrimary={ 'bottom' === dividerViewType }
									onClick={ () => setDividerViewType( 'bottom' ) }
								>
									{ __( 'Bottom', 'otter-blocks' ) }
								</Button>
							</ButtonGroup>

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
									<ColorGradientControl
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

				) || 'advanced' === tab && (

					<Fragment>
						<PanelBody
							title={ __( 'Responsive', 'otter-blocks' ) }
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

						<PanelBody
							title={ __( 'Section Settings', 'otter-blocks' ) }
							initialOpen={ false }
						>
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
