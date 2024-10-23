/**
 * External dependencies.
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';
import getSymbolFromCurrency from 'currency-symbol-map';

/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Placeholder,
	Spinner
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';

import {
	check,
	close,
	StarFilled
} from '../../helpers/icons.js';

import {
	blockInit,
	getDefaultValueByField
} from '../../helpers/block-utility.js';

import { useDarkBackground } from '../../helpers/utility-hooks.js';
import { _px } from '../../helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

const Stars = ({ rating }) => {
	const scale = Boolean( window.themeisleGutenberg.ratingScale );
	const stars = [];

	const divide = scale ? 2 : 1;

	for ( let i = 0; 10 / divide > i; i++ ) {
		stars.push(
			<StarFilled
				key={ i }
				className={ classnames(
					{
						'filled': i < Math.round( rating / divide )
					}
				) }
			/>
		);
	}

	return stars;
};

/**
 * Review component
 * @param {import('./type').ReviewProps} props
 * @return
 */
const Edit = ({
	name,
	attributes,
	setAttributes,
	clientId,
	isSelected,
	status = 'isInactive',
	productAttributes = {}
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const { image } = useSelect( select => {
		let image;
		const size = attributes.imageSize || 'medium';

		if ( attributes.image?.id || productAttributes.image?.id ) {
			image = select( 'core' ).getMedia( attributes.image?.id || productAttributes.image?.id, { context: 'view' });
		}

		image = image ?
			0 < Object.keys( image.media_details.sizes ).length ?
				image.media_details.sizes[size] ?
					image.media_details.sizes[size].source_url :
					image.source_url :
				image.source_url :
			null;

		return {
			image
		};
	}, [ attributes.image, attributes.imageSize, productAttributes ]);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	useDarkBackground( getValue( 'backgroundColor' ), attributes, setAttributes );

	const overallRatings = ( attributes.features.reduce( ( accumulator, feature ) => accumulator + feature.rating, 0 ) / attributes.features.length ).toFixed( 1 );

	const changeFeature = ( index, value ) => {
		const features = [ ...attributes.features ];
		features[ index ] = {
			...features[ index ],
			...value
		};
		setAttributes({ features });
	};

	const changePro = ( index, value ) => {
		const pros = [ ...attributes.pros ];
		pros[ index ] = value;
		setAttributes({ pros });
	};

	const changeCon = ( index, value ) => {
		const cons = [ ...attributes.cons ];
		cons[ index ] = value;
		setAttributes({ cons });
	};

	const changeLinks = ( index, value ) => {
		const links = [ ...attributes.links ];
		links[ index ] = {
			...links[ index ],
			...value
		};
		setAttributes({ links });
	};

	const boxShadow = getValue( 'boxShadow' );

	const inlineStyles = {
		'--background-color': getValue( 'backgroundColor' ),
		'--primary-color': getValue( 'primaryColor' ),
		'--text-color': getValue( 'textColor' ),
		'--button-text-color': getValue( 'buttonTextColor' ),
		'--border-color': getValue( 'borderColor' ),
		'--stars-color': getValue( 'starsColor' ),
		'--pros-color': getValue( 'prosColor' ),
		'--cons-color': getValue( 'consColor' ),
		'--content-font-size': getValue( 'contentFontSize' ),
		...( attributes?.padding?.top && { '--padding-desktop-top': attributes.padding.top }),
		...( attributes?.padding?.bottom && { '--padding-desktop-bottom': attributes.padding.bottom }),
		...( attributes?.padding?.right && { '--padding-desktop-right': attributes.padding.right }),
		...( attributes?.padding?.left && { '--padding-desktop-left': attributes.padding.left }),
		...( attributes?.paddingTablet?.top && { '--padding-tablet-top': attributes.paddingTablet.top }),
		...( attributes?.paddingTablet?.bottom && { '--padding-tablet-bottom': attributes.paddingTablet.bottom }),
		...( attributes?.paddingTablet?.right && { '--padding-tablet-right': attributes.paddingTablet.right }),
		...( attributes?.paddingTablet?.left && { '--padding-tablet-left': attributes.paddingTablet.left }),
		...( attributes?.paddingMobile?.top && { '--padding-mobile-top': attributes.paddingMobile.top }),
		...( attributes?.paddingMobile?.bottom && { '--padding-mobile-bottom': attributes.paddingMobile.bottom }),
		...( attributes?.paddingMobile?.right && { '--padding-mobile-right': attributes.paddingMobile.right }),
		...( attributes?.paddingMobile?.left && { '--padding-mobile-left': attributes.paddingMobile.left }),
		'--border-width': _px( getValue( 'borderWidth' ) ),
		'--border-radius': _px( getValue( 'borderRadius' ) ),
		'--box-shadow': boxShadow.active && `${ boxShadow.horizontal }px ${ boxShadow.vertical }px ${ boxShadow.blur }px ${ boxShadow.spread }px ${ hexToRgba( boxShadow.color || '#FFFFFF', boxShadow.colorOpacity ) }`
	};

	const isPlaceholder = ( 'object' === typeof status && null !== status && status.isError ) || 'isLoading' === status;

	const isOneColumn = attributes?.className?.includes( 'is-style-single-column' );
	const isInlineFeature = attributes?.className?.includes( 'is-style-inline-features' );

	const divide = Boolean( window.themeisleGutenberg.ratingScale ) ? 2 : 1;

	const blockProps = useBlockProps({
		id: attributes.id,
		className: isPlaceholder ? 'is-placeholder' : classnames({
			'no-pros-cons': ! ( 0 < attributes.pros.length || 0 < attributes.cons.length ),
			'no-footer': ! ( 0 < productAttributes?.links?.length || 0 < attributes.links.length )
		}),
		style: inlineStyles
	});

	const detailsWidth = {
		25: 'is-quarter',
		50: 'is-half',
		100: 'is-full'
	};

	const mainHeading = attributes.mainHeading || 'h2';

	const SubHeading = attributes.subHeading || 'h3';

	if ( 'isLoading' === status ) {
		return (
			<Fragment>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					getValue={ getValue }
					productAttributes={ productAttributes }
				/>

				<div { ...blockProps }>
					<Placeholder><Spinner /></Placeholder>
				</div>
			</Fragment>
		);
	}

	if ( 'object' === typeof status && null !== status && status.isError ) {
		return (
			<Fragment>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					getValue={ getValue }
					productAttributes={ productAttributes }
				/>

				<div { ...blockProps }>
					<Placeholder
						instructions={ status.message }
					/>
				</div>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				getValue={ getValue }
				productAttributes={ productAttributes }
			/>

			<div { ...blockProps }>
				<div className="o-review__header">
					{
						! productAttributes?.title ? (
							<RichText
								placeholder={ __( 'Name of your product…', 'otter-blocks' ) }
								allowedFormats={ [] }
								value={ attributes.title }
								onChange={ title => setAttributes({ title }) }
								tagName={ mainHeading }
							/>
						) : (
							<RichText.Content
								placeholder={ __( 'Name of your product…', 'otter-blocks' ) }
								allowedFormats={ [] }
								value={ productAttributes?.title }
								tagName={ mainHeading }
							/>
						)
					}

					<div className="o-review__header_meta">
						<div className="o-review__header_ratings">
							<div className="o-review__header_ratings__stars">
								<Stars rating={ Math.max( overallRatings, 1 ) } />
							</div>

							<span>
								{
									sprintf(

										/** translators: %1$f: Rating score, %2$f: Maximum possible score. */
										__( '%1$f out of %2$f', 'otter-blocks' ),
										Math.max( Math.abs( overallRatings / divide ).toFixed( 1 ) || 0, 1 ),
										10 / divide
									)
								}
							</span>
						</div>

						<span
							className="o-review__header_price"
						>
							{ ( ( productAttributes?.price && productAttributes?.discounted ) || ( attributes.price && attributes.discounted ) ) && (
								<del>{ ( getSymbolFromCurrency( productAttributes?.currency || attributes.currency ) ?? '$' ) + '' + ( productAttributes?.price || attributes.price ) || 0 }</del>
							) }

							{ ( attributes.price || attributes.discounted || productAttributes?.price || productAttributes?.discounted ) && ( getSymbolFromCurrency( productAttributes?.currency || attributes.currency ) ?? '$' ) + '' + ( ( productAttributes?.discounted || attributes.discounted ) ? ( productAttributes?.discounted || attributes.discounted ) : ( productAttributes?.price || attributes.price ) ) }
						</span>
					</div>

					<div
						className={ classnames(
							'o-review__header_details',
							{
								'is-single': ! image || ( ! isSelected && ! attributes.description ),
								[ detailsWidth[ attributes.imageWidth ] ]: ( attributes.imageWidth && 33 !== attributes.imageWidth )
							}
						) }
					>
						{ ( productAttributes?.image ) ? (
							<img
								src={ image }
								alt={ productAttributes?.image?.alt }
							/>
						) : attributes.image && (
							<img
								src={ image }
								alt={ attributes.image.alt }
							/>
						) }

						{ ( isSelected || attributes.description ) && ! productAttributes?.description ? (
							<RichText
								placeholder={ __( 'Product description or a small review…', 'otter-blocks' ) }
								value={ attributes.description }
								onChange={ description => setAttributes({ description }) }
								tagName="p"
							/>
						) : (
							<RichText.Content
								placeholder={ __( 'Product description or a small review…', 'otter-blocks' ) }
								value={ productAttributes?.description }
								tagName="p"
							/>
						) }
					</div>
				</div>

				<div className="o-review__left">
					<div className="o-review__left_features">
						{ 0 < attributes.features.length && attributes.features.map( ( feature, index ) => {
							return (
								<div className="o-review__left_feature" key={ index }>
									<RichText
										placeholder={ __( 'Feature title', 'otter-blocks' ) }
										value={ feature.title }
										className="o-review__left_feature_title"
										onChange={ title => changeFeature( index, { title }) }
										tagName="span"
									/>

									<div className="o-review__left_feature_ratings">
										<div className="o-review__left_feature_ratings__stars">
											<Stars rating={ Math.max( feature.rating, 1 ) } />
										</div>
										<span className="o-review__left_feature_num">
											{
												sprintf( 
													/** translators: %1$f: Rating score, %2$f: Maximum possible score. */ 
													__( '%1$f out of %2$f', 'otter-blocks' ), 
													Math.max( Math.abs( feature.rating / divide ).toFixed( 1 ) || 0, 1 ), 
													10 / divide 
												) 
											}
										</span>
									</div>

									{ ( isSelected || feature.description ) && (
										<RichText
											placeholder={ __( 'Feature Description…', 'otter-blocks' ) }
											value={ feature.description }
											className="o-review__left_feature_description"
											onChange={ description => changeFeature( index, { description }) }
											tagName="span"
										/>
									) }
								</div>
							);
						}) }
					</div>
				</div>

				{ ( 0 < attributes.pros.length || 0 < attributes.cons.length ) && (
					<div className="o-review__right">
						{ 0 < attributes.pros.length && (
							<div className="o-review__right_pros">
								<SubHeading>{ attributes.prosLabel }</SubHeading>

								{ attributes.pros.map( ( pro, index ) => (
									<div className="o-review__right_pros_item" key={ index }>
										{ check }

										<RichText
											placeholder={ __( 'Why do you like the product?', 'otter-blocks' ) }
											value={ pro }
											onChange={ value => changePro( index, value ) }
											tagName="p"
										/>
									</div>
								) ) }
							</div>
						) }

						{ 0 < attributes.cons.length && (
							<div className="o-review__right_cons">
								<SubHeading>{ attributes.consLabel }</SubHeading>

								{ attributes.cons.map( ( con, index ) => (
									<div className="o-review__right_cons_item" key={ index }>
										{ close }

										<RichText
											placeholder={ __( 'What can be improved?', 'otter-blocks' ) }
											value={ con }
											onChange={ value => changeCon( index, value ) }
											tagName="p"
										/>
									</div>
								) )}
							</div>
						) }
					</div>
				) }

				{ ( 0 < productAttributes?.links?.length || 0 < attributes.links.length ) && (
					<div className="o-review__footer">
						<SubHeading className="o-review__footer_label">
							{ attributes.buttonsLabel }
						</SubHeading>

						<div className="o-review__footer_buttons">
							{ ( productAttributes?.links || attributes.links ).map( ( link, index ) => (
								<RichText
									key={ index }
									placeholder={ __( 'Button label', 'otter-blocks' ) }
									value={ link.label }
									disabled={ 0 < productAttributes?.links }
									onChange={ label => changeLinks( index, { label }) }
									tagName="span"
								/>
							) ) }
						</div>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
