/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

import { createReduxStore, register } from '@wordpress/data';

const DEFAULT_STATE = {
	courses: [],
	groups: []
};

const actions = {
	setCourses( courses ) {
		return {
			type: 'SET_COURSES',
			courses
		};
	},
	setGroups( groups ) {
		return {
			type: 'SET_GROUPS',
			groups
		};
	},
	fetchFromAPI( path ) {
		return {
			type: 'FETCH_FROM_API',
			path
		};
	}
};

const store = createReduxStore( 'otter-pro', {
	reducer( state = DEFAULT_STATE, action ) {
		if ( 'SET_COURSES' === action.type ) {
			return {
				...state,
				courses: action.courses
			};
		}

		if ( 'SET_GROUPS' === action.type ) {
			return {
				...state,
				groups: action.groups
			};
		}

		return state;
	},

	selectors: {
		getCourses( state ) {
			return state.courses;
		},
		getGroups( state ) {
			return state.groups;
		}
	},

	controls: {
		FETCH_FROM_API( action ) {
			return apiFetch({ path: action.path });
		}
	},

	resolvers: {
		*getCourses() {
			const data = yield actions.fetchFromAPI( 'ldlms/v2/sfwd-courses' );

			const courses = data.map( datum => ({
				value: datum.id,
				label: datum.title.rendered
			}) );

			return actions.setCourses( courses );
		},

		*getGroups() {
			const data = yield actions.fetchFromAPI( 'ldlms/v2/groups' );

			const groups = data.map( datum => ({
				value: datum.id,
				label: datum.title.rendered
			}) );

			return actions.setGroups( groups );
		}
	}
});

register( store );
