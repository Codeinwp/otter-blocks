/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

/**
 *
 * @param {import('./types').ReviewComparisionInspectorProps} props
 * @return
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	return (
		<InspectorControls>
			<PanelColorSettings
				title={ __( 'Color', 'otter-pro' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.buttonColor,
						onChange: value => setAttributes({ buttonColor: value }),
						label: __( 'Button', 'otter-pro' ),
						isShownByDefault: true
					},
					{
						value: attributes.buttonText,
						onChange: value => setAttributes({ buttonText: value }),
						label: __( 'Button text', 'otter-pro' ),
						isShownByDefault: true
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
