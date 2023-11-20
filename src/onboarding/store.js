/**
 * WordPress dependencies.
 */
import {
	createReduxStore,
	register
} from '@wordpress/data';

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
	step: 1
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
		}

		return state;
	},

	actions,

	selectors: {
		getStep( state ) {
			return STEPS.find( step => step.value === state.step );
		}
	}
});

register( store );
