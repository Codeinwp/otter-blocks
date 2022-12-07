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
import { applyFilters } from '@wordpress/hooks';

const { Notice } = window.otterComponents;
const postTypes = Object.keys( window.themeisleGutenberg.postTypes );
const excludeTypes = [ 'attachment' ];

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

	const Notices = () => {
		if ( Boolean( window.otterPro.isExpired ) ) {
			return (
				<Notice
					notice={ __( 'Otter Pro license has expired.', 'otter-blocks' ) }
					instructions={ __( 'You need to renew your Otter Pro license in order to continue using the live search feature.', 'otter-blocks' ) }
				/>
			);
		}

		if ( ! Boolean( window.otterPro.isActive ) ) {
			return (
				<Notice
					notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use the live search feature.', 'otter-blocks' ) }
					style={{ color: 'red' }}
				/>
			);
		}

		return null;
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Live Search', 'otter-blocks' ) }
					initialOpen={ false }
				>
					{ ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) &&
						(
							<>
								<ToggleControl
									label={ __( 'Enable Live Search', 'otter-blocks' ) }
									checked={ props.attributes.isLive }
									onChange={ toggleLive }
								/>

								{ props.attributes.isLive && (
									<FormTokenField
										label={ __( 'Search in', 'otter-blocks' ) }
										value={ props.attributes.postTypes }
										suggestions={ postTypes.filter( type => ! excludeTypes.includes( type ) ) }
										onChange={ types => onPostTypeChange( types ) }
										__experimentalExpandOnFocus={ true }
										__experimentalValidateInput={ newValue => postTypes.includes( newValue ) }
									/>
								)}
							</>
						)
					}
					{ <Notices/> }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</PanelBody>
			</InspectorControls>

			<BlockEdit { ...props } />
		</Fragment>
	);
};

export default Edit;
