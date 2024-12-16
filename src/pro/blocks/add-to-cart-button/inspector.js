/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	TextControl
} from '@wordpress/components';

const { SelectProducts } = window.otterComponents;

const Inspector = ({
	attributes,
	setAttributes
}) => {
	if ( ! attributes.product ) {
		return null;
	}

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-pro' ) }
			>
				<SelectProducts
					label={ __( 'Select Product', 'otter-pro' ) }
					hideLabelFromVision
					value={ attributes.product }
					onChange={ product => {
						window.oTrk?.add({ feature: 'add-to-cart', featureComponent: 'product-changed' });
						setAttributes({ product: Number( product ) });
					} }
				/>

				<TextControl
					label={ __( 'Button Label', 'otter-pro' ) }
					help={ __( 'This overrides the default WooCommerce button label.', 'otter-pro' ) }
					value={ attributes.label }
					onChange={ label => setAttributes({ label }) }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
