/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const Inspector = ({
	attributes,
	setAttributes,
	playerRef
}) => {
	const onChangeTrigger = value => {
		setAttributes({ trigger: value });
	};

	const toggleLoop = value => {
		setAttributes({ loop: value });
		playerRef.current.setLooping( value );
		if ( attributes.direction ) {
			playerRef.current.seek( '100%' );
		}
		playerRef.current.play();
	};

	const onChangeLoopCount = value => {
		setAttributes({ count: Number( value ) });
		playerRef.current.load( attributes.file.url );
	};

	const onChangeSpeed = value => {
		setAttributes({ speed: Number( value ) });
		playerRef.current.setSpeed( value );
	};

	const toggleDirection = value => {
		setAttributes({ direction: value });
		playerRef.current.setDirection( value ? -1 : 1 );
		playerRef.current.seek( value ? '100%' : 0 );
	};

	const onChangeWidth = value => {
		setAttributes({ width: Number( value ) });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<SelectControl
					label={ __( 'Trigger', 'otter-blocks' ) }
					help={ __( 'Animation trigger. This will only work on the front-end.', 'otter-blocks' ) }
					value={ attributes.trigger }
					options={ [
						{ label: __( 'None', 'otter-blocks' ), value: 'none' },
						{ label: __( 'Scroll', 'otter-blocks' ), value: 'scroll' },
						{ label: __( 'Hover', 'otter-blocks' ), value: 'hover' },
						{ label: __( 'Click', 'otter-blocks' ), value: 'click' }
					] }
					onChange={ onChangeTrigger }
				/>

				{ 'scroll' !== attributes.trigger && (
					<Fragment>
						<ToggleControl
							label={ __( 'Loop', 'otter-blocks' ) }
							help={ __( 'Whether to loop animation.', 'otter-blocks' ) }
							checked={ attributes.loop }
							onChange={ toggleLoop }
						/>

						{ attributes.loop && (
							<TextControl
								label={ __( 'Numbers of loops', 'otter-blocks' ) }
								help={ __( 'Number of times to loop animation.', 'otter-blocks' ) }
								type="number"
								value={ attributes.count }
								onChange={ onChangeLoopCount }
							/>
						) }

						<RangeControl
							label={ __( 'Speed', 'otter-blocks' ) }
							help={ __( 'Animation speed.', 'otter-blocks' ) }
							value={ attributes.speed }
							onChange={ onChangeSpeed }
							step={ 0.1 }
							min={ 0.1 }
							max={ 5 }
						/>

						<ToggleControl
							label={ __( 'Reverse', 'otter-blocks' ) }
							help={ __( 'Direction of animation.', 'otter-blocks' ) }
							checked={ attributes.direction }
							onChange={ toggleDirection }
						/>
					</Fragment>
				) }

				<RangeControl
					label={ __( 'Width', 'otter-blocks' ) }
					help={ __( 'Container width in pixels.', 'otter-blocks' ) }
					value={ attributes.width }
					onChange={ onChangeWidth }
					min={ 100 }
					max={ 1000 }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
