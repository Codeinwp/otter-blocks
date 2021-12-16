const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const glob = require( 'glob' );
const path = require( 'path' );

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
			frontend: './src/animation/frontend.js',
			'anim-count': './src/animation/frontend/count/index.js'
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
					},
					frontendStyles: {
						name: 'style',
						test: /style\.scss$/,
						chunks: 'all'
					}
				}
			}
		}
	}
];
