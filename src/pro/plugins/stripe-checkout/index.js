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
				title={ __( 'Autoresponder', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Enable Autoresponder', 'otter-blocks' ) }
					checked={ Boolean( attributes.autoresponder ) }
					onChange={ ( value ) => setAttributes({ autoresponder: value ? { subject: undefined, body: undefined } : undefined })}
					help={ __( 'Enable autoresponder email to be sent to the customer after a successful purchase.', 'otter-blocks' ) }
				/>

				{
					attributes.autoresponder && (
						<Fragment>
							<TextControl
								label={__( 'Autoresponder Subject', 'otter-blocks' )}
								placeholder={__(
									'Thank you for your purchase',
									'otter-blocks'
								)}
								value={ attributes.autoresponder?.subject }
								onChange={ ( subject ) => setAttributes({ autoresponder: { ...attributes.autoresponder, subject }})}
								help={__(
									'Enter the subject of the autoresponder email.',
									'otter-blocks'
								)}
							/>

							<AutoresponderBodyModal
								value={ attributes.autoresponder?.body ?? __( 'Message example: We appreciate your recent purchase made on our website. You have received a promotional code, namely <strong>EXAMPLE</strong>, which can be applied during checkout on our <a href="https://themeisle.com/plugins/otter-blocks/">website</a>.', 'otter-blocks' ) }
								onChange={ ( body ) => setAttributes({ autoresponder: { ...attributes.autoresponder, body }}) }
								area="stripe-autoresponder"
							/>

							{
								(  ! Boolean( attributes.autoresponder?.title ) && ! Boolean( attributes.autoresponder.body ) ) && (
									<Notice
										notice={ __( 'Replace the placeholders for Subject and Body.', 'otter-blocks' ) }
										instructions={ __( 'You need to fill the Subject field and replace the value of Body of the Autoresponder. Email will not be send if the placeholders are still present.', 'otter-blocks' ) }
									/>
								)
							}

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

