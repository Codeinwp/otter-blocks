import { MediaPlaceholder, __experimentalColorGradientControl as ColorGradientControl } from '@wordpress/block-editor';
import { ColorPalette, FocalPointPicker, SelectControl, Button } from '@wordpress/components';
import BackgroundControl from '../../blocks/section/components/background-control';
import ColorBaseControl from '../color-base-control';
import ControlPanelControl from '../control-panel-control';
import {
	Fragment
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const BackgroundSelector = ({
	backgroundType,
	backgroundColor,
	image,
	gradient,
	backgroundAttachment,
	backgroundRepeat,
	backgroundSize,
	focalPoint,
	changeImage,
	changeColor,
	removeImage,
	changeBackgroundType,
	changeGradient,
	changeBackgroundAttachment,
	changeBackgroundRepeat,
	changeBackgroundSize,
	changeFocalPoint
}) => {

	return (
		<Fragment>

			<BackgroundControl
				label={ __( 'Background Type', 'otter-blocks' ) }
				backgroundType={ backgroundType }
				changeBackgroundType={ changeBackgroundType }
			/>

			{ 'color' === backgroundType && (

				<ColorBaseControl
					label={ __( 'Background Color', 'otter-blocks' ) }
					colorValue={ backgroundColor }
				>
					<ColorPalette
						label={ __( 'Color', 'otter-blocks' ) }
						value={ backgroundColor }
						onChange={ changeColor }
					/>
				</ColorBaseControl>

			) || 'image' === backgroundType && (
				image?.url ?
					(
						<Fragment>

							<FocalPointPicker
								label={ __( 'Focal point picker', 'otter-blocks' ) }
								url={ image.url }
								value={ focalPoint }
								onDragStart={ changeFocalPoint }
								onDrag={ changeFocalPoint }
								onChange={ changeFocalPoint }
							/>

							<Button
								isSecondary
								className="wp-block-themeisle-image-container-delete-button"
								onClick={ removeImage }
							>
								{ __( 'Change or Remove Image', 'otter-blocks' ) }
							</Button>

							<ControlPanelControl
								label={ __( 'Background Settings', 'otter-blocks' ) }
							>
								<SelectControl
									label={ __( 'Background Attachment', 'otter-blocks' ) }
									value={ backgroundAttachment }
									options={ [
										{ label: __( 'Scroll', 'otter-blocks' ), value: 'scroll' },
										{ label: __( 'Fixed', 'otter-blocks' ), value: 'fixed' },
										{ label: __( 'Local', 'otter-blocks' ), value: 'local' }
									] }
									onChange={ changeBackgroundAttachment }
								/>

								<SelectControl
									label={ __( 'Background Repeat', 'otter-blocks' ) }
									value={ backgroundRepeat }
									options={ [
										{ label: __( 'Repeat', 'otter-blocks' ), value: 'repeat' },
										{ label: __( 'No-repeat', 'otter-blocks' ), value: 'no-repeat' }
									] }
									onChange={ changeBackgroundRepeat }
								/>

								<SelectControl
									label={ __( 'Background Size', 'otter-blocks' ) }
									value={ backgroundSize }
									options={ [
										{ label: __( 'Auto', 'otter-blocks' ), value: 'auto' },
										{ label: __( 'Cover', 'otter-blocks' ), value: 'cover' },
										{ label: __( 'Contain', 'otter-blocks' ), value: 'contain' }
									] }
									onChange={ changeBackgroundSize }
								/>
							</ControlPanelControl>
						</Fragment>
					) :
					(
						<MediaPlaceholder
							icon="format-image"
							labels={ {
								title: __( 'Background Image', 'otter-blocks' ),
								name: __( 'an image', 'otter-blocks' )
							} }
							value={ image?.id }
							onSelect={ changeImage }
							accept="image/*"
							allowedTypes={ [ 'image' ] }
						/>
					)

			) || 'gradient' === backgroundType && (
				<ColorGradientControl
					label={ __( 'Background Gradient', 'otter-blocks' ) }
					gradientValue={ gradient }
					disableCustomColors={ true }
					onGradientChange={ changeGradient }
					clearable={ false }
				/>
			) }
		</Fragment>
	);
};

export default BackgroundSelector;
