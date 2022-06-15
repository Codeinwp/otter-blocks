/* eslint-disable camelcase */
/* jshint node:true */
/* global require */
const fs = require( 'fs' );
const blocks = require( './blocks.json' );

module.exports = function( grunt ) {
	grunt.loadNpmTasks( 'grunt-version' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	const sassFiles = {};

	const sourceFiles = [];

	Object.keys( blocks ).filter( block => blocks[ block ].assets !== undefined )
		.forEach( block => {
			Object.keys( blocks[ block ].assets ).forEach( s => {
				if ( blocks[ block ]?.isPro ) {
					sassFiles[ `build/pro/${ s }` ] = `src/${ blocks[ block ].assets[ s ] }`;
				} else {
					sassFiles[ `build/blocks/${ s }` ] = `src/${ blocks[ block ].assets[ s ] }`;
				}
				sourceFiles.push( `src/${ blocks[ block ].assets[ s ] }` );
			});
		});

	grunt.initConfig({
		sass: {
			dist: {
				options: {
					sourcemap: false,
					style: 'compressed'
				},
				files: sassFiles
			}
		},
		watch: {
			sass: {
				files: sourceFiles,
				tasks: [ 'build' ],
				options: {
					atBegin: true
				}
			}
		},
		version: {
			json: {
				options: {
					flags: ''
				},
				src: [ 'package.json', 'composer.json', 'package-lock.json' ]
			},
			metatag: {
				options: {
					prefix: 'Version:\\s*',
					flags: ''
				},
				src: [
					'otter-blocks.php',
					'plugins/blocks-animation/blocks-animation.php',
					'plugins/blocks-css/blocks-css.php',
					'plugins/blocks-export-import/blocks-export-imports.php',
					'plugins/otter-pro/otter-pro.php'
				]
			},
			php: {
				options: {
					prefix: 'OTTER_BLOCKS_VERSION\', \'',
					flags: ''
				},
				src: [ 'otter-blocks.php' ]
			},
			blocks: {
				options: {
					prefix: 'THEMEISLE_BLOCKS_VERSION\', \'',
					flags: ''
				},
				src: [ 'inc/class-main.php' ]
			},
			pro: {
				options: {
					prefix: 'OTTER_PRO_VERSION\', \'',
					flags: ''
				},
				src: [ 'plugins/otter-pro/otter-pro.php' ]
			}
		},
		wp_readme_to_markdown: {
			plugin: {
				files: {
					'readme.md': 'readme.txt',
					'plugins/blocks-animation/readme.md': 'plugins/blocks-animation/readme.txt',
					'plugins/blocks-css/readme.md': 'plugins/blocks-css/readme.txt',
					'plugins/blocks-export-import/readme.md': 'plugins/blocks-export-import/readme.txt'
				}
			}
		}
	});

	grunt.registerTask( 'build', 'Generate CSS', function() {
		const done = this.async();

		function checkFlag() {
			if ( fs.existsSync( `./build/blocks/${ Object.keys( blocks )[0] }` ) ) {
				grunt.task.run( 'sass' );
				done();
			} else {
				grunt.log.writeln( 'Waiting...' );
				setTimeout( checkFlag, 5000 );
			}
		}

		checkFlag();
	});
};
