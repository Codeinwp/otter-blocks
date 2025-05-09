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

	const id = `inspector-o-animations-control-${ instanceId }`;

	return (
		<BaseControl label={ __( 'Animation', 'blocks-animation' ) } id={ id }>
			<Dropdown
				contentClassName="o-animations-control__popover"
				position="bottom center"
				renderToggle={ ({ isOpen, onToggle }) => (
					<Button
						className="o-animations-control__button"
						id={ id }
						onClick={ onToggle }
						aria-expanded={ isOpen }
					>
						{ currentAnimationLabel }
					</Button>
				) }
				renderContent={ ({ onToggle }) => (
					<MenuGroup label={ __( 'Animations', 'blocks-animation' ) }>
						<TextControl
							placeholder={ __( 'Search', 'blocks-animation' ) }
							value={ currentInput }
							onChange={ ( e ) => {
								setCurrentInput( e );
								setAnimationFound( false );
							} }
						/>

						<div className="components-popover__items">
							{ animationsList.map( ( animation, index ) => {
								return (
									<Fragment key={ index }>
										{ '' === currentInput &&
											categories.map( ( category, catIndex ) => {
												return category.value ===
													animation.value ? (
														<div key={ catIndex } className="o-animations-control__category">
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
										'blocks-animation'
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
