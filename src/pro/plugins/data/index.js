/**
 * WordPress dependencies
 */
import { pick } from 'lodash';

import apiFetch from '@wordpress/api-fetch';

import { registerStore } from '@wordpress/data';

const DEFAULT_STATE = {
	acfGroups: [],
	acfFields: {},
	haveACFLoaded: false,
	learndDashCourses: [],
	learndDashGroups: [],
	haveLoadedCourses: false,
	haveLoadedGroups: false
};

const actions = {
	setCourses( courses ) {
		return {
			type: 'SET_LEARNDASH_COURSES',
			courses,
			haveLoadedCourses: true
		};
	},
	setGroups( groups ) {
		return {
			type: 'SET_LEARNDASH_GROUPS',
			groups,
			haveLoadedGroups: true
		};
	},
	setACFData( groups, fields, isLoaded ) {
		return {
			type: 'SET_ACF_DATA',
			groups,
			fields,
			haveACFLoaded: isLoaded
		};
	},
	fetchFromAPI( path ) {
		return {
			type: 'FETCH_FROM_API',
			path
		};
	}
};

registerStore( 'otter-pro', {
	reducer( state = DEFAULT_STATE, action ) {
		if ( 'SET_LEARNDASH_COURSES' === action.type ) {
			return {
				...state,
				learndDashCourses: action.courses,
				haveLoadedCourses: action.haveLoadedCourses
			};
		}

		if ( 'SET_LEARNDASH_GROUPS' === action.type ) {
			return {
				...state,
				learndDashGroups: action.groups,
				haveLoadedGroups: action.haveLoadedGroups
			};
		}

		if ( 'SET_ACF_DATA' === action.type ) {
			return {
				...state,
				acfGroups: action.groups,
				acfFields: action.fields,
				haveACFLoaded: action.haveACFLoaded
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
		},
		isACFLoaded( state ) {
			return state.haveACFLoaded;
		},
		isLearnDashCoursesLoaded( state ) {
			return state.haveLoadedCourses;
		},
		isLearnDashGroupsLoaded( state ) {
			return state.haveLoadedGroups;
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
				const { groups } = data;
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

				return actions.setACFData( groups, fields, true );
			}

			return actions.setACFData([], {}, false );
		}
	}
});
