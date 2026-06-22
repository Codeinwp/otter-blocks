/**
 * WordPress dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

const DEFAULT_STATE = {
	posts: {
		slugs: [],
		usedSlugs: []
	}
};

const ACTION_TYPES = {
	SET_POSTS_SLUGS: 'SET_POSTS_SLUGS',
	SET_POSTS_USED_SLUGS: 'SET_POSTS_USED_SLUGS',
	SET_ONLY_ONE_SLUG: 'SET_ONLY_ONE_SLUG',
	REMOVE_POSTS_USED_SLUGS: 'REMOVE_POSTS_USED_SLUGS'
};

/**
 * General store used by the other components
 * Reference: https://github.com/WordPress/gutenberg/tree/master/packages/data
 */

const reducer = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
	case ACTION_TYPES.SET_POSTS_SLUGS:
		return {
			...state,
			posts: {
				...state.posts,
				slugs: action.slugs
			}
		};
	case ACTION_TYPES.SET_POSTS_USED_SLUGS:
		return {
			...state,
			posts: {
				...state.posts,
				usedSlugs: [ ...state.posts.usedSlugs, ...action.slugs ]
			}
		};
	case ACTION_TYPES.SET_ONLY_ONE_SLUG:
		return {
			...state,
			posts: {
				...state.posts,
				usedSlugs: [ action.slug ]
			}
		};
	case ACTION_TYPES.REMOVE_POSTS_USED_SLUGS:
		return {
			...state,
			posts: {
				...state.posts,
				usedSlugs: state.posts.usedSlugs.filter( s => ! action.slugs.includes( s ) )
			}
		};
	default:
		return state;
	}
};

/**
 * Functions used to send data to the store.
 * Used with the hooks: useDispatch & dispatch
 */
const actions = {
	setPostsSlugs( newSlugs ) {
		return {
			type: ACTION_TYPES.SET_POSTS_SLUGS,
			slugs: newSlugs
		};
	},
	setPostsUsedSlugs( slugs ) {
		return {
			type: ACTION_TYPES.SET_POSTS_USED_SLUGS,
			slugs
		};
	},
	setOnlyOneSlug( slug ) {
		return {
			type: ACTION_TYPES.SET_ONLY_ONE_SLUG,
			slug
		};
	},
	removePostsUsedSlugs( slugs ) {
		return {
			type: ACTION_TYPES.REMOVE_POSTS_USED_SLUGS,
			slugs
		};
	}
};

/**
 * Functions used to get data from the store.
 * Used with the hooks: useSelect & select
 */
const selectors = {
	getPostsSlugs( state ) {
		return state.posts.slugs;
	},
	getPostsUsedSlugs( state ) {
		return state.posts.usedSlugs;
	}
};

const store = createReduxStore( 'otter-store', {
	reducer,
	actions,
	selectors
});

register( store );
