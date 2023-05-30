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
								value={ attributes.autoresponder?.body ?? __( 'Thank you for your recent purchase through our website. Your promotional code is <strong>GIFT2023</strong> and you can use it on our <a href="https://themeisle.com/plugins/otter-blocks/">website</a>.', 'otter-blocks' ) }
								onChange={ ( body ) => setAttributes({ autoresponder: { ...attributes.autoresponder, body }}) } />
						</Fragment>
					)
				}
			</PanelBody>
		</Fragment>
	);
};

addFilter( 'otter.stripe-checkout.inspector', 'themeisle-gutenberg/stripe-checkout-inspector', Autoresponder );
