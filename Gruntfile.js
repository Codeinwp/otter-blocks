/* eslint-disable camelcase */
/* jshint node:true */
/* global require */

module.exports = function( grunt ) {
	grunt.loadNpmTasks( 'grunt-version' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( 'grunt-mkdir' );
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );

	const blocks = {
		'about-author': {
			block: 'blocks/about-author/block.json',
			sass: {
				'about-author/editor.css': 'blocks/about-author/editor.scss',
				'about-author/style.css': 'blocks/about-author/style.scss'
			}
		},
		'accordion': {
			block: 'blocks/accordion/group/block.json',
			sass: {
				'accordion/editor.css': 'blocks/accordion/editor.scss',
				'accordion/style.css': 'blocks/accordion/style.scss'
			}
		},
		'accordion-item': {
			block: 'blocks/accordion/item/block.json'
		},
		'add-to-cart-button': {
			block: 'blocks/add-to-cart-button/block.json'
		},
		'advanced-heading': {
			block: 'blocks/advanced-heading/block.json',
			sass: {
				'advanced-heading/editor.css': 'blocks/advanced-heading/editor.scss',
				'advanced-heading/style.css': 'blocks/advanced-heading/style.scss'
			}
		},
		'business-hours': {
			block: 'blocks/business-hours/block.json',
			sass: {
				'business-hours/editor.css': 'blocks/business-hours/editor.scss',
				'business-hours/style.css': 'blocks/business-hours/style.scss'
			}
		},
		'business-hours-item': {
			block: 'blocks/business-hours/item/block.json'
		},
		'button-group': {
			block: 'button-group/group/block.json',
			sass: {
				'button-group/editor.css': 'blocks/button-group/editor.scss',
				'button-group/style.css': 'blocks/button-group/style.scss'
			}
		},
		'button': {
			block: 'blocks/button-group/button/block.json'
		},
		'circle-counter': {
			block: 'blocks/circle-counter/block.json',
			sass: {
				'circle-counter/editor.css': 'blocks/circle-counter/editor.scss',
				'circle-counter/style.css': 'blocks/circle-counter/style.scss'
			}
		},
		'countdown': {
			block: 'blocks/countdown/block.json',
			sass: {
				'countdown/editor.css': 'blocks/countdown/editor.scss',
				'countdown/style.css': 'blocks/countdown/style.scss'
			}
		},
		'flip': {
			block: 'blocks/flip/block.json',
			sass: {
				'flip/editor.css': 'blocks/flip/editor.scss',
				'flip/style.css': 'blocks/flip/style.scss'
			}
		},
		'font-awesome-icons': {
			block: 'blocks/font-awesome-icons/block.json',
			sass: {
				'font-awesome-icons/editor.css': 'blocks/font-awesome-icons/editor.scss',
				'font-awesome-icons/style.css': 'blocks/font-awesome-icons/style.scss'
			}
		},
		'form': {
			block: 'blocks/form/block.json',
			sass: {
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
		'google-maps': {
			block: 'blocks/google-map/block.json',
			sass: {
				'google-maps/editor.css': 'blocks/google-maps/editor.scss',
				'google-maps/style.css': 'blocks/google-maps/style.scss'
			}
		},
		'icon-list': {
			block: 'blocks/icon-list/block.json',
			sass: {
				'icon-list/editor.css': 'blocks/icon-list/editor.scss',
				'icon-list/style.css': 'blocks/icon-list/style.scss'
			}
		},
		'icon-list-item': {
			block: 'blocks/icon-list/item/block.json'
		},
		'leaflet-map': {
			block: 'blocks/leaflet-map/block.json',
			sass: {
				'leaflet-map/editor.css': 'blocks/leaflet-map/editor.scss',
				'leaflet-map/style.css': 'blocks/leaflet-map/style.scss'
			}
		},
		'lottie': {
			block: 'blocks/lottie/block.json',
			sass: {
				'lottie/editor.css': 'blocks/lottie/editor.scss'
			}
		},
		'plugin-card': {
			block: 'blocks/plugin-card/block.json',
			sass: {
				'plugin-card/editor.css': 'blocks/plugin-card/editor.scss',
				'plugin-card/style.css': 'blocks/plugin-card/style.scss'
			}
		},
		'popup': {
			block: 'blocks/popup/block.json',
			sass: {
				'popup/editor.css': 'blocks/popup/editor.scss',
				'popup/style.css': 'blocks/popup/style.scss'
			}
		},
		'posts-list': {
			block: 'blocks/posts/block.json',
			sass: {
				'posts/editor.css': 'blocks/posts/editor.scss',
				'posts/style.css': 'blocks/posts/style.scss'
			}
		},

		'progress-bar': {
			block: 'blocks/progress-bar/block.json',
			sass: {
				'progress-bar/editor.css': 'blocks/progress-bar/editor.scss',
				'progress-bar/style.css': 'blocks/progress-bar/style.scss'
			}
		},
		'review': {
			block: 'blocks/review/block.json',
			sass: {
				'review/editor.css': 'blocks/review/editor.scss',
				'review/style.css': 'blocks/review/style.scss'
			}
		},
		'review-comparison': {
			block: 'blocks/review-comparison/block.json',
			sass: {
				'review-comparison/editor.css': 'blocks/review-comparison/editor.scss',
				'review-comparison/style.css': 'blocks/review-comparison/style.scss'
			}
		},
		'advanced-columns': {
			block: 'blocks/section/columns/block.json',
			sass: {
				'section/editor.css': 'blocks/section/editor.scss',
				'section/style.css': 'blocks/section/style.scss'
			}
		},
		'advanced-column': {
			block: 'blocks/section/column/block.json'
		},
		'sharing-icons': {
			block: 'blocks/sharing-icons/block.json',
			sass: {
				'sharing-icons/editor.css': 'blocks/sharing-icons/editor.scss',
				'sharing-icons/style.css': 'blocks/sharing-icons/style.scss'
			}
		},
		'slider': {
			block: 'blocks/slider/block.json',
			sass: {
				'slider/editor.css': 'blocks/slider/editor.scss',
				'slider/style.css': 'blocks/slider/style.scss'
			}
		},
		'pricing': {
			block: 'blocks/pricing/block.json'
		},
		'service': {
			block: 'blocks/service/block.json'
		},
		'testimonials': {
			block: 'blocks/testimonials/block.json'
		},
		'tabs': {
			block: 'blocks/tabs/group/block.json',
			sass: {
				'tabs/editor.css': 'blocks/tabs/editor.scss',
				'tabs/style.css': 'blocks/tabs/style.scss'
			}
		},
		'tabs-item': {
			block: 'blocks/tabs/item/block.json'
		},
		'woo-comparison': {
			block: 'blocks/woo-comparison/block.json',
			sass: {
				'woo-comparison/editor.css': 'blocks/woo-comparison/editor.scss'
			}
		},
		'product-add-to-cart': {
			block: 'woocommerce/add-to-cart/block.json'
		},
		'product-images': {
			block: 'woocommerce/images/block.json'
		},
		'product-meta': {
			block: 'woocommerce/meta/block.json'
		},
		'product-price': {
			block: 'woocommerce/price/block.json'
		},
		'product-rating': {
			block: 'woocommerce/rating/block.json'
		},
		'product-related-products': {
			block: 'woocommerce/related-products/block.json'
		},
		'product-short-description': {
			block: 'woocommerce/short-description/block.json'
		},
		'product-stock': {
			block: 'woocommerce/stock/block.json'
		},
		'product-tabs': {
			block: 'woocommerce/tabs/block.json'
		},
		'product-title': {
			block: 'woocommerce/title/block.json'
		},
		'product-upsells': {
			block: 'woocommerce/upsells/block.json'
		}
	};

	const folders = Object.keys( blocks ).map( block => `build/blocks/${ block }` );

	const blockFiles = Object.keys( blocks ).filter( block => blocks[ block ].block !== undefined )
		.map( block => {
			return {
				expand: true,
				src: [ `src/blocks/${ blocks[ block ].block }` ],
				dest: `build/blocks/${ block }/`,
				flatten: true,
				filter: 'isFile'
			};
		});

	const sassFiles = {};

	Object.keys( blocks ).filter( block => blocks[ block ].sass !== undefined )
		.forEach( block => {
			Object.keys( blocks[ block ].sass ).forEach( s => {
				sassFiles[ `build/blocks/${ s }` ] = `src/blocks/${ blocks[ block ].sass[ s ] }`;
			});
		});

	grunt.initConfig({
		mkdir: {
			default: {
				options: {
					create: folders
				}
			}
		},
		copy: {
			main: {
				files: blockFiles
			}
		},
		sass: {
			dist: {
				options: {
					sourcemap: false,
					style: 'compressed'
				},
				files: sassFiles
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

	grunt.registerTask( 'build', [ 'mkdir', 'copy', 'sass' ]);
};
