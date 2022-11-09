/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	ToggleControl
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';

const Edit = ({
	BlockEdit,
	props
}) => {
	const toggleLive = () => {
		const isLive = ! props.attributes.isLive;
		props.setAttributes({ isLive });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Live Search', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Live Search', 'otter-blocks' ) }
						help={ __( 'Toggle on to see live search.', 'otter-blocks' ) }
						checked={ props.attributes.isLive }
						onChange={ toggleLive }
					/>
				</PanelBody>
			</InspectorControls>

			<BlockEdit { ...props } />
		</Fragment>
	);
};

export default Edit;
