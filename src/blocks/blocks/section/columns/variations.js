/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { cols112, cols12, cols21, cols211, cols2Equal, cols3Equal, cols4Equal, colsFull, pricingIcon } from '../../../helpers/icons.js';

const variations =
	[
		{
			name: 'themeisle-blocks/section-columns-1',
			description: __( 'Single column', 'otter-blocks' ),

			// Replace with one of our icons.
			icon: colsFull,
			title: __( 'Full', 'otter-blocks' ),
			attributes: {
				columns: 1,
				layout: 'equal',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '100' } ]
			],
			scope: [ 'block' ],
			isDefault: true
		},
		{
			name: 'themeisle-blocks/section-columns-equal',
			description: __( '2 equal columns', 'otter-blocks' ),
			icon: cols2Equal,
			title: __( '1:1', 'otter-blocks' ),
			attributes: {
				columns: 2,
				layout: 'equal',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '50' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '50' } ]
			],
			scope: [ 'block' ]
		},
		{
			name: 'themeisle-blocks/section-columns-1-2',
			description: __( '1:2 columns', 'otter-blocks' ),
			icon: cols12,
			title: __( '1:2', 'otter-blocks' ),
			attributes: {
				columns: 2,
				layout: 'oneTwo',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '33.34' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '66.66' } ]
			],
			scope: [ 'block' ]
		},
		{
			name: 'themeisle-blocks/section-columns-2-1',
			description: __( '2:1 columns', 'otter-blocks' ),
			icon: cols21,
			title: __( '2:1', 'otter-blocks' ),
			attributes: {
				columns: 2,
				layout: 'twoOne',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '66.66' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '33.33' } ]
			],
			scope: [ 'block' ]
		},
		{
			name: 'themeisle-blocks/section-columns-equal-3',
			description: __( '3 equal columns', 'otter-blocks' ),
			icon: cols3Equal,
			title: __( '1:1:1', 'otter-blocks' ),
			attributes: {
				columns: 3,
				layout: 'equal',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '33.33' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '33.33' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '33.33' } ]
			],
			scope: [ 'block' ]
		},
		{
			name: 'themeisle-blocks/section-columns-1-1-2',
			description: __( '1:1:2 columns', 'otter-blocks' ),
			icon: cols112,
			title: __( '1:1:2', 'otter-blocks' ),
			attributes: {
				columns: 3,
				layout: 'oneOneTwo',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '50' } ]
			],
			scope: [ 'block' ]
		},
		{
			name: 'themeisle-blocks/section-columns-2-1-1',
			description: __( '2:1:1 columns', 'otter-blocks' ),
			icon: cols211,
			title: __( '2:1:1', 'otter-blocks' ),
			attributes: {
				columns: 3,
				layout: 'twoOneOne',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '50' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ]
			],
			scope: [ 'block' ]
		},
		{
			name: 'themeisle-blocks/section-columns-equal-4',
			description: __( '4 equal columns', 'otter-blocks' ),
			icon: cols4Equal,
			title: __( '1:1:1:1', 'otter-blocks' ),
			attributes: {
				columns: 4,
				layout: 'equal',
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			},
			innerBlocks: [
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ],
				[ 'themeisle-blocks/advanced-column', { columnWidth: '25' } ]
			],
			scope: [ 'block' ]
		},
		{
			name: 'themeisle-blocks/section-pricing',
			description: __( 'Pricing Section for Otter Pro', 'otter-blocks' ),
			icon: pricingIcon,
			title: __( 'Pricing Section', 'otter-blocks' ),
			attributes: {
				columns: 3,
				layout: 'equal',
				layoutMobile: 'collapsedRows',
				columnsGap: 'nogap',
				paddingType: 'unlinked',
				paddingTypeTablet: 'unlinked',
				paddingTablet: 40,
				paddingMobile: 0,
				paddingTop: 80,
				paddingTopTablet: 40,
				paddingTopMobile: 20,
				paddingRightTablet: 20,
				paddingBottom: 80,
				paddingBottomTablet: 40,
				paddingLeftTablet: 20,
				marginMobile: 0,
				marginTop: 0,
				marginTopTablet: 0,
				marginTopMobile: 0,
				marginBottom: 0,
				marginBottomTablet: 0,
				marginBottomMobile: 0,
				columnsWidth: 1170,
				horizontalAlign: 'center',
				verticalAlign: 'flex-start',
				columnsHTMLTag: 'section',
				align: 'full',
				hasCustomCSS: true
			},
			innerBlocks: wp.blocks.parse( '<!-- wp:themeisle-blocks/advanced-column {\"id\":\"wp-block-themeisle-blocks-advanced-column-43e17023\",\"padding\":32,\"paddingTablet\":20,\"paddingMobile\":20,\"paddingTop\":40,\"marginType\":\"linked\",\"marginTypeMobile\":\"linked\",\"marginMobile\":20,\"marginTop\":0,\"marginTopMobile\":20,\"marginRightMobile\":10,\"marginBottom\":0,\"marginBottomMobile\":20,\"marginLeftMobile\":10,\"borderRadius\":20,\"boxShadow\":true,\"boxShadowColorOpacity\":10,\"boxShadowBlur\":80,\"boxShadowVertical\":2,\"columnWidth\":\"33.33\"} -->\n<div class=\"wp-block-themeisle-blocks-advanced-column\" id=\"wp-block-themeisle-blocks-advanced-column-43e17023\"><!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-cd4d5bb0\",\"tag\":\"h3\",\"align\":\"center\",\"marginBottom\":8} -->\n<h3 id=\"wp-block-themeisle-blocks-advanced-heading-cd4d5bb0\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-cd4d5bb0\">Essential</h3>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-7d521980\",\"tag\":\"span\",\"align\":\"center\",\"fontSize\":48,\"hasCustomCSS\":true} -->\n<span id=\"wp-block-themeisle-blocks-advanced-heading-7d521980\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-7d521980\"><strong>$59</strong></span>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-ee4f525b\",\"tag\":\"p\",\"align\":\"center\",\"headingColor\":\"#9b9b9b\",\"fontSize\":15} -->\n<p id=\"wp-block-themeisle-blocks-advanced-heading-ee4f525b\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-ee4f525b\">Party snackwave four dollar toast tumeric cold-pressed.</p>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:buttons {\"contentJustification\":\"center\"} -->\n<div class=\"wp-block-buttons is-content-justification-center\"><!-- wp:button {\"width\":100,\"style\":{\"border\":{\"radius\":50}},\"className\":\"is-style-primary\"} -->\n<div class=\"wp-block-button has-custom-width wp-block-button__width-100 is-style-primary\"><a class=\"wp-block-button__link\" style=\"border-radius:50px\">Get Started</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->\n\n<!-- wp:separator {\"color\":\"nv-light-bg\",\"className\":\"is-style-default\"} -->\n<hr class=\"wp-block-separator has-text-color has-background has-nv-light-bg-background-color has-nv-light-bg-color is-style-default\"/>\n<!-- /wp:separator -->\n\n<!-- wp:themeisle-blocks/icon-list {\"id\":\"wp-block-themeisle-blocks-icon-list-1806e8e7\",\"defaultIcon\":\"check\",\"defaultIconColor\":\"var(\\u002d\\u002dnv-primary-accent)\",\"defaultSize\":16,\"gap\":10} -->\n<div class=\"wp-block-themeisle-blocks-icon-list\" id=\"wp-block-themeisle-blocks-icon-list-1806e8e7\"><!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-26b966e4\",\"content\":\"Custom Layouts \\u0026amp; Hooks\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-26b966e4\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Custom Layouts &amp; Hooks</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item -->\n\n<!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-4aebde54\",\"content\":\"Unlimited Website Usage\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-4aebde54\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Unlimited Website Usage</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item -->\n\n<!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-64264549\",\"content\":\"Risk-Free Guarantee\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-64264549\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Risk-Free Guarantee</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item --></div>\n<!-- /wp:themeisle-blocks/icon-list -->\n\n<!-- wp:spacer {\"height\":20} -->\n<div style=\"height:20px\" aria-hidden=\"true\" class=\"wp-block-spacer\"></div>\n<!-- /wp:spacer --></div>\n<!-- /wp:themeisle-blocks/advanced-column -->\n\n<!-- wp:themeisle-blocks/advanced-column {\"id\":\"wp-block-themeisle-blocks-advanced-column-2489d76c\",\"padding\":32,\"paddingTablet\":20,\"paddingMobile\":20,\"paddingTop\":80,\"paddingBottom\":40,\"marginType\":\"linked\",\"marginTypeMobile\":\"linked\",\"marginMobile\":20,\"marginTop\":0,\"marginTopMobile\":20,\"marginRightMobile\":10,\"marginBottom\":0,\"marginBottomMobile\":20,\"marginLeftMobile\":10,\"borderRadius\":20,\"boxShadow\":true,\"boxShadowColorOpacity\":10,\"boxShadowBlur\":80,\"boxShadowVertical\":2,\"columnWidth\":\"33.33\"} -->\n<div class=\"wp-block-themeisle-blocks-advanced-column\" id=\"wp-block-themeisle-blocks-advanced-column-2489d76c\"><!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-e30ccf77\",\"tag\":\"h3\",\"align\":\"center\",\"marginBottom\":8} -->\n<h3 id=\"wp-block-themeisle-blocks-advanced-heading-e30ccf77\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-e30ccf77\">Business</h3>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-01f7ed6b\",\"tag\":\"span\",\"align\":\"center\",\"fontSize\":48,\"hasCustomCSS\":true} -->\n<span id=\"wp-block-themeisle-blocks-advanced-heading-01f7ed6b\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-01f7ed6b\"><strong>$129</strong></span>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-fe18de7e\",\"tag\":\"p\",\"align\":\"center\",\"headingColor\":\"#9b9b9b\",\"fontSize\":15} -->\n<p id=\"wp-block-themeisle-blocks-advanced-heading-fe18de7e\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-fe18de7e\">Party snackwave four dollar toast tumeric cold-pressed.</p>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:buttons {\"contentJustification\":\"center\"} -->\n<div class=\"wp-block-buttons is-content-justification-center\"><!-- wp:button {\"width\":100,\"style\":{\"border\":{\"radius\":50}},\"className\":\"is-style-primary\"} -->\n<div class=\"wp-block-button has-custom-width wp-block-button__width-100 is-style-primary\"><a class=\"wp-block-button__link\" style=\"border-radius:50px\">Get Started</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->\n\n<!-- wp:separator {\"color\":\"nv-light-bg\",\"className\":\"is-style-default\"} -->\n<hr class=\"wp-block-separator has-text-color has-background has-nv-light-bg-background-color has-nv-light-bg-color is-style-default\"/>\n<!-- /wp:separator -->\n\n<!-- wp:themeisle-blocks/icon-list {\"id\":\"wp-block-themeisle-blocks-icon-list-fb8b7e9c\",\"defaultIcon\":\"check\",\"defaultIconColor\":\"var(\\u002d\\u002dnv-primary-accent)\",\"defaultSize\":16,\"gap\":10} -->\n<div class=\"wp-block-themeisle-blocks-icon-list\" id=\"wp-block-themeisle-blocks-icon-list-fb8b7e9c\"><!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-78a49dfc\",\"content\":\"Custom Layouts \\u0026amp; Hooks\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-78a49dfc\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Custom Layouts &amp; Hooks</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item -->\n\n<!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-f341b063\",\"content\":\"Unlimited Website Usage\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-f341b063\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Unlimited Website Usage</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item -->\n\n<!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-8216d9b3\",\"content\":\"Risk-Free Guarantee\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-8216d9b3\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Risk-Free Guarantee</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item --></div>\n<!-- /wp:themeisle-blocks/icon-list -->\n\n<!-- wp:spacer {\"height\":20} -->\n<div style=\"height:20px\" aria-hidden=\"true\" class=\"wp-block-spacer\"></div>\n<!-- /wp:spacer --></div>\n<!-- /wp:themeisle-blocks/advanced-column -->\n\n<!-- wp:themeisle-blocks/advanced-column {\"id\":\"wp-block-themeisle-blocks-advanced-column-09158d16\",\"padding\":32,\"paddingTablet\":20,\"paddingMobile\":20,\"paddingTop\":40,\"marginType\":\"linked\",\"marginTypeMobile\":\"linked\",\"marginMobile\":20,\"marginTop\":0,\"marginTopMobile\":20,\"marginRightMobile\":10,\"marginBottom\":0,\"marginBottomMobile\":20,\"marginLeftMobile\":10,\"borderRadius\":20,\"boxShadow\":true,\"boxShadowColorOpacity\":10,\"boxShadowBlur\":80,\"boxShadowVertical\":2,\"columnWidth\":\"33.33\"} -->\n<div class=\"wp-block-themeisle-blocks-advanced-column\" id=\"wp-block-themeisle-blocks-advanced-column-09158d16\"><!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-b3766bd8\",\"tag\":\"h3\",\"align\":\"center\",\"marginBottom\":8} -->\n<h3 id=\"wp-block-themeisle-blocks-advanced-heading-b3766bd8\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-b3766bd8\">VIP</h3>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-e601353c\",\"tag\":\"span\",\"align\":\"center\",\"fontSize\":48,\"hasCustomCSS\":true} -->\n<span id=\"wp-block-themeisle-blocks-advanced-heading-e601353c\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-e601353c\"><strong>$199</strong></span>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:themeisle-blocks/advanced-heading {\"id\":\"wp-block-themeisle-blocks-advanced-heading-39d2e261\",\"tag\":\"p\",\"align\":\"center\",\"headingColor\":\"#9b9b9b\",\"fontSize\":15} -->\n<p id=\"wp-block-themeisle-blocks-advanced-heading-39d2e261\" class=\"wp-block-themeisle-blocks-advanced-heading wp-block-themeisle-blocks-advanced-heading-39d2e261\">Party snackwave four dollar toast tumeric cold-pressed.</p>\n<!-- /wp:themeisle-blocks/advanced-heading -->\n\n<!-- wp:buttons {\"contentJustification\":\"center\"} -->\n<div class=\"wp-block-buttons is-content-justification-center\"><!-- wp:button {\"width\":100,\"style\":{\"border\":{\"radius\":50}},\"className\":\"is-style-primary\"} -->\n<div class=\"wp-block-button has-custom-width wp-block-button__width-100 is-style-primary\"><a class=\"wp-block-button__link\" style=\"border-radius:50px\">Get Started</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->\n\n<!-- wp:separator {\"color\":\"nv-light-bg\",\"className\":\"is-style-default\"} -->\n<hr class=\"wp-block-separator has-text-color has-background has-nv-light-bg-background-color has-nv-light-bg-color is-style-default\"/>\n<!-- /wp:separator -->\n\n<!-- wp:themeisle-blocks/icon-list {\"id\":\"wp-block-themeisle-blocks-icon-list-2c744428\",\"defaultIcon\":\"check\",\"defaultIconColor\":\"var(\\u002d\\u002dnv-primary-accent)\",\"defaultSize\":16,\"gap\":10} -->\n<div class=\"wp-block-themeisle-blocks-icon-list\" id=\"wp-block-themeisle-blocks-icon-list-2c744428\"><!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-b78d20f0\",\"content\":\"Custom Layouts \\u0026amp; Hooks\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-b78d20f0\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Custom Layouts &amp; Hooks</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item -->\n\n<!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-14fe631b\",\"content\":\"Unlimited Website Usage\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-14fe631b\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Unlimited Website Usage</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item -->\n\n<!-- wp:themeisle-blocks/icon-list-item {\"id\":\"wp-block-themeisle-blocks-icon-list-item-0ce7030d\",\"content\":\"Risk-Free Guarantee\",\"library\":\"fontawesome\",\"iconPrefix\":\"fas\",\"icon\":\"check\"} -->\n<div class=\"wp-block-themeisle-blocks-icon-list-item\" id=\"wp-block-themeisle-blocks-icon-list-item-0ce7030d\"><i class=\"fas fa-check wp-block-themeisle-blocks-icon-list-item-icon\"></i><p class=\"wp-block-themeisle-blocks-icon-list-item-content\">Risk-Free Guarantee</p></div>\n<!-- /wp:themeisle-blocks/icon-list-item --></div>\n<!-- /wp:themeisle-blocks/icon-list -->\n\n<!-- wp:spacer {\"height\":20} -->\n<div style=\"height:20px\" aria-hidden=\"true\" class=\"wp-block-spacer\"></div>\n<!-- /wp:spacer --></div>\n<!-- /wp:themeisle-blocks/advanced-column --></div>' ),
			scope: [ 'block' ]
		}
	];


export default variations;
