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
			label: __( 'Users', 'otter-pro' ),
			conditions: [
				{
					value: 'loggedInUserMeta',
					label: __( 'Logged-in User Meta', 'otter-pro' ),
					help: __( 'The selected block will be visible based on meta of the logged-in user condition.', 'otter-pro' ),
					toogleVisibility: true
				}
			]
		},
		'posts': {
			label: __( 'Posts', 'otter-pro' ),
			conditions: [
				{
					value: 'postMeta',
					label: __( 'Post Meta', 'otter-pro' ),
					help: __( 'The selected block will be visible based on post meta condition.', 'otter-pro'  ),
					toogleVisibility: true
				}
			]
		},
		'dateAndTime': {
			label: __( 'Date & Time', 'otter-pro' ),
			conditions: [
				{
					value: 'dateRange',
					label: __( 'Date Range', 'otter-pro' ),
					help: __( 'The selected block will be visible based on the date range. Timezone is used based on your WordPress settings.', 'otter-pro'  )
				},
				{
					value: 'dateRecurring',
					label: __( 'Date Recurring', 'otter-pro' ),
					help: __( 'The selected block will be visible based on the selected days. Timezone is used based on your WordPress settings.', 'otter-pro'  )
				},
				{
					value: 'timeRecurring',
					label: __( 'Time Recurring', 'otter-pro' ),
					help: __( 'The selected block will be visible during the selected time. Timezone is used based on your WordPress settings.', 'otter-pro'  )
				}
			]
		},
		'advance': {
			label: __( 'Advance', 'otter-pro' ),
			conditions: [
				{
					value: 'queryString',
					label: __( 'Query String', 'otter-pro' ),
					help: __( 'The condition will be met if the URL contains specified parameters.', 'otter-pro'  ),
					toogleVisibility: true
				},
				{
					value: 'country',
					label: __( 'Country', 'otter-pro' ),
					help: __( 'The selected block will be visible based on user\'s country based on the IP address.', 'otter-pro'  ),
					toogleVisibility: true
				},
				{
					value: 'cookie',
					label: __( 'Cookie', 'otter-pro' ),
					help: __( 'The selected block will be visible based on PHP cookies.', 'otter-pro'  ),
					toogleVisibility: true
				}
			]
		},
		'woocommerce': {
			label: __( 'WooCommerce', 'otter-pro' ),
			conditions: [
				{
					value: 'wooProductsInCart',
					label: __( 'Products in Cart', 'otter-pro' ),
					help: __( 'The selected block will be visible based on the products added to WooCommerce cart.', 'otter-pro'  ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooTotalCartValue',
					label: __( 'Total Cart Value', 'otter-pro' ),
					help: __( 'The selected block will be visible based on the total value of WooCommerce cart.', 'otter-pro'  ),
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooPurchaseHistory',
					label: __( 'Purchase History', 'otter-pro' ),
					help: __( 'The selected block will be visible based on user\'s WooCommerce purchase history.', 'otter-pro'  ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooTotalSpent',
					label: __( 'Total Spent', 'otter-pro' ),
					help: __( 'The selected block will be visible based on how much the user spent during lifetime.', 'otter-pro'  ),
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				}
			]
		},
		'woocommerceProduct': {
			label: __( 'WooCommerce Product', 'otter-pro' ),
			conditions: [
				{
					value: 'wooCategory',
					label: __( 'Product Categories', 'otter-pro' ),
					help: __( 'The selected block will be visible based on the product categories.', 'otter-pro'  ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooTag',
					label: __( 'Product Tags', 'otter-pro' ),
					help: __( 'The selected block will be visible based on the product tags.', 'otter-pro'  ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				},
				{
					value: 'wooAttribute',
					label: __( 'Product Attributes', 'otter-pro' ),
					help: __( 'The selected block will be visible based on the product attribute.', 'otter-pro'  ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasWooCommerce )
				}
			]
		},
		'learndash': {
			label: __( 'LearnDash', 'otter-pro' ),
			conditions: [
				{
					value: 'learnDashPurchaseHistory',
					label: __( 'Purchase History', 'otter-pro' ),
					help: __( 'The selected block will be visible based on user\'s LearnDash purchase history.', 'otter-pro'  ),
					toogleVisibility: true,
					isDisabled: ! Boolean( window.otterPro.hasLearnDash )
				},
				{
					value: 'learnDashCourseStatus',
					label: __( 'Course Status', 'otter-pro' ),
					help: __( 'The selected block will be visible based on user\'s LearnDash course status.', 'otter-pro'  ),
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

	if ( 'wooProductsInCart' === value ) {
		attrs.on = 'products';
	}

	if ( 'wooTotalCartValue' === value || 'wooTotalSpent' === value ) {
		attrs.compare = 'greater_than';
	}

	if ( 'learnDashPurchaseHistory' === value ) {
		attrs.on = 'courses';
	}

	if ( 'learnDashCourseStatus' === value ) {
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
				notice={ __( 'Otter Pro license has expired.', 'otter-pro' ) }
				instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Block Conditions.', 'otter-pro' ) }
			/>
		);
	}

	if ( ! Boolean( window.otterPro.isActive ) ) {
		return (
			<Notice
				notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
				instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Block Conditions.', 'otter-pro' ) }
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
