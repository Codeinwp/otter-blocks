const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const glob = require( 'glob' );
const path = require( 'path' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );
const blocks = require( './blocks.json' );

const blockFiles = Object.keys( blocks ).filter( block => blocks[ block ].block !== undefined && true !== blocks[ block ]?.isPro )
	.map( block => {
		return {
			source: `src/${ blocks[ block ].block }`,
			destination: `build/blocks/${ block }/`
		};
	});

const blockFolders = Object.keys( blocks ).filter( block => true !== blocks[ block ]?.isPro ).map( block => `build/blocks/${ block }` );

const blockFilesPro = Object.keys( blocks ).filter( block => blocks[ block ].block !== undefined && true === blocks[ block ]?.isPro )
	.map( block => {
		return {
			source: `src/${ blocks[ block ].block }`,
			destination: `build/pro/${ block }/`
		};
	});

const blockFoldersPro = Object.keys( blocks ).filter( block => true === blocks[ block ]?.isPro ).map( block => `build/pro/${ block }` );

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
			'anim-count': './src/animation/frontend/count/index.js',
			'anim-typing': './src/animation/frontend/typing/index.js'
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

		// OTTER PRO
		...defaultConfig,
		stats: 'minimal',
		devtool: 'development' === NODE_ENV ? 'eval-source-map' : undefined,
		mode: NODE_ENV,
		entry: {
			blocks: [
				'./src/pro/index.js',
				'./src/pro/plugins/index.js',
				...glob.sync( './src/pro/blocks/**/index.js' )
			],
			woocommerce: [
				...glob.sync( './src/pro/woocommerce/**/index.js' )
			]
		},
		output: {
			path: path.resolve( __dirname, './build/pro' ),
			filename: '[name].js',
			chunkFilename: 'chunk-[name].js'
		},
		optimization: {
			...defaultConfig.optimization,
			splitChunks: {
				cacheGroups: {
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
						mkdir: blockFoldersPro,
						copy: blockFilesPro
					}
				},
				runOnceInWatchMode: false,
				runTasksInSeries: true
			})
		]
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
				'./src/blocks/components/index.js',
				'./src/blocks/helpers/index.js',
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
			popup: './src/blocks/frontend/popup/index.js',
			sticky: './src/blocks/frontend/sticky/index.js'
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
						mkdir: blockFolders,
						copy: blockFiles
					}
				},
				runOnceInWatchMode: false,
				runTasksInSeries: true
			})
		]
	}
];
