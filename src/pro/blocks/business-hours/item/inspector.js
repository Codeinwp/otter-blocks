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
				title={ __( 'Color', 'otter-pro' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.backgroundColor,
						onChange: backgroundColor => setAttributes({ backgroundColor }),
						label: __( 'Background', 'otter-pro' ),
						isShownByDefault: true
					},
					{
						value: attributes.labelColor,
						onChange: labelColor => setAttributes({ labelColor }),
						label: __( 'Label', 'otter-pro' ),
						isShownByDefault: true
					},
					{
						value: attributes.timeColor,
						onChange: timeColor => setAttributes({ timeColor }),
						label: __( 'Time', 'otter-pro' ),
						isShownByDefault: true
					}
				] }
			>
				<ContrastChecker
					{ ...{
						textColor: attributes.labelColor,
						backgroundColor: attributes.backgroundColor
					} }
				/>
			</PanelColorSettings>
		</InspectorControls>
	);
};

export default Inspector;
