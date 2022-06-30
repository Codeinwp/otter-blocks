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
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import ButtonControl from '../ButtonControl.js';

const Dashboard = ({
	status,
	getOption,
	updateOption
}) => {
	useEffect( () => {
		if ( ! Boolean( window.otterObj.stylesExist ) ) {
			setRegeneratedDisabled( true );
		}
	}, []);

	const { createNotice } = dispatch( 'core/notices' );

	const [ isRegeneratedDisabled, setRegeneratedDisabled ] = useState( false );
	const [ isOpen, setOpen ] = useState( false );

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

		setRegeneratedDisabled( true );
		setOpen( false );
	};

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Modules', 'otter-blocks' ) }
			>
				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Custom CSS Module', 'otter-blocks' ) }
						help={ __( 'Custom CSS module allows to add custom CSS to each block in Block Editor.', 'otter-blocks' ) }
						checked={ Boolean( getOption( 'themeisle_blocks_settings_css_module' ) ) }
						disabled={ 'saving' === status }
						onChange={ () => updateOption( 'themeisle_blocks_settings_css_module', ! Boolean( getOption( 'themeisle_blocks_settings_css_module' ) ) ) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Blocks Animation Module', 'otter-blocks' ) }
						help={ __( 'Blocks Animation module allows to add CSS animations to each block in Block Editor.', 'otter-blocks' ) }
						checked={ Boolean( getOption( 'themeisle_blocks_settings_blocks_animation' ) ) }
						disabled={ 'saving' === status }
						onChange={ () => updateOption( 'themeisle_blocks_settings_blocks_animation', ! Boolean( getOption( 'themeisle_blocks_settings_blocks_animation' ) ) ) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Visibility Condition Module', 'otter-blocks' ) }
						help={ __( 'Blocks Conditions module allows to hide/display blocks to your users based on selected conditions.', 'otter-blocks' ) }
						checked={ Boolean( getOption( 'themeisle_blocks_settings_block_conditions' ) ) }
						disabled={ 'saving' === status }
						onChange={ () => updateOption( 'themeisle_blocks_settings_block_conditions', ! Boolean( getOption( 'themeisle_blocks_settings_block_conditions' ) ) ) }
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
						checked={ Boolean( getOption( 'themeisle_blocks_settings_default_block' ) ) }
						disabled={ 'saving' === status }
						onChange={ () => updateOption( 'themeisle_blocks_settings_default_block', ! Boolean( getOption( 'themeisle_blocks_settings_default_block' ) ) ) }
					/>
				</PanelRow>

				<PanelRow>
					<ToggleControl
						label={ __( 'Anonymous Data Tracking.', 'otter-blocks' ) }
						help={ __( 'Become a contributor by opting in to our anonymous data tracking. We guarantee no sensitive data is collected.', 'otter-blocks' ) }
						checked={ 'yes' === getOption( 'otter_blocks_logger_flag' ) ? true : false }
						disabled={ 'saving' === status }
						onChange={ () => updateOption( 'otter_blocks_logger_flag', ( 'yes' === getOption( 'otter_blocks_logger_flag' ) ? 'no' : 'yes' ) ) }
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
