const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const path = require( 'path' );

defaultConfig.plugins.splice( 1, 1 ); // We need to remove Core's Copy Files plugin.

const getConfig = textdomain => {
	return {
		rules: [
			{
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
								[ '@automattic/babel-plugin-replace-textdomain', { 'textdomain': textdomain }]
							]
						}
					}
				]
			},
			...defaultConfig.module.rules
		]
	};
};

const plugins = {
	plugins: [
		...defaultConfig.plugins,
		new FileManagerPlugin({
			events: {
				onEnd: {
					delete: [
						'build/animation/blocks/',
						'build/animation/pro/',
						'build/css/blocks/',
						'build/css/pro/',
						'build/export-import/blocks/',
						'build/export-import/pro/'
					]
				}
			},
			runOnceInWatchMode: false,
			runTasksInSeries: true
		})
	]
};

module.exports = [
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
		module: { ...getConfig( 'blocks-animation' ) },
		...plugins
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
		module: { ...getConfig( 'blocks-css' ) },
		...plugins
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
		module: { ...getConfig( 'blocks-export-import' ) },
		...plugins
	}
];
