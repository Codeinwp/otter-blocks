import { Fragment } from '@wordpress/element';
import { Notice, Notice as OtterNotice } from '../../../blocks/components';
import { __ } from '@wordpress/i18n';
import { ExternalLink, PanelBody, TextareaControl, TextControl } from '@wordpress/components';
import { setUtm } from '../../../blocks/helpers/helper-functions';
import { addFilter } from '@wordpress/hooks';
import AutoresponderBodyModal from '../../components/autoresponder/index.js';

const Autoresponder = ( Template, attributes, setAttributes ) => {

	if ( ! Boolean( window?.otterPro?.isActive ) ) {
		return (
			<Fragment>
				{ Template }
				<OtterNotice
					notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Stripe Checkout.', 'otter-blocks' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Autoresponder', 'otter-blocks' ) }
			>
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
			</PanelBody>
		</Fragment>
	);
};

addFilter( 'otter.stripe-checkout.inspector', 'themeisle-gutenberg/stripe-checkout-inspector', Autoresponder );
