/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { omit } from 'lodash';

import { RichText } from '@wordpress/block-editor';

import SliderControls from './components/slider-controls.js';

const attributes = {
	id: {
		type: 'string'
	},
	align: {
		type: 'string'
	},
	images: {
		type: 'array',
		default: [],
		source: 'query',
		selector: '.wp-block-themeisle-blocks-slider-item-wrapper',
		query: {
			id: {
				type: 'number',
				source: 'attribute',
				selector: 'img',
				attribute: 'data-id'
			},
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'img',
				attribute: 'src'
			},
			alt: {
				type: 'string',
				source: 'attribute',
				selector: 'img',
				attribute: 'alt',
				default: ''
			},
			caption: {
				type: 'string',
				source: 'html',
				selector: 'figcaption',
				default: ''
			}
		}
	},
	perView: {
		type: 'number',
		default: 1
	},
	gap: {
		type: 'number',
		default: 0
	},
	peek: {
		type: 'number',
		default: 0
	},
	autoplay: {
		type: 'boolean',
		default: true
	},
	height: {
		type: 'number',
		default: 400
	}
};

const deprecated = [ {
	attributes: {
		...omit(
			attributes,
			[ 'align' ]
		)
	},

	supports: {
		align: [ 'wide', 'full' ]
	},

	save: ({
		attributes,
		className
	}) => {
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
				data-autoplay={ attributes.autoplay }
			>
				<div className="glide__track" data-glide-el="track">
					<div
						className="glide__slides"
						style={ {
							height: `${ attributes.height }px`
						} }
					>
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

					<SliderControls attributes={ attributes } />
				</div>
			</div>
		);
	}
}, {
	attributes: {
		...omit(
			attributes,
			[ 'align' ]
		),
		delay: {
			type: 'number',
			default: 2
		},
		hideArrows: {
			type: 'boolean',
			default: false
		},
		hideBullets: {
			type: 'boolean',
			default: false
		}
	},

	supports: {
		align: [ 'wide', 'full' ]
	},

	save: ({
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

					<SliderControls attributes={ attributes } />
				</div>
			</div>
		);
	}
} ];

export default deprecated;
