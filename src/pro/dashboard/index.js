/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	PanelRow,
	ToggleControl
} from '@wordpress/components';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import useSettings from '../helpers/use-settings.js';

const Integrations = props => {
	const [ getOption, updateOption, status ] = useSettings();

	return (
		<PanelBody
			title={ __( 'Fonts Module', 'otter-blocks' ) }
			className="is-pro"
		>
			<PanelRow>
				<ToggleControl
					label={ __( 'Save Google Fonts Locally', 'otter-blocks' ) }
					help={ __( 'Enable this option to save Google Fonts locally to make your website faster', 'otter-blocks' ) }
					checked={ Boolean( getOption( 'otter_offload_fonts' ) ) }
					disabled={ 'saving' === status }
					onChange={ () => updateOption( 'otter_offload_fonts', ! Boolean( getOption( 'otter_offload_fonts' ) ) ) }
				/>
			</PanelRow>
		</PanelBody>
	);
};

addFilter( 'otter.dashboard.integrations', 'themeisle-gutenberg/dashboard-integration', Integrations );
