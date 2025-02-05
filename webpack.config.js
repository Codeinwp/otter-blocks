const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const ANALYZER = 'true' === process.env.NODE_ANALYZER ? true : false;
const path = require( 'path' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );
const blocks = require( './blocks.json' );

defaultConfig.plugins.splice( 1, 1 ); // We need to remove Core's Copy Files plugin.

const blockFiles = Object.keys( blocks ).filter( block => blocks[ block ].block !== undefined && true !== blocks[ block ]?.isPro )
	.map( block => {
		return {
			source: `src/${ blocks[ block ].block }`,
			destination: `build/blocks/${ block }/`
		};
	});

const blockFolders = Object.keys( blocks ).filter( block => true !== blocks[ block ]?.isPro ).map( block => `build/blocks/${ block }` );

const changeTextDomain = textdomain => {
	return {
		test: /\.(j|t)sx?$/,
		exclude: /node_modules/,
		use: [
			{
				loader: require.resolve( 'babel-loader' ),
				options: {
					cacheDirectory:
					process.env.BABEL_CACHE_DIRECTORY || true,
					babelrc: false,
					configFile: false,
					presets: [
						require.resolve(
							'@wordpress/babel-preset-default'
						)
					],
					plugins: [
						[ '@automattic/babel-plugin-replace-textdomain', { textdomain }]
					]
				}
			}
		]
	};
};

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
		},
		plugins: [
			...defaultConfig.plugins,
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
	},
	{

		// OTTER ONBOARDING
		...defaultConfig,
		stats: 'minimal',
		mode: NODE_ENV,
		entry: {
			index: './src/onboarding/index.js'
		},
		output: {
			path: path.resolve( __dirname, './build/onboarding' )
		},
		plugins: [
			...defaultConfig.plugins,
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
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
		},
		module: {
			rules: [
				changeTextDomain('otter-blocks'),
				...defaultConfig.module.rules
			]
		},
		plugins: [
			...defaultConfig.plugins,
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
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
		},
		module: {
			rules: [
				changeTextDomain('otter-blocks'),
				...defaultConfig.module.rules
			]
		},
		plugins: [
			...defaultConfig.plugins,
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
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
		},
		module: {
			rules: [
				changeTextDomain('otter-blocks'),
				...defaultConfig.module.rules
			]
		},
		plugins: [
			...defaultConfig.plugins,
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
	},
	{

		// OTTER BLOCKS
		...defaultConfig,
		stats: 'minimal',
		devtool: 'development' === NODE_ENV ? 'inline-source-map' : undefined,
		mode: NODE_ENV,
		entry: {
			blocks: [
				'./src/blocks/index.js',
				'./src/blocks/blocks/index.js',
				'./src/blocks/components/index.js',
				'./src/blocks/helpers/index.js',
				'./src/blocks/plugins/registerPlugin.tsx'
			],
			'leaflet-map': './src/blocks/frontend/leaflet-map/index.js',
			'leaflet-gesture-handling': './src/blocks/frontend/leaflet-map/leaflet-gesture-handling.js',
			maps: './src/blocks/frontend/google-map/index.js',
			slider: './src/blocks/frontend/slider/index.js',
			'progress-bar': './src/blocks/frontend/progress-bar/index.js',
			'circle-counter': './src/blocks/frontend/circle-counter/index.js',
			lottie: './src/blocks/frontend/lottie/index.js',
			tabs: './src/blocks/frontend/tabs/index.js',
			masonry: './src/blocks/frontend/masonry/index.js',
			form: './src/blocks/frontend/form/index.js',
			countdown: './src/blocks/frontend/countdown/index.ts',
			popup: './src/blocks/frontend/popup/index',
			sticky: './src/blocks/frontend/sticky/index.ts',
			accordion: './src/blocks/frontend/accordion/index.js',
			'live-search': './src/blocks/frontend/live-search/index.ts',
			'live-search-style': './src/blocks/frontend/live-search/style.scss'
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
						copy: blockFiles,
						delete: [
							'build/animation/blocks/',
							'build/animation/pro/',
							'build/css/blocks/',
							'build/css/pro/',
							'build/dashboard/blocks/',
							'build/dashboard/pro/',
							'build/export-import/blocks/',
							'build/export-import/pro/',
							'build/blocks/pro/',
							'build/blocks/blocks/',
							'build/pro/pro',
							'build/pro/blocks',
							'build/onboarding/blocks/',
							'build/onboarding/pro/'
						]
					}
				},
				runOnceInWatchMode: false,
				runTasksInSeries: false
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
	}
];
