/** @jsx jsx */

/**
 * External dependencies
 */
import {
	css,
	jsx
} from '@emotion/react';

import classnames from 'classnames';

import getSymbolFromCurrency from 'currency-symbol-map';

/**
  * WordPress dependencies.
  */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
  * Internal dependencies
  */
import defaultAttributes from './attributes.js';
import Placeholder from './placeholder.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { blockInit } from '../../helpers/block-utility.js';
import defaultReviewAttributes from '../review/attributes.js';
import {
	StarFilled,
	StarHalf
} from '../../helpers/icons.js';

let tableImages = [];
let tableName = [];
let tablePrice = [];
let tableRating = [];
let tableDescription = [];
let tableStatistics = [];
let tableLinks = [];

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	useEffect( () => {
		( async() => {
			try {
				setStatus( 'loading' );
				const data = await apiFetch({ path: 'themeisle-gutenberg-blocks/v1/filter_blocks?block=themeisle-blocks/review' });
				setData( data );
				setStatus( 'loaded' );
				setEditing( ! Boolean( attributes.reviews.length ) );
			} catch ( error ) {
				setStatus( 'error' );
			}
		})();
	}, []);

	const [ data, setData ] = useState([]);
	const [ status, setStatus ] = useState( 'loading' );
	const [ isEditing, setEditing ] = useState( true );

	const styles = css`
		.otter-review-comparison__buttons span {
			background: ${ attributes.buttonColor } !important;
			color: ${ attributes.buttonText } !important;
		}
	`;

	useEffect( () => {
		tableImages = [];
		tableName = [];
		tablePrice = [];
		tableRating = [];
		tableDescription = [];
		tableStatistics = [];
		tableLinks = [];

		if ( ! Boolean( data.length ) ) {
			return;
		}

		attributes.reviews.forEach( value => {
			const values = value.split( '-' );
			const review = data.find( review => review.ID === Number( values[0]) && review.attrs.id.slice( review.attrs.id.length - 8 ) === values[1]);

			if ( ! review ) {
				return;
			}

			const currency = getSymbolFromCurrency( review.attrs.currency ) ?? '$';
			const features = review.attrs.features || defaultReviewAttributes.features.default;
			const overallRatings = Math.round( features.reduce( ( accumulator, feature ) =>  accumulator + feature.rating, 0 ) / features.length ) / 2;
			const links = review.attrs.links || defaultReviewAttributes.links.default;

			const featureRatings = [];

			features.forEach( feature => {
				featureRatings.push(
					<div className="otter-review-comparison__rating_container">
						<div className="otter-review-comparison__rating_title">{ feature.title }</div>
						<div className="otter-review-comparison__ratings">{ getStars( feature.rating / 2 ) }</div>
					</div>
				);
			});

			const buttonLinks = [];

			links.forEach( link => {
				buttonLinks.push(
					<span className="wp-block-button__link">{ link.label }</span>
				);
			});

			tableImages.push( <td>{ review.attrs.image && <img src={ review.attrs.image.url } /> }</td> );
			tableName.push( <td>{ review.attrs.title || __( 'Untitled review', 'otter-blocks' ) }</td> );
			tablePrice.push( <td>{ review.attrs.discounted ? <Fragment><del>{ currency + review.attrs.price }</del> { currency + review.attrs.discounted }</Fragment> : ( review.attrs.price ? ( currency + review.attrs.price ) : '-' ) }</td> );
			tableRating.push( <td><div className="otter-review-comparison__ratings">{ getStars( overallRatings ) }</div></td> );
			tableDescription.push( <td dangerouslySetInnerHTML={ { __html: review.attrs.description } }></td> );
			tableStatistics.push( <td>{ featureRatings }</td> );
			tableLinks.push( <td><div className="otter-review-comparison__buttons wp-block-button">{ buttonLinks }</div></td> );
		});
	}, [ attributes.reviews, data ]);

	const isLoading  = 'loading' === status;
	const isComplete = 'loaded' === status;
	const isError = 'error' === status;

	const getStars = ( overallRatings ) => {
		const stars = [];

		for ( let i = 0; 5 > i; i++ ) {
			stars.push(
				( i < overallRatings && ( overallRatings < i + 1 ) ) ?
					<StarHalf
						className={ classnames(
							{
								'low': 1.5 >= overallRatings && i < overallRatings,
								'medium': 1.5 < overallRatings && 3.5 >= overallRatings && i < overallRatings,
								'high': 3.5 < overallRatings && 5 >= overallRatings && i < overallRatings
							}
						) }
					/>					:
					<StarFilled
						className={ classnames(
							{
								'low': 1.5 >= overallRatings && i < overallRatings,
								'medium': 1.5 < overallRatings && 3.5 >= overallRatings && i < overallRatings,
								'high': 3.5 < overallRatings && 5 >= overallRatings && i < overallRatings
							}
						) }
					/>
			);
		}

		return stars;
	};

	if ( isEditing ) {
		return (
			<Placeholder
				attributes={ attributes }
				setAttributes={ setAttributes }
				data={ data }
				onComplete={ () => setEditing( false ) }
				isLoading={ isLoading }
				isComplete={ isComplete }
				isError={ isError }
			/>
		);
	}

	return (
		<Fragment>
			<Controls onEdit={ () => setEditing( true ) } />

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<table
				id={ attributes.id }
				className={ className }
			>
				<thead>
					<tr>
						<th></th>
						{ tableImages }
					</tr>
				</thead>

				<tbody>
					<tr>
						<th>{ __( 'Name', 'otter-blocks' ) }</th>
						{ tableName }
					</tr>

					<tr>
						<th>{ __( 'Price', 'otter-blocks' ) }</th>
						{ tablePrice }
					</tr>

					<tr>
						<th>{ __( 'Rating', 'otter-blocks' ) }</th>
						{ tableRating }
					</tr>

					<tr>
						<th>{ __( 'Description', 'otter-blocks' ) }</th>
						{ tableDescription }
					</tr>

					<tr>
						<th>{ __( 'Statistics', 'otter-blocks' ) }</th>
						{ tableStatistics }
					</tr>

					<tr css={ styles }>
						<th>{ __( 'Buy this product', 'otter-blocks' ) }</th>
						{ tableLinks }
					</tr>
				</tbody>
			</table>
		</Fragment>
	);
};

export default Edit;
