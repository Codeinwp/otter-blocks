const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const glob = require( 'glob' );
const path = require( 'path' );
const _ = require( 'lodash' );

const blockNames = [
	'about-author',
	'accordion',
	'add-to-cart-button',
	'advanced-heading',
	'business-hours',
	'button-group',
	'circle-counter',
	'countdown',
	'font-awesome-icons',
	'form',
	'google-maps',
	'icon-list',
	'leaflet-map',
	'lottie',
	'plugin-card',
	'popup',
	'posts',
	'progress-bar',
	'review',
	'review-comparision',
	'section',
	'sharing-icons',
	'slider',
	'structural',
	'tabs',
	'woo-comparision'
];

const frontendCSSEntries = _.omitBy(
	_.zipObject(
		blockNames,
		blockNames.map( name => glob.sync( `./src/blocks/blocks/${name}/**/style.scss` ) )
	),
	_.isEmpty
);

console.log( frontendCSSEntries );

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

		// OTTER BLOCKS
		...defaultConfig,
		stats: 'minimal',
		devtool: 'eval-source-map',
		mode: NODE_ENV,
		entry: {
			blocks: [
				'./src/blocks/index.js',
				'./src/blocks/plugins/registerPlugin.js',
				...glob.sync( './src/blocks/blocks/**/index.js' )
			],

			...frontendCSSEntries,
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

					// frontendStyles: {
					// 	name: 'style',
					// 	test: /style\.scss$/,
					// 	chunks: 'all'
					// }
				}
			}
		}
	}
];
