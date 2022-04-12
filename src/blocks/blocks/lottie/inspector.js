/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	__experimentalUnitControl as UnitControl, InspectorAdvancedControls,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 *
 * @param {import('./types').LottieInspectorProps} props
 * @returns
 */
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
		const valueNumber = parseInt( value.slice( 0, -1 ) );
		const unit = value.slice( -1 );

		if ( 100 < valueNumber && '%' === unit ) {
			value = '100%';
		}

		setAttributes({ width: value });
	};

	return (
		<Fragment>
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
							{ label: __( 'Autoplay', 'otter-blocks' ), value: 'none' },
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

					<UnitControl
						onChange={ onChangeWidth }
						label={ __( 'Width', 'otter-blocks' ) }
						isUnitSelectTabbable
						isResetValueOnUnitChange
						__unstableInputWidth="50%"
						value={ Number.isInteger( attributes.width ) ? `${attributes.width}px` : attributes.width }
						units={ [
							{
								value: '%',
								label: '%',
								default: 100
							},
							{
								value: 'px',
								label: 'px',
								default: 300
							}
						] }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Background', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<ColorGradientControl
						colorValue={ attributes.backgroundColor }
						gradientValue={ attributes.backgroundGradient }
						onColorChange={ newValue => setAttributes({ backgroundColor: newValue }) }
						onGradientChange={ newValue => setAttributes({ backgroundGradient: newValue }) }
						className="otter-lottie-background-control"
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorAdvancedControls>
				<TextControl
					label={ __( 'Aria Label', 'otter-blocks' ) }
					help={ __( 'Describe the purpose of this animation on the page.', 'otter-blocks' ) }
					value={ attributes.ariaLabel }
					onChange={ value => setAttributes({ ariaLabel: value })}
				/>
			</InspectorAdvancedControls>
		</Fragment>
	);
};

export default Inspector;
