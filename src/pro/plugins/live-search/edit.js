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
const hasNecessaryPlan = [ 2, 3 ].includes( parseInt( window.otterPro.licenseType ) );

const Edit = ({
	BlockEdit,
	props
}) => {
	const toggleLive = () => {
		const otterIsLive = ! props.attributes.otterIsLive;
		props.setAttributes({ otterIsLive });
	};

	const onPostTypeChange = types => {
		props.setAttributes({ otterSearchQuery: { postTypes: types }});
	};

	const Notices = () => {
		if ( ! hasNecessaryPlan ) {
			return (
				<Notice
					notice={ __( 'You need to upgrade your plan.', 'otter-blocks' ) }
					instructions={ __( 'You need to upgrade your plan to Business or Agency in order to use the live search feature.', 'otter-blocks' ) }
				/>
			);
		}

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
					{ ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) && hasNecessaryPlan &&
						(
							<>
								<ToggleControl
									label={ __( 'Enable Live Search', 'otter-blocks' ) }
									checked={ props.attributes.otterIsLive }
									onChange={ toggleLive }
								/>

								{ props.attributes.otterIsLive && (
									<>
										<FormTokenField
											label={ __( 'Search in', 'otter-blocks' ) }
											value={ props.attributes.otterSearchQuery?.postTypes || [] }
											suggestions={ postTypes.filter( type => ! excludeTypes.includes( type ) ) }
											onChange={ types => onPostTypeChange( types ) }
											__experimentalExpandOnFocus={ true }
											__experimentalValidateInput={ newValue => postTypes.includes( newValue ) }
										/>
										<Notice
											notice={ __( 'Leave empty to search in all post types.', 'otter-blocks' ) }
											variant="help"
										/>
									</>
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
