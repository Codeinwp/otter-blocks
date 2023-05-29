import { Fragment } from '@wordpress/element';
import { Notice, Notice as OtterNotice } from '../../../blocks/components';
import { __ } from '@wordpress/i18n';
import { ExternalLink, PanelBody, TextareaControl, TextControl, ToggleControl } from '@wordpress/components';
import { setUtm } from '../../../blocks/helpers/helper-functions';
import { addFilter } from '@wordpress/hooks';
import AutoresponderBodyModal from '../../components/autoresponder/index.js';

const Autoresponder = ( Template, attributes, setAttributes ) => {

	if ( ! Boolean( window?.otterPro?.isActive ) ) {
		return (
			<Fragment>
				{ Template }
			</Fragment>
		);
	}

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Autoresponder', 'otter-blocks' ) }
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
								value={ attributes.autoresponder?.body ?? __( 'Thank you for choosing our online store for your recent purchase. We greatly appreciate your business and trust in our products.', 'otter-blocks' ) }
								onChange={ ( body ) => setAttributes({ autoresponder: { ...attributes.autoresponder, body }}) } />
						</Fragment>
					)
				}
			</PanelBody>
		</Fragment>
	);
};

addFilter( 'otter.stripe-checkout.inspector', 'themeisle-gutenberg/stripe-checkout-inspector', Autoresponder );
