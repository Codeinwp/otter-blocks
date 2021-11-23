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
	__experimentalBoxControl as BoxControl,
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
import ResponsiveControl from '../../../components/responsive-control/index.js';
import BackgroundControl from '../components/background-control/index.js';
import ControlPanelControl from '../../../components/control-panel-control/index.js';
import { isNullObject } from '../../../helpers/helper-functions.js';

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

	const getPadding = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.padding;
		case 'Tablet':
			return attributes.paddingTablet;
		case 'Mobile':
			return attributes.paddingMobile;
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

	const getMargin = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.margin;
		case 'Tablet':
			return attributes.marginTablet;
		case 'Mobile':
			return attributes.marginMobile;
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
			return setAttributes({ marginTablet: value });
		case 'Mobile':
			return setAttributes({ marginMobile: value });
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
							label={ __( 'Screen Type', 'otter-blocks' ) }
							className="otter-section-padding-responsive-control"
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

							<BoxControl
								label={ __( 'Margin', 'otter-blocks' ) }
								values={ getMargin() }
								inputProps={ {
									min: -500,
									max: 500
								} }
								onChange={ changeMargin }
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
							changeBackgroundType={ value => setAttributes({ backgroundType: value }) }
						/>

						{ 'color' === attributes.backgroundType && (

							<ColorBaseControl
								label={ __( 'Background Color', 'otter-blocks' ) }
								colorValue={ attributes.headingColor }
							>
								<ColorPalette
									label={ __( 'Background Color', 'otter-blocks' ) }
									value={ attributes.backgroundColor }
									onChange={ value => setAttributes({ backgroundColor: value }) }
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
												onClick={ () => {
													setAttributes({
														backgroundImageID: '',
														backgroundImageURL: ''
													});
												} }
											>
												<Dashicon icon="trash" />
												<span>{ __( 'Remove Image', 'otter-blocks' ) }</span>
											</div>
										</div>
									</div>

									<Button
										isSecondary
										className="wp-block-themeisle-image-container-delete-button"
										onClick={ () => {
											setAttributes({
												backgroundImageID: '',
												backgroundImageURL: ''
											});
										} }
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
											onChange={ value => setAttributes({ backgroundAttachment: value }) }
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
											onChange={ value => setAttributes({ backgroundPosition: value }) }
										/>

										<SelectControl
											label={ __( 'Background Repeat', 'otter-blocks' ) }
											value={ attributes.backgroundRepeat }
											options={ [
												{ label: __( 'Repeat', 'otter-blocks' ), value: 'repeat' },
												{ label: __( 'No-repeat', 'otter-blocks' ), value: 'no-repeat' }
											] }
											onChange={ value => setAttributes({ backgroundRepeat: value }) }
										/>

										<SelectControl
											label={ __( 'Background Size', 'otter-blocks' ) }
											value={ attributes.backgroundSize }
											options={ [
												{ label: __( 'Auto', 'otter-blocks' ), value: 'auto' },
												{ label: __( 'Cover', 'otter-blocks' ), value: 'cover' },
												{ label: __( 'Contain', 'otter-blocks' ), value: 'contain' }
											] }
											onChange={ value => setAttributes({ backgroundSize: value }) }
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
									onSelect={ value => {
										setAttributes({
											backgroundImageID: value.id,
											backgroundImageURL: value.url
										});
									}}
									accept="image/*"
									allowedTypes={ [ 'image' ] }
								/>

						) || 'gradient' === attributes.backgroundType && (
							<ColorGradientControl
								label={ __( 'Background Gradient', 'otter-blocks' ) }
								gradientValue={ attributes.backgroundGradient }
								disableCustomColors={ true }
								onGradientChange={ value => setAttributes({ backgroundGradient: value }) }
								clearable={ false }
							/>
						) }
					</PanelBody>

					<PanelBody
						title={ __( 'Border', 'otter-blocks' ) }
						className="wp-block-themeisle-border-container"
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

						<ColorBaseControl
							label={ __( 'Border Color', 'otter-blocks' ) }
							colorValue={ attributes.borderColor }
						>
							<ColorPalette
								label={ __( 'Border Color', 'otter-blocks' ) }
								value={ attributes.borderColor }
								onChange={ value => setAttributes({ borderColor: value }) }
							/>
						</ColorBaseControl>

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
							id="otter-border-raduis-box"
							onChange={ changeBorderRadius }
						/>

						<ToggleControl
							label={ __( 'Box Shadow', 'otter-blocks' ) }
							checked={ attributes.boxShadow }
							onChange={ () => setAttributes({ boxShadow: ! attributes.boxShadow }) }
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
										onChange={ value => setAttributes({ boxShadowColor: value }) }
									/>
								</ColorBaseControl>

								<ControlPanelControl
									label={ __( 'Shadow Properties', 'otter-blocks' ) }
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
						onChange={ value => setAttributes({ columnsHTMLTag: value }) }
					/>
				</PanelBody>
			) }
		</InspectorControls>
	);
};

export default Inspector;
