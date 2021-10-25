/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ColorPalette,
	InspectorControls,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
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
import ColorBaseControl from '../../../components/color-base-control/index.js';
import LayoutControl from './../components/layout-control/index.js';
import SizingControl from '../../../components/sizing-control/index.js';
import ResponsiveControl from '../../../components/responsive-control/index.js';
import BackgroundControl from '../components/background-control/index.js';
import ControlPanelControl from '../../../components/control-panel-control/index.js';
import HTMLAnchorControl from '../../../components/html-anchor-control/index.js';

const Inspector = ({
	attributes,
	setAttributes,
	updateColumnsWidth,
	dividerViewType,
	setDividerViewType,
	changeColumnsNumbers
}) => {
	const getView = useSelect( ( select ) => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	const [ tab, setTab ] = useState( 'layout' );

	const [ hasColumnsChanged, setColumnsChanged ] = useState( false );

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
		setColumnsChanged( true );
	};

	useEffect( () => {
		if ( ! hasColumnsChanged ) {
			return;
		}

		if ( 6 >= attributes.columns ) {
			updateColumnsWidth( attributes.columns, 'equal' );
		} else if ( 6 < attributes.columns ) {
			updateColumnsWidth( 6, 'equal' );
		} else if ( 1 >= attributes.columns ) {
			updateColumnsWidth( 1, 'equal' );
		}

		setColumnsChanged( false );
	}, [ attributes.columns ]);

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

	const changeColumnsGap = value => {
		setAttributes({ columnsGap: value });
	};

	let getPaddingType = () => {
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

	getPaddingType = getPaddingType();

	const changePaddingType = value => {
		switch ( getView ) {
		case 'Desktop':
			setAttributes({ paddingType: value });
			break;
		case 'Tablet':
			setAttributes({ paddingTypeTablet: value });
			break;
		case 'Mobile':
			setAttributes({ paddingTypeMobile: value });
			break;
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
		if ( 'Desktop' === getView ) {
			if ( 'linked' === attributes.paddingType ) {
				setAttributes({ padding: value });
			} else {
				setAttributes({ [desktopPaddingType[type]]: value });
			}
		} else if ( 'Tablet' === getView ) {
			if ( 'linked' === attributes.paddingTypeTablet ) {
				setAttributes({ paddingTablet: value });
			} else {
				setAttributes({ [tabletPaddingType[type]]: value });
			}
		} else if ( 'Mobile' === getView ) {
			if ( 'linked' === attributes.paddingTypeMobile ) {
				setAttributes({ paddingMobile: value });
			} else {
				setAttributes({ [mobilePaddingType[type]]: value });
			}
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
		if ( 'Desktop' === getView ) {
			if ( 'linked' === attributes.marginType ) {
				setAttributes({ margin: value });
			} else {
				setAttributes({ [desktopMarginType[type]]: value });
			}
		} else if ( 'Tablet' === getView ) {
			if ( 'linked' === attributes.marginTypeTablet ) {
				setAttributes({ marginTablet: value });
			} else {
				setAttributes({ [tabletMarginType[type]]: value });
			}
		} else if ( 'Mobile' === getView ) {
			if ( 'linked' === attributes.marginTypeMobile ) {
				setAttributes({ marginMobile: value });
			} else {
				setAttributes({ [mobileMarginType[type]]: value });
			}
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

	const changeColumnsWidth = value => {
		if ( ( 0 <= value && 1200 >= value ) || undefined === value ) {
			setAttributes({ columnsWidth: value });
		}
	};

	const changeHorizontalAlign = value => {
		if ( attributes.horizontalAlign === value ) {
			return setAttributes({ horizontalAlign: 'unset' });
		}

		setAttributes({ horizontalAlign: value });
	};

	const changeColumnsHeight = value => {
		setAttributes({ columnsHeight: value });
	};

	let getColumnsHeightCustom = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.columnsHeightCustom;
		case 'Tablet':
			return attributes.columnsHeightCustomTablet;
		case 'Mobile':
			return attributes.columnsHeightCustomMobile;
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

	const changeBackgroundType = value => {
		setAttributes({ backgroundType: value });
	};

	const changeBackgroundColor = value => {
		setAttributes({ backgroundColor: value });
	};

	const removeBackgroundImage = () => {
		setAttributes({
			backgroundImageID: '',
			backgroundImageURL: ''
		});
	};

	const changeBackgroundAttachment = value => {
		setAttributes({ backgroundAttachment: value });
	};

	const changeBackgroundPosition = value => {
		setAttributes({ backgroundPosition: value });
	};

	const changeBackgroundRepeat = value => {
		setAttributes({ backgroundRepeat: value });
	};

	const changeBackgroundSize = value => {
		setAttributes({ backgroundSize: value });
	};

	const changeBackgroundImage = value => {
		setAttributes({
			backgroundImageID: value.id,
			backgroundImageURL: value.url
		});
	};

	const changeBackgroundGradient = value => {
		setAttributes({ backgroundGradient: value });
	};

	const changeBackgroundOverlayType = value => {
		setAttributes({ backgroundOverlayType: value });
	};

	const changeBackgroundOverlayOpacity = value => {
		setAttributes({ backgroundOverlayOpacity: value });
	};

	const changeBackgroundOverlayColor = value => {
		setAttributes({ backgroundOverlayColor: value });
	};

	const removeBackgroundOverlayImage = () => {
		setAttributes({
			backgroundOverlayImageID: '',
			backgroundOverlayImageURL: ''
		});
	};

	const changeBackgroundOverlayAttachment = value => {
		setAttributes({ backgroundOverlayAttachment: value });
	};

	const changeBackgroundOverlayPosition = value => {
		setAttributes({ backgroundOverlayPosition: value });
	};

	const changeBackgroundOverlayRepeat = value => {
		setAttributes({ backgroundOverlayRepeat: value });
	};

	const changeBackgroundOverlaySize = value => {
		setAttributes({ backgroundOverlaySize: value });
	};

	const changeBackgroundOverlayImage = value => {
		setAttributes({
			backgroundOverlayImageID: value.id,
			backgroundOverlayImageURL: value.url
		});
	};

	const changeBackgroundOverlayGradient = value => {
		setAttributes({ backgroundOverlayGradient: value });
	};

	const changebackgroundOverlayFilterBlur = value => {
		setAttributes({ backgroundOverlayFilterBlur: value });
	};

	const changebackgroundOverlayFilterBrightness = value => {
		setAttributes({ backgroundOverlayFilterBrightness: value });
	};

	const changebackgroundOverlayFilterContrast = value => {
		setAttributes({ backgroundOverlayFilterContrast: value });
	};

	const changebackgroundOverlayFilterGrayscale = value => {
		setAttributes({ backgroundOverlayFilterGrayscale: value });
	};

	const changebackgroundOverlayFilterHue = value => {
		setAttributes({ backgroundOverlayFilterHue: value });
	};

	const changebackgroundOverlayFilterSaturate = value => {
		setAttributes({ backgroundOverlayFilterSaturate: value });
	};

	const changebackgroundOverlayBlend = value => {
		setAttributes({ backgroundOverlayBlend: value });
	};

	const changeBorderType = value => {
		setAttributes({ borderType: value });
	};

	const borderWidthDirection = {
		top: 'borderTop',
		right: 'borderRight',
		bottom: 'borderBottom',
		left: 'borderLeft'
	};

	const changeBorder = ( type, value ) => {
		if ( 'linked' === attributes.borderType ) {
			setAttributes({ border: value });
		} else {
			setAttributes({ [borderWidthDirection[type]]: value });
		}
	};

	const getBorder = type => {
		switch ( type ) {
		case 'top':
			return 'linked' === attributes.borderType ? attributes.border : attributes.borderTop;
		case 'right':
			return 'linked' === attributes.borderType ? attributes.border : attributes.borderRight;
		case 'bottom':
			return 'linked' === attributes.borderType ? attributes.border : attributes.borderBottom;
		case 'left':
			return 'linked' === attributes.borderType ? attributes.border : attributes.borderLeft;
		default:
			return undefined;
		}
	};

	const changeBorderColor = value => {
		setAttributes({ borderColor: value });
	};

	const changeBorderRadiusType = value => {
		setAttributes({ borderRadiusType: value });
	};

	const borderRadiusDirection = {
		top: 'borderRadiusTop',
		right: 'borderRadiusRight',
		bottom: 'borderRadiusBottom',
		left: 'borderRadiusLeft'
	};

	const changeBorderRadius = ( type, value ) => {
		if ( 'linked' === attributes.borderRadiusType ) {
			setAttributes({ borderRadius: value });
		} else {
			setAttributes({ [borderRadiusDirection[type]]: value });
		}
	};

	const getBorderRadius = type => {
		switch ( type ) {
		case 'top':
			return 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusTop;
		case 'right':
			return 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusRight;
		case 'bottom':
			return 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusBottom;
		case 'left':
			return 'linked' === attributes.borderRadiusType ? attributes.borderRadius : attributes.borderRadiusLeft;
		default:
			return undefined;
		}
	};

	const changeBoxShadow = () => {
		setAttributes({ boxShadow: ! attributes.boxShadow });
	};

	const changeBoxShadowColor = value => {
		setAttributes({ boxShadowColor: value });
	};

	const changeBoxShadowColorOpacity = value => {
		setAttributes({ boxShadowColorOpacity: value });
	};

	const changeBoxShadowBlur = value => {
		setAttributes({ boxShadowBlur: value });
	};

	const changeBoxShadowSpread = value => {
		setAttributes({ boxShadowSpread: value });
	};

	const changeBoxShadowHorizontal = value => {
		setAttributes({ boxShadowHorizontal: value });
	};

	const changeBoxShadowVertical = value => {
		setAttributes({ boxShadowVertical: value });
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
				return attributes.dividerTopWidth;
			case 'Tablet':
				return attributes.dividerTopWidthTablet;
			case 'Mobile':
				return attributes.dividerTopWidthMobile;
			}
		} else if ( 'bottom' == dividerViewType ) {
			switch ( getView ) {
			case 'Desktop':
				return attributes.dividerBottomWidth;
			case 'Tablet':
				return attributes.dividerBottomWidthTablet;
			case 'Mobile':
				return attributes.dividerBottomWidthMobile;
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

	const changeColumnsHTMLTag = value => {
		setAttributes({ columnsHTMLTag: value });
	};

	const changeID = value => {
		setAttributes({ id: value });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody className="wp-block-themeisle-blocks-advanced-columns-header-panel">
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

							<SelectControl
								label={ __( 'Columns Gap', 'otter-blocks' ) }
								value={ attributes.columnsGap }
								options={ [
									{ label: __( 'Default (10px)', 'otter-blocks' ), value: 'default' },
									{ label: __( 'No Gap', 'otter-blocks' ), value: 'nogap' },
									{ label: __( 'Narrow (5px)', 'otter-blocks' ), value: 'narrow' },
									{ label: __( 'Extended (15px)', 'otter-blocks' ), value: 'extended' },
									{ label: __( 'Wide (20px)', 'otter-blocks' ), value: 'wide' },
									{ label: __( 'Wider (30px)', 'otter-blocks' ), value: 'wider' }
								] }
								onChange={ changeColumnsGap }
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
									type={ getPaddingType }
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
						</PanelBody>

						<PanelBody
							title={ __( 'Section Structure', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<RangeControl
								label={ __( 'Maximum Content Width', 'otter-blocks' ) }
								value={ attributes.columnsWidth || '' }
								onChange={ changeColumnsWidth }
								min={ 0 }
								max={ 1800 }
							/>

							{ attributes.columnsWidth && (
								<BaseControl
									label={ __( 'Horizontal Align', 'otter-blocks' ) }
								>
									<ButtonGroup className="wp-block-themeisle-icon-buttom-group">
										<Button
											icon="editor-alignleft"
											label={ __( 'Left', 'otter-blocks' ) }
											showTooltip={ true }
											isLarge
											isPrimary={ 'flex-start' === attributes.horizontalAlign }
											onClick={ () => changeHorizontalAlign( 'flex-start' ) }
										/>

										<Button
											icon="editor-aligncenter"
											label={ __( 'Center', 'otter-blocks' ) }
											showTooltip={ true }
											isLarge
											isPrimary={ 'center' === attributes.horizontalAlign }
											onClick={ () => changeHorizontalAlign( 'center' ) }
										/>

										<Button
											icon="editor-alignright"
											label={ __( 'Right', 'otter-blocks' ) }
											showTooltip={ true }
											isLarge
											isPrimary={ 'flex-end' === attributes.horizontalAlign }
											onClick={ () => changeHorizontalAlign( 'flex-end' ) }
										/>
									</ButtonGroup>
								</BaseControl>
							) }

							<SelectControl
								label={ __( 'Minimum Height', 'otter-blocks' ) }
								value={ attributes.columnsHeight }
								options={ [
									{ label: __( 'Default', 'otter-blocks' ), value: 'auto' },
									{ label: __( 'Fit to Screen', 'otter-blocks' ), value: '100vh' },
									{ label: __( 'Custom', 'otter-blocks' ), value: 'custom' }
								] }
								onChange={ changeColumnsHeight }
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
							className="wp-block-themeisle-image-container"
						>
							<BackgroundControl
								label={ __( 'Background Type', 'otter-blocks' ) }
								backgroundType={ attributes.backgroundType }
								changeBackgroundType={ changeBackgroundType }
							/>

							{ 'color' === attributes.backgroundType && (

								<ColorBaseControl
									label={ __( 'Background Color', 'otter-blocks' ) }
									colorValue={ attributes.backgroundColor }
								>
									<ColorPalette
										label={ __( 'Background Color', 'otter-blocks' ) }
										value={ attributes.backgroundColor }
										onChange={ changeBackgroundColor }
									/>
								</ColorBaseControl>

							) || 'image' === attributes.backgroundType && (
								attributes.backgroundImageURL ?

									<Fragment>
										<div className="wp-block-themeisle-image-container-body">
											<div className="wp-block-themeisle-image-container-area">
												<div
													className="wp-block-themeisle-image-container-holder"
													style={ {
														backgroundImage: `url('${ attributes.backgroundImageURL }')`
													} }
												></div>

												<div
													className="wp-block-themeisle-image-container-delete"
													onClick={ removeBackgroundImage }
												>
													<Dashicon icon="trash" />
													<span>{ __( 'Remove Image', 'otter-blocks' ) }</span>
												</div>
											</div>
										</div>

										<Button
											isSecondary
											className="wp-block-themeisle-image-container-delete-button"
											onClick={ removeBackgroundImage }
										>
											{ __( 'Change or Remove Image', 'otter-blocks' ) }
										</Button>

										<ControlPanelControl
											label={ __( 'Background Settings', 'otter-blocks' ) }
										>

											<SelectControl
												label={ __( 'Background Attachment', 'otter-blocks' ) }
												value={ attributes.backgroundAttachment }
												options={ [
													{ label: __( 'Scroll', 'otter-blocks' ), value: 'scroll' },
													{ label: __( 'Fixed', 'otter-blocks' ), value: 'fixed' },
													{ label: __( 'Local', 'otter-blocks' ), value: 'local' }
												] }
												onChange={ changeBackgroundAttachment }
											/>

											<SelectControl
												label={ __( 'Background Position', 'otter-blocks' ) }
												value={ attributes.backgroundPosition }
												options={ [
													{ label: __( 'Default', 'otter-blocks' ), value: 'top left' },
													{ label: __( 'Top Left', 'otter-blocks' ), value: 'top left' },
													{ label: __( 'Top Center', 'otter-blocks' ), value: 'top center' },
													{ label: __( 'Top Right', 'otter-blocks' ), value: 'top right' },
													{ label: __( 'Center Left', 'otter-blocks' ), value: 'center left' },
													{ label: __( 'Center Center', 'otter-blocks' ), value: 'center center' },
													{ label: __( 'Center Right', 'otter-blocks' ), value: 'center right' },
													{ label: __( 'Bottom Left', 'otter-blocks' ), value: 'bottom left' },
													{ label: __( 'Bottom Center', 'otter-blocks' ), value: 'bottom center' },
													{ label: __( 'Bottom Right', 'otter-blocks' ), value: 'bottom right' }
												] }
												onChange={ changeBackgroundPosition }
											/>

											<SelectControl
												label={ __( 'Background Repeat', 'otter-blocks' ) }
												value={ attributes.backgroundRepeat }
												options={ [
													{ label: __( 'Repeat', 'otter-blocks' ), value: 'repeat' },
													{ label: __( 'No-repeat', 'otter-blocks' ), value: 'no-repeat' }
												] }
												onChange={ changeBackgroundRepeat }
											/>

											<SelectControl
												label={ __( 'Background Size', 'otter-blocks' ) }
												value={ attributes.backgroundSize }
												options={ [
													{ label: __( 'Auto', 'otter-blocks' ), value: 'auto' },
													{ label: __( 'Cover', 'otter-blocks' ), value: 'cover' },
													{ label: __( 'Contain', 'otter-blocks' ), value: 'contain' }
												] }
												onChange={ changeBackgroundSize }
											/>

										</ControlPanelControl>
									</Fragment> :

									<MediaPlaceholder
										icon="format-image"
										labels={ {
											title: __( 'Background Image', 'otter-blocks' ),
											name: __( 'an image', 'otter-blocks' )
										} }
										value={ attributes.backgroundImageID }
										onSelect={ changeBackgroundImage }
										accept="image/*"
										allowedTypes={ [ 'image' ] }
									/>

							) || 'gradient' === attributes.backgroundType && (
								<ColorGradientControl
									label={ __( 'Background Gradient', 'otter-blocks' ) }
									gradientValue={ attributes.backgroundGradient }
									disableCustomColors={ true }
									onGradientChange={ changeBackgroundGradient }
									clearable={ false }
								/>
							) }
						</PanelBody>

						<PanelBody
							title={ __( 'Background Overlay', 'otter-blocks' ) }
							className="wp-block-themeisle-image-container"
							initialOpen={ false }
						>
							<BackgroundControl
								label={ __( 'Overlay Type', 'otter-blocks' ) }
								backgroundType={ attributes.backgroundOverlayType }
								changeBackgroundType={ changeBackgroundOverlayType }
							/>

							<RangeControl
								label={ __( 'Overlay Opacity', 'otter-blocks' ) }
								value={ attributes.backgroundOverlayOpacity }
								onChange={ changeBackgroundOverlayOpacity }
								min={ 0 }
								max={ 100 }
							/>

							{ 'color' === attributes.backgroundOverlayType && (

								<ColorBaseControl
									label={ __( 'Overlay Color', 'otter-blocks' ) }
									colorValue={ attributes.backgroundOverlayColor }
								>
									<ColorPalette
										label={ __( 'Overlay Color', 'otter-blocks' ) }
										value={ attributes.backgroundOverlayColor }
										onChange={ changeBackgroundOverlayColor }
									/>
								</ColorBaseControl>

							) || 'image' === attributes.backgroundOverlayType && (
								attributes.backgroundOverlayImageURL ?

									<Fragment>
										<div className="wp-block-themeisle-image-container-body">
											<div className="wp-block-themeisle-image-container-area">
												<div
													className="wp-block-themeisle-image-container-holder"
													style={ {
														backgroundImage: `url('${ attributes.backgroundOverlayImageURL }')`
													} }
												></div>

												<div
													className="wp-block-themeisle-image-container-delete"
													onClick={ removeBackgroundOverlayImage }
												>
													<Dashicon icon="trash" />
													<span>{ __( 'Remove Image', 'otter-blocks' ) }</span>
												</div>
											</div>
										</div>

										<Button
											isSecondary
											className="wp-block-themeisle-image-container-delete-button"
											onClick={ removeBackgroundOverlayImage }
										>
											{ __( 'Change or Remove Image', 'otter-blocks' ) }
										</Button>

										<ControlPanelControl
											label={ __( 'Background Settings', 'otter-blocks' ) }
										>

											<SelectControl
												label={ __( 'Background Attachment', 'otter-blocks' ) }
												value={ attributes.backgroundOverlayAttachment }
												options={ [
													{ label: __( 'Scroll', 'otter-blocks' ), value: 'scroll' },
													{ label: __( 'Fixed', 'otter-blocks' ), value: 'fixed' },
													{ label: __( 'Local', 'otter-blocks' ), value: 'local' }
												] }
												onChange={ changeBackgroundOverlayAttachment }
											/>

											<SelectControl
												label={ __( 'Background Position', 'otter-blocks' ) }
												value={ attributes.backgroundOverlayPosition }
												options={ [
													{ label: __( 'Default', 'otter-blocks' ), value: 'top left' },
													{ label: __( 'Top Left', 'otter-blocks' ), value: 'top left' },
													{ label: __( 'Top Center', 'otter-blocks' ), value: 'top center' },
													{ label: __( 'Top Right', 'otter-blocks' ), value: 'top right' },
													{ label: __( 'Center Left', 'otter-blocks' ), value: 'center left' },
													{ label: __( 'Center Center', 'otter-blocks' ), value: 'center center' },
													{ label: __( 'Center Right', 'otter-blocks' ), value: 'center right' },
													{ label: __( 'Bottom Left', 'otter-blocks' ), value: 'bottom left' },
													{ label: __( 'Bottom Center', 'otter-blocks' ), value: 'bottom center' },
													{ label: __( 'Bottom Right', 'otter-blocks' ), value: 'bottom right' }
												] }
												onChange={ changeBackgroundOverlayPosition }
											/>

											<SelectControl
												label={ __( 'Background Repeat', 'otter-blocks' ) }
												value={ attributes.backgroundOverlayRepeat }
												options={ [
													{ label: __( 'Repeat', 'otter-blocks' ), value: 'repeat' },
													{ label: __( 'No-repeat', 'otter-blocks' ), value: 'no-repeat' }
												] }
												onChange={ changeBackgroundOverlayRepeat }
											/>

											<SelectControl
												label={ __( 'Background Size', 'otter-blocks' ) }
												value={ attributes.backgroundOverlaySize }
												options={ [
													{ label: __( 'Auto', 'otter-blocks' ), value: 'auto' },
													{ label: __( 'Cover', 'otter-blocks' ), value: 'cover' },
													{ label: __( 'Contain', 'otter-blocks' ), value: 'contain' }
												] }
												onChange={ changeBackgroundOverlaySize }
											/>

										</ControlPanelControl>
									</Fragment> :

									<MediaPlaceholder
										icon="format-image"
										labels={ {
											title: __( 'Background Image', 'otter-blocks' ),
											name: __( 'an image', 'otter-blocks' )
										} }
										value={ attributes.backgroundOverlayImageID }
										onSelect={ changeBackgroundOverlayImage }
										accept="image/*"
										allowedTypes={ [ 'image' ] }
									/>

							) || 'gradient' === attributes.backgroundOverlayType && (
								<ColorGradientControl
									label={ __( 'Background Gradient', 'otter-blocks' ) }
									gradientValue={ attributes.backgroundOverlayGradient }
									disableCustomColors={ true }
									onGradientChange={ changeBackgroundOverlayGradient }
									clearable={ false }
								/>
							) }

							<ControlPanelControl
								label={ __( 'CSS Filters', 'otter-blocks' ) }
							>
								<RangeControl
									label={ __( 'Blur', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterBlur }
									onChange={ changebackgroundOverlayFilterBlur }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Brightness', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterBrightness }
									onChange={ changebackgroundOverlayFilterBrightness }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Contrast', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterContrast }
									onChange={ changebackgroundOverlayFilterContrast }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Grayscale', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterGrayscale }
									onChange={ changebackgroundOverlayFilterGrayscale }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Hue', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterHue }
									onChange={ changebackgroundOverlayFilterHue }
									min={ 0 }
									max={ 360 }
								/>

								<RangeControl
									label={ __( 'Saturation', 'otter-blocks' ) }
									value={ attributes.backgroundOverlayFilterSaturate }
									onChange={ changebackgroundOverlayFilterSaturate }
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
								onChange={ changebackgroundOverlayBlend }
							/>
						</PanelBody>

						<PanelBody
							title={ __( 'Border', 'otter-blocks' ) }
							className="wp-block-themeisle-border-container"
							initialOpen={ false }
						>
							<SizingControl
								label={ __( 'Border Width', 'otter-blocks' ) }
								type={ attributes.borderType }
								min={ 0 }
								max={ 500 }
								changeType={ changeBorderType }
								onChange={ changeBorder }
								options={ [
									{
										label: __( 'Top', 'otter-blocks' ),
										type: 'top',
										value: getBorder( 'top' )
									},
									{
										label: __( 'Right', 'otter-blocks' ),
										type: 'right',
										value: getBorder( 'right' )
									},
									{
										label: __( 'Bottom', 'otter-blocks' ),
										type: 'bottom',
										value: getBorder( 'bottom' )
									},
									{
										label: __( 'Left', 'otter-blocks' ),
										type: 'left',
										value: getBorder( 'left' )
									}
								] }
							/>

							<ColorBaseControl
								label={ __( 'Border Color', 'otter-blocks' ) }
								colorValue={ attributes.borderColor }
							>
								<ColorPalette
									label={ __( 'Border Color', 'otter-blocks' ) }
									value={ attributes.borderColor }
									onChange={ changeBorderColor }
								/>
							</ColorBaseControl>

							<SizingControl
								label={ __( 'Border Radius', 'otter-blocks' ) }
								type={ attributes.borderRadiusType }
								min={ 0 }
								max={ 500 }
								changeType={ changeBorderRadiusType }
								onChange={ changeBorderRadius }
								options={ [
									{
										label: __( 'Top', 'otter-blocks' ),
										type: 'top',
										value: getBorderRadius( 'top' )
									},
									{
										label: __( 'Right', 'otter-blocks' ),
										type: 'right',
										value: getBorderRadius( 'right' )
									},
									{
										label: __( 'Bottom', 'otter-blocks' ),
										type: 'bottom',
										value: getBorderRadius( 'bottom' )
									},
									{
										label: __( 'Left', 'otter-blocks' ),
										type: 'left',
										value: getBorderRadius( 'left' )
									}
								] }
							/>

							<ToggleControl
								label={ __( 'Box Shadow', 'otter-blocks' ) }
								checked={ attributes.boxShadow }
								onChange={ changeBoxShadow }
							/>

							{ attributes.boxShadow && (
								<Fragment>

									<ColorBaseControl
										label={ __( 'Shadow Color', 'otter-blocks' ) }
										colorValue={ attributes.boxShadowColor }
									>
										<ColorPalette
											label={ __( 'Shadow Color', 'otter-blocks' ) }
											value={ attributes.boxShadowColor }
											onChange={ changeBoxShadowColor }
										/>
									</ColorBaseControl>

									<ControlPanelControl
										label={ __( 'Border Shadow', 'otter-blocks' ) }
									>
										<RangeControl
											label={ __( 'Opacity', 'otter-blocks' ) }
											value={ attributes.boxShadowColorOpacity }
											onChange={ changeBoxShadowColorOpacity }
											min={ 0 }
											max={ 100 }
										/>

										<RangeControl
											label={ __( 'Blur', 'otter-blocks' ) }
											value={ attributes.boxShadowBlur }
											onChange={ changeBoxShadowBlur }
											min={ 0 }
											max={ 100 }
										/>

										<RangeControl
											label={ __( 'Spread', 'otter-blocks' ) }
											value={ attributes.boxShadowSpread }
											onChange={ changeBoxShadowSpread }
											min={ -100 }
											max={ 100 }
										/>

										<RangeControl
											label={ __( 'Horizontal', 'otter-blocks' ) }
											value={ attributes.boxShadowHorizontal }
											onChange={ changeBoxShadowHorizontal }
											min={ -100 }
											max={ 100 }
										/>

										<RangeControl
											label={ __( 'Vertical', 'otter-blocks' ) }
											value={ attributes.boxShadowVertical }
											onChange={ changeBoxShadowVertical }
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
									<ColorBaseControl
										label={ __( 'Color', 'otter-blocks' ) }
										colorValue={ getDividerColor() }
									>
										<ColorPalette
											label={ __( 'Color', 'otter-blocks' ) }
											value={ getDividerColor() }
											onChange={ changeDividerColor }
										/>
									</ColorBaseControl>

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
								onChange={ changeColumnsHTMLTag }
							/>
						</PanelBody>
					</Fragment>

				) }
			</InspectorControls>

			<HTMLAnchorControl
				value={ attributes.id }
				onChange={ changeID }
			/>
		</Fragment>
	);
};

export default Inspector;
