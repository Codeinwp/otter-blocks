/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { pick } from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	MediaReplaceFlow
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	ColorPalette,
	FocalPointPicker,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';
import ControlPanelControl from '../../components/control-panel-control';
import ColorBaseControl from '../../components/color-base-control';

const Inspector = ({
	attributes,
	setAttributes
}) => {

	const changeBoxShadowColor = value => {
		setAttributes({
			boxShadowColor: ( 100 > attributes.boxShadowColorOpacity && attributes.boxShadowColor?.includes( 'var(' ) ) ?
				getComputedStyle( document.documentElement, null ).getPropertyValue( value?.replace( 'var(', '' )?.replace( ')', '' ) ) :
				value
		});
	};

	const changeBoxShadow = value => {
		setAttributes({ boxShadow: value });
	};

	const changeBoxShadowColorOpacity = value => {
		const changes = { boxShadowColorOpacity: value };
		if ( 100 > value && attributes.boxShadowColor?.includes( 'var(' ) ) {
			changes.boxShadowColor = getComputedStyle( document.documentElement, null ).getPropertyValue( attributes.boxShadowColor.replace( 'var(', '' ).replace( ')', '' ) );
		}
		setAttributes( changes );
	};

	const changeBoxShadowBlur = value => {
		setAttributes({ boxShadowBlur: value });
	};

	const changeBoxShadowHorizontal = value => {
		setAttributes({ boxShadowHorizontal: value });
	};

	const changeBoxShadowVertical = value => {
		setAttributes({ boxShadowVertical: value });
	};


	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<RangeControl
					label={ __( 'Width', 'otter-blocks' ) }
					help={ __( 'Width of the container. Make sure that the width match the size of your content.', 'otter-blocks' ) }
					value={ attributes.width }
					onChange={ width => setAttributes({ width }) }
					min={ 0 }
					max={ 1200 }
				/>

				<RangeControl
					label={ __( 'Height', 'otter-blocks' ) }
					help={ __( 'Height of the container. Make sure that the height match the size of your content.', 'otter-blocks' ) }
					value={ attributes.height }
					onChange={ height => setAttributes({ height }) }
					min={ 0 }
					max={ 1200 }
				/>

				<ToggleControl
					label={ __( 'Invert the sides', 'otter-blocks' ) }
					checked={ attributes.isInverted }
					onChange={ isInverted => setAttributes({ isInverted })}
					help={ __( 'Use this to display the back side first.', 'otter-blocks' ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Front', 'otter-blocks' ) }
				initialOpen={ false }
			>

				<BaseControl
					label={ __( 'Media Image', 'otter-blocks' ) }
					help={ __( 'Set an image as showcase.', 'otter-blocks' ) }
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							border: '0.5px solid #aaa',
							borderRadius: '5px',
							marginTop: '4px'
						}}
					>
						<MediaReplaceFlow
							mediaId={ attributes.frontMedia?.id }
							mediaURL={ attributes.frontMedia?.url }
							allowedTypes={ [ 'image' ] }
							accept="image/*"
							onSelect={ media => {
								setAttributes({
									frontMedia: pick( media, [ 'id', 'url' ])
								});
							} }
							name={ ! attributes.frontMedia?.url ? __( 'Add image', 'otter-blocks' ) : __( 'Replace or remove image', 'otter-blocks' ) }
						>
						</MediaReplaceFlow>
						<Button
							onClick={ () => {
								setAttributes({
									frontMedia: undefined
								});
							}}
						>
							{__( 'Clear image', 'otter-blocks' )}
						</Button>
					</div>
				</BaseControl>

				<RangeControl
					label={ __( 'Media Width', 'otter-blocks' ) }
					value={ attributes.frontMediaWidth }
					onChange={ frontMediaWidth => setAttributes({ frontMediaWidth }) }
					min={ 0 }
					max={ 1000 }
				/>

				<RangeControl
					label={ __( 'Media Height', 'otter-blocks' ) }
					value={ attributes.frontMediaHeight }
					onChange={ frontMediaHeight => setAttributes({ frontMediaHeight }) }
					min={ 0 }
					max={ 1000 }
				/>

				<BaseControl
					label={ __( 'Background Image', 'otter-blocks' ) }
					help={ __( 'Set an image as background.', 'otter-blocks' ) }
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							border: '0.5px solid #aaa',
							borderRadius: '5px',
							marginTop: '4px'
						}}
					>
						<MediaReplaceFlow
							mediaId={ attributes.frontImg?.id }
							mediaURL={ attributes.frontImg?.url }
							allowedTypes={ [ 'image' ] }
							accept="image/*"
							onSelect={ media => {
								setAttributes({
									frontImg: pick( media, [ 'id', 'url' ])
								});
							} }
							name={ ! attributes.frontImg?.url ? __( 'Add image', 'otter-blocks' ) : __( 'Replace image', 'otter-blocks' ) }
						>
						</MediaReplaceFlow>
						<Button
							onClick={ () => {
								setAttributes({
									frontImg: undefined
								});
							}}
						>
							{__( 'Clear image', 'otter-blocks' )}
						</Button>
					</div>
				</BaseControl>

				{
					attributes.frontImg?.url && (
						<FocalPointPicker
							label={ __( 'Focal point picker', 'otter-blocks' ) }
							url={ attributes.frontImg?.url }
							value={ attributes.frontImgFocalpoint }

							// TODO: change to reference manipulation for speed
							onDragStart={ ( newFocalPoint ) =>
								setAttributes({
									frontImgFocalpoint: newFocalPoint
								}) }

							// TODO: change to reference manipulation for speed
							onDrag={ ( newFocalPoint ) =>
								setAttributes({
									frontImgFocalpoint: newFocalPoint
								}) }
							onChange={ ( newFocalPoint ) =>
								setAttributes({
									frontImgFocalpoint: newFocalPoint
								})
							}
						/>
					)
				}

				<SelectControl
					label={ __( 'Vertical Align', 'otter-blocks' )}
					value={ attributes.verticalAlign }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: '' },
						{ label: __( 'Top', 'otter-blocks' ), value: 'flex-start' },
						{ label: __( 'Center', 'otter-blocks' ), value: 'center' },
						{ label: __( 'Botton', 'otter-blocks' ), value: 'flex-end' }
					]}
					onChange={ verticalAlign => setAttributes({ verticalAlign })}
				/>

				<SelectControl
					label={ __( 'Horizontal Align', 'otter-blocks' )}
					value={ attributes.horizontalAlign }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: '' },
						{ label: __( 'Left', 'otter-blocks' ), value: 'flex-start' },
						{ label: __( 'Center', 'otter-blocks' ), value: 'center' },
						{ label: __( 'Right', 'otter-blocks' ), value: 'flex-end' }
					]}
					onChange={ horizontalAlign => setAttributes({ horizontalAlign })}
				/>

			</PanelBody>

			<PanelBody
				title={ __( 'Back', 'otter-blocks' ) }
				initialOpen={ false }
			>

				<BaseControl
					label={ __( 'Background Image', 'otter-blocks' ) }
					help={ __( 'Set an image as background.', 'otter-blocks' ) }
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							border: '0.5px solid #aaa',
							borderRadius: '5px',
							marginTop: '4px'
						}}
					>
						<MediaReplaceFlow
							mediaId={ attributes.backImg?.id }
							mediaURL={ attributes.backImg?.url }
							allowedTypes={ [ 'image' ] }
							accept="image/*,video/*"
							onSelect={ media => {
								setAttributes({
									backImg: pick( media, [ 'id', 'url' ])
								});
							} }
							name={ ! attributes.backImg?.url ? __( 'Add image', 'otter-blocks' ) : __( 'Replace image', 'otter-blocks' ) }
						>
						</MediaReplaceFlow>
						<Button
							onClick={ () => {
								setAttributes({
									backImg: undefined
								});
							}}
						>
							{__( 'Clear image', 'otter-blocks' )}
						</Button>
					</div>
				</BaseControl>

				{
					attributes.frontImg?.url && (
						<FocalPointPicker
							label={ __( 'Focal point picker', 'otter-blocks' ) }
							url={ attributes.backImg?.url }
							value={ attributes.backImgFocalpoint }

							// TODO: change to reference manipulation for speed
							onDragStart={ ( newFocalPoint ) =>
								setAttributes({
									backImgFocalpoint: newFocalPoint
								}) }

							// TODO: change to reference manipulation for speed
							onDrag={ ( newFocalPoint ) =>
								setAttributes({
									backImgFocalpoint: newFocalPoint
								}) }
							onChange={ ( newFocalPoint ) =>
								setAttributes({
									backImgFocalpoint: newFocalPoint
								})
							}
						/>
					)
				}

			</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
			>

				<SelectControl
					label={ __( 'Flip Type', 'otter-blocks' )}
					value={ attributes.animType }
					options={ [
						{ label: __( 'Bottom to Top', 'otter-blocks' ), value: 'flipX' },
						{ label: __( 'Left to right', 'otter-blocks' ), value: 'flipY' }
					]}
					onChange={ animType => setAttributes({ animType })}
				/>


				<RangeControl
					label={ __( 'Overlay Opacity', 'otter-blocks' ) }
					value={ attributes.frontOverlayOpacity }
					onChange={ frontOverlayOpacity => setAttributes({ frontOverlayOpacity }) }
					min={ 0 }
					max={ 100 }
				/>


				<RangeControl
					label={ __( 'Padding', 'otter-blocks' ) }
					value={ attributes.padding }
					onChange={ padding => setAttributes({ padding }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ borderRadius => setAttributes({ borderRadius }) }
					min={ 0 }
					max={ 50 }
				/>

				<ColorGradientControl
					label={ __( 'Front Side Background Color', 'otter-blocks' ) }
					colorValue={ attributes.frontBackgroundColor }
					onColorChange={ frontBackgroundColor => setAttributes({ frontBackgroundColor }) }
				/>

				<ColorGradientControl
					label={ __( 'Back Side Background Color', 'otter-blocks' ) }
					colorValue={ attributes.backBackgroundColor }
					onColorChange={ backBackgroundColor => setAttributes({ backBackgroundColor }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Box Shadow', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Shadow Properties', 'otter-blocks' ) }
					checked={ attributes.boxShadow }
					onChange={ changeBoxShadow }
				/>

				{ attributes.boxShadow && (
					<Fragment>
						<ColorBaseControl
							label={ __( 'Color', 'otter-blocks' ) }
							colorValue={ attributes.boxShadowColor }
						>
							<ColorPalette
								label={ __( 'Color', 'otter-blocks' ) }
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
		</InspectorControls>
	);
};

export default Inspector;
