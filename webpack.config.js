const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const glob = require( 'glob' );
const path = require( 'path' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );

const blocks = {
	'about-author': {
		block: 'blocks/about-author/block.json'
	},
	'accordion': {
		block: 'blocks/accordion/group/block.json'
	},
	'accordion-item': {
		block: 'blocks/accordion/item/block.json'
	},
	'add-to-cart-button': {
		block: 'blocks/add-to-cart-button/block.json'
	},
	'advanced-heading': {
		block: 'blocks/advanced-heading/block.json'
	},
	'business-hours': {
		block: 'blocks/business-hours/block.json'
	},
	'business-hours-item': {
		block: 'blocks/business-hours/item/block.json'
	},
	'button-group': {
		block: 'blocks/button-group/group/block.json'
	},
	'button': {
		block: 'blocks/button-group/button/block.json'
	},
	'circle-counter': {
		block: 'blocks/circle-counter/block.json'
	},
	'countdown': {
		block: 'blocks/countdown/block.json'
	},
	'flip': {
		block: 'blocks/flip/block.json'
	},
	'font-awesome-icons': {
		block: 'blocks/font-awesome-icons/block.json'
	},
	'form': {
		block: 'blocks/form/block.json'
	},
	'form-input': {
		block: 'blocks/form/input/block.json'
	},
	'form-nonce': {
		block: 'blocks/form/nonce/block.json'
	},
	'form-textarea': {
		block: 'blocks/form/textarea/block.json'
	},
	'google-map': {
		block: 'blocks/google-map/block.json'
	},
	'icon-list': {
		block: 'blocks/icon-list/block.json'
	},
	'icon-list-item': {
		block: 'blocks/icon-list/item/block.json'
	},
	'leaflet-map': {
		block: 'blocks/leaflet-map/block.json'
	}

	// 'lottie': {
	// 	block: 'blocks/lottie/block.json'
	// },
	// 'plugin-card': {
	// 	block: 'blocks/plugin-card/block.json'
	// },
	// 'popup': {
	// 	block: 'blocks/popup/block.json'
	// },
	// 'posts-list': {
	// 	block: 'blocks/posts/block.json'
	// },

	// 'progress-bar': {
	// 	block: 'blocks/progress-bar/block.json'
	// },
	// 'review': {
	// 	block: 'blocks/review/block.json'
	// },
	// 'review-comparison': {
	// 	block: 'blocks/review-comparison/block.json'
	// },
	// 'advanced-columns': {
	// 	block: 'blocks/section/columns/block.json'
	// },
	// 'advanced-column': {
	// 	block: 'blocks/section/column/block.json'
	// },
	// 'sharing-icons': {
	// 	block: 'blocks/sharing-icons/block.json'
	// },
	// 'slider': {
	// 	block: 'blocks/slider/block.json'
	// },
	// 'pricing': {
	// 	block: 'blocks/pricing/block.json'
	// },
	// 'service': {
	// 	block: 'blocks/service/block.json'
	// },
	// 'testimonials': {
	// 	block: 'blocks/testimonials/block.json'
	// },
	// 'tabs': {
	// 	block: 'blocks/tabs/group/block.json'
	// },
	// 'tabs-item': {
	// 	block: 'blocks/tabs/item/block.json'
	// },
	// 'woo-comparison': {
	// 	block: 'blocks/woo-comparison/block.json'
	// },
	// 'product-add-to-cart': {
	// 	block: 'woocommerce/add-to-cart/block.json'
	// },
	// 'product-images': {
	// 	block: 'woocommerce/images/block.json'
	// },
	// 'product-meta': {
	// 	block: 'woocommerce/meta/block.json'
	// },
	// 'product-price': {
	// 	block: 'woocommerce/price/block.json'
	// },
	// 'product-rating': {
	// 	block: 'woocommerce/rating/block.json'
	// },
	// 'product-related-products': {
	// 	block: 'woocommerce/related-products/block.json'
	// },
	// 'product-short-description': {
	// 	block: 'woocommerce/short-description/block.json'
	// },
	// 'product-stock': {
	// 	block: 'woocommerce/stock/block.json'
	// },
	// 'product-tabs': {
	// 	block: 'woocommerce/tabs/block.json'
	// },
	// 'product-title': {
	// 	block: 'woocommerce/title/block.json'
	// },
	// 'product-upsells': {
	// 	block: 'woocommerce/upsells/block.json'
	// }
};

const blockFiles = Object.keys( blocks ).filter( block => blocks[ block ].block !== undefined )
	.map( block => {
		return {
			source: `src/blocks/${ blocks[ block ].block }`,
			destination: `build/blocks/${ block }/`
		};
	});

const folders = Object.keys( blocks ).map( block => `build/blocks/${ block }` );

module.exports = [
	{

		// OTTER DASHBOARD
		...defaultConfig,
		stats: 'minimal',
		mode: NODE_ENV,
		entry: {
			index: './src/dashboard/index.js'
		},
		output: {
			path: path.resolve( __dirname, './build/dashboard' )
		}
	},
	{

		// ANIMATION
		...defaultConfig,
		stats: 'minimal',
		mode: NODE_ENV,
		entry: {
			index: './src/animation/index.js',
			frontend: './src/animation/frontend.js'
		},
		output: {
			path: path.resolve( __dirname, './build/animation' )
		}
	},
	{

		// CSS
		...defaultConfig,
		stats: 'minimal',
		mode: NODE_ENV,
		entry: {
			index: './src/css/index.js'
		},
		output: {
			path: path.resolve( __dirname, './build/css' )
		}
	},
	{

		// Export Import
		...defaultConfig,
		stats: 'minimal',
		mode: NODE_ENV,
		entry: {
			index: './src/export-import/index.js'
		},
		output: {
			path: path.resolve( __dirname, './build/export-import' )
		}
	},
	{

		// OTTER BLOCKS
		...defaultConfig,
		stats: 'minimal',
		devtool: 'development' === NODE_ENV ? 'eval-source-map' : undefined,
		mode: NODE_ENV,
		entry: {
			blocks: [
				'./src/blocks/index.js',
				'./src/blocks/plugins/registerPlugin.js',
				...glob.sync( './src/blocks/blocks/**/index.js' )
			],
			woocommerce: [
				...glob.sync( './src/blocks/woocommerce/**/index.js' )
			],
			'leaflet-map': './src/blocks/frontend/leaflet-map/index.js',
			maps: './src/blocks/frontend/google-map/index.js',
			slider: './src/blocks/frontend/slider/index.js',
			'progress-bar': './src/blocks/frontend/progress-bar/index.js',
			'circle-counter': './src/blocks/frontend/circle-counter/index.js',
			lottie: './src/blocks/frontend/lottie/index.js',
			tabs: './src/blocks/frontend/tabs/index.js',
			masonry: './src/blocks/frontend/masonry/index.js',
			form: './src/blocks/frontend/form/index.js',
			countdown: './src/blocks/frontend/countdown/index.js',
			popup: './src/blocks/frontend/popup/index.js'
		},
		output: {
			path: path.resolve( __dirname, './build/blocks' ),
			filename: '[name].js',
			chunkFilename: 'chunk-[name].js'
		},
		optimization: {
			...defaultConfig.optimization,
			splitChunks: {
				cacheGroups: {
					vendor: {
						name: 'vendor',
						test: /[\\/]node_modules[\\/]/,
						chunks: 'initial'
					},
					editorStyles: {
						name: 'editor',
						test: /editor\.scss$/,
						chunks: 'all'
					}
				}
			}
		},
		plugins: [
			...defaultConfig.plugins,
			new FileManagerPlugin({
				events: {
					onEnd: {
						mkdir: folders,
						copy: blockFiles
					}
				}
			})
		]
	}
];
