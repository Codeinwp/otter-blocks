/**
 * WordPress dependencies
 */

import { registerStore } from '@wordpress/data';

const DEFAULT_STATE = {
	showOnboarding: Boolean( window.themeisleGutenberg.showOnboarding ),
	viewType: 'Desktop'
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

		return state;
	},

	selectors: {
		getView( state ) {
			return state.viewType;
		},
		isOnboardingVisible( state ) {
			return state.showOnboarding;
		}
	},

	actions: {
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
		}
	}
});
