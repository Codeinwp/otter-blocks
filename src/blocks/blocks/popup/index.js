/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import save from './save.js';
import { popupIcon as icon, popupScratch, popupWithForm, popupWithImageAndText } from '../../helpers/icons';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Popup', 'otter-blocks' ),
	description: __( 'Display your content in beautiful popup with many customization options. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'popup',
		'modal',
		'lightbox'
	],
	edit,
	save,
	example: {
		attributes: {}
	},
	variations: [
		{
			'name': 'themeisle-blocks/popup-scratch',
			'title': __( 'Start from scratch', 'otter-blocks' ),
			'description': __( 'Simple Popup with default settings.', 'otter-blocks' ),
			'icon': popupScratch,
			'scope': [ 'block' ],
			'attributes': {},
			'innerBlocks': [
				{
					'name': 'core/paragraph',
					'attributes': {
						'content': 'Add your content.',
						'dropCap': false,
						'style': {
							'typography': {
								'fontSize': '16px'
							}
						}
					}
				}
			]
		},
		{
			'name': 'themeisle-blocks/popup-with-text-and-image',
			'title': __( 'Text and Image', 'otter-blocks' ),
			'description': __( 'Popup with Text and Image.', 'otter-blocks' ),
			'icon': popupWithImageAndText,
			'scope': [ 'block' ],
			'attributes': {
				'minWidth': 900,
				'trigger': 'onLoad',
				'wait': 1,
				'scroll': 75,
				'showClose': false,
				'outsideClose': true,
				'anchorClose': false,
				'recurringClose': false,
				'backgroundColor': '#ffffff',
				'closeColor': 'var(--nv-text-color)',
				'overlayColor': '#000000',
				'overlayOpacity': 95,
				'paddingMobile': {
					'top': '8px',
					'bottom': '8px',
					'left': '8px',
					'right': '8px'
				},
				'width': '860px',
				'height': '500px',
				'heightTablet': '400px',
				'heightMobile': '320px',
				'boxShadow': {
					'active': false,
					'colorOpacity': 50,
					'blur': 5,
					'spread': 1,
					'horizontal': 0,
					'vertical': 0
				}
			},
			'innerBlocks': [
				{
					'name': 'themeisle-blocks/advanced-columns',
					'attributes': {
						'columns': 2,
						'layout': 'equal',
						'layoutTablet': 'equal',
						'layoutMobile': 'collapsedRows',
						'padding': {
							'top': '0px',
							'right': '0px',
							'bottom': '0px',
							'left': '0px'
						},
						'paddingTablet': {
							'top': '40px',
							'right': '20px',
							'bottom': '40px',
							'left': '20px'
						},
						'paddingMobile': {
							'top': '20px',
							'right': '20px',
							'bottom': '20px',
							'left': '20px'
						},
						'columnsWidth': '100%',
						'horizontalAlign': 'center',
						'columnsHeight': 'auto',
						'verticalAlign': 'center',
						'backgroundType': 'color',
						'backgroundAttachment': 'scroll',
						'backgroundRepeat': 'repeat',
						'backgroundSize': 'auto',
						'backgroundGradient': 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
						'backgroundOverlayOpacity': 50,
						'backgroundOverlayType': 'color',
						'backgroundOverlayAttachment': 'scroll',
						'backgroundOverlayRepeat': 'repeat',
						'backgroundOverlaySize': 'auto',
						'backgroundOverlayGradient': 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
						'backgroundOverlayFilterBlur': 0,
						'backgroundOverlayFilterBrightness': 10,
						'backgroundOverlayFilterContrast': 10,
						'backgroundOverlayFilterGrayscale': 0,
						'backgroundOverlayFilterHue': 0,
						'backgroundOverlayFilterSaturate': 10,
						'backgroundOverlayBlend': 'normal',
						'boxShadow': false,
						'boxShadowColor': '#000000',
						'boxShadowColorOpacity': 50,
						'boxShadowBlur': 5,
						'boxShadowSpread': 0,
						'boxShadowHorizontal': 0,
						'boxShadowVertical': 0,
						'dividerTopType': 'none',
						'dividerTopColor': '#000000',
						'dividerTopInvert': false,
						'dividerBottomType': 'none',
						'dividerBottomColor': '#000000',
						'dividerBottomInvert': false,
						'hide': false,
						'hideTablet': false,
						'hideMobile': false,
						'reverseColumnsTablet': false,
						'reverseColumnsMobile': true,
						'columnsHTMLTag': 'div'
					},
					'innerBlocks': [
						{
							'name': 'themeisle-blocks/advanced-column',
							'attributes': {
								'padding': {
									'top': '20px',
									'right': '20px',
									'bottom': '20px',
									'left': '20px'
								},
								'paddingTablet': {
									'top': '20px',
									'right': '20px',
									'bottom': '20px',
									'left': '20px'
								},
								'paddingMobile': {
									'top': '20px',
									'right': '20px',
									'bottom': '20px',
									'left': '20px'
								},
								'backgroundType': 'color',
								'backgroundAttachment': 'scroll',
								'backgroundRepeat': 'repeat',
								'backgroundSize': 'auto',
								'backgroundGradient': 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
								'backgroundOverlayOpacity': 50,
								'backgroundOverlayType': 'color',
								'backgroundOverlayAttachment': 'scroll',
								'backgroundOverlayRepeat': 'repeat',
								'backgroundOverlaySize': 'auto',
								'backgroundOverlayGradient': 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
								'backgroundOverlayFilterBlur': 0,
								'backgroundOverlayFilterBrightness': 10,
								'backgroundOverlayFilterContrast': 10,
								'backgroundOverlayFilterGrayscale': 0,
								'backgroundOverlayFilterHue': 0,
								'backgroundOverlayFilterSaturate': 10,
								'backgroundOverlayBlend': 'normal',
								'boxShadow': false,
								'boxShadowColor': '#000000',
								'boxShadowColorOpacity': 50,
								'boxShadowBlur': 5,
								'boxShadowSpread': 0,
								'boxShadowHorizontal': 0,
								'boxShadowVertical': 0,
								'columnsHTMLTag': 'div',
								'columnWidth': '50',
								'verticalAlign': 'center'
							},
							'innerBlocks': [
								{
									'name': 'themeisle-blocks/advanced-heading',
									'attributes': {
										'content': '<strong>Explore COURSES</strong>',
										'tag': 'p',
										'alignTablet': 'left',
										'alignMobile': 'left',
										'fontSize': '12px',
										'fontSizeTablet': 16,
										'fontSizeMobile': 16,
										'textTransform': 'uppercase',
										'lineHeight': 1.4,
										'textShadow': false,
										'textShadowColor': '#000000',
										'textShadowColorOpacity': 50,
										'textShadowBlur': 5,
										'textShadowHorizontal': 0,
										'textShadowVertical': 0,
										'paddingTop': 0
									}
								},
								{
									'name': 'themeisle-blocks/advanced-heading',
									'attributes': {
										'content': 'Illustration Skills',
										'tag': 'h2',
										'textShadow': false,
										'textShadowColor': '#000000',
										'textShadowColorOpacity': 50,
										'textShadowBlur': 5,
										'textShadowHorizontal': 0,
										'textShadowVertical': 0,
										'paddingTop': 0,
										'margin': {
											'top': '0px',
											'bottom': '8px'
										}
									}
								},
								{
									'name': 'core/paragraph',
									'attributes': {
										'content': 'Through the years I have created downloadable resources that you can download and improve your skills.',
										'dropCap': false
									}
								},
								{
									'name': 'core/buttons',
									'attributes': {
										'layout': {
											'type': 'flex',
											'justifyContent': 'left'
										}
									},
									'innerBlocks': [
										{
											'name': 'core/button',
											'isValid': true,
											'attributes': {
												'text': 'Learn More',
												'className': 'is-style-primary'
											}
										}
									]
								}
							]
						},
						{
							'name': 'themeisle-blocks/advanced-column',
							'attributes': {
								'padding': {
									'top': '20px',
									'right': '20px',
									'bottom': '20px',
									'left': '20px'
								},
								'paddingTablet': {
									'top': '20px',
									'right': '20px',
									'bottom': '20px',
									'left': '20px'
								},
								'paddingMobile': {
									'top': '20px',
									'right': '20px',
									'bottom': '20px',
									'left': '20px'
								},
								'backgroundType': 'color',
								'backgroundAttachment': 'scroll',
								'backgroundRepeat': 'repeat',
								'backgroundSize': 'auto',
								'backgroundGradient': 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
								'backgroundOverlayOpacity': 50,
								'backgroundOverlayType': 'color',
								'backgroundOverlayAttachment': 'scroll',
								'backgroundOverlayRepeat': 'repeat',
								'backgroundOverlaySize': 'auto',
								'backgroundOverlayGradient': 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
								'backgroundOverlayFilterBlur': 0,
								'backgroundOverlayFilterBrightness': 10,
								'backgroundOverlayFilterContrast': 10,
								'backgroundOverlayFilterGrayscale': 0,
								'backgroundOverlayFilterHue': 0,
								'backgroundOverlayFilterSaturate': 10,
								'backgroundOverlayBlend': 'normal',
								'boxShadow': false,
								'boxShadowColor': '#000000',
								'boxShadowColorOpacity': 50,
								'boxShadowBlur': 5,
								'boxShadowSpread': 0,
								'boxShadowHorizontal': 0,
								'boxShadowVertical': 0,
								'columnsHTMLTag': 'div',
								'columnWidth': '50'
							},
							'innerBlocks': [
								{
									'name': 'core/image',
									'attributes': {
										'url': 'https://demosites.io/otter/wp-content/uploads/sites/664/2022/11/otter-demo-8.png',
										'alt': '',
										'caption': '',
										'sizeSlug': 'full',
										'linkDestination': 'none',
										'boxShadow': false,
										'boxShadowColor': '#000000',
										'boxShadowColorOpacity': 50,
										'boxShadowBlur': 5,
										'boxShadowHorizontal': 0,
										'boxShadowVertical': 0
									}

								}
							]

						}
					]
				}
			]
		},
		{
			'name': 'themeisle-blocks/popup-with-form',
			'title': __( 'Popup with Form', 'otter-blocks' ),
			'description': __( 'Popup with Form that appears on page load.', 'otter-blocks' ),
			'icon': popupWithForm,
			'scope': [ 'block' ],
			'attributes': {
				'trigger': 'onLoad',
				'wait': 1,
				'showClose': true,
				'outsideClose': true,
				'anchorClose': false,
				'recurringClose': false,
				'backgroundColor': '#ffffff',
				'closeColor': 'var(--nv-text-color)',
				'lockScrolling': false,
				'padding': {
					'top': '32px',
					'bottom': '32px',
					'left': '32px',
					'right': '32px'
				},
				'borderWidth': {
					'top': '8px'
				},
				'borderRadius': {
					'top': '5px',
					'bottom': '5px',
					'left': '5px',
					'right': '5px'
				},
				'borderColor': '#ed6f57',
				'width': '540px',
				'closeButtonType': 'outside',
				'boxShadow': {
					'active': false,
					'colorOpacity': 50,
					'blur': 5,
					'spread': 1,
					'horizontal': 0,
					'vertical': 0
				},
				'disableOn': 'mobile'
			},
			'innerBlocks': [
				{
					'name': 'themeisle-blocks/advanced-heading',
					'attributes': {
						'content': 'Find the perfect course',
						'tag': 'h2',
						'textShadow': false,
						'textShadowColor': '#000000',
						'textShadowColorOpacity': 50,
						'textShadowBlur': 5,
						'textShadowHorizontal': 0,
						'textShadowVertical': 0,
						'paddingTop': 0,
						'margin': {
							'top': '0px',
							'bottom': '16px'
						}
					}
				},
				{
					'name': 'core/paragraph',
					'attributes': {
						'content': 'All of our courses are designed to help you learn the fundamentals of writing and other related topics.',
						'dropCap': false,
						'style': {
							'typography': {
								'fontSize': '16px'
							}
						},
						'textColor': 'neve-text-color'
					}
				},
				{
					'name': 'themeisle-blocks/form',
					'attributes': {
						'provider': '',
						'action': 'subscribe',
						'submitLabel': 'Send me the survey',
						'submitMessageColor': 'var(--nv-c-1)',
						'submitMessageErrorColor': 'var(--nv-c-2)',
						'submitStyle': 'full'
					},
					'innerBlocks': [
						{
							'name': 'themeisle-blocks/form-input',
							'attributes': {
								'type': 'text',
								'label': 'Name',
								'isRequired': true,
								'labelColor': 'var(--nv-text-color)'
							}
						},
						{
							'name': 'themeisle-blocks/form-input',
							'attributes': {
								'type': 'email',
								'label': 'Email',
								'isRequired': true,
								'labelColor': 'var(--nv-text-color)'
							}
						},
						{
							'name': 'core/paragraph',
							'attributes': {
								'align': 'left',
								'content': 'You agree to privacy and terms.',
								'dropCap': false,
								'textColor': 'neve-text-color',
								'fontSize': 'small'
							}
						}
					]
				}
			]
		}
	]
});
