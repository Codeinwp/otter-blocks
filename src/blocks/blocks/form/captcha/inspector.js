/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	ExternalLink,
	PanelBody,
	SelectControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Notice } from '../../../components/index.js';

/**
 *
 * @param {import('./types').FormCaptchaInspectorProps} props
 * @return {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'Captcha Provider', 'otter-blocks' ) }
					value={ attributes.provider || 'recaptcha' }
					options={ [
						{ label: __( 'Google reCaptcha', 'otter-blocks' ), value: 'recaptcha' },
						{ label: __( 'Cloudflare Turnstile', 'otter-blocks' ), value: 'turnstile' }
					] }
					onChange={ provider => setAttributes({ provider }) }
				/>

				<Notice
					notice={
						<div>
							{ __( 'You can modify the API Keys in Integrations tab from Settings > Otter.', 'otter-blocks' ) }
							<ExternalLink href={ ( window?.themeisleGutenberg?.optionsPath ) }>{ __( 'Go to Dashboard.', 'otter-blocks' ) }</ExternalLink>
						</div>
					}
					variant="help"
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
