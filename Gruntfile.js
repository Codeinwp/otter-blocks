/* jshint node:true */
/* global require */

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-version');
	grunt.loadNpmTasks('grunt-wp-readme-to-markdown');
	grunt.initConfig({
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
			}
		},
		wp_readme_to_markdown: {
			plugin: {
				files: {
					'readme.md': 'readme.txt',
					'plugins/blocks-animation/readme.md': 'plugins/blocks-animation/readme.txt',
					'plugins/blocks-css/readme.md': 'plugins/blocks-css/readme.txt',
					'plugins/blocks-export-import/readme.md': 'plugins/blocks-export-import/readme.txt'
				},
			},
		},
	});

};