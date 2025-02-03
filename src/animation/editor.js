/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	PanelBody,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import {
	Fragment,
	useState,
	useEffect,
	memo
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import {
	animationsList,
	delayList,
	outAnimation,
	speedList
} from './data.js';

import AnimationPopover from './components/animation-popover.js';

import ControlPanelControl from './../blocks/components/control-panel-control/index.js';

import countPlaceholder from './../../assets/images/count-animation.png';

import typingPlaceholder from './../../assets/images/typing-animation.png';

const AnimationType = {
	count: 'count',
	typing: 'typing',
	default: 'default'
};

import { useCSSNode } from '../blocks/helpers/block-utility.js';

/**
 * Update the animation config.
 *
 * @param {string}              type          The type of animation. (e.g. count, typing, default)
 * @param {string|undefined}    oldValue      The old value of the animation.
 * @param {string|undefined}    newValue      The new value of the animation.
 * @param {Function|undefined}  callback      The callback function which will be called after the animation is updated.
 * @param {Object}              attributes    The attributes of the block.
 * @param {(x: Object) => void} setAttributes The setAttributes function of the block.
 */
export const updateAnimConfig = ( type, oldValue, newValue, callback, attributes, setAttributes ) => {
	let template;
	switch ( type ) {
	case AnimationType.count:
		template = 'o-count-';
		break;
	case AnimationType.typing:
		template = 'o-typing-';
		break;
	case AnimationType.default:
		template = '';
		break;
	}

	oldValue ??= '';
	const oldClassName = template + oldValue;
	const newClassName = 'none' !== newValue ? template + newValue : '';
	let classes;

	if ( attributes.className ) {
		classes = attributes.className;
		classes = classes.split( ' ' );
		const exists = classes.find( ( i ) =>  i === oldClassName );

		if ( oldValue.startsWith( 'o-anim-value-delay-' ) || oldValue.startsWith( 'o-anim-value-speed-' ) || oldValue.startsWith( 'o-anim-offset-' ) ) {

			// Remove the old custom value.
			classes = classes.filter( ( i ) => ! i.includes( oldValue ) );
		}

		if ( 'o-anim-custom-delay' === oldValue || 'o-anim-custom-speed' === oldValue ) {
			const cssKey = 'o-anim-custom-delay' === oldValue ? 'o-anim-value-delay-' : 'o-anim-value-speed-';

			// Remove the old custom value.
			classes = classes.filter( ( i ) => ! i.includes( cssKey ) );
		}

		if ( exists ) {
			classes = classes.join( ' ' ).replace( oldClassName, newClassName );
		} else {
			classes.push( newClassName );
			classes = classes.join( ' ' ).trim();
		}
	} else {
		classes = newClassName;
	}

	classes = classes.replace( /\s+/g, ' ' );

	if ( '' === classes ) {
		classes = undefined;
	}

	setAttributes({ className: classes });
	callback?.();
};

function AnimationControls({
	clientId,
	attributes,
	setAttributes
}) {

	const [ animation, setAnimation ] = useState( 'none' );
	const [ delay, setDelay ] = useState( 'none' );
	const [ speed, setSpeed ] = useState( 'none' );
	const [ currentAnimationLabel, setCurrentAnimationLabel ] = useState( __( 'None', 'blocks-animation' ) );
	const [ customDelayValue, setCustomDelayValue ] = useState( 0 );
	const [ customSpeedValue, setCustomSpeedValue ] = useState( 0 );
	const [ playOnHover, setPlayOnHover ] = useState( false );
	const [ triggerOffset, setTriggerOffset ] = useState( '' );
	const [ triggerOffsetValue, setTriggerOffsetValue ] = useState( '0px' );
	const [ cssNode, setNodeCSS ] = useCSSNode({
		selector: 'animated',
		appendToRoot: true
	});

	const updateAnimation = ( e ) => {
		let classes;
		const animationValue = 'none' !== e ? e : '';

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );
			const exists = classes.find( ( i ) => i === animation );
			const animatedExists = classes.find( ( i ) => 'animated' === i );

			if ( ! animatedExists ) {
				classes.push( 'animated' );
			}

			if ( exists ) {
				classes = classes
					.join( ' ' )
					.replace( animation, animationValue );
			} else {
				classes.push( animationValue );
				classes = classes.join( ' ' );
			}
		} else {
			classes = `animated ${ animationValue }`;
		}

		if ( 'none' === e ) {
			classes = classes
				.replace( 'animated', '' )
				.replace( delay, '' )
				.replace( speed, '' );

			setDelay( 'none' );
			setSpeed( 'none' );
		}

		classes = classes.replace( /\s+/g, ' ' ).trim();

		if ( '' === classes ) {
			classes = undefined;
		}

		setAnimation( e );
		setAttributes({ className: classes });

		const block = document.querySelector( `#block-${ clientId } .animated` ) || document.querySelector( `#block-${ clientId }.animated` );

		if ( block ) {
			outAnimation.forEach( ( i ) => {
				const isOut = block.className.includes( i );

				if ( isOut ) {
					block.addEventListener( 'animationend', () => {
						block.classList.remove( i );

						block.addEventListener( 'animationstart', () => {
							block.classList.remove( i );
						});
					});
				}
			});
		}
	};

	const replayAnimation = () => {
		let classes = attributes.className;
		classes = classes.replace( animation, 'o-replay' );

		setAttributes({ className: classes });

		setTimeout( () => setAttributes({ className: classes.replace( 'o-replay', animation ) }), 100 );
	};

	useEffect( () => {
		if ( undefined !== window?.blocksAnimation ) {
			window.blocksAnimation.removeAnimation = () => updateAnimation( 'none' );
		}
	}, []);

	useEffect( () => {
		setNodeCSS(
			attributes.className
				?.split( ' ' )
				.map( ( i ) => {
					if ( i.includes( 'o-anim-value-delay-' ) ) {
						return `.${ i } { animation-delay: ${ i.replace( 'o-anim-value-delay-', '' ) }; --webkit-animation-delay: ${ i.replace( 'o-anim-value-delay-', '' ) }; }`;
					} else if ( i.includes( 'o-anim-value-speed-' ) ) {
						return `.${ i } { animation-duration: ${ i.replace( 'o-anim-value-speed-', '' ) }; --webkit-animation-duration: ${ i.replace( 'o-anim-value-speed-', '' ) }; }`;
					}
					return '';
				})
				.filter( ( i ) => i ) ?? ''
		);

	}, [ attributes.className ]);

	useEffect( () => {
		let classes;

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );

			const animationClass = Array.from( animationsList ).find( ( i ) => {
				return classes.find( ( o ) => o === i.value );
			});

			const delayClass = Array.from( delayList ).find( ( i ) => {
				return classes.find( ( o ) => o === i.value );
			});

			const speedClass = Array.from( speedList ).find( ( i ) => {
				return classes.find( ( o ) => o === i.value );
			});

			let customDelay = classes.find( ( i ) => i.includes( 'o-anim-value-delay' ) );
			if ( customDelay ) {
				customDelay = customDelay.replace( 'o-anim-value-delay-', '' );

				// The string must start with a number and end with s or ms.
				if ( ! customDelay.match( /^[0-9]+(ms|s)$/ ) ) {
					customDelay = undefined;
				}
			}

			let customSpeed = classes.find( ( i ) => i.includes( 'o-anim-value-speed' ) );
			if ( customSpeed ) {
				customSpeed = customSpeed.replace( 'o-anim-value-speed-', '' );

				// The string must start with a number and end with s or ms.
				if ( ! customSpeed.match( /^[0-9]+(ms|s)$/ ) ) {
					customSpeed = undefined;
				}
			}

			let triggerOffsetValue = classes.find( ( i ) => i.includes( 'o-anim-offset-' ) );
			if ( triggerOffsetValue ) {
				triggerOffsetValue = triggerOffsetValue.replace( 'o-anim-offset-', '' );

				// The string must start with a number and end with px or %.
				if ( ! triggerOffsetValue.match( /^[0-9]+(px|%)$/ ) ) {
					triggerOffsetValue = '0px';
				}
			}

			const playOnHover = classes.find( ( i ) => i.includes( 'o-anim-hover' ) );

			setAnimation( animationClass ? animationClass.value : 'none' );
			setDelay( delayClass ? delayClass.value : 'none' );
			setSpeed( speedClass ? speedClass.value : 'none' );
			setCustomDelayValue( customDelay || 0 );
			setCustomSpeedValue( customSpeed || 0 );
			setPlayOnHover( playOnHover ? true : false );
			setCurrentAnimationLabel(
				animationClass ? animationClass.label : 'none'
			);

			setTriggerOffset( triggerOffsetValue ? `o-anim-offset-${triggerOffsetValue}` : '' );
			setTriggerOffsetValue( triggerOffsetValue || '0px' );
		}

	}, []);

	useEffect( () => {

		if ( ! triggerOffset ) {
			return;
		}

		if ( ! triggerOffsetValue ) {
			return;
		}

		if ( triggerOffset === `o-anim-offset-${triggerOffsetValue}` ) {
			return;
		}

		updateAnimConfig( AnimationType.default, 'o-anim-offset-', triggerOffsetValue ? `o-anim-offset-${triggerOffsetValue}` : '', () => setTriggerOffset( `o-anim-offset-${triggerOffsetValue}` ), attributes, setAttributes );
	}, [ triggerOffsetValue, triggerOffset ]);

	return (
		<PanelBody
			title={ __( 'Animations', 'blocks-animation' ) }
			initialOpen={ false }
		>
			<div className="o-animations-control">
				<AnimationPopover
					animationsList={ animationsList }
					updateAnimation={ updateAnimation }
					currentAnimationLabel={ currentAnimationLabel }
					setCurrentAnimationLabel={ setCurrentAnimationLabel }
				/>

				{ 'none' !== animation && (
					<Fragment>
						<SelectControl
							label={ __( 'Delay', 'blocks-animation' ) }
							value={ delay || 'none' }
							options={ delayList }
							onChange={  value => updateAnimConfig( AnimationType.default, delay, value, () => setDelay( value ), attributes, setAttributes ) }
						/>

						{
							'o-anim-custom-delay' === delay && (
								<UnitControl
									label={ __( 'Value', 'blocks-animation' ) }
									value={ customDelayValue }
									onChange={ value => updateAnimConfig( AnimationType.default, 'o-anim-value-delay-', value ? `o-anim-value-delay-${value}` : undefined, () => setCustomDelayValue( value ), attributes, setAttributes ) }
									min={ 0 }
									step={ 0.1 }
									allowReset
									units={
										[
											{
												label: __( 'S', 'blocks-animation' ),
												value: 's'
											},
											{
												label: __( 'MS', 'blocks-animation' ),
												value: 'ms'
											}
										]
									}
								/>
							)
						}

						<SelectControl
							label={ __( 'Speed', 'blocks-animation' ) }
							value={ speed || 'none' }
							options={ speedList }
							onChange={ value => updateAnimConfig( AnimationType.default, speed, value, () => setSpeed( value ), attributes, setAttributes ) }
						/>

						{
							'o-anim-custom-speed' === speed && (
								<UnitControl
									label={ __( 'Value', 'blocks-animation' ) }
									value={ customSpeedValue }
									onChange={ value => updateAnimConfig( AnimationType.default, 'o-anim-value-speed-', `o-anim-value-speed-${value}`, () => setCustomSpeedValue( value ), attributes, setAttributes ) }
									min={ 0 }
									step={ 0.1 }
									allowReset
									units={
										[
											{
												label: __( 'S', 'blocks-animation' ),
												value: 's'
											},
											{
												label: __( 'MS', 'blocks-animation' ),
												value: 'ms'
											}
										]
									}
								/>
							)
						}

						<ToggleControl
							label={ __( 'Play on Hover', 'blocks-animation' ) }
							checked={ playOnHover }
							onChange={ value  => updateAnimConfig( AnimationType.default, 'o-anim-hover', value ? 'o-anim-hover' : '', () => setPlayOnHover( value ), attributes, setAttributes ) }

						/>

						<ToggleControl
							label={ __( 'Trigger Offset', 'blocks-animation' ) }
							checked={ Boolean( triggerOffset ) }
							onChange={
								value  => updateAnimConfig(
									AnimationType.default,
									'o-anim-offset-0px', value ? 'o-anim-offset-0px' : '',
									() => {
										setTriggerOffset( value ? 'o-anim-offset-0px' : '' );
										setTriggerOffsetValue( value ? 'o-anim-offset-0px' : '' );
									},
									attributes,
									setAttributes
								)
							}
							help={ __( 'This will offset the trigger of animation relative to the screen.', 'blocks-animation' ) }
						/>

						{
							Boolean( triggerOffset ) && (
								<UnitControl
									label={ __( 'Height Trigger Offset', 'blocks-animation' ) }
									value={ triggerOffsetValue }
									onChange={ setTriggerOffsetValue }
									step={ 0.1 }
									allowReset
									units={
										[
											{
												label: __( 'px', 'blocks-animation' ),
												value: 'px'
											},
											{
												label: __( '%', 'blocks-animation' ),
												value: '%'
											}
										]
									}
									help={ triggerOffsetValue?.endsWith( '%' ) ? __( 'Is the percentage of the screen height. E.g: with 50% the animation will trigger after passing the middle of screen.', 'blocks-animation' ) : '' }
								/>
							)
						}

						<Button
							variant="secondary"
							onClick={ replayAnimation }
						>
							{ __( 'Replay Animation', 'blocks-animation' ) }
						</Button>
					</Fragment>
				) }
			</div>

			<ControlPanelControl
				label={ __( 'Count Animations', 'blocks-animation' ) }
			>
				<img
					src={ typingPlaceholder }
					alt={ __( 'Using Count Animation in the Block Editor', 'blocks-animation' ) }
					className="otter-animations-count-image"
				/>

				<p>{ __( 'You can add counting animation from the format toolbar of this block.', 'blocks-animation' ) }</p>
				<p>{ __( 'Note: This feature is not available in all the blocks.', 'blocks-animation' ) }</p>
			</ControlPanelControl>

			<ControlPanelControl
				label={ __( 'Typing Animations', 'blocks-animation' ) }
			>
				<img
					src={ countPlaceholder }
					alt={ __( 'Using Typing Animation in the Block Editor', 'blocks-animation' ) }
					className="otter-animations-count-image"
				/>

				<p>{ __( 'You can add typing animation from the format toolbar of this block.', 'blocks-animation' ) }</p>
				<p>{ __( 'Note: This feature is not available in all the blocks.', 'blocks-animation' ) }</p>
			</ControlPanelControl>

			<div className="o-fp-wrap">
				{ applyFilters( 'otter.feedback', '', 'animations' ) }
				{ applyFilters( 'otter.poweredBy', '' ) }
			</div>
		</PanelBody>
	);
}

export default memo( AnimationControls );
