/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	AlignmentToolbar,
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	FontSizePicker,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

import {
	isNumber
} from 'lodash';

/**
 * Internal dependencies
 */
import InspectorHeader from '../../components/inspector-header/index.js';
import { InspectorExtensions } from '../../components/inspector-slot-fill/index.js';
import GoogleFontsControl from '../../components/google-fonts-control/index.js';
import ControlPanelControl from '../../components/control-panel-control/index.js';
import ResponsiveControl from '../../components/responsive-control/index.js';
import SizingControl from '../../components/sizing-control/index.js';
import HTMLAnchorControl from '../../components/html-anchor-control/index.js';
import ClearButton from '../../components/clear-button/index.js';
import { alignCenter, alignLeft, alignRight } from '@wordpress/icons';
import ToogleGroupControl from '../../components/toogle-group-control/index.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import { makeBox } from '../../plugins/copy-paste/utils';
import { _px } from '../../helpers/helper-functions.js';

/**
 *
 * @param {import('./types.js').AdvancedHeadingInspectorProps} props
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

	const [ tab, setTab ] = useState( 'style' );
	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const getFontSize = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.fontSize;
		case 'Tablet':
			return attributes.fontSizeTablet;
		case 'Mobile':
			return attributes.fontSizeMobile;
		default:
			return undefined;
		}
	};

	const changeFontSize = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ fontSize: value });
		} else if ( 'Tablet' === getView ) {
			setAttributes({ fontSizeTablet: value });
		} else if ( 'Mobile' === getView ) {
			setAttributes({ fontSizeMobile: value });
		}
	};

	const getAlignment = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.align;
		case 'Tablet':
			return attributes.alignTablet;
		case 'Mobile':
			return attributes.alignMobile;
		default:
			return undefined;
		}
	};


	const changeAlignment = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ align: value });
		} else if ( 'Tablet' === getView ) {
			setAttributes({ alignTablet: value });
		} else if ( 'Mobile' === getView ) {
			setAttributes({ alignMobile: value });
		}
	};

	const getPaddingType = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.paddingType;
		case 'Tablet':
			return attributes.paddingTypeTablet;
		case 'Mobile':
			return attributes.paddingTypeMobile;
		default:
			return undefined;
		}
	};

	const changePaddingType = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ paddingType: value });
		} else if ( 'Tablet' === getView ) {
			setAttributes({ paddingTypeTablet: value });
		} else if ( 'Mobile' === getView ) {
			setAttributes({ paddingTypeMobile: value });
		}
	};

	const desktopPaddingType = {
		top: 'paddingTop',
		right: 'paddingRight',
		bottom: 'paddingBottom',
		left: 'paddingLeft'
	};

	const tabletPaddingType = {
		top: 'paddingTopTablet',
		right: 'paddingRightTablet',
		bottom: 'paddingBottomTablet',
		left: 'paddingLeftTablet'
	};

	const mobilePaddingType = {
		top: 'paddingTopMobile',
		right: 'paddingRightMobile',
		bottom: 'paddingBottomMobile',
		left: 'paddingLeftMobile'
	};

	const changePadding = ( type, value ) => {
		switch ( getView ) {
		case 'Desktop':
			if ( 'linked' === attributes.paddingType ) {
				setAttributes({ padding: value });
			} else {
				setAttributes({ [desktopPaddingType[type]]: value });
			}
			break;
		case 'Tablet':
			if ( 'linked' === attributes.paddingTypeTablet ) {
				setAttributes({ paddingTablet: value });
			} else {
				setAttributes({ [tabletPaddingType[type]]: value });
			}
			break;
		case 'Mobile':
			if ( 'linked' === attributes.paddingTypeMobile ) {
				setAttributes({ paddingMobile: value });
			} else {
				setAttributes({ [mobilePaddingType[type]]: value });
			}
			break;
		}
	};

	const getPadding = type => {
		if ( 'top' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.paddingType ? attributes.padding : attributes.paddingTop;
			case 'Tablet':
				return 'linked' === attributes.paddingTypeTablet ? attributes.paddingTablet : attributes.paddingTopTablet;
			case 'Mobile':
				return 'linked' === attributes.paddingTypeMobile ? attributes.paddingMobile : attributes.paddingTopMobile;
			}
		} else if ( 'right' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.paddingType ? attributes.padding : attributes.paddingRight;
			case 'Tablet':
				return 'linked' === attributes.paddingTypeTablet ? attributes.paddingTablet : attributes.paddingRightTablet;
			case 'Mobile':
				return 'linked' === attributes.paddingTypeMobile ? attributes.paddingMobile : attributes.paddingRightMobile;
			}
		} else if ( 'bottom' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.paddingType ? attributes.padding : attributes.paddingBottom;
			case 'Tablet':
				return 'linked' === attributes.paddingTypeTablet ? attributes.paddingTablet : attributes.paddingBottomTablet;
			case 'Mobile':
				return 'linked' === attributes.paddingTypeMobile ? attributes.paddingMobile : attributes.paddingBottomMobile;
			}
		} else if ( 'left' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.paddingType ? attributes.padding : attributes.paddingLeft;
			case 'Tablet':
				return 'linked' === attributes.paddingTypeTablet ? attributes.paddingTablet : attributes.paddingLeftTablet;
			case 'Mobile':
				return 'linked' === attributes.paddingTypeMobile ? attributes.paddingMobile : attributes.paddingLeftMobile;
			}
		}

		return undefined;
	};

	const getOldPaddingValues = () => ({
		top: _px( responsiveGetAttributes([ attributes.paddingTop, attributes.paddingTopTablet, attributes.paddingTopMobile  ]) ) ?? '0px',
		bottom: _px( responsiveGetAttributes([ attributes.paddingBottom, attributes.paddingBottomTablet, attributes.paddingBottomMobile  ]) ) ?? '0px',
		right: _px ( responsiveGetAttributes([ attributes.paddingRight, attributes.paddingRightTablet, attributes.paddingRightMobile  ]) ) ?? '0px',
		left: _px( responsiveGetAttributes([ attributes.paddingLeft, attributes.paddingLeftTablet, attributes.paddingLeftMobile  ]) ) ?? '0px'
	});

	const getOldMarginValues = () => ({
		top: _px( responsiveGetAttributes([ attributes.marginTop, attributes.marginTopTablet, attributes.marginTopMobile  ]) ) ?? '0px',
		bottom: _px( responsiveGetAttributes([ attributes.marginBottom, attributes.marginBottomTablet, attributes.marginBottomMobile  ]) ) ?? '0px'
	});


	const getMarginType = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.marginType;
		case 'Tablet':
			return attributes.marginTypeTablet;
		case 'Mobile':
			return attributes.marginTypeMobile;
		default:
			return undefined;
		}
	};

	const changeMarginType = value => {
		switch ( getView ) {
		case 'Desktop':
			setAttributes({ marginType: value });
			break;
		case 'Tablet':
			setAttributes({ marginTypeTablet: value });
			break;
		case 'Mobile':
			setAttributes({ marginTypeMobile: value });
			break;
		}
	};

	const desktopMarginType = {
		top: 'marginTop',
		bottom: 'marginBottom'
	};

	const tabletMarginType = {
		top: 'marginTopTablet',
		bottom: 'marginBottomTablet'
	};

	const mobileMarginType = {
		top: 'marginTopMobile',
		bottom: 'marginBottomMobile'
	};

	const changeMargin = ( type, value ) => {
		switch ( getView ) {
		case 'Desktop':
			if ( 'linked' === attributes.marginType ) {
				setAttributes({ margin: value });
			} else {
				setAttributes({ [desktopMarginType[type]]: value });
			}
			break;
		case 'Tablet':
			if ( 'linked' === attributes.marginTypeTablet ) {
				setAttributes({ marginTablet: value });
			} else {
				setAttributes({ [tabletMarginType[type]]: value });
			}
			break;
		case 'Mobile':
			if ( 'linked' === attributes.marginTypeMobile ) {
				setAttributes({ marginMobile: value });
			} else {
				setAttributes({ [mobileMarginType[type]]: value });
			}
			break;
		}
	};

	const getMargin = type => {
		if ( 'top' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.marginType ? attributes.margin : attributes.marginTop;
			case 'Tablet':
				return 'linked' === attributes.marginTypeTablet ? attributes.marginTablet : attributes.marginTopTablet;
			case 'Mobile':
				return 'linked' === attributes.marginTypeMobile ? attributes.marginMobile : attributes.marginTopMobile;
			}
		} else if ( 'bottom' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.marginType ? attributes.margin : attributes.marginBottom;
			case 'Tablet':
				return 'linked' === attributes.marginTypeTablet ? attributes.marginTablet : attributes.marginBottomTablet;
			case 'Mobile':
				return 'linked' === attributes.marginTypeMobile ? attributes.marginMobile : attributes.marginBottomMobile;
			}
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

				<div>

					{
						'settings' === tab && (
							<Fragment>
								<PanelBody
									title={ __( 'Sizing', 'otter-blocks' ) }
								>
									<ResponsiveControl
										label={ __( 'Alignment', 'otter-blocks' ) }
									>
										<ToogleGroupControl
											value={ responsiveGetAttributes([ attributes.align, attributes.alignTablet, attributes.alignMobile  ]) ?? 'left' }
											onChange={ value => responsiveSetAttributes( 'left' === value ? undefined : value, [ 'align', 'alignTablet', 'alignMobile' ]) }
											options={[
												{
													icon: alignLeft,
													label: __( 'Left', 'otter-blocks' ),
													value: 'left'
												},
												{
													icon: alignCenter,
													label: __( 'Center', 'otter-blocks' ),
													value: 'center'
												},
												{
													icon: alignRight,
													label: __( 'Right', 'otter-blocks' ),
													value: 'right'
												}
											]}
											hasIcon
										/>
									</ResponsiveControl>

									<SelectControl
										label={ __( 'HTML Tag', 'otter-blocks' ) }
										value={ attributes.tag  }
										onChange={ tag  => setAttributes({ tag }) }
										options={[
											{ label: __( 'H1', 'otter-blocks' ), value: 'h1' },
											{ label: __( 'H2', 'otter-blocks' ), value: 'h2' },
											{ label: __( 'H3', 'otter-blocks' ), value: 'h3' },
											{ label: __( 'H4', 'otter-blocks' ), value: 'h4' },
											{ label: __( 'H5', 'otter-blocks' ), value: 'h5' },
											{ label: __( 'H6', 'otter-blocks' ), value: 'h6' },
											{ label: __( 'div', 'otter-blocks' ), value: 'div' },
											{ label: __( 'span', 'otter-blocks' ), value: 'span' },
											{ label: __( 'p', 'otter-blocks' ), value: 'p' }
										]}
									/>
								</PanelBody>

							</Fragment>
						)
					}

					{ 'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Typography', 'otter-blocks' ) }
								initialOpen={ false }
							>

								<ResponsiveControl
									label={ __( 'Font Size', 'otter-blocks' ) }
									initialOpen={ true }
								>

									<FontSizePicker
										value={ _px( responsiveGetAttributes([ attributes.fontSize, attributes.fontSizeTablet, attributes.fontSizeMobile  ]) ) ?? '20px'}
										onChange={ value => responsiveSetAttributes( value, [ 'fontSize', 'fontSizeTablet', 'fontSizeMobile' ]) }
										fontSizes={
											[
												{
													name: __( '13', 'otter-blocks' ),
													size: '13px',
													slug: 'small'
												},
												{
													name: __( '20', 'otter-blocks' ),
													size: '20px',
													slug: 'medium'
												},
												{
													name: __( '36', 'otter-blocks' ),
													size: '36px',
													slug: 'large'
												},
												{
													name: __( '42', 'otter-blocks' ),
													size: '42px',
													slug: 'xl'
												}
											]
										}
									/>
								</ResponsiveControl>

								<GoogleFontsControl
									label={ __( 'Font Family', 'otter-blocks' ) }
									value={ attributes.fontFamily }
									onChangeFontFamily={ changeFontFamily }
									valueVariant={ attributes.fontVariant }
									onChangeFontVariant={ fontVariant => setAttributes({ fontVariant }) }
									valueStyle={ attributes.fontStyle }
									onChangeFontStyle={ fontStyle => setAttributes({ fontStyle }) }
									valueTransform={ attributes.textTransform }
									onChangeTextTransform={ textTransform => setAttributes({ textTransform }) }
								/>

								<UnitControl
									label={ __( 'Line Height', 'otter-blocks' ) }
									value={ attributes.lineHeight }
									onChange={ lineHeight => setAttributes({ lineHeight }) }
									step={ 0.1 }
									min={ 0 }
									max={ 3 }
								/>

								<br />

								<UnitControl
									label={ __( 'Letter Spacing', 'otter-blocks' ) }
									value={ attributes.letterSpacing }
									onChange={ letterSpacing => setAttributes({ letterSpacing }) }
									step={ 0.1 }
									min={ -50 }
									max={ 100 }
								/>

								<ClearButton
									values={[ 'fontFamily', 'fontVariant', 'fontStyle', 'textTransform', 'lineHeight', 'letterSpacing' ]}
									setAttributes={ setAttributes }
								/>

							</PanelBody>

							<PanelColorSettings
								title={ __( 'Color', 'otter-blocks' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: attributes.headingColor,
										onChange: headingColor => setAttributes({ headingColor }),
										label: __( 'Text', 'otter-blocks' )
									},
									{
										value: attributes.backgroundColor,
										onChange: backgroundColor => setAttributes({ backgroundColor }),
										label: __( 'Background', 'otter-blocks' )
									},
									{
										value: attributes.linkColor,
										onChange: linkColor => setAttributes({ linkColor }),
										label: __( 'Link', 'otter-blocks' )
									},
									{
										value: attributes.linkHoverColor,
										onChange: linkHoverColor => setAttributes({ linkHoverColor }),
										label: __( 'Link Hover', 'otter-blocks' )
									},
									{
										value: attributes.highlightBackground,
										onChange: highlightBackground => setAttributes({ highlightBackground }),
										label: __( 'Highlight Text', 'otter-blocks' )
									},
									{
										value: attributes.highlightBackground,
										onChange: highlightBackground => setAttributes({ highlightBackground }),
										label: __( 'Highlight Background', 'otter-blocks' )
									}
								] }
							/>

							<PanelBody
								title={ __( 'Dimensions', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<ResponsiveControl
									label={ __( 'Padding', 'otter-blocks' ) }
								>
									<BoxControl

										// label={ __( 'Padding', 'otter-blocks' ) }
										values={
											responsiveGetAttributes([
												isFinite( attributes.padding ) ? makeBox( _px( attributes.padding ) ) : attributes.padding,
												isFinite( attributes.paddingTablet ) ? makeBox( _px( attributes.paddingTablet ) ) : attributes.paddingTablet,
												isFinite( attributes.paddingMobile ) ? makeBox( _px( attributes.paddingMobile ) ) : attributes.paddingMobile
											]) ?? getOldPaddingValues()
										}
										onChange={ value => {
											responsiveSetAttributes( value, [ 'padding', 'paddingTablet', 'paddingMobile' ]);
										} }
									/>

								</ResponsiveControl>


								{/* <ClearButton
									values={[
										{ 'padding': 'Desktop' === getView && 'linked' === attributes.paddingType },
										{ 'paddingTablet': 'Tablet' === getView && 'linked' === attributes.paddingType },
										{ 'paddingMobile': 'Mobile' === getView && 'linked' === attributes.paddingType },
										{ 'paddingRight': 'Desktop' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingRightTablet': 'Tablet' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingRightMobile': 'Mobile' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingTop': 'Desktop' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingTopTablet': 'Tablet' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingTopMobile': 'Mobile' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingBottom': 'Desktop' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingBottomTablet': 'Tablet' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingBottomMobile': 'Mobile' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingLeft': 'Desktop' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingLeftTablet': 'Tablet' === getView && 'linked' !== attributes.paddingType },
										{ 'paddingLeftMobile': 'Mobile' === getView && 'linked' !== attributes.paddingType }
									]}
									setAttributes={ setAttributes }
								/> */}

								<ResponsiveControl
									label={ __( 'Margin', 'otter-blocks' ) }
								>
									<BoxControl

										// label={ __( 'Padding', 'otter-blocks' ) }
										values={
											responsiveGetAttributes([
												isFinite( attributes.margin ) ? makeBox( _px( attributes.margin ) ) : attributes.margin,
												isFinite( attributes.marginTablet ) ? makeBox( _px( attributes.marginTablet ) ) : attributes.marginTablet,
												isFinite( attributes.marginMobile ) ? makeBox( _px( attributes.marginMobile ) ) : attributes.marginMobile
											]) ?? getOldMarginValues()
										}
										onChange={ value => {
											responsiveSetAttributes( value, [ 'margin', 'marginTablet', 'marginMobile' ]);
										} }
										sides={ [ 'top', 'bottom' ] }
									/>
								</ResponsiveControl>

								{/* <ClearButton
									values={[
										{ 'margin': 'Desktop' === getView && 'linked' === attributes.marginType },
										{ 'marginTablet': 'Tablet' === getView && 'linked' === attributes.marginType },
										{ 'marginMobile': 'Mobile' === getView && 'linked' === attributes.marginType },
										{ 'marginTop': 'Desktop' === getView && 'linked' !== attributes.marginType },
										{ 'marginTopTablet': 'Tablet' === getView && 'linked' !== attributes.marginType },
										{ 'marginTopMobile': 'Mobile' === getView && 'linked' !== attributes.marginType },
										{ 'marginBottom': 'Desktop' === getView && 'linked' !== attributes.marginType },
										{ 'marginBottomTablet': 'Tablet' === getView && 'linked' !== attributes.marginType },
										{ 'marginBottomMobile': 'Mobile' === getView && 'linked' !== attributes.marginType }
									]}
									setAttributes={ setAttributes }
								/> */}
							</PanelBody>

							<PanelBody
								title={ __( 'Shadow', 'otter-blocks' ) }
								className="o-adv-h-panel"
							>
								<ToggleControl
									label={ __( 'Enable Text Shadow', 'otter-blocks' ) }
									checked={ attributes.textShadow }
									onChange={ textShadow => setAttributes({ textShadow }) }
								/>

								{ attributes.textShadow && (
									<Fragment>
										<ColorGradientControl
											label={ __( 'Color', 'otter-blocks' ) }
											colorValue={ attributes.textShadowColor }
											onColorChange={ textShadowColor => setAttributes({ textShadowColor }) }
										/>

										<ControlPanelControl
											label={ __( 'Shadow Properties', 'otter-blocks' ) }
										>
											<RangeControl
												label={ __( 'Opacity', 'otter-blocks' ) }
												value={ attributes.textShadowColorOpacity }
												onChange={ textShadowColorOpacity => setAttributes({ textShadowColorOpacity }) }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Blur', 'otter-blocks' ) }
												value={ attributes.textShadowBlur }
												onChange={ textShadowBlur => setAttributes({ textShadowBlur }) }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Horizontal', 'otter-blocks' ) }
												value={ attributes.textShadowHorizontal }
												onChange={ textShadowHorizontal => setAttributes({ textShadowHorizontal }) }
												min={ -100 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Vertical', 'otter-blocks' ) }
												value={ attributes.textShadowVertical }
												onChange={ textShadowVertical => setAttributes({ textShadowVertical }) }
												min={ -100 }
												max={ 100 }
											/>
										</ControlPanelControl>

									</Fragment>
								) }

							</PanelBody>
						</Fragment>

					)  }

					<InspectorExtensions/>

				</div>
			</InspectorControls>

			<HTMLAnchorControl
				value={ attributes.id }
				onChange={ id => setAttributes({ id }) }
			/>

		</Fragment>
	);
};

export default Inspector;
