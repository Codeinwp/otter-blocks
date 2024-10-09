/**
 * External dependencies.
 */
import { isString } from 'lodash';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import {
	Button,
	Modal,
	PanelBody,
	PanelRow,
	ToggleControl
} from '@wordpress/components';

import { dispatch } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useReducer,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import ButtonControl from '../ButtonControl.js';
import useSettings from '../../../blocks/helpers/use-settings';

const optionMapping = {
	enableCustomCss: 'themeisle_blocks_settings_css_module',
	enableBlocksAnimation: 'themeisle_blocks_settings_blocks_animation',
	enableBlockConditions: 'themeisle_blocks_settings_block_conditions',
	enablePatternsLibrary: 'themeisle_blocks_settings_patterns_library',
	enableDynamicContent: 'themeisle_blocks_settings_dynamic_content',
	enableOnboardingWizard: 'themeisle_blocks_settings_onboarding_wizard',
	enableSectionDefaultBlock: 'themeisle_blocks_settings_default_block',
	enableOptimizeAnimationsCss: 'themeisle_blocks_settings_optimize_animations_css',
	enableRichSchema: 'themeisle_blocks_settings_disable_review_schema',
	enableReviewScale: 'themeisle_blocks_settings_review_scale',
	enableHighlightDynamic: 'themeisle_blocks_settings_highlight_dynamic',
	enableAnonymousDataTracking: 'otter_blocks_logger_flag',
	enableAIToolbar: 'themeisle_blocks_settings_block_ai_toolbar_module'
};

const initialState = {
	values: {
		enableCustomCss: false,
		enableBlocksAnimation: false,
		enableBlockConditions: false,
		enablePatternsLibrary: false,
		enableDynamicContent: false,
		enableOnboardingWizard: false,
		enableSectionDefaultBlock: false,
		enableOptimizeAnimationsCss: false,
		enableRichSchema: false,
		enableReviewScale: false,
		enableHighlightDynamic: false,
		enableAnonymousDataTracking: 'no',
		enableAIToolbar: false
	},
	status: {
		enableCustomCss: 'init',
		enableBlocksAnimation: 'init',
		enableBlockConditions: 'init',
		enablePatternsLibrary: 'init',
		enableDynamicContent: 'init',
		enableOnboardingWizard: 'init',
		enableSectionDefaultBlock: 'init',
		enableOptimizeAnimationsCss: 'init',
		enableRichSchema: 'init',
		enableReviewScale: 'init',
		enableHighlightDynamic: 'init',
		enableAnonymousDataTracking: 'init',
		enableAIToolbar: 'init'
	},
	dirty: {
		enableCustomCss: false,
		enableBlocksAnimation: false,
		enableBlockConditions: false,
		enablePatternsLibrary: false,
		enableDynamicContent: false,
		enableOnboardingWizard: false,
		enableSectionDefaultBlock: false,
		enableOptimizeAnimationsCss: false,
		enableRichSchema: false,
		enableReviewScale: false,
		enableHighlightDynamic: false,
		enableAnonymousDataTracking: false,
		enableAIToolbar: false
	},
	old: {}
};

/**
 * Reducer.
 * @param {Object} state  The current state.
 * @param {Object} action The action to be performed.
 * @return {*}
 */
const reducer = ( state, action ) => {
	switch ( action.type ) {
	case 'init':
		state.values[ action.name ] = action.value;
		state.status[ action.name ] = 'saved';
		return { ...state };

	case 'update':
		state.old[ action.name ] = isString( state.values[ action.name ]) ? state.values[ action.name ] : Boolean( state.values[ action.name ]);
		state.values[ action.name ] = action.value;
		state.dirty[ action.name ] = true;
		return { ...state };

	case 'status_bulk':
		action.names.forEach( name => {
			state.status[ name ] = action.value;
			state.dirty[ name ] = false;
		});
		return { ...state };

	case 'saved':
		state.status[ action.name ] = 'saved';
		state.values[ action.name ] = action.value;
		state.old[ action.name ] = undefined;
		return { ...state };

	case 'rollback':
		if ( undefined !== state.old[ action.name ]) {
			state.values[action.name] = state.old[action.name];
		}
		state.old[ action.name ] = undefined;
		state.dirty[ action.name ] = false;
		state.status[ action.name ] = 'saved';
		return { ...state };

	default:
		return state;
	}
};

const Dashboard = () => {
	useEffect( () => {
		if ( ! Boolean( window.otterObj.stylesExist ) ) {
			setRegeneratedDisabled( true );
		}
	}, []);

	const [ getOption, updateOption, status  ] = useSettings();

	const { createNotice } = dispatch( 'core/notices' );

	const [ isRegeneratedDisabled, setRegeneratedDisabled ] = useState( false );
	const [ isOpen, setOpen ] = useState( false );

	const [ state, applyAction ] = useReducer( reducer, initialState );

	/**
	 * Regenerate styles.
	 * @return {Promise<void>}
	 */
	const regenerateStyles = async() => {
		const data = await apiFetch({ path: 'otter/v1/regenerate', method: 'DELETE' });

		createNotice(
			data.success ? 'success' : 'error',
			data.data.message,
			{
				isDismissible: true,
				type: 'snackbar'
			}
		);

		window.tiTrk?.with( 'otter' ).add({ feature: 'dashboard', featureComponent: 'regenerate-style' });
		setRegeneratedDisabled( true );
		setOpen( false );
	};

	/**
	 * Initialize the state with values from the WordPress options.
	 */
	useEffect( () => {
		if ( 'loaded' !== status ) {
			return;
		}

		Object.entries( state.status )
			.filter( ([ key, value ]) => 'init' === value )
			.forEach( ([ name, _ ]) => {
				applyAction({ type: 'init', name, value: getOption( optionMapping[ name ]) });
			});
	}, [ state, status, getOption ]);

	/**
	 * Update the WordPress options.
	 */
	useEffect( () => {
		const dirtyOptionNames = Object.entries( state.dirty ).filter( ([ key, value ]) => value ).map( ([ key, value ]) => key );

		if ( dirtyOptionNames.length ) {
			if ( 'error' !== status ) {
				applyAction({ type: 'status_bulk', value: 'saving', names: dirtyOptionNames });
			}

			for ( const name of dirtyOptionNames ) {
				updateOption(
					optionMapping[ name ],
					state.values[ name ],
					__( 'Settings saved.', 'otter-blocks' ),
					'o-settings-saved-notice',
					( response ) => {
						applyAction({ type: 'saved', name, value: response[ optionMapping[ name ] ] });
					},
					() => {
						applyAction({ type: 'rollback', name });
					}
				);
			}
		}

	}, [ state, status ]);

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Modules', 'otter-blocks' ) }
			>
				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Custom CSS Module', 'otter-blocks' ) }
						help={ __( 'Custom CSS module allows to add custom CSS to each block in Block Editor.', 'otter-blocks' ) }
						checked={ state.values.enableCustomCss }
						disabled={ 'saving' === state.status.enableCustomCss }
						onChange={ ( value ) => {
							applyAction({ type: 'update', name: 'enableCustomCss', value });
						} }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable AI Block Toolbar Module', 'otter-blocks' ) }
						help={ __( 'Display AI Block shortcut in Editor Blocks toolbar.', 'otter-blocks' ) }
						checked={ state.values.enableAIToolbar }
						disabled={ 'saving' === state.status.enableAIToolbar }
						onChange={ ( value ) => {
							applyAction({ type: 'update', name: 'enableAIToolbar', value });
						} }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Blocks Animation Module', 'otter-blocks' ) }
						help={ __( 'Blocks Animation module allows to add CSS animations to each block in Block Editor.', 'otter-blocks' ) }
						checked={ state.values.enableBlocksAnimation }
						disabled={ 'saving' === state.status.enableBlocksAnimation }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableBlocksAnimation', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Visibility Condition Module', 'otter-blocks' ) }
						help={ __( 'Blocks Conditions module allows to hide/display blocks to your users based on selected conditions.', 'otter-blocks' ) }
						checked={ state.values.enableBlockConditions }
						disabled={ 'saving' === state.status.enableBlockConditions }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableBlockConditions', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Patterns Library', 'otter-blocks' ) }
						help={ __( 'Toggle the visibility of the Patterns Library in the Block Editor.', 'otter-blocks' ) }
						checked={ state.values.enablePatternsLibrary }
						disabled={ 'saving' === state.status.enablePatternsLibrary }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enablePatternsLibrary', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Dynamic Content Module', 'otter-blocks' ) }
						help={ __( 'Toggle the Dynamic Content Module that includes Dynamic Content, Link and Images.', 'otter-blocks' ) }
						checked={ state.values.enableDynamicContent }
						disabled={ 'saving' === state.status.enableDynamicContent }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableDynamicContent', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Theme Setup Wizard', 'otter-blocks' ) }
						help={ __( 'Toggle the visibility of the Theme Setup link in the Appearance menu.', 'otter-blocks' ) }
						checked={ state.values.enableOnboardingWizard }
						disabled={ 'saving' === state.status.enableOnboardingWizard }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableOnboardingWizard', value }) }
					/>
				</PanelRow>
			</PanelBody>

			<PanelBody
				title={ __( 'Other', 'otter-blocks' ) }
			>
				<PanelRow>
					<ToggleControl
						label={ __( 'Make Section your default block for Pages', 'otter-blocks' ) }
						help={ __( 'Everytime you create a new page, Section block will be appended there by default.', 'otter-blocks' ) }
						checked={ state.values.enableSectionDefaultBlock }
						disabled={ 'saving' === state.status.enableSectionDefaultBlock }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableSectionDefaultBlock', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Optimize Animations CSS', 'otter-blocks' ) }
						help={ __( 'Only load CSS for the animations that are used on the page. We recommend you to regenerate styles after you toggle this option.', 'otter-blocks' ) }
						checked={ state.values.enableOptimizeAnimationsCss }
						disabled={ 'saving' === state.status.enableOptimizeAnimationsCss }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableOptimizeAnimationsCss', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Rich Schema', 'otter-blocks' ) }
						help={ __( 'Control if you want to show rich schema in Product Review Block.', 'otter-blocks' ) }
						checked={ state.values.enableRichSchema }
						disabled={ 'saving' === state.status.enableRichSchema }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableRichSchema', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Use 1–5 Scale for Review Block', 'otter-blocks' ) }
						help={ __( 'Use 1–5 rating scale instead of the default 1–10.', 'otter-blocks' ) }
						checked={ state.values.enableReviewScale }
						disabled={ 'saving' === state.status.enableReviewScale }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableReviewScale', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Highlight the Dynamic Text', 'otter-blocks' ) }
						help={ __( 'Easily differentiate between dynamic and normal text in the editor.', 'otter-blocks' ) }
						checked={ state.values.enableHighlightDynamic }
						disabled={ 'saving' === state.status.enableHighlightDynamic }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableHighlightDynamic', value }) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Anonymous Data Tracking.', 'otter-blocks' ) }
						help={ __( 'Become a contributor by opting in to our anonymous data tracking. We guarantee no sensitive data is collected.', 'otter-blocks' ) }
						checked={ 'yes' === state.values.enableAnonymousDataTracking }
						disabled={ 'saving' === state.status.enableAnonymousDataTracking }
						onChange={ ( value ) => applyAction({ type: 'update', name: 'enableAnonymousDataTracking', value: value ? 'yes' : 'no' }) }
					/>
				</PanelRow>
			</PanelBody>

			<PanelBody>
				<PanelRow>
					<ButtonControl
						label={ __( 'Regenerate Styles', 'otter-blocks' ) }
						help={ __( 'Clicking on this will delete all the Otter generated CSS files.', 'otter-blocks' ) }
						buttonLabel={ __( 'Regenerate', 'otter-blocks' ) }
						disabled={ isRegeneratedDisabled }
						action={ () => setOpen( true ) }
					/>
				</PanelRow>
			</PanelBody>

			{ isOpen && (
				<Modal
					title={ __( 'Are you sure?', 'otter-blocks' ) }
					onRequestClose={ () => setOpen( false ) }
				>
					<p>{ __( 'Are you sure you want to delete all Otter generated CSS files?', 'otter-blocks' ) }</p>
					<p>{ __( 'Note: Styles will be regenerated as users start visiting your pages.', 'otter-blocks' ) }</p>

					<div className="otter-modal-actions">
						<Button
							isSecondary
							onClick={ () => setOpen( false ) }
						>
							{ __( 'Cancel', 'otter-blocks' ) }
						</Button>

						<Button
							isPrimary
							disabled={ 'saving' === status }
							isBusy={ 'saving' === status }
							onClick={ regenerateStyles }
						>
							{ __( 'Confirm', 'otter-blocks' ) }
						</Button>
					</div>
				</Modal>
			) }
		</Fragment>
	);
};

export default Dashboard;
