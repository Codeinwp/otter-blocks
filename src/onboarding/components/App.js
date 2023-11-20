/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { BlockPreview } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import Sidebar from './Sidebar';

const blocks = [
	{
		'clientId': '7de83d98-f17a-4f5f-8873-da7b229d990f',
		'name': 'core/template-part',
		'isValid': true,
		'originalContent': '',
		'validationIssues': [],
		'attributes': {
			'slug': 'header',
			'theme': 'raft',
			'tagName': 'header',
			'hasCustomCSS': false,
			'otterConditions': []
		},
		'innerBlocks': []
	},
	{
		'clientId': '032637d0-12ee-470b-b5cc-84e46f1dce66',
		'name': 'core/group',
		'isValid': true,
		'originalContent': '<div class="wp-block-group has-raft-bg-alt-background-color has-background" style="margin-top:0px;margin-bottom:0px;padding-top:64px;padding-bottom:64px">\n\n\n\n\n\n\n\n\n\n\n\n</div>',
		'validationIssues': [],
		'attributes': {
			'tagName': 'div',
			'backgroundColor': 'raft-bg-alt',
			'style': {
				'spacing': {
					'padding': {
						'top': '64px',
						'bottom': '64px'
					},
					'blockGap': '24px',
					'margin': {
						'top': '0px',
						'bottom': '0px'
					}
				}
			},
			'layout': {
				'inherit': true,
				'type': 'constrained'
			},
			'otterConditions': [],
			'hasCustomCSS': false
		},
		'innerBlocks': [
			{
				'clientId': '36ab4e10-5eec-4633-a144-b09208a04fae',
				'name': 'core/heading',
				'isValid': true,
				'originalContent': '<h1 class="has-text-align-center has-huge-font-size">Block-based websites made simple.</h1>',
				'validationIssues': [],
				'attributes': {
					'textAlign': 'center',
					'content': 'Block-based websites made simple.',
					'level': 1,
					'fontSize': 'huge',
					'otterConditions': [],
					'hasCustomCSS': false
				},
				'innerBlocks': []
			},
			{
				'clientId': '8bc5b509-0cf3-4b6e-bada-79cbfe1a6542',
				'name': 'core/paragraph',
				'isValid': true,
				'originalContent': '<p class="has-text-align-center has-medium-font-size">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>',
				'validationIssues': [],
				'attributes': {
					'align': 'center',
					'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua.',
					'dropCap': false,
					'fontSize': 'medium',
					'hasCustomCSS': false,
					'otterConditions': []
				},
				'innerBlocks': []
			},
			{
				'clientId': '21111f4a-9696-43de-8243-8b49ca8a068f',
				'name': 'core/buttons',
				'isValid': true,
				'originalContent': '<div class="wp-block-buttons">\n\n\n\n</div>',
				'validationIssues': [],
				'attributes': {
					'layout': {
						'type': 'flex',
						'justifyContent': 'center'
					},
					'hasCustomCSS': false,
					'otterConditions': []
				},
				'innerBlocks': [
					{
						'clientId': '642d719f-b419-4b2d-8a61-9624cf92b595',
						'name': 'core/button',
						'isValid': true,
						'originalContent': '<div class="wp-block-button">\n<a class="wp-block-button__link has-raft-fg-alt-color has-text-color">Learn More</a>\n</div>',
						'validationIssues': [],
						'attributes': {
							'text': 'Learn More',
							'textColor': 'raft-fg-alt',
							'otterConditions': [],
							'hasCustomCSS': false
						},
						'innerBlocks': []
					}
				]
			},
			{
				'clientId': '214e3be8-fd03-4d9d-8747-da041dc79ef3',
				'name': 'core/spacer',
				'isValid': true,
				'originalContent': '<div style="height:3vw" aria-hidden="true" class="wp-block-spacer"></div>',
				'validationIssues': [],
				'attributes': {
					'height': '3vw',
					'hasCustomCSS': false,
					'otterConditions': []
				},
				'innerBlocks': []
			},
			{
				'clientId': '757d828c-1fa0-49ae-af42-87a2833c6368',
				'name': 'core/image',
				'isValid': true,
				'originalContent': '<figure class="wp-block-image aligncenter size-large">\n<img src="http://localhost:8888/wp-content/themes/raft/assets/img/raft-illustration.svg" alt="Hero Illustration"/>\n</figure>',
				'validationIssues': [],
				'attributes': {
					'align': 'center',
					'url': 'http://localhost:8888/wp-content/themes/raft/assets/img/raft-illustration.svg',
					'alt': 'Hero Illustration',
					'caption': '',
					'sizeSlug': 'large',
					'linkDestination': 'none',
					'hasCustomCSS': false,
					'otterConditions': [],
					'boxShadow': false,
					'boxShadowColor': '#000000',
					'boxShadowColorOpacity': 50,
					'boxShadowBlur': 5,
					'boxShadowHorizontal': 0,
					'boxShadowVertical': 0
				},
				'innerBlocks': []
			}
		]
	},
	{
		'clientId': '0dc9b2ee-ecea-4893-ac43-9ec4de5b981f',
		'name': 'core/group',
		'isValid': true,
		'originalContent': '<div class="wp-block-group" style="margin-top:0px;margin-bottom:0px;padding-top:64px;padding-bottom:64px">\n    \n</div>',
		'validationIssues': [],
		'attributes': {
			'tagName': 'div',
			'style': {
				'spacing': {
					'padding': {
						'top': '64px',
						'bottom': '64px'
					},
					'margin': {
						'top': '0px',
						'bottom': '0px'
					}
				}
			},
			'layout': {
				'type': 'constrained'
			},
			'hasCustomCSS': false,
			'otterConditions': []
		},
		'innerBlocks': [
			{
				'clientId': '002c8b37-2ece-4151-b151-6b114f00b181',
				'name': 'core/post-content',
				'isValid': true,
				'originalContent': '',
				'validationIssues': [],
				'attributes': {
					'layout': {
						'type': 'default'
					},
					'hasCustomCSS': false,
					'otterConditions': []
				},
				'innerBlocks': []
			}
		]
	},
	{
		'clientId': '7046e62b-9094-4c1e-87ac-cdc1c874cdc7',
		'name': 'core/group',
		'isValid': true,
		'originalContent': '<div class="wp-block-group alignfull" style="margin-top:0px;margin-bottom:0px;padding-top:64px;padding-bottom:64px">\n\n\n\n</div>',
		'validationIssues': [],
		'attributes': {
			'tagName': 'div',
			'align': 'full',
			'style': {
				'spacing': {
					'padding': {
						'top': '64px',
						'bottom': '64px'
					},
					'margin': {
						'top': '0px',
						'bottom': '0px'
					}
				}
			},
			'layout': {
				'type': 'constrained'
			},
			'hasCustomCSS': false,
			'otterConditions': []
		},
		'innerBlocks': [
			{
				'clientId': '520f4d8e-1237-4920-aa5c-92718b033bd3',
				'name': 'core/columns',
				'isValid': true,
				'originalContent': '<div class="wp-block-columns alignwide"></div>',
				'validationIssues': [],
				'attributes': {
					'isStackedOnMobile': true,
					'align': 'wide',
					'hasCustomCSS': false,
					'otterConditions': []
				},
				'innerBlocks': [
					{
						'clientId': '95527c39-32d2-4e9a-8a16-53e4c3e2b893',
						'name': 'core/column',
						'isValid': true,
						'originalContent': '<div class="wp-block-column"></div>',
						'validationIssues': [],
						'attributes': {
							'hasCustomCSS': false,
							'otterConditions': []
						},
						'innerBlocks': [
							{
								'clientId': 'c12b5e3f-6513-4a23-be28-055e2fc7da9c',
								'name': 'core/image',
								'isValid': true,
								'originalContent': '<figure class="wp-block-image size-full"><img src="http://localhost:8888/wp-content/themes/raft/assets/img/shape-05.svg" alt="Illustration" /></figure>',
								'validationIssues': [],
								'attributes': {
									'url': 'http://localhost:8888/wp-content/themes/raft/assets/img/shape-05.svg',
									'alt': 'Illustration',
									'caption': [],
									'linkDestination': 'none',
									'className': 'size-full',
									'otterConditions': [],
									'boxShadow': false,
									'boxShadowColor': '#000000',
									'boxShadowColorOpacity': 50,
									'boxShadowBlur': 5,
									'boxShadowHorizontal': 0,
									'boxShadowVertical': 0,
									'hasCustomCSS': false
								},
								'innerBlocks': []
							},
							{
								'clientId': '82ce962e-2d52-4982-b1a1-fa01a416f5fe',
								'name': 'core/heading',
								'isValid': true,
								'originalContent': '<h3>Style Variations</h3>',
								'validationIssues': [],
								'attributes': {
									'content': 'Style Variations',
									'level': 3,
									'otterConditions': [],
									'hasCustomCSS': false
								},
								'innerBlocks': []
							},
							{
								'clientId': 'e037ae68-5b36-4268-a117-be45481b932d',
								'name': 'core/paragraph',
								'isValid': true,
								'originalContent': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>',
								'validationIssues': [],
								'attributes': {
									'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
									'dropCap': false,
									'hasCustomCSS': false,
									'otterConditions': []
								},
								'innerBlocks': []
							}
						]
					},
					{
						'clientId': '69e9e1c2-dca1-4050-9dd9-aba5bf622ec9',
						'name': 'core/column',
						'isValid': true,
						'originalContent': '<div class="wp-block-column"></div>',
						'validationIssues': [],
						'attributes': {
							'hasCustomCSS': false,
							'otterConditions': []
						},
						'innerBlocks': [
							{
								'clientId': '136177ea-91b8-4970-8dbf-9eaa5af466fe',
								'name': 'core/image',
								'isValid': true,
								'originalContent': '<figure class="wp-block-image size-full"><img src="http://localhost:8888/wp-content/themes/raft/assets/img/shape-06.svg" alt="Illustration" /></figure>',
								'validationIssues': [],
								'attributes': {
									'url': 'http://localhost:8888/wp-content/themes/raft/assets/img/shape-06.svg',
									'alt': 'Illustration',
									'caption': [],
									'linkDestination': 'none',
									'className': 'size-full',
									'otterConditions': [],
									'boxShadow': false,
									'boxShadowColor': '#000000',
									'boxShadowColorOpacity': 50,
									'boxShadowBlur': 5,
									'boxShadowHorizontal': 0,
									'boxShadowVertical': 0,
									'hasCustomCSS': false
								},
								'innerBlocks': []
							},
							{
								'clientId': '60c0d2dc-c526-475f-9cbf-5441f67b2d7d',
								'name': 'core/heading',
								'isValid': true,
								'originalContent': '<h3>Built-in Patterns</h3>',
								'validationIssues': [],
								'attributes': {
									'content': 'Built-in Patterns',
									'level': 3,
									'otterConditions': [],
									'hasCustomCSS': false
								},
								'innerBlocks': []
							},
							{
								'clientId': '526feaf1-96d1-49f2-92a5-20377d40695c',
								'name': 'core/paragraph',
								'isValid': true,
								'originalContent': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>',
								'validationIssues': [],
								'attributes': {
									'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
									'dropCap': false,
									'hasCustomCSS': false,
									'otterConditions': []
								},
								'innerBlocks': []
							}
						]
					},
					{
						'clientId': '94fe896c-d8ec-4311-ab2d-58ed6d7dfd6b',
						'name': 'core/column',
						'isValid': true,
						'originalContent': '<div class="wp-block-column"></div>',
						'validationIssues': [],
						'attributes': {
							'hasCustomCSS': false,
							'otterConditions': []
						},
						'innerBlocks': [
							{
								'clientId': '601b19bf-e72a-44e8-aab0-e6622d4c7299',
								'name': 'core/image',
								'isValid': true,
								'originalContent': '<figure class="wp-block-image size-full"><img src="http://localhost:8888/wp-content/themes/raft/assets/img/shape-04.svg" alt="Illustration" /></figure>',
								'validationIssues': [],
								'attributes': {
									'url': 'http://localhost:8888/wp-content/themes/raft/assets/img/shape-04.svg',
									'alt': 'Illustration',
									'caption': [],
									'linkDestination': 'none',
									'className': 'size-full',
									'otterConditions': [],
									'boxShadow': false,
									'boxShadowColor': '#000000',
									'boxShadowColorOpacity': 50,
									'boxShadowBlur': 5,
									'boxShadowHorizontal': 0,
									'boxShadowVertical': 0,
									'hasCustomCSS': false
								},
								'innerBlocks': []
							},
							{
								'clientId': 'fbf0ab73-317b-474e-b1ad-e235e202f782',
								'name': 'core/heading',
								'isValid': true,
								'originalContent': '<h3>Powered by blocks</h3>',
								'validationIssues': [],
								'attributes': {
									'content': 'Powered by blocks',
									'level': 3,
									'otterConditions': [],
									'hasCustomCSS': false
								},
								'innerBlocks': []
							},
							{
								'clientId': 'b0eebc71-e75c-4371-ba85-372de6b1e137',
								'name': 'core/paragraph',
								'isValid': true,
								'originalContent': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>',
								'validationIssues': [],
								'attributes': {
									'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
									'dropCap': false,
									'hasCustomCSS': false,
									'otterConditions': []
								},
								'innerBlocks': []
							}
						]
					}
				]
			}
		]
	},
	{
		'clientId': '2d130305-7402-4f5c-bb48-35303f346d69',
		'name': 'core/group',
		'isValid': true,
		'originalContent': '<div class="wp-block-group alignfull has-raft-fg-alt-color has-raft-accent-background-color has-text-color has-background" style="margin-top:0px;margin-bottom:0px;padding-top:64px;padding-bottom:64px">\n\n\n\n</div>',
		'validationIssues': [],
		'attributes': {
			'tagName': 'div',
			'align': 'full',
			'backgroundColor': 'raft-accent',
			'textColor': 'raft-fg-alt',
			'style': {
				'spacing': {
					'padding': {
						'top': '64px',
						'bottom': '64px'
					},
					'blockGap': '40px',
					'margin': {
						'top': '0px',
						'bottom': '0px'
					}
				}
			},
			'layout': {
				'inherit': true,
				'type': 'constrained'
			},
			'otterConditions': [],
			'hasCustomCSS': false
		},
		'innerBlocks': [
			{
				'clientId': '4004c3dd-db04-4c6e-ad21-6211a096c172',
				'name': 'core/heading',
				'isValid': true,
				'originalContent': '<h2 class="has-text-align-center has-raft-fg-alt-color has-text-color">Lorem ipsum sit dolor!</h2>',
				'validationIssues': [],
				'attributes': {
					'textAlign': 'center',
					'content': 'Lorem ipsum sit dolor!',
					'level': 2,
					'textColor': 'raft-fg-alt',
					'otterConditions': [],
					'hasCustomCSS': false
				},
				'innerBlocks': []
			},
			{
				'clientId': '53ebe99e-ce77-45e8-8f93-3b48a3937ce6',
				'name': 'core/buttons',
				'isValid': true,
				'originalContent': '<div class="wp-block-buttons">\n\n</div>',
				'validationIssues': [],
				'attributes': {
					'layout': {
						'type': 'flex',
						'justifyContent': 'center'
					},
					'hasCustomCSS': false,
					'otterConditions': []
				},
				'innerBlocks': [
					{
						'clientId': '6816ab82-b189-47a2-972e-4a1fa42e84b2',
						'name': 'core/button',
						'isValid': true,
						'originalContent': '<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-raft-fg-alt-color has-text-color">Lorem ipsum</a></div>',
						'validationIssues': [],
						'attributes': {
							'text': 'Lorem ipsum',
							'textColor': 'raft-fg-alt',
							'className': 'is-style-outline',
							'otterConditions': [],
							'hasCustomCSS': false
						},
						'innerBlocks': []
					}
				]
			}
		]
	},
	{
		'clientId': '9819ba4d-2fb6-4051-be88-211539c8ca50',
		'name': 'core/template-part',
		'isValid': true,
		'originalContent': '',
		'validationIssues': [],
		'attributes': {
			'slug': 'footer',
			'theme': 'raft',
			'tagName': 'footer',
			'hasCustomCSS': false,
			'otterConditions': []
		},
		'innerBlocks': []
	}
];

const App = () => {
	return (
		<div id="otter-onboarding">
			<div className="o-onboarding">
				<Sidebar />

				<div className="o-main">
					<BlockPreview
						blocks={ blocks }
					/>
				</div>
			</div>
		</div>
	);
};

export default App;
