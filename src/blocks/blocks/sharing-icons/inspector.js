/**
 * WordPress dependencies
 */
import { Fragment, useState } from '@wordpress/element';
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
	const [ gap, setGap ] = useState( parseInt( attributes.gap.split( 'px' )[0]) );

	const onChangeGap = value => {
		if ( value === undefined ) {
			setGap( parseInt( metadata.attributes.gap.default.split( 'px' )[0]) );
			setAttributes({ gap: metadata.attributes.gap.default });
			return;
		}

		setGap( value );
		setAttributes({ gap: `${value}px` });
	};

	return <Fragment>
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Items gap (px)', 'otter-blocks' ) }
					value={ gap }
					onChange={ onChangeGap }
					allowReset
					max={ 20 }
				/>
			</PanelBody>
		</InspectorControls>
	</Fragment>;
};

export default Inspector;
