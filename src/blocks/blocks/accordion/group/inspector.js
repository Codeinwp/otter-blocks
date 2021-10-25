/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl
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
				<SelectControl
					label={ __( 'Gap', 'otter-blocks' ) }
					value={ attributes.gap }
					options={ [
						{ label: __( 'No Gap', 'otter-blocks' ), value: '' },
						{ label: __( 'Narrow (5px)', 'otter-blocks' ), value: 'narrow' },
						{ label: __( 'Wide (10px)', 'otter-blocks' ), value: 'wide' },
						{ label: __( 'Wider (20px)', 'otter-blocks' ), value: 'wider' }
					] }
					onChange={ e => setAttributes({ gap: e }) }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.titleColor,
						onChange: value => setAttributes({ titleColor: value }),
						label: __( 'Title', 'otter-blocks' )
					},
					{
						value: attributes.titleBackground,
						onChange: value => setAttributes({ titleBackground: value }),
						label: __( 'Title Background', 'otter-blocks' )
					},
					{
						value: attributes.contentBackground,
						onChange: value => setAttributes({ contentBackground: value }),
						label: __( 'Content Background', 'otter-blocks' )
					},
					{
						value: attributes.borderColor,
						onChange: value => setAttributes({ borderColor: value }),
						label: __( 'Border Color', 'otter-blocks' )
					}
				] }
			>
				<ContrastChecker
					{ ...{
						textColor: attributes.titleColor,
						backgroundColor: attributes.titleBackground
					} }
				/>
			</PanelColorSettings>
		</InspectorControls>
	);
};

export default Inspector;
