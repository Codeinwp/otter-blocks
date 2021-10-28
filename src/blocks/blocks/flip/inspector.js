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
	FocalPointPicker,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes
}) => {

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
							accept="image/*,video/*"
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
							accept="image/*,video/*"
							onSelect={ media => {
								setAttributes({
									frontImg: pick( media, [ 'id', 'url' ])
								});
							} }
							name={ ! attributes.frontImg?.url ? __( 'Add image', 'otter-blocks' ) : __( 'Replace or remove image', 'otter-blocks' ) }
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
						{ label: __( 'Default', 'otter-blocks' ), value: 'flex-start' },
						{ label: __( 'Left', 'otter-blocks' ), value: 'flex-start' },
						{ label: __( 'Center', 'otter-blocks' ), value: 'center' },
						{ label: __( 'Right', 'otter-blocks' ), value: 'flex-end' }
					]}
					onChange={ horizontalAlign => setAttributes({ horizontalAlign })}
				/>

			</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
			>

				<SelectControl
					label={ __( 'Flip Type', 'otter-blocks' )}
					value={ attributes.animType }
					options={ [
						{ label: __( 'X axis', 'otter-blocks' ), value: 'flipX' },
						{ label: __( 'Y axis', 'otter-blocks' ), value: 'flipY' }
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
		</InspectorControls>
	);
};

export default Inspector;
