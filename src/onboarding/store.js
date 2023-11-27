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
	isSaving: false,
	isFinished: false
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
			const isLast = STEPS.length === ( step.value + 1 );
			const newStep = isLast ? STEPS.length : ( step.value + 1 );

			dispatch( actions.setSaving( false ) );

			if ( isLast ) {
				dispatch( actions.setFinished( true ) );
				return;
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

			dispatch( actions.setSaving( true ) );

			if ([ 'archive_template', 'single_template' ].includes( step.id ) ) {
				const type = step.id.replace( '_template', '' );

				const selectedTemplate = select.getSelectedTemplate( type );

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

			if ([ 'site_info', 'appearance', 'archive_template', 'single_template' ].includes( step.id ) ) {
				const edits = __experimentalGetDirtyEntityRecords();

				await Promise.all( edits.map( async edit => {
					await saveEditedEntityRecord( edit.kind, edit.name, edit?.key );
				}) );
			}

			if ( 'additional_templates' === step.id ) {
				const selectedTemplates = select.getSelectedTemplate( 'pageTemplates' );
				const pageTemplates = select.getLibrary( 'page_templates' );
				const importedTemplates = select.getImportedTemplates(); // It will be array similar to selectedTemplates

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
