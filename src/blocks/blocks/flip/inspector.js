/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { pick } from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ControlPanelControl from '../../components/control-panel-control/index.js';
import BackgroundSelectorControl from '../../components/background-selector-control/index.js';

/**
 *
 * @param {import('./types.js').FlipInspectorProps} props
 * @returns
 */
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

	const changeBoxShadowColorOpacity = value => {
		const changes = { boxShadowColorOpacity: value };
		if ( 100 > value && attributes.boxShadowColor?.includes( 'var(' ) ) {
			changes.boxShadowColor = getComputedStyle( document.documentElement, null ).getPropertyValue( attributes.boxShadowColor.replace( 'var(', '' ).replace( ')', '' ) );
		}
		setAttributes( changes );
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Width', 'otter-blocks' ) }
					help={ __( 'Width of the container. Make sure that the width match the size of your content.', 'otter-blocks' ) }
					value={ attributes.width }
					onChange={ width => setAttributes({ width }) }
					min={ 0 }
					max={ 1200 }
					allowReset={ true }
				/>

				<RangeControl
					label={ __( 'Height', 'otter-blocks' ) }
					help={ __( 'Height of the container. Make sure that the height match the size of your content.', 'otter-blocks' ) }
					value={ attributes.height }
					onChange={ height => setAttributes({ height }) }
					min={ 0 }
					max={ 1200 }
					allowReset={ true }
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
					{ ! ( attributes.frontMedia?.url ) ? (
						<MediaPlaceholder
							labels={ {
								title: __( 'Media Image', 'otter-blocks' )
							} }
							accept="image/*"
							allowedTypes={ [ 'image' ] }
							value={ attributes.frontMedia }
							onSelect={ value => setAttributes({ frontMedia: pick( value, [ 'id', 'alt', 'url' ]) }) }
						/>
					) : (
						<BaseControl
						>
							<img
								src={ attributes.frontMedia.url }
								alt={ attributes.frontMedia.alt }
								style={{
									border: '2px solid var( --wp-admin-theme-color)',
									maxHeight: '250px'
								}}
							/>

							<Button
								isSecondary
								onClick={ () => setAttributes({ frontMedia: undefined }) }
							>
								{ __( 'Remove image', 'otter-blocks' ) }
							</Button>
						</BaseControl>
					) }
				</BaseControl>

				<RangeControl
					label={ __( 'Media Width', 'otter-blocks' ) }
					value={ attributes.frontMediaWidth }
					onChange={ frontMediaWidth => setAttributes({ frontMediaWidth }) }
					min={ 0 }
					max={ 1000 }
					allowReset={ true }
				/>

				<RangeControl
					label={ __( 'Media Height', 'otter-blocks' ) }
					value={ attributes.frontMediaHeight }
					onChange={ frontMediaHeight => setAttributes({ frontMediaHeight }) }
					min={ 0 }
					max={ 1000 }
					allowReset={ true }
				/>

				<SelectControl
					label={ __( 'Vertical Align', 'otter-blocks' )}
					value={ attributes.frontVerticalAlign }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: '' },
						{ label: __( 'Top', 'otter-blocks' ), value: 'flex-start' },
						{ label: __( 'Center', 'otter-blocks' ), value: 'center' },
						{ label: __( 'Bottom', 'otter-blocks' ), value: 'flex-end' }
					]}
					onChange={ frontVerticalAlign => setAttributes({ frontVerticalAlign })}
				/>

				<SelectControl
					label={ __( 'Horizontal Align', 'otter-blocks' )}
					value={ attributes.frontHorizontalAlign }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: '' },
						{ label: __( 'Left', 'otter-blocks' ), value: 'flex-start' },
						{ label: __( 'Center', 'otter-blocks' ), value: 'center' },
						{ label: __( 'Right', 'otter-blocks' ), value: 'flex-end' }
					]}
					onChange={ frontHorizontalAlign => setAttributes({ frontHorizontalAlign })}
				/>

				<RangeControl
					label={ __( 'Title Font Size', 'otter-blocks' ) }
					value={ attributes.titleFontSize }
					onChange={ titleFontSize => setAttributes({ titleFontSize }) }
					min={ 0 }
					max={ 50 }
					allowReset={ true }
				/>

				<RangeControl
					label={ __( 'Description Font Size', 'otter-blocks' ) }
					value={ attributes.descriptionFontSize }
					onChange={ descriptionFontSize => setAttributes({ descriptionFontSize }) }
					min={ 0 }
					max={ 50 }
					allowReset={ true }
				/>

				<BackgroundSelectorControl
					backgroundType={ attributes.frontBackgroundType }
					backgroundColor={ attributes.frontBackgroundColor }
					image={ attributes.frontBackgroundImage }
					gradient={ attributes.frontBackgroundGradient }
					focalPoint={ attributes.frontBackgroundPosition }
					backgroundAttachment={ attributes.frontBackgroundAttachment }
					backgroundRepeat={ attributes.frontBackgroundRepeat }
					backgroundSize={ attributes.frontBackgroundSize }
					changeBackgroundType={ frontBackgroundType => setAttributes({ frontBackgroundType }) }
					changeImage={ media => {
						setAttributes({
							frontBackgroundImage: pick( media, [ 'id', 'url' ])
						});
					}}
					removeImage={ () => setAttributes({ frontBackgroundImage: undefined })}
					changeColor={ frontBackgroundColor => setAttributes({ frontBackgroundColor })}
					changeGradient={ frontBackgroundGradient => setAttributes({ frontBackgroundGradient }) }
					changeBackgroundAttachment={ frontBackgroundAttachment => setAttributes({ frontBackgroundAttachment })}
					changeBackgroundRepeat={ frontBackgroundRepeat => setAttributes({ frontBackgroundRepeat })}
					changeFocalPoint={ frontBackgroundPosition => setAttributes({ frontBackgroundPosition }) }
					changeBackgroundSize={ frontBackgroundSize => setAttributes({ frontBackgroundSize }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Back', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<BackgroundSelectorControl
					backgroundType={ attributes.backBackgroundType }
					backgroundColor={ attributes.backBackgroundColor }
					image={ attributes.backBackgroundImage }
					gradient={ attributes.backBackgroundGradient }
					focalPoint={ attributes.backBackgroundPosition }
					backgroundAttachment={ attributes.backBackgroundAttachment }
					backgroundRepeat={ attributes.backBackgroundRepeat }
					backgroundSize={ attributes.backBackgroundSize }
					changeBackgroundType={ backBackgroundType => setAttributes({ backBackgroundType }) }
					changeImage={ media => {
						setAttributes({
							backBackgroundImage: pick( media, [ 'id', 'url' ])
						});
					}}
					removeImage={ () => setAttributes({ backBackgroundImage: undefined })}
					changeColor={ backBackgroundColor => setAttributes({ backBackgroundColor })}
					changeGradient={ backBackgroundGradient => setAttributes({ backBackgroundGradient }) }
					changeBackgroundAttachment={ backBackgroundAttachment => setAttributes({ backBackgroundAttachment })}
					changeBackgroundRepeat={ backBackgroundRepeat => setAttributes({ backBackgroundRepeat })}
					changeFocalPoint={ backBackgroundPosition => setAttributes({ backBackgroundPosition }) }
					changeBackgroundSize={ backBackgroundSize => setAttributes({ backBackgroundSize }) }
				/>

				<SelectControl
					label={ __( 'Vertical Align', 'otter-blocks' )}
					value={ attributes.backVerticalAlign }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: '' },
						{ label: __( 'Top', 'otter-blocks' ), value: 'flex-start' },
						{ label: __( 'Center', 'otter-blocks' ), value: 'center' },
						{ label: __( 'Bottom', 'otter-blocks' ), value: 'flex-end' }
					]}
					onChange={ backVerticalAlign => setAttributes({ backVerticalAlign })}
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
				initialOpen={ false }
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
					label={ __( 'Padding', 'otter-blocks' ) }
					value={ attributes.padding }
					onChange={ padding => setAttributes({ padding }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					value={ attributes.borderWidth }
					onChange={ borderWidth => setAttributes({ borderWidth }) }
					min={ 0 }
					max={ 50 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ borderRadius => setAttributes({ borderRadius }) }
					min={ 0 }
					max={ 50 }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.borderColor,
						onChange: borderColor => setAttributes({ borderColor }),
						label: __( 'Border Color', 'otter-blocks' )
					},
					{
						value: attributes.titleColor,
						onChange: titleColor => setAttributes({ titleColor }),
						label: __( 'Title Color', 'otter-blocks' )
					},
					{
						value: attributes.descriptionColor,
						onChange: descriptionColor => setAttributes({ descriptionColor }),
						label: __( 'Description Color', 'otter-blocks' )
					}
				] }
			>
			</PanelColorSettings>

			<PanelBody
				title={ __( 'Box Shadow', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Shadow Properties', 'otter-blocks' ) }
					checked={ attributes.boxShadow }
					onChange={ boxShadow => setAttributes({ boxShadow }) }
				/>

				{ attributes.boxShadow && (
					<Fragment>
						<ColorGradientControl
							label={ __( 'Color', 'otter-blocks' ) }
							colorValue={ attributes.boxShadowColor }
							onColorChange={ changeBoxShadowColor }
						/>

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
								onChange={ boxShadowBlur => setAttributes({ boxShadowBlur }) }
								min={ 0 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Horizontal', 'otter-blocks' ) }
								value={ attributes.boxShadowHorizontal }
								onChange={ boxShadowHorizontal => setAttributes({ boxShadowHorizontal })}
								min={ -100 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Vertical', 'otter-blocks' ) }
								value={ attributes.boxShadowVertical }
								onChange={ boxShadowVertical => setAttributes({ boxShadowVertical }) }
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
