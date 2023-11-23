/**
 * WordPress dependencies.
 */
import apiFetch from '@wordpress/api-fetch';

import {
	createReduxStore,
	dispatch,
	register,
	select
} from '@wordpress/data';

import { addQueryArgs } from '@wordpress/url';

const { __experimentalGetDirtyEntityRecords } = select( 'core' );

const { saveEditedEntityRecord } = dispatch( 'core' );

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
	templateParts: {},
	isSaving: false
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
	onContinue() {
		return async({ dispatch, select }) => {
			const step = select.getStep();

			if ([ 'site_info', 'appearance' ].includes( step.id )  ) {
				const edits = __experimentalGetDirtyEntityRecords();

				dispatch( actions.setSaving( true ) );

				await Promise.all( edits.map( async edit => {
					await saveEditedEntityRecord( edit.kind, edit.name, edit?.key );
				}) );

				dispatch( actions.setSaving( false ) );
			}

			dispatch( actions.nextStep() );
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
	setSaving( isSaving ) {
		return {
			type: 'SET_SAVING',
			isSaving
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
		case 'SET_SAVING':
			return {
				...state,
				isSaving: action.isSaving
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
		},
		isSaving( state ) {
			return state.isSaving;
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
