/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PanelBody, RangeControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	const onChangeValue = ( value, name ) => {
		let newAttributes = {};
		if ( value === undefined ) {
			newAttributes[name] = metadata.attributes[name].default;
			setAttributes( newAttributes );
			return;
		}

		newAttributes[name] = `${ value }px`;
		setAttributes( newAttributes );
	};

	const extractNumber = value => {
		return parseInt( value.match( /\d+/g )[0]);
	};

	return <Fragment>
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Items Gap', 'otter-blocks' ) }
					value={ extractNumber( attributes.gap ) }
					onChange={ value => onChangeValue( value, 'gap' ) }
					allowReset
					max={ 20 }
				/>
				<RangeControl
					label={ __( 'Icons Border Badius', 'otter-blocks' ) }
					value={ extractNumber( attributes.borderRadius ) }
					onChange={ value => onChangeValue( value, 'borderRadius' ) }
					allowReset
					max={ 100 }
				/>
			</PanelBody>
		</InspectorControls>
	</Fragment>;
};

export default Inspector;
