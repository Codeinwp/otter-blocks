/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import {
	FormTokenField,
	PanelBody,
	ToggleControl
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';

const postTypes = Object.keys( window.themeisleGutenberg.postTypes );

const Edit = ({
	BlockEdit,
	props
}) => {
	const toggleLive = () => {
		const isLive = ! props.attributes.isLive;
		props.setAttributes({ isLive });
	};

	const onPostTypeChange = types => {
		props.setAttributes({ postTypes: types });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Live Search', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Enable Live Search', 'otter-blocks' ) }
						checked={ props.attributes.isLive }
						onChange={ toggleLive }
					/>

					<FormTokenField
						label={ __( 'Search in', 'otter-blocks' ) }
						value={ props.attributes.postTypes }
						suggestions={ postTypes }
						onChange={ types => onPostTypeChange( types ) }
						__experimentalExpandOnFocus={ true }
						__experimentalValidateInput={ newValue => postTypes.includes( newValue ) }
					/>
				</PanelBody>
			</InspectorControls>

			<BlockEdit { ...props } />
		</Fragment>
	);
};

export default Edit;
