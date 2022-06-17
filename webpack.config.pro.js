const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin;
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

module.exports = [
	{

		// OTTER PRO
		...defaultConfig,
		stats: 'minimal',
		devtool: 'development' === NODE_ENV ? 'eval-source-map' : undefined,
		mode: NODE_ENV,
		entry: {
			blocks: [
				'./src/pro/index.js',
				'./src/pro/blocks/index.js',
				'./src/pro/plugins/index.js'
			],
			woocommerce: './src/pro/woocommerce/index.js'
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
				}
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
	}
];
