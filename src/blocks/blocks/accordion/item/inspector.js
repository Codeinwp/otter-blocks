/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	ToggleControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<ToggleControl
					label={ __( 'Initially Open', 'otter-blocks' ) }
					checked={ attributes.initialOpen }
					onChange={ value => setAttributes({ initialOpen: value }) }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
