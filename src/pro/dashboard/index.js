/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	PanelRow,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
const { useSettings } = window.otterUtils;

const Integrations = props => {
	const [ getOption, updateOption, status ] = useSettings();

	useEffect( () => {
		setIPHubAPI( getOption( 'otter_iphub_api_key' ) );
	}, [ getOption( 'otter_iphub_api_key' ) ]);

	const [ IPHubAPI, setIPHubAPI ] = useState( '' );

	return (
		<Fragment>
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

			<PanelBody
				title={ __( 'IPHub API Key', 'otter-blocks' ) }
				initialOpen={ false }
				className="is-pro"
			>
				<PanelRow>
					<BaseControl
						label={ __( 'IPHub API Key', 'otter-blocks' ) }
						help={ __( 'In order to use IP-based locations, you need to use IPHub API.', 'otter-blocks' ) }
						id="otter-options-iphub-api"
						className="otter-button-field"
					>
						<input
							type="password"
							id="otter-options-iphub-api"
							value={ IPHubAPI }
							placeholder={ __( 'IPHub API Key', 'otter-blocks' ) }
							disabled={ 'saving' === status }
							onChange={ e => setIPHubAPI( e.target.value ) }
						/>

						<div className="otter-button-group">
							<Button
								variant="secondary"
								isSecondary
								disabled={ 'saving' === status }
								onClick={ () => updateOption( 'otter_iphub_api_key', IPHubAPI ) }
							>
								{ __( 'Save', 'otter-blocks' ) }
							</Button>

							<ExternalLink
								href="https://iphub.info/api"
							>
								{ __( 'Get API Key', 'otter-blocks' ) }
							</ExternalLink>
						</div>
					</BaseControl>
				</PanelRow>
			</PanelBody>
		</Fragment>
	);
};

addFilter( 'otter.dashboard.integrations', 'themeisle-gutenberg/dashboard-integration', Integrations );
