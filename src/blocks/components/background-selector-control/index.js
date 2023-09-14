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

import { Fragment, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import ControlPanelControl from '../control-panel-control/index.js';
import ToogleGroupControl from '../toogle-group-control/index.js';
import { use } from '@wordpress/data';

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

	const [ backgroundTypeValue, setBackgroundTypeValue ] = useState( backgroundType );

	const withBackground = ( backgroundType, f ) => {
		return value => {
			f( value );
			changeBackgroundType( backgroundType );
		};
	};

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
				onChange={ setBackgroundTypeValue }
			/>

			{
				( 'color' === backgroundTypeValue || undefined === backgroundTypeValue ) && (
					<ColorGradientControl
						label={ __( 'Background Color', 'otter-blocks' ) }
						colorValue={ backgroundColor }
						onColorChange={ withBackground( 'color', changeColor ) }
					/>
				)
			}
			{
				'image' === backgroundTypeValue && (
					image?.url ? (
						<Fragment>
							<FocalPointPicker
								label={ __( 'Focal point picker', 'otter-blocks' ) }
								url={ image.url }
								value={ focalPoint }
								onDragStart={ changeFocalPoint }
								onDrag={ changeFocalPoint }
								onChange={ withBackground( 'image', changeFocalPoint ) }
							/>

							<div className="o-background-image-manage">
								<MediaReplaceFlow
									name={ __( 'Manage Image', 'otter-blocks' ) }
									mediaURL={ image.url }
									mediaId={ image?.id }
									accept="image/*"
									allowedTypes={ [ 'image' ] }
									onSelect={ withBackground( 'image', changeImage ) }
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
									onChange={ withBackground( 'image', changeBackgroundAttachment ) }
								/>

								<SelectControl
									label={ __( 'Background Repeat', 'otter-blocks' ) }
									value={ backgroundRepeat }
									options={ [
										{ label: __( 'Repeat', 'otter-blocks' ), value: 'repeat' },
										{ label: __( 'No-repeat', 'otter-blocks' ), value: 'no-repeat' }
									] }
									onChange={ withBackground( 'image', changeBackgroundRepeat ) }
								/>

								<SelectControl
									label={ __( 'Background Size', 'otter-blocks' ) }
									value={ backgroundSize }
									options={ [
										{ label: __( 'Auto', 'otter-blocks' ), value: 'auto' },
										{ label: __( 'Cover', 'otter-blocks' ), value: 'cover' },
										{ label: __( 'Contain', 'otter-blocks' ), value: 'contain' }
									] }
									onChange={ withBackground( 'image', changeBackgroundSize ) }
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
								onSelect={ withBackground( 'image', changeImage ) }
								accept="image/*"
								allowedTypes={ [ 'image' ] }
							/>
						</Fragment>
					)
				)
			}
			{
				'gradient' === backgroundTypeValue && (
					<ColorGradientControl
						label={ __( 'Background Gradient', 'otter-blocks' ) }
						gradientValue={ gradient }
						disableCustomColors={ true }
						onGradientChange={ withBackground( 'gradient', changeGradient ) }
						clearable={ false }
					/>
				)
			}
		</div>
	);
};

export default BackgroundSelectorControl;
