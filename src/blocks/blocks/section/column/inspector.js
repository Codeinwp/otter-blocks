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
	Button,
	Dashicon,
	PanelBody,
	ToggleControl,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import ColorBaseControl from '../../../components/color-base-control/index.js';
import SizingControl from '../../../components/sizing-control/index.js';
import ResponsiveControl from '../../../components/responsive-control/index.js';
import BackgroundControl from '../components/background-control/index.js';
import ControlPanelControl from '../../../components/control-panel-control/index.js';

const Inspector = ({
	attributes,
	setAttributes,
	isSelected,
	clientId,
	adjacentBlock,
	parentBlock,
	updateBlockAttributes,
	adjacentBlockClientId
}) => {
	const getView = useSelect( ( select ) => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	useEffect( () => {
		if ( 1 < parentBlock.innerBlocks.length ) {
			if ( ! adjacentBlockClientId ) {
				const blockId = parentBlock.innerBlocks.findIndex( e => e.clientId === clientId );
				const previousBlock = parentBlock.innerBlocks[ blockId - 1 ];
				nextBlock.current = previousBlock.clientId;
				nextBlockWidth.current = previousBlock.attributes.columnWidth;
			}
		}
	}, []);

	useEffect( () => {
		if ( 1 < parentBlock.innerBlocks.length ) {
			if ( ! adjacentBlockClientId ) {
				const blockId = parentBlock.innerBlocks.findIndex( e => e.clientId === clientId );
				const previousBlock = parentBlock.innerBlocks[ blockId - 1 ];
				nextBlockWidth.current = previousBlock.attributes.columnWidth;
				nextBlock.current = previousBlock.clientId;
				currentBlockWidth.current = attributes.columnWidth;
			} else {
				nextBlockWidth.current = adjacentBlock.attributes.columnWidth;
				nextBlock.current = adjacentBlockClientId;
				currentBlockWidth.current = attributes.columnWidth;
			}
		}
	}, [ isSelected, attributes.columnWidth, parentBlock.innerBlocks.length ]);

	const [ tab, setTab ] = useState( 'layout' );

	const currentBlockWidth = useRef( attributes.columnWidth );
	const nextBlock = useRef( adjacentBlockClientId && adjacentBlockClientId );
	const nextBlockWidth = useRef( adjacentBlock && adjacentBlock.attributes.columnWidth );

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

	let getMarginType = () => {
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
		right: 'marginRight',
		bottom: 'marginBottom',
		left: 'marginLeft'
	};

	const tabletMarginType = {
		top: 'marginTopTablet',
		right: 'marginRightTablet',
		bottom: 'marginBottomTablet',
		left: 'marginLeftTablet'
	};

	const mobileMarginType = {
		top: 'marginTopMobile',
		right: 'marginRightMobile',
		bottom: 'marginBottomMobile',
		left: 'marginLeftMobile'
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
		} else if ( 'left' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.marginType ? attributes.margin : attributes.marginLeft;
			case 'Tablet':
				return 'linked' === attributes.marginTypeTablet ? attributes.marginTablet : attributes.marginLeftTablet;
			case 'Mobile':
				return 'linked' === attributes.marginTypeMobile ? attributes.marginMobile : attributes.marginLeftMobile;
			}
		} else if ( 'right' == type ) {
			switch ( getView ) {
			case 'Desktop':
				return 'linked' === attributes.marginType ? attributes.margin : attributes.marginRight;
			case 'Tablet':
				return 'linked' === attributes.marginTypeTablet ? attributes.marginTablet : attributes.marginRightTablet;
			case 'Mobile':
				return 'linked' === attributes.marginTypeMobile ? attributes.marginMobile : attributes.marginRightMobile;
			}
		}

		return undefined;
	};


	const changeBackgroundType = value => {
		setAttributes({ backgroundType: value });
	};

	const changeBackgroundColor = value => {
		setAttributes({ backgroundColor: value });
	};

	const changeBackgroundImage = value => {
		setAttributes({
			backgroundImageID: value.id,
			backgroundImageURL: value.url
		});
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

	const changeBackgroundGradient = value => {
		setAttributes({ backgroundGradient: value });
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

	const changeColumnsHTMLTag = value => {
		setAttributes({ columnsHTMLTag: value });
	};

	return (
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
						title={ __( 'Spacing', 'otter-blocks' ) }
					>
						{ ( 1 < parentBlock.innerBlocks.length ) && (
							<RangeControl
								label={ __( 'Column Width', 'otter-blocks' ) }
								value={ Number( attributes.columnWidth ) }
								onChange={ changeColumnWidth }
								min={ 10 }
								max={ ( Number( attributes.columnWidth ) + Number( nextBlockWidth.current ) ) - 10 }
							/>
						) }

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
										type: 'right',
										value: getMargin( 'right' )
									},
									{
										label: __( 'Bottom', 'otter-blocks' ),
										type: 'bottom',
										value: getMargin( 'bottom' )
									},
									{
										label: __( 'Left', 'otter-blocks' ),
										type: 'left',
										value: getMargin( 'left' )
									}
								] }
							/>
						</ResponsiveControl>
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
								colorValue={ attributes.headingColor }
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
									label={ __( 'Shadow Properties', 'otter-blocks' ) }
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
				</Fragment>
			) || 'advanced' === tab && (
				<PanelBody
					title={ __( 'Section Settings', 'otter-blocks' ) }
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
			) }
		</InspectorControls>
	);
};

export default Inspector;
