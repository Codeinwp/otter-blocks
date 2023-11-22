/**
 * WordPress dependencies.
 */
import apiFetch from '@wordpress/api-fetch';

import {
	createReduxStore,
	register
} from '@wordpress/data';

import { addQueryArgs } from '@wordpress/url';

const STEPS = [
	{
		id: 'site_info',
		value: 1
	},
	{
		id: 'appearance',
		value: 2
	},
	{
		id: 'blog_template',
		value: 3
	},
	{
		id: 'single_template',
		value: 4
	},
	{
		id: 'additional_templates',
		value: 5
	}
];

const DEFAULT_STATE = {
	step: 1,
	templates: {},
	templateParts: {}
};

const actions = {
	setStep( step ) {
		return {
			type: 'SET_STEP',
			step
		};
	},
	nextStep() {
		return ({ dispatch, select }) => {
			const step = select.getStep();
			const newStep = STEPS.length < ( step.value + 1 ) ? STEPS.length : ( step.value + 1 );

			dispatch( actions.setStep( newStep ) );
		};
	},
	previousStep() {
		return ({ dispatch, select }) => {
			const step = select.getStep();
			const newStep = 1 > ( step.value - 1 ) ? 1 : ( step.value - 1 );

			dispatch( actions.setStep( newStep ) );
		};
	},
	setTemplate( template ) {
		return {
			type: 'SET_TEMPLATE',
			template
		};
	},
	setTemplatePart( templatePart ) {
		return {
			type: 'SET_TEMPLATE_PART',
			templatePart
		};
	},
	fetchFromAPI( path ) {
		return {
			type: 'FETCH_FROM_API',
			path
		};
	}
};

const store = createReduxStore( 'otter/onboarding', {
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
		case 'SET_STEP':
			return {
				...state,
				step: action.step
			};

		case 'SET_TEMPLATE':
			return {
				...state,
				templates: {
					...state.templates,
					[action.template.slug]: action.template
				}
			};

		case 'SET_TEMPLATE_PART':
			return {
				...state,
				templateParts: {
					...state.templateParts,
					[action.templatePart.id]: action.templatePart
				}
			};
		}

		return state;
	},

	actions,

	selectors: {
		getStep( state ) {
			return STEPS.find( step => step.value === state.step );
		},
		getTemplate( state, query ) {
			return state.templates?.[ query?.slug ];
		},
		getTemplatePart( state, slug ) {
			return state.templateParts?.[ slug ];
		}
	},

	controls: {
		FETCH_FROM_API( action ) {
			return apiFetch({ path: action.path });
		}
	},

	resolvers: {
		*getTemplate( query ) {
			const path = addQueryArgs( '/wp/v2/templates/lookup', query );
			const value = yield actions.fetchFromAPI( path );
			return actions.setTemplate( value );
		},
		*getTemplatePart( slug ) {
			const path = `/wp/v2/template-parts/${ slug }` ;
			const value = yield actions.fetchFromAPI( path );
			return actions.setTemplatePart( value );
		}
	}
});

register( store );
