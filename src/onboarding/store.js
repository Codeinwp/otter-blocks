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

const {
	editEntityRecord,
	saveEditedEntityRecord
} = dispatch( 'core' );

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
		id: 'archive_template',
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
	sourceTemplates: {},
	templateParts: {},
	library: {},
	selectedTemplates: {
		archive: 'default',
		single: 'default'
	},
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
			const edits = __experimentalGetDirtyEntityRecords();
			const selectedTemplate = select.getSelectedTemplate( 'archive' );

			dispatch( actions.setSaving( true ) );

			if ( 'archive_template' === step.id && !! selectedTemplate ) {
				const archive = select.getTemplate({ slug: 'archive' });
				let content = '';

				if ( 'default' === selectedTemplate ) {
					const template = archive?.id && select.getSourceTemplate( archive );
					content = template?.content?.raw ?? '';
				} else {
					const library = select.getLibrary( 'archive' );
					content = library[selectedTemplate]?.content?.raw ?? '';
				}

				editEntityRecord( 'postType', 'wp_template', archive.id, {
					'content': content
				});

				if ( ! edits.length ) {
					dispatch( actions.onContinue() );
					return;
				}
			}

			if ([ 'site_info', 'appearance', 'archive_template' ].includes( step.id )  ) {
				await Promise.all( edits.map( async edit => {
					await saveEditedEntityRecord( edit.kind, edit.name, edit?.key );
				}) );
			}

			dispatch( actions.setSaving( false ) );
			dispatch( actions.nextStep() );
		};
	},
	setTemplate( template ) {
		return {
			type: 'SET_TEMPLATE',
			template
		};
	},
	setSourceTemplate( template ) {
		return {
			type: 'SET_SOURCE_TEMPLATE',
			template
		};
	},
	setTemplatePart( templatePart ) {
		return {
			type: 'SET_TEMPLATE_PART',
			templatePart
		};
	},
	setLibrary( library ) {
		return {
			type: 'SET_LIBRARY',
			library
		};
	},
	setSelectedTemplate( slug, template ) {
		return {
			type: 'SET_SELECTED_TEMPLATE',
			slug,
			template
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
		case 'SET_SOURCE_TEMPLATE':
			return {
				...state,
				sourceTemplates: {
					...state.sourceTemplates,
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
		case 'SET_LIBRARY':
			return {
				...state,
				library: action.library
			};
		case 'SET_SELECTED_TEMPLATE':
			return {
				...state,
				selectedTemplates: {
					...state.selectedTemplates,
					[action.slug]: action.template
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
		getSourceTemplate( state, query ) {
			return state.sourceTemplates?.[ query?.slug ];
		},
		getTemplatePart( state, slug ) {
			return state.templateParts?.[ slug ];
		},
		getLibrary( state, type ) {
			if ( ! type ) {
				return state.library;
			}

			return state.library[ type ] ?? {};
		},
		getSelectedTemplate( state, type ) {
			return state.selectedTemplates[ type ];
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
			let path = addQueryArgs( '/wp/v2/templates/lookup', query );
			const value = yield actions.fetchFromAPI( path );
			return actions.setTemplate( value );
		},
		*getSourceTemplate( query ) {
			const path = addQueryArgs(
				`/wp/v2/templates/${ query?.id }`,
				{
					source: 'theme',
					context: 'edit'
				}
			);
			const value = yield actions.fetchFromAPI( path );
			return actions.setSourceTemplate( value );
		},
		*getTemplatePart( slug ) {
			const path = `/wp/v2/template-parts/${ slug }` ;
			const value = yield actions.fetchFromAPI( path );
			return actions.setTemplatePart( value );
		},
		*getLibrary() {
			const path = '/otter/v1/onboarding/templates';
			const value = yield actions.fetchFromAPI( path );

			if ( ! value?.success ) {
				return;
			}

			return actions.setLibrary( value.data );
		}
	}
});

register( store );
