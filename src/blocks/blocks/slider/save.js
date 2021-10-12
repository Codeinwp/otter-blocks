/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { SliderControlsBullets } from './components/slider-controls.js';

const Save = ({
	attributes,
	className
}) => {
	const autoplay = attributes.autoplay ? ( 2 !== attributes.delay ? attributes.delay * 1000 : attributes.autoplay ) : attributes.autoplay;

	return (
		<div
			id={ attributes.id }
			className={ classnames(
				'wp-block-themeisle-blocks-slider',
				'glide',
				className
			) }
			data-per-view={ attributes.perView }
			data-gap={ attributes.gap }
			data-peek={ attributes.peek }
			data-autoplay={ autoplay }
			data-height={ `${ attributes.height }px` }
			data-hide-arrows={ attributes.hideArrows }
		>
			<div className="glide__track" data-glide-el="track">
				<div className="glide__slides">
					{ attributes.images.map( image => {
						return (
							<div
								className="wp-block-themeisle-blocks-slider-item-wrapper glide__slide"
								tabIndex="0"
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

									{ ! RichText.isEmpty( image.caption ) && (
										<RichText.Content
											tagName="figcaption"
											value={ image.caption }
										/>
									) }
								</figure>
							</div>
						);
					}) }
				</div>

				<SliderControlsBullets attributes={ attributes } />
			</div>
		</div>
	);
};

export default Save;
