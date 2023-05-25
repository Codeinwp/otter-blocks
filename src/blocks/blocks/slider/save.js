/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { SliderControlsBullets } from './components/slider-controls.js';
import { _px } from '../../helpers/helper-functions.js';

const Save = ({
	attributes
}) => {
	const autoplay = attributes.autoplay ? ( 2 !== attributes.delay ? attributes.delay * 1000 : attributes.autoplay ) : attributes.autoplay;

	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: 'glide',
		'data-per-view': attributes.perView,
		'data-gap': attributes.gap,
		'data-peek': attributes.peek,
		'data-autoplay': autoplay,
		'data-height': _px( attributes.height ),
		'data-hide-arrows': attributes.hideArrows,
		...( attributes.transition && {
			'data-transition': attributes.transition
		})
	});

	return (
		<div { ...blockProps }>
			<div className="glide__track" data-glide-el="track">
				<div className="glide__slides">
					{ attributes.images.map( image => {
						return (
							<div
								key={ image.id }
								className="wp-block-themeisle-blocks-slider-item-wrapper glide__slide"
								tabIndex="0"
							>
								<figure>
									<img
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
