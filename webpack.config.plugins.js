const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const path = require( 'path' );

defaultConfig.plugins.splice( 1, 1 ); // We need to remove Core's Copy Files plugin.

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
			'anim-typing': './src/animation/frontend/typing/index.js',
			'welcome-notice': './src/animation/welcome-notice/index.js'
		},
		output: {
			path: path.resolve( __dirname, './build/animation' )
		},
		module: {
			rules: [
				changeTextDomain('blocks-animation'),
				...defaultConfig.module.rules
			]
		},
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
		module: {
			rules: [
				changeTextDomain('blocks-css'),
				...defaultConfig.module.rules
			]
		},
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
		module: {
			rules: [
				changeTextDomain('blocks-export-import'),
				...defaultConfig.module.rules
			]
		},
		...plugins
	}
];
