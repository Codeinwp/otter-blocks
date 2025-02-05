const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const ANALYZER = 'true' === process.env.NODE_ANALYZER ? true : false;
const path = require( 'path' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );
const blocks = require( './blocks.json' );

defaultConfig.plugins.splice( 1, 1 ); // We need to remove Core's Copy Files plugin.

const blockFilesPro = Object.keys( blocks ).filter( block => blocks[ block ].block !== undefined && true === blocks[ block ]?.isPro )
	.map( block => {
		return {
			source: `src/${ blocks[ block ].block }`,
			destination: `build/pro/${ block }/`
		};
	});

const blockFoldersPro = Object.keys( blocks ).filter( block => true === blocks[ block ]?.isPro ).map( block => `build/pro/${ block }` );

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

		// OTTER PRO
		...defaultConfig,
		stats: 'minimal',
		devtool: 'development' === NODE_ENV ? 'eval-source-map' : undefined,
		mode: NODE_ENV,
		entry: {
			blocks: [
				'./src/pro/blocks/index.js',
				'./src/pro/plugins/index.js'
			],
			dashboard: './src/pro/dashboard/index.js',
			woocommerce: './src/pro/woocommerce/index.js'
		},
		output: {
			path: path.resolve( __dirname, './build/pro' ),
			filename: '[name].js',
			chunkFilename: 'chunk-[name].js'
		},
		module: {
			rules: [
				changeTextDomain('otter-pro'),
				...defaultConfig.module.rules
			]
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
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
	}
];
