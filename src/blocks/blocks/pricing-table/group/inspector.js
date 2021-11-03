import { PanelBody, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const Inspector = ({ attributes, setAttributes }) => {
	const { hasMoneyBackSection } = attributes;

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Money Back Section', 'otter-blocks' ) }>
				<ToggleControl
					label={ __( 'Enable Money Back Section', 'otter-blocks' ) }
					checked={ hasMoneyBackSection }
					onChange={ ( nextVal ) =>
						setAttributes({ hasMoneyBackSection: nextVal })
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
