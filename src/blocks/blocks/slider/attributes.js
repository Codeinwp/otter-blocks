const attributes = {
	id: {
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
	},
	height: {
		type: 'number',
		default: 400
	}
};

export default attributes;
