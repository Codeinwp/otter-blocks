/**
 * External dependencies.
 */
import deepmerge from 'deepmerge';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Edit from './edit.js';

const { Notice } = window.otterComponents;

const applyProConditions = conditions => {
	const proConditions = {
		'users': {
			label: __( 'Users', 'otter-blocks' ),
			conditions: [
				{
					value: 'loggedInUserMeta',
					label: __( 'Logged-in User Meta', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on meta of the logged-in user condition.' ),
					toogleVisibility: true
				}
			]
		},
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
		'advance': {
			label: __( 'Advance', 'otter-blocks' ),
			conditions: [
				{
					value: 'queryString',
					label: __( 'Query String', 'otter-blocks' ),
					help: __( 'The condition will be met if the URL contains specified parameters.' ),
					toogleVisibility: true
				},
				{
					value: 'country',
					label: __( 'Country', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on user\'s country based on the IP address.' ),
					toogleVisibility: true
				},
				{
					value: 'cookie',
					label: __( 'Cookie', 'otter-blocks' ),
					help: __( 'The selected block will be visible based on PHP cookies.' ),
					toogleVisibility: true
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

const applyProDefaults = ( attrs, value ) => {
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

	if ( 'cookie' === value ) {
		// eslint-disable-next-line camelcase
		attrs.cookie_compare = 'is_true';
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

const BlockConditions = (
	el,
	groupIndex,
	itemIndex,
	item,
	conditions,
	setAttributes,
	changeValue
) => {
	return (
		<Edit
			groupIndex={ groupIndex }
			itemIndex={ itemIndex }
			item={ item }
			conditions={ conditions }
			setAttributes={ setAttributes }
			changeValue={ changeValue }
		/>
	);
};

const Notices = el => {
	if ( Boolean( window.otterPro.isExpired ) ) {
		return (
			<Notice
				notice={ __( 'Otter Pro license has expired.', 'otter-blocks' ) }
				instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Block Conditions.', 'otter-blocks' ) }
			/>
		);
	}

	if ( ! Boolean( window.otterPro.isActive ) ) {
		return (
			<Notice
				notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
				instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Block Conditions.', 'otter-blocks' ) }
			/>
		);
	}

	return el;
};

if ( ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	addFilter( 'otter.blockConditions.conditions', 'themeisle-gutenberg/block-conditions-list', applyProConditions );
	addFilter( 'otter.blockConditions.defaults', 'themeisle-gutenberg/block-conditions-defaults', applyProDefaults );
}

addFilter( 'otter.blockConditions.controls', 'themeisle-gutenberg/block-conditions-controls', BlockConditions );
addFilter( 'otter.blockConditions.notices', 'themeisle-gutenberg/block-conditions-notices', Notices );
