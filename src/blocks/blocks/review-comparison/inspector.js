/**
  * WordPress dependencies
  */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	return (
		<InspectorControls>
			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.buttonColor,
						onChange: value => setAttributes({ buttonColor: value }),
						label: __( 'Button', 'otter-blocks' )
					},
					{
						value: attributes.buttonText,
						onChange: value => setAttributes({ buttonText: value }),
						label: __( 'Button text', 'otter-blocks' )
					}
				] }
			>

				<ContrastChecker
					{ ...{
						textColor: attributes.buttonText,
						backgroundColor: attributes.buttonColor
					} }
				/>
			</PanelColorSettings>
		</InspectorControls>
	);
};

export default Inspector;
