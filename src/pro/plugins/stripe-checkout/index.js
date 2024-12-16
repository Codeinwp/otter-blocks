/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import AutoresponderBodyModal from '../../components/autoresponder/index.js';
import { Notice } from '../../../blocks/components';

const Autoresponder = ( Template, attributes, setAttributes ) => {
	return (
		<Fragment>
			<PanelBody
				title={ __( 'Autoresponder', 'otter-pro' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Enable Autoresponder', 'otter-pro' ) }
					checked={ Boolean( attributes.autoresponder ) }
					onChange={ ( value ) => setAttributes({ autoresponder: value ? { subject: undefined, body: undefined } : undefined })}
					help={ __( 'Enable autoresponder email to be sent to the customer after a successful purchase.', 'otter-pro' ) }
				/>

				{
					attributes.autoresponder && (
						<Fragment>
							<TextControl
								label={__( 'Autoresponder Subject', 'otter-pro' )}
								placeholder={__(
									'Thank you for your purchase',
									'otter-pro'
								)}
								value={ attributes.autoresponder?.subject }
								onChange={ ( subject ) => setAttributes({ autoresponder: { ...attributes.autoresponder, subject }})}
								help={__(
									'Enter the subject of the autoresponder email.',
									'otter-pro'
								)}
							/>

							<AutoresponderBodyModal
								value={ attributes.autoresponder?.body ?? __( 'Message example: We appreciate your recent purchase made on our website. You have received a promotional code, namely <strong>EXAMPLE</strong>, which can be applied during checkout on our <a href="https://themeisle.com/plugins/otter-blocks/">website</a>.', 'otter-pro' ) }
								onChange={ ( body ) => setAttributes({ autoresponder: { ...attributes.autoresponder, body }}) }
								area="stripe-autoresponder"
							/>
						</Fragment>
					)
				}
			</PanelBody>
		</Fragment>
	);
};

if ( Boolean( window?.otterPro?.isActive ) ) {
	addFilter( 'otter.stripe-checkout.inspector', 'themeisle-gutenberg/stripe-checkout-inspector', Autoresponder );
}

