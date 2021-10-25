/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Path,
	SVG,
	Rect
} from '@wordpress/components';
import { cols112, cols12, cols21, cols211, cols2Equal, cols3Equal, cols4Equal, colsFull } from '../../../helpers/themeisle-icons';

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
		}
	];


export default variations;
