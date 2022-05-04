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
	RangeControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	return <Fragment>
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Items Gap', 'otter-blocks' ) }
					value={ attributes.gap }
					onChange={ value => setAttributes({ gap: value }) }
					allowReset
					max={ 100 }
				/>
				<RangeControl
					label={ __( 'Icons Border Badius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ value => setAttributes({ borderRadius: value })}
					allowReset
					max={ 100 }
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
