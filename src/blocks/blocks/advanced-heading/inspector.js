/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	AlignmentToolbar,
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	Button,
	Dashicon,
	PanelBody,
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import GoogleFontsControl from '../../components/google-fonts-control/index.js';
import ControlPanelControl from '../../components/control-panel-control/index.js';
import ResponsiveControl from '../../components/responsive-control/index.js';
import SizingControl from '../../components/sizing-control/index.js';
import HTMLAnchorControl from '../../components/html-anchor-control/index.js';
import ClearButton from '../../components/clear-button/index.js';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	const getView = useSelect( select => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' );
		return __experimentalGetPreviewDeviceType();
	}, []);

	const [ tab, setTab ] = useState( 'style' );

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
				<PanelBody className="o-heading-header-panel">
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

				{ 'style' === tab && (

					<Fragment>
						<PanelBody
							title={ __( 'General Settings', 'otter-blocks' ) }
							className="o-adv-h-panel"
						>
							<ColorGradientControl
								label={ __( 'Heading Color', 'otter-blocks' ) }
								colorValue={ attributes.headingColor }
								onColorChange={ headingColor => setAttributes({ headingColor }) }
							/>

							<ResponsiveControl
								label={ __( 'Font Size', 'otter-blocks' ) }
							>
								<RangeControl
									value={ getFontSize() || '' }
									onChange={ changeFontSize }
									min={ 1 }
									max={ 500 }
									allowReset={ true }
								/>
							</ResponsiveControl>

							<ResponsiveControl
								label={ __( 'Alignment', 'otter-blocks' ) }
							>
								<AlignmentToolbar
									value={ getAlignment() }
									onChange={ changeAlignment }
									isCollapsed={ false }
								/>
							</ResponsiveControl>
						</PanelBody>

						<PanelBody
							title={ __( 'Typography Settings', 'otter-blocks' ) }
							initialOpen={ false }
						>
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

							<ClearButton
								values={[ 'fontFamily', 'fontVariant', 'fontStyle', 'textTransform' ]}
								setAttributes={ setAttributes }
							/>

							<RangeControl
								label={ __( 'Line Height', 'otter-blocks' ) }
								value={ attributes.lineHeight }
								onChange={ lineHeight => setAttributes({ lineHeight }) }
								min={ 0 }
								step={ 0.1 }
								max={ 3 }
								allowReset={ true }
							/>

							<RangeControl
								label={ __( 'Letter Spacing', 'otter-blocks' ) }
								value={ attributes.letterSpacing }
								onChange={ letterSpacing => setAttributes({ letterSpacing }) }
								min={ -50 }
								max={ 100 }
								allowReset={ true }
							/>

							<ToggleControl
								label={ __( 'Shadow Properties', 'otter-blocks' ) }
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

				) || 'advanced' === tab && (

					<Fragment>
						<PanelBody
							title={ __( 'Highlight Color', 'otter-blocks' ) }
						>
							<ColorGradientControl
								label={ __( 'Highlight Color', 'otter-blocks' ) }
								colorValue={ attributes.highlightColor }
								onColorChange={ highlightColor => setAttributes({ highlightColor }) }
							/>

							<ColorGradientControl
								label={ __( 'Highlight Background', 'otter-blocks' ) }
								colorValue={ attributes.highlightBackground }
								onColorChange={ highlightBackground => setAttributes({ highlightBackground }) }
							/>
						</PanelBody>

						<PanelBody
							title={ __( 'Spacing', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ResponsiveControl
								label={ __( 'Padding', 'otter-blocks' ) }
							>
								<SizingControl
									type={ getPaddingType() }
									min={ 0 }
									max={ 500 }
									changeType={ changePaddingType }
									onChange={ changePadding }
									options={ [
										{
											label: __( 'Top', 'otter-blocks' ),
											type: 'top',
											value: getPadding( 'top' )
										},
										{
											label: __( 'Right', 'otter-blocks' ),
											type: 'right',
											value: getPadding( 'right' )
										},
										{
											label: __( 'Bottom', 'otter-blocks' ),
											type: 'bottom',
											value: getPadding( 'bottom' )
										},
										{
											label: __( 'Left', 'otter-blocks' ),
											type: 'left',
											value: getPadding( 'left' )
										}
									] }
								/>
							</ResponsiveControl>

							<ClearButton
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
							/>

							<ResponsiveControl
								label={ __( 'Margin', 'otter-blocks' ) }
							>
								<SizingControl
									type={ getMarginType() }
									min={ -500 }
									max={ 500 }
									changeType={ changeMarginType }
									onChange={ changeMargin }
									options={ [
										{
											label: __( 'Top', 'otter-blocks' ),
											type: 'top',
											value: getMargin( 'top' )
										},
										{
											label: __( 'Right', 'otter-blocks' ),
											disabled: true
										},
										{
											label: __( 'Bottom', 'otter-blocks' ),
											type: 'bottom',
											value: getMargin( 'bottom' )
										},
										{
											label: __( 'Left', 'otter-blocks' ),
											disabled: true
										}
									] }
								/>
							</ResponsiveControl>

							<ClearButton
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
							/>
						</PanelBody>
					</Fragment>
				) }
			</InspectorControls>

			<HTMLAnchorControl
				value={ attributes.id }
				onChange={ id => setAttributes({ id }) }
			/>
		</Fragment>
	);
};

export default Inspector;
