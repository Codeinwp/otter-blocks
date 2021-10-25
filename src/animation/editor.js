/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { SelectControl } from '@wordpress/components';

import { Fragment, useState, useEffect } from '@wordpress/element';

/**
  * Internal dependencies.
  */
import { animationsList, delayList, speedList, outAnimation } from './data.js';

import AnimationPopover from './components/animation-popover';

function AnimationControls({ attributes, clientId, setAttributes }) {
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

			setAnimation( animationClass ? animationClass.value : 'none' );
			setDelay( delayClass ? delayClass.value : 'default' );
			setSpeed( speedClass ? speedClass.value : 'default' );
			setCurrentAnimationLabel(
				animationClass ? animationClass.label : 'none'
			);
		}
	}, []);

	const [ animation, setAnimation ] = useState( 'none' );
	const [ delay, setDelay ] = useState( 'default' );
	const [ speed, setSpeed ] = useState( 'default' );
	const [ currentAnimationLabel, setCurrentAnimationLabel ] = useState(
		'none'
	);

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

			setDelay( 'default' );
			setSpeed( 'default' );
		}

		classes = classes.replace( /\s+/g, ' ' ).trim();

		if ( '' === classes ) {
			classes = undefined;
		}

		setAnimation( e );
		setAttributes({ className: classes });

		let block = document.querySelector( `#block-${ clientId } .animated` );

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

	return (
		<div className="themeisle-animations-control">
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
						value={ delay || 'default' }
						options={ delayList }
						onChange={ updateDelay }
					/>

					<SelectControl
						label={ __( 'Speed', 'otter-blocks' ) }
						value={ speed || 'default' }
						options={ speedList }
						onChange={ updateSpeed }
					/>
				</Fragment>
			) }
		</div>
	);
}

export default AnimationControls;
