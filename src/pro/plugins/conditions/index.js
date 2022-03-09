/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import deepmerge from 'deepmerge';

import { addFilter } from '@wordpress/hooks';

const applyProConditions = conditions => {
	const proConditions = {
		'posts': {
			label: __( 'Posts', 'otter-blocks' ),
			conditions: [
				{
					value: 'postMeta',
					label: __( 'Post Meta', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on post meta condition.' ),
					toogleVisibility: true
				}
			]
		},
		'url': {
			label: __( 'URL', 'otter-blocks' ),
			conditions: [
				{
					value: 'queryString',
					label: __( 'Query String', 'otter-blocks' ),
					help: __( 'The condition will be met if the URL contains specified parameters.' ),
					toogleVisibility: true
				}
			]
		},
		'dateAndTime': {
			label: __( 'Date & Time', 'otter-blocks' ),
			conditions: [
				{
					value: 'dateRange',
					label: __( 'Date Range', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on the date range. Timezone is used based on your WordPress settings.' )
				},
				{
					value: 'dateRecurring',
					label: __( 'Date Recurring', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on the selected days. Timezone is used based on your WordPress settings.' )
				},
				{
					value: 'timeRecurring',
					label: __( 'Time Recurring', 'otter-blocks' ),
					help: __( 'The selected block will be visible during the selected time. Timezone is used based on your WordPress settings.' )
				}
			]
		},
		'woocommerce': {
			label: __( 'WooCommerce', 'otter-blocks' ),
			conditions: [
				{
					value: 'wooProductsInCart',
					label: __( 'Products in Cart', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on the products added to WooCommerce cart.' ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooTotalCartValue',
					label: __( 'Total Cart Value', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on the total value of WooCommerce cart.' ),
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooPurchaseHistory',
					label: __( 'Purchase History', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on user\'s WooCommerce purchase history.' ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooTotalSpent',
					label: __( 'Total Spent', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on how much the user spent during lifetime.' ),
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				}
			]
		},
		'learndash': {
			label: __( 'LearnDash', 'otter-blocks' ),
			conditions: [
				{
					value: 'learnDashPurchaseHistory',
					label: __( 'Purchase History', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on user\'s LearnDash purchase history.' ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasLearnDash )
				},
				{
					value: 'learnDashCourseStatus',
					label: __( 'Course Status', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on user\'s LearnDash course status.' ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasLearnDash )
				}
			]
		}
	};

	Object.keys( conditions ).forEach( i => {
		conditions[i].conditions = conditions[i].conditions.filter( o => ! o?.isDisabled );

		if ( ! Boolean( conditions[ i ].conditions.length ) ) {
			delete conditions[ i ];
		}
	});

	conditions = deepmerge( conditions, proConditions );

	return conditions;
};

const applyProDefaults = ({ attrs, value }) => {
	if ( 'postMeta' === value ) {
		attrs.visibility = true;
	}

	if ( 'postMeta' === value ) {
		// eslint-disable-next-line camelcase
		attrs.meta_compare = 'is_true';
	}

	if ( 'queryString' === value ) {
		attrs.match = 'any';
	}

	if ( 'wooProductsInCart' == value ) {
		attrs.on = 'products';
	}

	if ( 'wooTotalCartValue' === value || 'wooTotalSpent' === value ) {
		attrs.compare = 'greater_than';
	}

	if ( 'learnDashPurchaseHistory' == value ) {
		attrs.on = 'courses';
	}

	if ( 'learnDashCourseStatus' == value ) {
		attrs.status = 'not_started';
	}

	return attrs;
};

addFilter( 'otter.blockConditions.conditions', 'themeisle-gutenberg/block-conditions-list', applyProConditions );
addFilter( 'otter.blockConditions.defaults', 'themeisle-gutenberg/block-conditions-defaults', applyProDefaults );
