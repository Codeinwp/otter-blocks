/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { trash } from '@wordpress/icons';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	MediaPlaceholder,
	MediaReplaceFlow
} from '@wordpress/block-editor';

import {
	FocalPointPicker,
	MenuItem,
	SelectControl
} from '@wordpress/components';

import { useInstanceId } from '@wordpress/compose';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import ControlPanelControl from '../control-panel-control/index.js';
import ToogleGroupControl from '../toogle-group-control/index.js';

const BackgroundSelectorControl = ({
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
	const instanceId = useInstanceId( BackgroundSelectorControl );

	const id = `inspector-background-selector-control-${ instanceId }`;

	return (
		<div id={ id } className="components-base-control o-background-selector-control">
			<ToogleGroupControl
				value={ backgroundType }
				options={[
					{
						label: __( 'Color', 'otter-blocks' ),
						value: 'color'
					},
					{
						label: __( 'Image', 'otter-blocks' ),
						value: 'image'
					},
					{
						label: __( 'Gradient', 'otter-blocks' ),
						value: 'gradient'
					}
				]}
				onChange={ changeBackgroundType }
			/>

			{
				( 'color' === backgroundType || undefined === backgroundType ) && (
					<ColorGradientControl
						label={ __( 'Background Color', 'otter-blocks' ) }
						colorValue={ backgroundColor }
						onColorChange={ changeColor }
					/>
				)
			}
			{
				'image' === backgroundType && (
					image?.url ? (
						<Fragment>
							<FocalPointPicker
								label={ __( 'Focal point picker', 'otter-blocks' ) }
								url={ image.url }
								value={ focalPoint }
								onDragStart={ changeFocalPoint }
								onDrag={ changeFocalPoint }
								onChange={ changeFocalPoint }
							/>

							<div className="o-background-image-manage">
								<MediaReplaceFlow
									name={ __( 'Manage Image', 'otter-blocks' ) }
									mediaURL={ image.url }
									mediaId={ image?.id }
									accept="image/*"
									allowedTypes={ [ 'image' ] }
									onSelect={ changeImage }
								>
									<MenuItem
										icon={ trash }
										onClick={ removeImage }
									>
										{ __( 'Clear Image', 'otter-blocks' ) }
									</MenuItem>
								</MediaReplaceFlow>
							</div>

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
					) : (
						<Fragment>
							<br />

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
						</Fragment>
					)
				)
			}
			{
				'gradient' === backgroundType && (
					<ColorGradientControl
						label={ __( 'Background Gradient', 'otter-blocks' ) }
						gradientValue={ gradient }
						disableCustomColors={ true }
						onGradientChange={ changeGradient }
						clearable={ false }
					/>
				)
			}
		</div>
	);
};

export default BackgroundSelectorControl;
