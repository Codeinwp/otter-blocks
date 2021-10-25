/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Path,
	SVG,
	Rect
} from '@wordpress/components';

const variations =
	[
		{
			name: 'themeisle-blocks/section-columns-1',
			description: __( 'Single column', 'otter-blocks' ),

			// Replace with one of our icons.
			icon: (
				<SVG
					width="48"
					height="48"
					viewBox="0 0 48 48"
					xmlns="http://www.w3.org/2000/svg"
				>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="m39.0625 14h-30.0625v20.0938h30.0625zm-30.0625-2c-1.10457 0-2 .8954-2 2v20.0938c0 1.1045.89543 2 2 2h30.0625c1.1046 0 2-.8955 2-2v-20.0938c0-1.1046-.8954-2-2-2z"
					/>
				</SVG>
			),
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
			icon: (
				<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
					<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"></Path>
					<Rect x="22.9" y="13" width="2.2" height="22"/>
				</SVG>
			),
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
			icon: (
				<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
					<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
					<Rect x="16.9" y="13" width="2.2" height="22"/>
				</SVG>
			),
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
			icon: (
				<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
					<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
					<Rect x="28.9" y="13" width="2.2" height="22"/>
				</SVG>
			),
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
			icon: (
				<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
					<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
					<Rect x="28.9" y="13" width="2.2" height="22"/>
					<Rect x="16.9" y="13" width="2.2" height="22"/>
				</SVG>
			),
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
			icon: (
				<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
					<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
					<Rect x="22.9" y="13" width="2.2" height="22"/>
					<Rect x="12.9" y="13" width="2.2" height="22"/>
				</SVG>
			),
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
			icon: (
				<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
					<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
					<Rect x="22.9" y="13" width="2.2" height="22"/>
					<Rect x="32.9" y="13" width="2.2" height="22"/>
				</SVG>
			),
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
			name: 'themeisle-blocks/section-columns-2-1-1',
			description: __( '4 equal columns', 'otter-blocks' ),
			icon: (
				<SVG viewBox="0 0 48 48" xmlns="http://www.w3.org/1999/xlink">
					<Path d="M41.8,13.2V34.8H6.2V13.2H41.8M42,11H6a2,2,0,0,0-2,2V35a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V13a2,2,0,0,0-2-2Z"/>
					<Rect x="13.9" y="13" width="2.2" height="22"/>
					<Rect x="32.9" y="13" width="2.2" height="22"/>
					<Rect x="22.9" y="13" width="2.2" height="22"/>
				</SVG>
			),
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
