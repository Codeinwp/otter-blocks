/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	PanelColorSettings,
	ContrastChecker
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes,
	socialList
}) => {
	const onIconChange = ( value, item, field ) => {
		const newValue = attributes[item];
		newValue[field] = value;

		setAttributes({ [ item ]: { ...newValue } });
	};

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
				className='ott-color-controls'
				initialOpen={ false }
				colorSettings={
					Object.keys( socialList ).reduce( ( acc, icon ) => {
						if ( ! ( attributes[icon].active ?? attributes[icon]) ) {
							return acc;
						}

						return [ ...acc,
							{
								value: attributes[icon].backgroundColor,
								onChange: value => onIconChange( value, icon, 'backgroundColor' ),
								onGradientChange: value => onIconChange( value, icon, 'backgroundColor' ),

								/* translators: %s Social Website */
								label: sprintf( __( ' %s Background Color', 'otter-blocks' ), socialList[icon].label )
							},
							{
								value: attributes[icon].textColor,
								onChange: value => onIconChange( value, icon, 'textColor' ),

								/* translators: %s Social Website */
								label: sprintf( __( ' %s Text Color', 'otter-blocks' ), socialList[icon].label )
							}
						];
					}, [])
				}
			>
				{ Object.keys( socialList ).map( ( icon ) => {
					if ( ! ( attributes[icon].active ?? attributes[icon]) ) {
						return null;
					}

					return (
						<ContrastChecker
							backgroundColor={ attributes[icon].backgroundColor }
							textColor={ attributes[icon].textColor }
						/>
					);
				}) }
			</PanelColorSettings>
		</InspectorControls>
	</Fragment>;
};

export default Inspector;
