/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';

const DEFAULT_STATE = {
	viewType: 'Desktop'
};

registerStore( 'themeisle-gutenberg/data', {
	reducer( state = DEFAULT_STATE, action ) {
		if ( 'UPDATE_VIEW' === action.type ) {
			return {
				viewType: action.viewType
			};
		}

		return state;
	},

	selectors: {
		getView( state ) {
			return state.viewType;
		}
	},

	actions: {
		updateView( viewType ) {
			return {
				type: 'UPDATE_VIEW',
				viewType
			};
		}
	}
});
