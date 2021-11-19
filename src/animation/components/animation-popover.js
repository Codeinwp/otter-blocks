/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
	TextControl
} from '@wordpress/components';

import { useInstanceId } from '@wordpress/compose';

import { Fragment, useState } from '@wordpress/element';

/**
  * Internal dependencies.
  */
import { categories } from '../data.js';

function AnimationPopover({
	animationsList,
	updateAnimation,
	currentAnimationLabel,
	setCurrentAnimationLabel
}) {
	const instanceId = useInstanceId( AnimationPopover );

	const [ currentInput, setCurrentInput ] = useState( '' );
	const [ animationFound, setAnimationFound ] = useState( false );

	const getAnimations = ( animation, onToggle ) => {
		let match = true;

		if ( currentInput ) {
			const inputWords = currentInput.toLowerCase().split( ' ' );
			inputWords.forEach( ( word ) => {
				if ( ! animation.label.toLowerCase().includes( word ) ) {
					match = false;
				}
			});
		}

		if ( match && ! animationFound ) {
			setAnimationFound( true );
		}

		return (
			match && (
				<MenuItem
					className={
						currentAnimationLabel === animation.label ?
							'is-selected' :
							''
					}
					onClick={ () => {
						setCurrentAnimationLabel( animation.label );
						updateAnimation( animation.value );
						onToggle();
					} }
				>
					{ animation.label }
				</MenuItem>
			)
		);
	};

	const id = `inspector-themeisle-animations-control-${ instanceId }`;

	return (
		<BaseControl label={ __( 'Animation', 'otter-blocks' ) } id={ id }>
			<Dropdown
				contentClassName="themeisle-animations-control__popover"
				position="bottom center"
				renderToggle={ ({ isOpen, onToggle }) => (
					<Button

						className="themeisle-animations-control__button"
						id={ id }
						onClick={ onToggle }
						aria-expanded={ isOpen }
					>
						{ currentAnimationLabel }
					</Button>
				) }
				renderContent={ ({ onToggle }) => (
					<MenuGroup label={ __( 'Animations', 'otter-blocks' ) }>
						<TextControl
							placeholder={ __( 'Search', 'otter-blocks' ) }
							value={ currentInput }
							onChange={ ( e ) => {
								setCurrentInput( e );
								setAnimationFound( false );
							} }
						/>

						<div className="components-popover__items">
							{ animationsList.map( ( animation ) => {
								return (
									<Fragment>
										{ '' === currentInput &&
											categories.map( ( category ) => {
												return category.value ===
													animation.value ? (
														<div className="themeisle-animations-control__category">
															{ category.label }
														</div>
													) : (
														''
													);
											}) }

										{ getAnimations( animation, onToggle ) }
									</Fragment>
								);
							}) }

							{ ! animationFound && (
								<div>
									{ __(
										'Nothing found. Try searching for something else!',
										'otter-blocks'
									) }
								</div>
							) }
						</div>
					</MenuGroup>
				) }
			/>
		</BaseControl>
	);
}

export default AnimationPopover;
