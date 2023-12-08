/* eslint-disable camelcase */
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

/**
 * Internal dependencies.
 */
import STEP_DATA from './steps';
import { recordEvent } from './utils';

const STEPS = Object.keys( STEP_DATA )
	.filter( i => !! STEP_DATA[i].isSupported )
	.map( ( i, o ) => ({
		id: i,
		value: o
	}) );

const { __experimentalGetDirtyEntityRecords } = select( 'core' );

const {
	editEntityRecord,
	saveEditedEntityRecord,
	saveEntityRecord
} = dispatch( 'core' );

const DEFAULT_STATE = {
	step: 0,
	templates: {},
	sourceTemplates: {},
	templateParts: {},
	library: {},
	selectedTemplates: {
		archive: '',
		single: '',
		pageTemplates: []
	},
	importedTemplates: [],
	changedData: {
		design_choices: {
			palette: 'default'
		},
		fields_filled: {}
	},
	isSaving: false,
	isFinished: false,
	sessionID: ''
};

const actions = {
	setStep( step ) {
		return {
			type: 'SET_STEP',
			step
		};
	},
	nextStep( isSkip = false ) {
		return ({ dispatch, select }) => {
			const step = select.getStep();
			const isLast = STEPS.length === ( step.value + 1 );
			const newStep = isLast ? STEPS.length : ( step.value + 1 );

			dispatch( actions.setSaving( false ) );

			if ( isLast ) {
				recordEvent({
					step_id: STEPS.length,
					step_status: 'completed'
				});

				dispatch( actions.setFinished( true ) );
				return;
			}

			if ( isSkip ) {
				recordEvent({
					step_id: step.value + 1,
					step_status: 'skip'
				});
			}

			dispatch( actions.setStep( newStep ) );
		};
	},
	previousStep() {
		return ({ dispatch, select }) => {
			const step = select.getStep();
			const isFirst = 0 === step.value;
			const newStep = isFirst ? 0 : ( step.value - 1 );

			dispatch( actions.setSaving( false ) );
			dispatch( actions.setStep( newStep ) );
		};
	},
	setFinished( isFinished ) {
		return {
			type: 'SET_FINISHED',
			isFinished
		};
	},
	onContinue() {
		return async({ dispatch, select }) => {
			const step = select.getStep();
			const changedData = select.getChangedData();

			let event = {
				type: step.id,
				step_id: step.value + 1,
				step_status: 'completed'
			};

			dispatch( actions.setSaving( true ) );

			if ([ 'front-page_template', 'archive_template', 'single_template' ].includes( step.id ) ) {
				const type = step.id.replace( '_template', '' );

				const selectedTemplate = select.getSelectedTemplate( type );

				event.selected_template = selectedTemplate;

				if ( ! selectedTemplate ) {
					dispatch( actions.nextStep() );
					return;
				}

				const currentTemplate = select.getTemplate({ slug: type });
				let content = '';

				if ( 'default' === selectedTemplate ) {
					const template = currentTemplate?.id && select.getSourceTemplate( currentTemplate );
					content = template?.content?.raw ?? '';
				} else {
					const library = select.getLibrary( type );
					content = library[selectedTemplate]?.content?.raw ?? '';
				}

				editEntityRecord( 'postType', 'wp_template', currentTemplate.id, {
					'content': content
				});
			}

			if ([ 'site_info', 'appearance', 'front-page_template', 'archive_template', 'single_template' ].includes( step.id ) ) {
				const edits = __experimentalGetDirtyEntityRecords();

				await Promise.all( edits.map( async edit => {
					await saveEditedEntityRecord( edit.kind, edit.name, edit?.key );
				}) );
			}

			if ( 'site_info' === step.id ) {
				event.fields_filled = changedData.fields_filled;
			}

			if ( 'appearance' === step.id ) {
				event.design_choices = changedData.design_choices;
			}

			if ( 'additional_templates' === step.id ) {
				const selectedTemplates = select.getSelectedTemplate( 'pageTemplates' );
				const pageTemplates = select.getLibrary( 'page_templates' );
				const importedTemplates = select.getImportedTemplates();

				event.imported_items = selectedTemplates;

				await Promise.all(
					selectedTemplates
						.filter( template => ! importedTemplates.find( importedTemplate => importedTemplate === template ) )
						.map( async template => {
							const pageTemplate = pageTemplates[ template ];

							await saveEntityRecord( 'postType', 'page', {
								status: 'publish',
								title: pageTemplate.title,
								content: pageTemplate.content.raw,
								template: pageTemplate.template
							});

							dispatch( actions.setImportedTemplate( template ) );
						}) );
			}

			recordEvent( event );

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
	setImportedTemplate( template ) {
		return {
			type: 'SET_IMPORTED_TEMPLATE',
			template
		};
	},
	setSaving( isSaving ) {
		return {
			type: 'SET_SAVING',
			isSaving
		};
	},
	setSessionID( sessionID ) {
		return {
			type: 'SET_SESSION_ID',
			sessionID
		};
	},
	setChangedData( data ) {
		return {
			type: 'SET_CHANGED_DATA',
			data
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
		case 'SET_FINISHED':
			return {
				...state,
				isFinished: action.isFinished
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
		case 'SET_IMPORTED_TEMPLATE':
			return {
				...state,
				importedTemplates: [
					...state.importedTemplates,
					action.template
				]
			};
		case 'SET_SAVING':
			return {
				...state,
				isSaving: action.isSaving
			};
		case 'SET_SESSION_ID':
			return {
				...state,
				sessionID: action.sessionID
			};
		case 'SET_CHANGED_DATA':
			return {
				...state,
				changedData: {
					...state.changedData,
					...action.data
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
		getImportedTemplates( state ) {
			return state.importedTemplates;
		},
		isSaving( state ) {
			return state.isSaving;
		},
		isFinished( state ) {
			return state.isFinished;
		},
		getSessionID( state ) {
			return state.sessionID;
		},
		getChangedData( state ) {
			return state.changedData;
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
