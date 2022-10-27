/**
 * External dependencies
 */
import hash from 'object-hash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getQueryStringFromObject } from '../../helpers/helper-functions.js';

const DEFAULT_STATE = {
	showOnboarding: Boolean( window.themeisleGutenberg.showOnboarding ) && 'false' !== localStorage?.getItem( 'o-show-onboarding' ),
	viewType: 'Desktop',
	visiblePopover: 'themeisle-blocks/dynamic-value',
	dynamicData: {},
	stripeProducts: []
};

const actions = {
	updateView( viewType ) {
		return {
			type: 'UPDATE_VIEW',
			viewType
		};
	},
	showOnboarding( showOnboarding ) {
		return {
			type: 'UPDATE_ONBOARDING',
			showOnboarding
		};
	},
	setVisiblePopover( visiblePopover ) {
		return {
			type: 'UPDATE_POPOVER',
			visiblePopover
		};
	},
	setDynamicData( key, value ) {
		return {
			type: 'SET_DYNAMIC_DATA',
			key,
			value
		};
	},
	setStripeProducts( products ) {
		return {
			type: 'SET_STRIPE_PRODUCTS',
			products
		};
	},
	fetchFromAPI( path ) {
		return {
			type: 'FETCH_FROM_API',
			path
		};
	}
};

registerStore( 'themeisle-gutenberg/data', {
	reducer( state = DEFAULT_STATE, action ) {
		if ( 'UPDATE_VIEW' === action.type ) {
			return {
				viewType: action.viewType
			};
		}

		if ( 'UPDATE_ONBOARDING' === action.type ) {
			return {
				showOnboarding: action.showOnboarding
			};
		}

		if ( 'UPDATE_POPOVER' === action.type ) {
			return {
				visiblePopover: action.visiblePopover
			};
		}

		if ( 'SET_DYNAMIC_DATA' === action.type ) {
			return {
				dynamicData: {
					...state.dynamicData,
					[ action.key ]: action.value
				}
			};
		}

		if ( 'SET_STRIPE_PRODUCTS' === action.type ) {
			return {
				stripeProducts: action.products
			};
		}

		return state;
	},

	actions,

	selectors: {
		getView( state ) {
			return state.viewType;
		},
		isOnboardingVisible( state ) {
			return state.showOnboarding;
		},
		getVisiblePopover( state ) {
			return state.visiblePopover;
		},
		getDynamicData( state, attrs ) {
			const key  = hash( attrs );
			return state.dynamicData[ key ];
		},
		getStripeProducts( state ) {
			return state.stripeProducts;
		}
	},

	controls: {
		FETCH_FROM_API( action ) {
			return apiFetch({ path: action.path });
		}
	},

	resolvers: {
		*getDynamicData( attrs ) {
			const key = hash( attrs );
			const path = 'otter/v1/dynamic/preview/?' + getQueryStringFromObject( attrs );
			const value = yield actions.fetchFromAPI( path );
			return actions.setDynamicData( key, value );
		},
		*getStripeProducts() {
			const path = 'otter/v1/stripe/products';
			const response = yield actions.fetchFromAPI( path );

			let value = [];

			if ( Boolean( response?.data?.length ) ) {
				value = response.data.map( product => {
					return {
						label: `${ product?.name } (id:${ product?.id })`,
						value: product?.id
					};
				});
			}

			return actions.setStripeProducts( value );
		}
	}
});
