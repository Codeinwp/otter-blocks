/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { serialize } from '@wordpress/blocks';

import { SelectControl } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

import { create } from '@wordpress/rich-text';

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

function AnimationControls({
	clientId,
	attributes,
	setAttributes
}) {
	useEffect( () => {
		let classes;

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );

			let animationClass = Array.from( animationsList ).find( ( i ) => {
				return classes.find( ( o ) => o === i.value );
			});

			const delayClass = Array.from( delayList ).find( ( i ) => {
				return classes.find( ( o ) => o === i.value );
			});

			const speedClass = Array.from( speedList ).find( ( i ) => {
				return classes.find( ( o ) => o === i.value );
			});

			const countDelayClass = Array.from( delayList ).find( ( i ) => {
				return classes.find( ( o ) => o === `o-count-${ i.value }` );
			});

			const countSpeedClass = Array.from( speedList ).find( ( i ) => {
				return classes.find( ( o ) => o === `o-count-${ i.value }` );
			});

			setAnimation( animationClass ? animationClass.value : 'none' );
			setDelay( delayClass ? delayClass.value : 'none' );
			setSpeed( speedClass ? speedClass.value : 'none' );
			setCurrentAnimationLabel(
				animationClass ? animationClass.label : 'none'
			);

			setCountDelay( countDelayClass ? countDelayClass.value : 'none' );
			setCountSpeed( countSpeedClass ? countSpeedClass.value : 'none' );
		}

	}, []);

	const hasFormat = useSelect( select => {
		const { getBlock } = select( 'core/block-editor' );
		const html = serialize( getBlock( clientId ) );
		const block = create({ html });
		let hasFormat = false;

		if ( block.formats ) {
			hasFormat = block.formats.some( format => true === format.some( i => 'themeisle-blocks/count-animation' === i.type ) );
		}

		return hasFormat;
	}, []);

	const [ animation, setAnimation ] = useState( 'none' );
	const [ delay, setDelay ] = useState( 'none' );
	const [ speed, setSpeed ] = useState( 'none' );
	const [ currentAnimationLabel, setCurrentAnimationLabel ] = useState( __( 'None', 'otter-blocks' ) );

	const [ countDelay, setCountDelay ] = useState( 'none' );
	const [ countSpeed, setCountSpeed ] = useState( 'none' );

	const updateAnimation = ( e ) => {
		let classes;
		let animationValue = 'none' !== e ? e : '';

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

		let block = document.querySelector( `#block-${ clientId } .animated` ) || document.querySelector( `#block-${ clientId }.animated` );

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

	const updateDelay = ( e ) => {
		let classes;
		let delayValue = 'none' !== e ? e : '';

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );
			const exists = classes.find( ( i ) => i === delay );

			if ( exists ) {
				classes = classes.join( ' ' ).replace( delay, delayValue );
			} else {
				classes.push( delayValue );
				classes = classes.join( ' ' );
			}
		} else {
			classes = delayValue;
		}

		classes = classes.replace( /\s+/g, ' ' );

		setDelay( e );
		setAttributes({ className: classes });
	};

	const updateSpeed = ( e ) => {
		let classes;
		let speedValue = 'none' !== e ? e : '';

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );
			const exists = classes.find( ( i ) => i === speed );

			if ( exists ) {
				classes = classes.join( ' ' ).replace( speed, speedValue );
			} else {
				classes.push( speedValue );
				classes = classes.join( ' ' );
			}
		} else {
			classes = speedValue;
		}

		classes = classes.replace( /\s+/g, ' ' );

		setSpeed( e );
		setAttributes({ className: classes });
	};

	const updateCountDelay = ( e ) => {
		let classes;
		let delayValue = 'none' !== e ? `o-count-${ e }` : '';

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );
			const exists = classes.find( ( i ) => i === `o-count-${ countDelay }` );

			if ( exists ) {
				classes = classes.join( ' ' ).replace( `o-count-${ countDelay }`, delayValue );
			} else {
				classes.push( delayValue );
				classes = classes.join( ' ' );
			}
		} else {
			classes = delayValue;
		}

		classes = classes.replace( /\s+/g, ' ' ).trim();

		if ( '' === classes ) {
			classes = undefined;
		}

		setCountDelay( e );
		setAttributes({ className: classes });
	};

	const updateCountSpeed = ( e ) => {
		let classes;
		let speedValue = 'none' !== e ? `o-count-${ e }` : '';

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );
			const exists = classes.find( ( i ) => i === `o-count-${ countSpeed }` );

			if ( exists ) {
				classes = classes.join( ' ' ).replace( `o-count-${ countSpeed }`, speedValue );
			} else {
				classes.push( speedValue );
				classes = classes.join( ' ' ).trim();
			}
		} else {
			classes = speedValue;
		}

		classes = classes.replace( /\s+/g, ' ' );

		if ( '' === classes ) {
			classes = undefined;
		}

		setCountSpeed( e );
		setAttributes({ className: classes });
	};

	return (
		<Fragment>
			<ControlPanelControl
				label={ __( 'Loading Animations', 'otter-blocks' ) }
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
								label={ __( 'Delay', 'otter-blocks' ) }
								value={ delay || 'none' }
								options={ delayList }
								onChange={ updateDelay }
							/>

							<SelectControl
								label={ __( 'Speed', 'otter-blocks' ) }
								value={ speed || 'none' }
								options={ speedList }
								onChange={ updateSpeed }
							/>
						</Fragment>
					) }
				</div>
			</ControlPanelControl>

			<ControlPanelControl
				label={ __( 'Count Animations', 'otter-blocks' ) }
			>
				{ hasFormat ? (
					<Fragment>
						<SelectControl
							label={ __( 'Delay', 'otter-blocks' ) }
							value={ countDelay || 'none' }
							options={ delayList }
							onChange={ updateCountDelay }
						/>

						<SelectControl
							label={ __( 'Speed', 'otter-blocks' ) }
							value={ countSpeed || 'none' }
							options={ speedList }
							onChange={ updateCountSpeed }
						/>
					</Fragment>
				) : (
					<Fragment>
						<img
							src={ countPlaceholder }
							alt={ _( 'Using Count Animation in the Block Editor', 'otter-blocks' ) }
							className="otter-animations-count-image"
						/>

						<p>{ __( 'You can add counting animation from the format toolbar of this block. Once you have added them, you will see customization settings here.', 'otter-blocks' ) }</p>
						<p>{ __( 'Note: This feature is not available in all the blocks.', 'otter-blocks' ) }</p>
					</Fragment>
				) }
			</ControlPanelControl>
		</Fragment>
	);
}

export default AnimationControls;
