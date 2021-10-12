/**
  * WordPress dependencies.
  */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import {
	Button,
	CheckboxControl,
	MenuGroup,
	Placeholder,
	Spinner,
	TextControl
} from '@wordpress/components';

import { useState } from '@wordpress/element';

import { blockTable } from '@wordpress/icons';

const BlockPlaceholder = ({
	attributes,
	setAttributes,
	data,
	onComplete,
	isLoading,
	isComplete,
	isError
}) => {
	const [ query, setQuery ] = useState( '' );

	const toggleReview = ID => {
		const reviews = [ ...attributes.reviews ];
		if ( reviews.includes( ID ) ) {
			const index = reviews.indexOf( ID );

			if ( -1 !== index ) {
				reviews.splice( index, 1 );
			}
		} else {
			reviews.push( ID );
		}

		setAttributes({ reviews });
	};

	const LabelTag = ({
		label,
		value
	}) => (
		<span className="otter-review-comparison__tag">
			<span className="otter-review-comparison__tag_title">{ label }</span>

			<Button
				label={ sprintf( __( 'Remove %s', 'otter-blocks' ), label ) }
				icon="dismiss"
				onClick={ () => toggleReview( value ) }
			/>
		</span>
	);

	const getNiceValues = () => attributes.reviews.filter( value => {
		const values = value.split( '-' );
		return data.find( review => review.ID === Number( values[0]) && review.attrs.id.slice( review.attrs.id.length - 8 ) === values[1]);
	}).map( value => {
		const values = value.split( '-' );
		const review = data.find( review => review.ID === Number( values[0]) && review.attrs.id.slice( review.attrs.id.length - 8 ) === values[1]);
		const label = review.attrs.title || __( 'Untitled review', 'otter-blocks' );

		return {
			label,
			value
		};
	});

	return (
		<Placeholder
			label={ __( 'Product Review Comparison', 'otter-blocks' ) }
			instructions={ __( 'Display a selection of product reviews in a comparison table.', 'otter-blocks' ) }
			icon={ blockTable }
			isColumnLayout={ true }
			className="otter-review-comparison__placeholder"
		>
			{ isLoading && <Spinner /> }

			{ isError && __( 'There seems to have been an error.', 'otter-blocks' ) }

			{ ( isComplete && ! Boolean( data.length ) ) && __( 'No reviews found.', 'otter-blocks' ) }

			{ ( isComplete && Boolean( data.length ) ) && (
				<div className="otter-review-comparison__placeholder__container">
					<div className="otter-review-comparison__placeholder__selected">
						<div className="otter-review-comparison__placeholder__selected_label">
							{

								/**
								 * translators: %s Number of selected reviews.
								 */
								sprintf( __( '%s reviews selected', 'otter-blocks' ), attributes.reviews.length )
							}
						</div>

						{ getNiceValues().map( niceValue => (
							<LabelTag
								key={ niceValue.value }
								label={ niceValue.label }
								value={ niceValue.value }
							/>
						) ) }
					</div>

					<TextControl
						label={ __( 'Search for review to display', 'otter-blocks' ) }
						value={ query }
						onChange={ setQuery }
					/>

					<MenuGroup>
						{ data.filter( review => ( review.attrs.title || __( 'Untitled review', 'otter-blocks'  ) ).toLowerCase().includes( query.toLowerCase() ) ).map( review => {
							const ID = review.ID + '-' + review.attrs.id.slice( review.attrs.id.length - 8 );

							return (
								<CheckboxControl
									label={ review.attrs.title || __( 'Untitled review', 'otter-blocks' ) }
									checked={ attributes.reviews.includes( ID ) }
									onChange={ () => toggleReview( ID ) }
								/>
							);
						}) }
					</MenuGroup>

					<Button
						isPrimary
						onClick={ onComplete }
					>
						{ __( 'Done', 'otter-blocks' ) }
					</Button>
				</div>
			) }
		</Placeholder>
	);
};

export default BlockPlaceholder;
