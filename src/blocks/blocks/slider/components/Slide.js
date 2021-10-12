/**
 * External dependencies
 */
import classnames from 'classnames';

import {
	closeSmall,
	chevronLeft,
	chevronRight,
	Icon
} from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { filter } from 'lodash';

import { RichText } from '@wordpress/block-editor';

import { Button } from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const Slide = ({
	images,
	image,
	index,
	isFirstItem,
	isLastItem,
	isSelected,
	setAttributes,
	setSelectedImage
}) => {
	const onMove = ( oldIndex, newIndex ) => {
		const newImages = [ ...images ];
		newImages.splice( newIndex, 1, images[ oldIndex ]);
		newImages.splice( oldIndex, 1, images[ newIndex ]);
		setSelectedImage( newIndex );
		setAttributes({ images: newImages });
	};

	const onMoveForward = () => {
		if ( index === images.length - 1 ) {
			return;
		}
		onMove( index, index + 1 );
	};

	const onMoveBackward = () => {
		if ( 0 === index ) {
			return;
		}
		onMove( index, index - 1 );
	};

	const onRemoveImage = () => {
		const newImages = filter( images, ( img, i ) => index !== i );
		setSelectedImage( null );
		setAttributes({ images: newImages });
	};

	const changeCaption = value => {
		const newImages = [ ...images ];
		newImages[index].caption = value;
		setAttributes({ images: newImages });
	};

	return (
		<div
			className={ classnames(
				'wp-block-themeisle-blocks-slider-item-wrapper glide__slide',
				{ 'is-selected': isSelected }
			) }
			tabIndex="0"
			onClick={ () => setSelectedImage( image.id ) }
			onFocus={ () => setSelectedImage( image.id ) }
		>
			<figure>
				<img
					key={ image.id }
					className="wp-block-themeisle-blocks-slider-item"
					src={ image.url }
					alt={ image.alt }
					title={ image.alt }
					data-id={ image.id }
				/>

				{ isSelected && (
					<Fragment>
						<div className="wp-block-themeisle-blocks-slider-item-move-menu">
							<Button
								icon={ <Icon icon={ chevronLeft } /> }
								label={ __( 'Move image backward', 'otter-blocks' ) }
								showTooltip={ true }
								onClick={ isFirstItem ? undefined : () => onMoveBackward() }
								className="wp-block-themeisle-blocks-slider-item-move-backward"
								aria-disabled={ isFirstItem }
								disabled={ ! isSelected }
							/>

							<Button
								icon={ <Icon icon={ chevronRight } /> }
								label={ __( 'Move image forward', 'otter-blocks' ) }
								showTooltip={ true }
								onClick={ isLastItem ? undefined : () => onMoveForward() }
								className="wp-block-themeisle-blocks-slider-item-move-forward"
								aria-disabled={ isLastItem }
								disabled={ ! isSelected }
							/>
						</div>


						<div className="wp-block-themeisle-blocks-slider-item-delete-menu">
							<Button
								icon={ <Icon icon={ closeSmall } /> }
								label={ __( 'Remove image', 'otter-blocks' ) }
								showTooltip={ true }
								onClick={ onRemoveImage }
								className="wp-block-themeisle-blocks-slider-item-delete"
							/>
						</div>
					</Fragment>
				) }

				{ ( isSelected || ! RichText.isEmpty( image.caption ) ) && (
					<RichText
						tagName="figcaption"
						placeholder={ isSelected ? __( 'Write caption…', 'otter-blocks' ) : null }
						value={ image.caption }
						onChange={ changeCaption }
						multiline={ false }
					/>
				) }
			</figure>
		</div>
	);
};

export default Slide;
