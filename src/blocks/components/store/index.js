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

/**
 * General store used by the other components
 * Reference: https://github.com/WordPress/gutenberg/tree/master/packages/data
 */

const reducer = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
	case 'SET_POSTS_SLUGS':
		return {
			...state,
			posts: {
				...state.posts,
				slugs: action.slugs
			}
		};
	case 'SET_POSTS_USED_SLUGS':
		return {
			...state,
			posts: {
				...state.posts,
				usedSlugs: [ ...state.posts.usedSlugs, ...action.slugs ]
			}
		};
	case 'SET_ONLY_ONE_SLUG':
		return {
			...state,
			posts: {
				...state.posts,
				usedSlugs: [ action.slug ]
			}
		};
	case 'REMOVE_POSTS_USED_SLUGS':
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
			type: 'SET_POSTS_SLUGS',
			slugs: newSlugs
		};
	},
	setPostsUsedSlugs( slugs ) {
		return {
			type: 'SET_POSTS_USED_SLUGS',
			slugs
		};
	},
	setOnlyOneSlug( slug ) {
		return {
			type: 'SET_ONLY_ONE_SLUG',
			slug
		};
	},
	removePostsUsedSlugs( slugs ) {
		return {
			type: 'REMOVE_POSTS_USED_SLUGS',
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
