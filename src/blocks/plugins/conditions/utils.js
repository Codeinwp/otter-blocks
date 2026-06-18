/**
 * WordPress dependencies.
 */
import {
	__,
	_n,
	sprintf
} from '@wordpress/i18n';

import { dateI18n } from '@wordpress/date';

import { applyFilters } from '@wordpress/hooks';

import {
	archive,
	backup,
	calendar,
	category,
	code,
	commentAuthorAvatar,
	currencyDollar,
	desktop,
	globe,
	institution,
	listView,
	notAllowed,
	page,
	payment,
	people,
	postAuthor,
	receipt,
	settings,
	store,
	tag,
	update
} from '@wordpress/icons';

const conditionIcons = {
	screenSize: desktop,
	loggedInUser: commentAuthorAvatar,
	loggedOutUser: notAllowed,
	userRoles: people,
	loggedInUserMeta: listView,
	postAuthor,
	postType: page,
	postCategory: category,
	postTag: tag,
	postMeta: listView,
	stripePurchaseHistory: payment,
	dateRange: calendar,
	dateRecurring: update,
	timeRecurring: backup,
	queryString: code,
	country: globe,
	cookie: archive,
	wooProductsInCart: store,
	wooTotalCartValue: currencyDollar,
	wooPurchaseHistory: receipt,
	wooTotalSpent: currencyDollar,
	wooCategory: category,
	wooTag: tag,
	wooAttribute: listView,
	learnDashPurchaseHistory: receipt,
	learnDashCourseStatus: institution
};

export const getConditionIcon = type => conditionIcons[ type ] ?? settings;

const screenSizeLabels = {
	mobile: __( 'Mobile', 'otter-blocks' ),
	tablet: __( 'Tablet', 'otter-blocks' ),
	desktop: __( 'Desktop', 'otter-blocks' )
};

const compareLabels = {
	'is_true': __( 'is true', 'otter-blocks' ),
	'is_false': __( 'is false', 'otter-blocks' ),
	'is_empty': __( 'is empty', 'otter-blocks' ),
	'if_equals': __( 'is equal to', 'otter-blocks' ),
	'if_contains': __( 'contains', 'otter-blocks' )
};

const dayLabels = {
	monday: __( 'Mon', 'otter-blocks' ),
	tuesday: __( 'Tue', 'otter-blocks' ),
	wednesday: __( 'Wed', 'otter-blocks' ),
	thursday: __( 'Thu', 'otter-blocks' ),
	friday: __( 'Fri', 'otter-blocks' ),
	saturday: __( 'Sat', 'otter-blocks' ),
	sunday: __( 'Sun', 'otter-blocks' )
};

const courseStatusLabels = {
	'not_started': __( 'not started', 'otter-blocks' ),
	'in_progress': __( 'in progress', 'otter-blocks' ),
	'completed': __( 'completed', 'otter-blocks' )
};

const compareSummary = ( key, compare, value ) => {
	if ( ! key ) {
		return '';
	}

	const parts = [ key, compareLabels[ compare ] ?? compareLabels['is_true'] ];

	if ( value && ( 'if_equals' === compare || 'if_contains' === compare ) ) {
		parts.push( `"${ value }"` );
	}

	return parts.join( ' ' );
};

/**
 * Get a short human-readable summary of a condition's current value.
 *
 * @param {Object} condition The condition object.
 * @return {string} The summary.
 */
export const getConditionSummary = condition => {
	let summary = '';
	let placeholder = '';

	switch ( condition.type ) {
	case 'screenSize': {
		const sizes = ( condition['screen_sizes'] ?? []).map( size => screenSizeLabels[ size ]).filter( Boolean );

		if ( sizes.length ) {

			/* translators: %s: a list of devices, e.g. Mobile, Tablet */
			summary = sprintf( __( 'Hidden on %s', 'otter-blocks' ), sizes.join( ', ' ) );
		} else {
			summary = __( 'Visible on all screen sizes', 'otter-blocks' );
		}
		break;
	}
	case 'loggedInUser':
		summary = __( 'Visitor is logged in', 'otter-blocks' );
		break;
	case 'loggedOutUser':
		summary = __( 'Visitor is logged out', 'otter-blocks' );
		break;
	case 'userRoles':
		if ( condition.roles?.length ) {
			summary = condition.roles.join( ', ' );
		} else {
			placeholder = __( 'Select user roles', 'otter-blocks' );
		}
		break;
	case 'loggedInUserMeta':
	case 'postMeta':
		summary = compareSummary( condition['meta_key'], condition['meta_compare'], condition['meta_value']);
		if ( ! summary ) {
			placeholder = __( 'Set a meta key', 'otter-blocks' );
		}
		break;
	case 'postAuthor':
		if ( condition.authors?.length ) {
			summary = condition.authors.join( ', ' );
		} else {
			placeholder = __( 'Select authors', 'otter-blocks' );
		}
		break;
	case 'postType':
		if ( condition['post_types']?.length ) {
			summary = condition['post_types'].join( ', ' );
		} else {
			placeholder = __( 'Select post types', 'otter-blocks' );
		}
		break;
	case 'postCategory':
		if ( condition.categories?.length ) {
			summary = condition.categories.join( ', ' );
		} else {
			placeholder = __( 'Select categories', 'otter-blocks' );
		}
		break;
	case 'postTag':
		if ( condition.tags?.length ) {
			summary = condition.tags.join( ', ' );
		} else {
			placeholder = __( 'Select tags', 'otter-blocks' );
		}
		break;
	case 'stripePurchaseHistory':
		if ( condition.product ) {

			/* translators: %s: the Stripe product ID */
			summary = sprintf( __( 'Purchased %s', 'otter-blocks' ), condition.product );
		} else {
			placeholder = __( 'Select a product', 'otter-blocks' );
		}
		break;
	case 'queryString': {
		const params = ( condition['query_string'] ?? '' ).split( '\n' ).map( param => param.trim() ).filter( Boolean );

		if ( ! params.length ) {
			placeholder = __( 'Set URL parameters', 'otter-blocks' );
		} else if ( 1 === params.length ) {
			summary = params[0];
		} else {

			/* translators: %1$s: the first URL parameter, %2$d: the number of remaining parameters */
			summary = sprintf( __( '%1$s + %2$d more', 'otter-blocks' ), params[0], params.length - 1 );
		}
		break;
	}
	case 'country':
		if ( condition.value ) {

			/* translators: %s: a list of country codes, e.g. US, CA */
			summary = sprintf( __( 'Visitor is from %s', 'otter-blocks' ), condition.value );
		} else {
			placeholder = __( 'Set country codes', 'otter-blocks' );
		}
		break;
	case 'cookie':
		summary = compareSummary( condition['cookie_key'], condition['cookie_compare'], condition['cookie_value']);
		if ( ! summary ) {
			placeholder = __( 'Set a cookie key', 'otter-blocks' );
		}
		break;
	case 'dateRange':
		if ( condition['start_date'] || condition['end_date']) {
			const startDate = condition['start_date'] ? dateI18n( 'M j, Y', condition['start_date']) : '…';
			const endDate = condition['end_date'] ? dateI18n( 'M j, Y', condition['end_date']) : '…';
			summary = `${ startDate } – ${ endDate }`;
		} else {
			placeholder = __( 'Select a date range', 'otter-blocks' );
		}
		break;
	case 'dateRecurring': {
		const days = ( condition.days ?? []).map( day => dayLabels[ day ]).filter( Boolean );

		if ( days.length ) {
			summary = days.join( ', ' );
		} else {
			placeholder = __( 'Select days', 'otter-blocks' );
		}
		break;
	}
	case 'timeRecurring':
		if ( condition['start_time'] || condition['end_time']) {
			summary = `${ condition['start_time'] ?? '…' } – ${ condition['end_time'] ?? '…' }`;
		} else {
			placeholder = __( 'Select a time interval', 'otter-blocks' );
		}
		break;
	case 'wooProductsInCart':
		if ( 'categories' === condition.on ) {
			if ( condition.categories?.length ) {

				/* translators: %d: the number of categories */
				summary = sprintf( _n( '%d category in cart', '%d categories in cart', condition.categories.length, 'otter-blocks' ), condition.categories.length );
			} else {
				placeholder = __( 'Select categories', 'otter-blocks' );
			}
		} else if ( condition.products?.length ) {

			/* translators: %d: the number of products */
			summary = sprintf( _n( '%d product in cart', '%d products in cart', condition.products.length, 'otter-blocks' ), condition.products.length );
		} else {
			placeholder = __( 'Select products', 'otter-blocks' );
		}
		break;
	case 'wooTotalCartValue':
		if ( condition.value ) {

			/* translators: %1$s: the compare operator, %2$s: the cart value */
			summary = sprintf( __( 'Cart total %1$s %2$s', 'otter-blocks' ), 'less_than' === condition.compare ? '<' : '>', condition.value );
		} else {
			placeholder = __( 'Set a cart value', 'otter-blocks' );
		}
		break;
	case 'wooTotalSpent':
		if ( condition.value ) {

			/* translators: %1$s: the compare operator, %2$s: the amount spent */
			summary = sprintf( __( 'Total spent %1$s %2$s', 'otter-blocks' ), 'less_than' === condition.compare ? '<' : '>', condition.value );
		} else {
			placeholder = __( 'Set an amount', 'otter-blocks' );
		}
		break;
	case 'wooPurchaseHistory':
		if ( condition.products?.length ) {

			/* translators: %d: the number of products */
			summary = sprintf( _n( '%d product purchased', '%d products purchased', condition.products.length, 'otter-blocks' ), condition.products.length );
		} else {
			placeholder = __( 'Select products', 'otter-blocks' );
		}
		break;
	case 'wooCategory':
		if ( condition.categories?.length ) {

			/* translators: %d: the number of categories */
			summary = sprintf( _n( '%d category selected', '%d categories selected', condition.categories.length, 'otter-blocks' ), condition.categories.length );
		} else {
			placeholder = __( 'Select categories', 'otter-blocks' );
		}
		break;
	case 'wooTag':
		if ( condition.tags?.length ) {

			/* translators: %d: the number of tags */
			summary = sprintf( _n( '%d tag selected', '%d tags selected', condition.tags.length, 'otter-blocks' ), condition.tags.length );
		} else {
			placeholder = __( 'Select tags', 'otter-blocks' );
		}
		break;
	case 'wooAttribute':
		if ( condition.terms?.length ) {
			summary = condition.terms.join( ', ' );
		} else if ( condition.attribute ) {
			placeholder = __( 'Select terms', 'otter-blocks' );
		} else {
			placeholder = __( 'Select an attribute', 'otter-blocks' );
		}
		break;
	case 'learnDashPurchaseHistory':
		if ( 'groups' === condition.on ) {
			if ( condition.groups?.length ) {

				/* translators: %d: the number of groups */
				summary = sprintf( _n( '%d group purchased', '%d groups purchased', condition.groups.length, 'otter-blocks' ), condition.groups.length );
			} else {
				placeholder = __( 'Select groups', 'otter-blocks' );
			}
		} else if ( condition.courses?.length ) {

			/* translators: %d: the number of courses */
			summary = sprintf( _n( '%d course purchased', '%d courses purchased', condition.courses.length, 'otter-blocks' ), condition.courses.length );
		} else {
			placeholder = __( 'Select courses', 'otter-blocks' );
		}
		break;
	case 'learnDashCourseStatus':
		if ( condition.course ) {

			/* translators: %s: the course status, e.g. completed */
			summary = sprintf( __( 'Course %s', 'otter-blocks' ), courseStatusLabels[ condition.status ] ?? courseStatusLabels['not_started']);
		} else {
			placeholder = __( 'Select a course', 'otter-blocks' );
		}
		break;
	}

	if ( placeholder ) {
		return applyFilters( 'otter.blockConditions.conditionSummary', placeholder, condition );
	}

	if ( summary && false === condition.visibility ) {

		/* translators: %s: the condition summary, e.g. "Cart total > 50" */
		summary = sprintf( __( 'Hidden if: %s', 'otter-blocks' ), summary );
	}

	return applyFilters( 'otter.blockConditions.conditionSummary', summary, condition );
};
