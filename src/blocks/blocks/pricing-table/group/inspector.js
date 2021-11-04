import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';


const Inspector = ({ attributes, setAttributes }) => {

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'otter-blocks' ) }>
				<RangeControl
					label={ __( 'Columns Per Row', 'otter-blocks' )}
					help={ __( 'Set how many columns can fit on the row', 'otter-blocks' ) }
					value={ attributes.columns }
					onChange={ columns => setAttributes({ columns })}
					min={1}
					max={5}
				/>
				<RangeControl
					label={ __( 'Column Width', 'otter-blocks' )}
					help={ __( 'Set the width of the column. Use this when the items does not fit with the default size.', 'otter-blocks' ) }
					value={ attributes.columnWidth }
					onChange={ columnWidth => setAttributes({ columnWidth })}
					min={0}
					max={400}
				/>

			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
