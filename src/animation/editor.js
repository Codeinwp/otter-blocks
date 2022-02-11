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

import typingPlaceholder from './../../assets/images/typing-animation.png';

const AnimationType = {
	count: 'count',
	typing: 'typing',
	default: 'default'
};

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

			const typingDelayClass = Array.from( delayList ).find( ( i ) => {
				return classes.find( ( o ) => o === `o-typing-${ i.value }` );
			});

			const typingSpeedClass = Array.from( speedList ).find( ( i ) => {
				return classes.find( ( o ) => o === `o-typing-${ i.value }` );
			});

			setAnimation( animationClass ? animationClass.value : 'none' );
			setDelay( delayClass ? delayClass.value : 'none' );
			setSpeed( speedClass ? speedClass.value : 'none' );
			setCurrentAnimationLabel(
				animationClass ? animationClass.label : 'none'
			);

			setCountDelay( countDelayClass ? countDelayClass.value : 'none' );
			setCountSpeed( countSpeedClass ? countSpeedClass.value : 'none' );

			setTypingDelay( typingDelayClass ? typingDelayClass.value : 'none' );
			setTypingSpeed( typingSpeedClass ? typingSpeedClass.value : 'none' );
		}

	}, []);

	const { hasCountFormat, hasTypingFormat } = useSelect( select => {
		const { getBlock } = select( 'core/block-editor' );
		const html = serialize( getBlock( clientId ) );
		const block = create({ html });
		let hasCountFormat = false;
		let hasTypingFormat = false;

		if ( block.formats ) {
			hasCountFormat = block.formats.some( format => true === format.some( format => 'themeisle-blocks/count-animation' === format.type ) );
			hasTypingFormat = block.formats.some( format => true === format.some( format => 'themeisle-blocks/typing-animation' === format.type ) );
		}

		return { hasCountFormat, hasTypingFormat};
	}, []);

	const [ animation, setAnimation ] = useState( 'none' );
	const [ delay, setDelay ] = useState( 'none' );
	const [ speed, setSpeed ] = useState( 'none' );
	const [ currentAnimationLabel, setCurrentAnimationLabel ] = useState( __( 'None', 'otter-blocks' ) );

	const [ countDelay, setCountDelay ] = useState( 'none' );
	const [ countSpeed, setCountSpeed ] = useState( 'none' );

	const [ typingDelay, setTypingDelay ] = useState( 'none' );
	const [ typingSpeed, setTypingSpeed ] = useState( 'none' );

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

	const updateAnimConfig = ( type, oldValue, newValue, callback ) => {
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

		const oldClassName = template + oldValue;
		const newClassName = 'none' !== newValue ? template + newValue : '';
		let classes;

		if ( attributes.className ) {
			classes = attributes.className;
			classes = classes.split( ' ' );
			const exists = classes.find( ( i ) => i === oldClassName );

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
								onChange={  value => updateAnimConfig( AnimationType.default, delay, value, () => setDelay( value ) ) }
							/>

							<SelectControl
								label={ __( 'Speed', 'otter-blocks' ) }
								value={ speed || 'none' }
								options={ speedList }
								onChange={ value => updateAnimConfig( AnimationType.default, speed, value, () => setSpeed( value ) ) }
							/>
						</Fragment>
					) }
				</div>
			</ControlPanelControl>

			<ControlPanelControl
				label={ __( 'Count Animations', 'otter-blocks' ) }
			>
				{ hasCountFormat ? (
					<Fragment>
						<SelectControl
							label={ __( 'Delay', 'otter-blocks' ) }
							value={ countDelay || 'none' }
							options={ delayList }
							onChange={ value => updateAnimConfig( AnimationType.count, countDelay, value, () => setCountDelayDelay( value ) ) }
						/>

						<SelectControl
							label={ __( 'Speed', 'otter-blocks' ) }
							value={ countSpeed || 'none' }
							options={ speedList }
							onChange={ value => updateAnimConfig( AnimationType.count, countSpeed, value, () => setTypingSpeed( value ) ) }
						/>
					</Fragment>
				) : (
					<Fragment>
						<img
							src={ typingPlaceholder }
							alt={ _( 'Using Count Animation in the Block Editor', 'otter-blocks' ) }
							className="otter-animations-count-image"
						/>

						<p>{ __( 'You can add counting animation from the format toolbar of this block. Once you have added them, you will see customization settings here.', 'otter-blocks' ) }</p>
						<p>{ __( 'Note: This feature is not available in all the blocks.', 'otter-blocks' ) }</p>
					</Fragment>
				) }
			</ControlPanelControl>

			<ControlPanelControl
				label={ __( 'Typing Animations', 'otter-blocks' ) }
			>
				{ hasTypingFormat ? (
					<Fragment>
						<SelectControl
							label={ __( 'Delay', 'otter-blocks' ) }
							value={ typingDelay || 'none' }
							options={ delayList }
							onChange={ value => updateAnimConfig( AnimationType.typing, typingDelay, value, () => setTypingDelay( value ) ) }
						/>

						<SelectControl
							label={ __( 'Speed', 'otter-blocks' ) }
							value={ typingSpeed || 'none' }
							options={ speedList }
							onChange={ value => updateAnimConfig( AnimationType.typing, typingSpeed, value, () => setTypingSpeed( value ) ) }
						/>
					</Fragment>
				) : (
					<Fragment>
						<img
							src={ countPlaceholder }
							alt={ _( 'Using Typing Animation in the Block Editor', 'otter-blocks' ) }
							className="otter-animations-count-image"
						/>

						<p>{ __( 'You can add typing animation from the format toolbar of this block. Once you have added them, you will see customization settings here.', 'otter-blocks' ) }</p>
						<p>{ __( 'Note: This feature is not available in all the blocks.', 'otter-blocks' ) }</p>
					</Fragment>
				) }
			</ControlPanelControl>
		</Fragment>
	);
}

export default AnimationControls;
