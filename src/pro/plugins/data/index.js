/**
 * WordPress dependencies
 */
import { pick } from 'lodash';

import apiFetch from '@wordpress/api-fetch';

import {
	createReduxStore,
	register
} from '@wordpress/data';

const DEFAULT_STATE = {
	acfGroups: [],
	acfFields: {},
	learndDashCourses: [],
	learndDashGroups: []
};

const actions = {
	setCourses( courses ) {
		return {
			type: 'SET_LEARNDASH_COURSES',
			courses
		};
	},
	setGroups( groups ) {
		return {
			type: 'SET_LEARNDASH_GROUPS',
			groups
		};
	},
	setACFData( groups, fields ) {
		return {
			type: 'SET_ACF_DATA',
			groups,
			fields
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
		if ( 'SET_LEARNDASH_COURSES' === action.type ) {
			return {
				...state,
				learndDashCourses: action.courses
			};
		}

		if ( 'SET_LEARNDASH_GROUPS' === action.type ) {
			return {
				...state,
				learndDashGroups: action.groups
			};
		}

		if ( 'SET_ACF_DATA' === action.type ) {
			return {
				...state,
				acfGroups: action.groups,
				acfFields: action.fields
			};
		}

		return state;
	},

	selectors: {
		getLearnDashCourses( state ) {
			return state.learndDashCourses;
		},
		getLearnDashGroups( state ) {
			return state.learndDashGroups;
		},
		getACFData( state ) {
			return {
				groups: state.acfGroups,
				fields: state.acfFields
			};
		}
	},

	controls: {
		FETCH_FROM_API( action ) {
			return apiFetch({ path: action.path });
		}
	},

	resolvers: {
		*getLearnDashCourses() {
			if ( ! Boolean( window.otterPro.hasLearnDash ) ) {
				return;
			}

			const data = yield actions.fetchFromAPI( 'ldlms/v2/sfwd-courses' );

			const courses = data.map( datum => ({
				value: datum.id,
				label: datum.title.rendered
			}) );

			return actions.setCourses( courses );
		},

		*getLearnDashGroups() {
			if ( ! Boolean( window.otterPro.hasLearnDash ) ) {
				return;
			}

			const data = yield actions.fetchFromAPI( 'ldlms/v2/groups' );

			const groups = data.map( datum => ({
				value: datum.id,
				label: datum.title.rendered
			}) );

			return actions.setGroups( groups );
		},

		*getACFData() {
			if ( ! window.acf ) {
				return;
			}

			const data = yield actions.fetchFromAPI( 'otter/v1/acf-fields' );

			if ( data?.success ) {
				const groups = data.groups;
				const fields = groups
					?.map( ({ fields, data }) => {
						return fields.map( field => {
							field.urlLocation = `${ window.themeisleGutenberg?.rootUrl || '' }/wp-admin/post.php?post=${ data.ID }&action=edit`;
							return field;
						});
					})
					.flat()
					.reduce( ( acc, field ) => {
						if ( field.key && field.label ) {
							acc[ field.key ] = pick( field, [ 'label', 'type', 'prepend', 'append', 'default_value', 'value', 'urlLocation' ]);
						}
						return acc;
					}, {});

				return actions.setACFData( groups, fields );
			}

			return actions.setACFData([], {});
		}
	}
});

register( store );
