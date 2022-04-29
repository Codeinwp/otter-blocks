/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import metadata from './block.json';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	const onChangePixelValue = ( value, name ) => {
		let newAttributes = {};
		if ( value === undefined ) {
			newAttributes[name] = metadata.attributes[name].default;
			setAttributes( newAttributes );
			return;
		}

		newAttributes[name] = value;
		setAttributes( newAttributes );
	};

	const onChangeTextDeco = value => {
		setAttributes({ textDeco: ( value ? 'none' : 'underline' ) });
	};

	return <Fragment>
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Items Gap', 'otter-blocks' ) }
					value={ attributes.gap }
					onChange={ value => onChangePixelValue( value, 'gap' ) }
					allowReset
					max={ 100 }
				/>
				<RangeControl
					label={ __( 'Icons Border Badius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ value => onChangePixelValue( value, 'borderRadius' ) }
					allowReset
					max={ 100 }
				/>
				<ToggleControl
					label={ __( 'Remove text underline', 'otter-blocks' ) }
					checked={ 'underline' !== attributes.textDeco }
					onChange={ onChangeTextDeco }
				/>
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Color Settings' ) }
				colorSettings={ [
					{
						value: attributes.backgroundColor,
						onChange: ( value ) => setAttributes({ backgroundColor: value }),
						label: __( 'Background Color', 'otter-blocks' )
					},
					{
						value: attributes.textColor,
						onChange: ( value ) => setAttributes({ textColor: value }),
						label: __( 'Text Color', 'otter-blocks' )
					}
				] }
			>
				<p><i> { __( 'The colors will be set for all icons.', 'otter-blocks' ) } </i></p>
			</PanelColorSettings>
		</InspectorControls>
	</Fragment>;
};

export default Inspector;
