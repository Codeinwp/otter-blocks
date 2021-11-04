import { PanelBody, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const Inspector = ({ attributes, setAttributes }) => {
	const { hasMoneyBackSection } = attributes;

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'otter-blocks' ) }>

			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
