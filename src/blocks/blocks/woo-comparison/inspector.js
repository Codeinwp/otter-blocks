/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import LayoutBuilder from './components/layout-builder.js';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	const colorSettings = [
		{
			value: attributes.rowColor,
			onChange: value => setAttributes({ rowColor: value }),
			label: __( 'Background', 'otter-blocks' )
		},
		{
			value: attributes.headerColor,
			onChange: value => setAttributes({ headerColor: value }),
			label: __( 'Header Text', 'otter-blocks' )
		},
		{
			value: attributes.textColor,
			onChange: value => setAttributes({ textColor: value }),
			label: __( 'Text', 'otter-blocks' )
		},
		{
			value: attributes.borderColor,
			onChange: value => setAttributes({ borderColor: value }),
			label: __( 'Border', 'otter-blocks' )
		}
	];

	if ( Boolean( attributes.altRow ) ) {
		colorSettings.push({
			value: attributes.altRowColor,
			onChange: value => setAttributes({ altRowColor: value }),
			label: __( 'Alternating Row Background', 'otter-blocks' )
		});
	}

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'Table View Type', 'otter-blocks' ) }
					value={ attributes.listingType }
					options={ [
						{
							label: __( 'Column', 'otter-blocks' ),
							value: 'column'
						},
						{
							label: __( 'Row', 'otter-blocks' ),
							value: 'row'
						}
					] }
					onChange={ value => setAttributes({ listingType: value  }) }
				/>

				<ToggleControl
					label={ __( 'Enable Alternating Row Color', 'otter-blocks' ) }
					checked={ Boolean( attributes.altRow ) }
					onChange={ () => setAttributes({ altRow: ! Boolean( attributes.altRow ) }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Fields', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<LayoutBuilder
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ colorSettings }
			>
				<ContrastChecker
					{ ...{
						textColor: attributes.textColor,
						backgroundColor: attributes.rowColor
					} }
				/>
			</PanelColorSettings>
		</InspectorControls>
	);
};

export default Inspector;
