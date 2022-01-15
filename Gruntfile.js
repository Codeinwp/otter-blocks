/* eslint-disable camelcase */
/* jshint node:true */
/* global require */
const fs = require( 'fs' );

module.exports = function( grunt ) {
	grunt.loadNpmTasks( 'grunt-version' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	const blocks = {
		'about-author': {
			block: 'blocks/about-author/block.json',
			assets: {
				'about-author/style.css': 'blocks/about-author/style.scss'
			}
		},
		'accordion': {
			block: 'blocks/accordion/group/block.json',
			assets: {
				'accordion/editor.css': 'blocks/accordion/editor.scss',
				'accordion/style.css': 'blocks/accordion/style.scss'
			}
		},
		'advanced-heading': {
			block: 'blocks/advanced-heading/block.json',
			assets: {
				'advanced-heading/editor.css': 'blocks/advanced-heading/editor.scss'
			}
		},
		'business-hours': {
			block: 'blocks/business-hours/block.json',
			assets: {
				'business-hours/editor.css': 'blocks/business-hours/editor.scss',
				'business-hours/style.css': 'blocks/business-hours/style.scss'
			}
		},
		'button-group': {
			block: 'blocks/button-group/group/block.json',
			assets: {
				'button-group/editor.css': 'blocks/button-group/editor.scss',
				'button-group/style.css': 'blocks/button-group/style.scss'
			}
		},
		'circle-counter': {
			block: 'blocks/circle-counter/block.json',
			assets: {
				'circle-counter/style.css': 'blocks/circle-counter/style.scss'
			}
		},
		'countdown': {
			block: 'blocks/countdown/block.json',
			assets: {
				'countdown/style.css': 'blocks/countdown/style.scss'
			}
		},
		'flip': {
			block: 'blocks/flip/block.json',
			assets: {
				'flip/style.css': 'blocks/flip/style.scss'
			}
		},
		'font-awesome-icons': {
			block: 'blocks/font-awesome-icons/block.json',
			assets: {
				'font-awesome-icons/style.css': 'blocks/font-awesome-icons/style.scss'
			}
		},
		'form': {
			block: 'blocks/form/block.json',
			assets: {
				'form/editor.css': 'blocks/form/editor.scss',
				'form/style.css': 'blocks/form/style.scss'
			}
		},
		'form-input': {
			block: 'blocks/form-input/block.json'
		},
		'form-nonce': {
			block: 'blocks/form-nonce/block.json'
		},
		'form-textarea': {
			block: 'blocks/form-textarea/block.json'
		},
		'google-map': {
			block: 'blocks/google-map/block.json',
			assets: {
				'google-map/editor.css': 'blocks/google-map/editor.scss',
				'google-map/style.css': 'blocks/google-map/style.scss'
			}
		},
		'icon-list': {
			block: 'blocks/icon-list/block.json',
			assets: {
				'icon-list/editor.css': 'blocks/icon-list/editor.scss',
				'icon-list/style.css': 'blocks/icon-list/style.scss'
			}
		},
		'leaflet-map': {
			block: 'blocks/leaflet-map/block.json',
			assets: {
				'leaflet-map/editor.css': 'blocks/leaflet-map/editor.scss',
				'leaflet-map/style.css': 'blocks/leaflet-map/style.scss'
			}
		},
		'lottie': {
			block: 'blocks/lottie/block.json',
			assets: {
				'lottie/editor.css': 'blocks/lottie/editor.scss'
			}
		},
		'plugin-card': {
			block: 'blocks/plugin-card/block.json',
			assets: {
				'plugin-card/editor.css': 'blocks/plugin-card/editor.scss',
				'plugin-card/style.css': 'blocks/plugin-card/style.scss'
			}
		},
		'popup': {
			block: 'blocks/popup/block.json',
			assets: {
				'popup/style.css': 'blocks/popup/style.scss'
			}
		},
		'posts-grid': {
			block: 'blocks/posts/block.json',
			assets: {
				'posts-grid/editor.css': 'blocks/posts/editor.scss',
				'posts-grid/style.css': 'blocks/posts/style.scss'
			}
		},
		'progress-bar': {
			block: 'blocks/progress-bar/block.json',
			assets: {
				'progress-bar/style.css': 'blocks/progress-bar/style.scss'
			}
		},
		'review': {
			block: 'blocks/review/block.json',
			assets: {
				'review/editor.css': 'blocks/review/editor.scss',
				'review/style.css': 'blocks/review/style.scss'
			}
		},
		'review-comparison': {
			block: 'blocks/review-comparison/block.json',
			assets: {
				'review-comparison/editor.css': 'blocks/review-comparison/editor.scss',
				'review-comparison/style.css': 'blocks/review-comparison/style.scss'
			}
		}

		// 'advanced-columns': {
		// 	block: 'blocks/section/columns/block.json',
		// 	assets: {
		// 		'advanced-columns/editor.css': 'blocks/section/editor.scss',
		// 		'advanced-columns/style.css': 'blocks/section/style.scss'
		// 	}
		// },
		// 'advanced-column': {
		// 	block: 'blocks/section/column/block.json'
		// },
		// 'sharing-icons': {
		// 	block: 'blocks/sharing-icons/block.json',
		// 	assets: {
		// 		'sharing-icons/editor.css': 'blocks/sharing-icons/editor.scss',
		// 		'sharing-icons/style.css': 'blocks/sharing-icons/style.scss'
		// 	}
		// },
		// 'slider': {
		// 	block: 'blocks/slider/block.json',
		// 	assets: {
		// 		'slider/editor.css': 'blocks/slider/editor.scss',
		// 		'slider/style.css': 'blocks/slider/style.scss'
		// 	}
		// },
		// 'pricing': {
		// 	block: 'blocks/pricing/block.json'
		// },
		// 'service': {
		// 	block: 'blocks/service/block.json'
		// },
		// 'testimonials': {
		// 	block: 'blocks/testimonials/block.json'
		// },
		// 'tabs': {
		// 	block: 'blocks/tabs/group/block.json',
		// 	assets: {
		// 		'tabs/editor.css': 'blocks/tabs/editor.scss',
		// 		'tabs/style.css': 'blocks/tabs/style.scss'
		// 	}
		// },
		// 'tabs-item': {
		// 	block: 'blocks/tabs/item/block.json'
		// },
		// 'woo-comparison': {
		// 	block: 'blocks/woo-comparison/block.json',
		// 	assets: {
		// 		'woo-comparison/editor.css': 'blocks/woo-comparison/editor.scss'
		// 	}
		// },
		// 'product-add-to-cart': {
		// 	block: 'woocommerce/add-to-cart/block.json'
		// },
		// 'product-images': {
		// 	block: 'woocommerce/images/block.json'
		// },
		// 'product-meta': {
		// 	block: 'woocommerce/meta/block.json'
		// },
		// 'product-price': {
		// 	block: 'woocommerce/price/block.json'
		// },
		// 'product-rating': {
		// 	block: 'woocommerce/rating/block.json'
		// },
		// 'product-related-products': {
		// 	block: 'woocommerce/related-products/block.json'
		// },
		// 'product-short-description': {
		// 	block: 'woocommerce/short-description/block.json'
		// },
		// 'product-stock': {
		// 	block: 'woocommerce/stock/block.json'
		// },
		// 'product-tabs': {
		// 	block: 'woocommerce/tabs/block.json'
		// },
		// 'product-title': {
		// 	block: 'woocommerce/title/block.json'
		// },
		// 'product-upsells': {
		// 	block: 'woocommerce/upsells/block.json'
		// }
	};

	const sassFiles = {};

	const sourceFiles = [];

	Object.keys( blocks ).filter( block => blocks[ block ].assets !== undefined )
		.forEach( block => {
			Object.keys( blocks[ block ].assets ).forEach( s => {
				sassFiles[ `build/blocks/${ s }` ] = `src/blocks/${ blocks[ block ].assets[ s ] }`;
				sourceFiles.push( `src/blocks/${ blocks[ block ].assets[ s ] }` );
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
					'plugins/blocks-export-import/blocks-export-imports.php'
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
