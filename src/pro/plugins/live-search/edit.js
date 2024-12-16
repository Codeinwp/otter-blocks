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

const {
	CategoriesFieldToken,
	Notice
} = window.otterComponents;
const postTypes = Object.keys( window.themeisleGutenberg.postTypes );
const excludeTypes = [ 'attachment' ];
const hasNecessaryPlan = [ 2, 3 ].includes( parseInt( window.otterPro.licenseType ) ) || window.otterPro.hasNeveLicense;

const Edit = ({
	BlockEdit,
	props
}) => {
	const toggleLive = () => {
		const otterIsLive = ! props.attributes.otterIsLive;
		props.setAttributes({ otterIsLive });
	};

	const onUpdateQuery = ( key, value ) => {
		const query = { ...props.attributes.otterSearchQuery };
		query[ key ] = value;

		if ( 'post_type' === key && ( ! value.includes( 'post' ) || 1 !== value.length ) && query.cat ) {
			delete query.cat;
		}

		props.setAttributes({ otterSearchQuery: query });
	};

	const Notices = () => {
		if ( ! hasNecessaryPlan ) {
			return (
				<Notice
					notice={ __( 'You need to upgrade your plan.', 'otter-pro' ) }
					instructions={ __( 'You need to upgrade your plan to Agency in order to use the Live Search feature.', 'otter-pro' ) }
				/>
			);
		}

		if ( Boolean( window.otterPro.isExpired ) ) {
			return (
				<Notice
					notice={ __( 'Otter Pro license has expired.', 'otter-pro' ) }
					instructions={ __( 'You need to renew your Otter Pro license in order to continue using the live search feature.', 'otter-pro' ) }
				/>
			);
		}

		if ( ! Boolean( window.otterPro.isActive ) ) {
			return (
				<Notice
					notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use the live search feature.', 'otter-pro' ) }
				/>
			);
		}

		return null;
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Live Search', 'otter-pro' ) }
					initialOpen={ false }
				>
					{ ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) && hasNecessaryPlan &&
						(
							<>
								<ToggleControl
									label={ __( 'Enable Live Search', 'otter-pro' ) }
									checked={ props.attributes.otterIsLive }
									onChange={ value => {

										if ( value ) {
											window.oTrk?.add({ feature: 'live-search', featureComponent: 'enable' });
										}

										toggleLive();
									} }
								/>

								{ props.attributes.otterIsLive && (
									<>
										<FormTokenField
											label={ __( 'Search in', 'otter-pro' ) }
											value={ props.attributes.otterSearchQuery ? props.attributes.otterSearchQuery['post_type'] : [] }
											suggestions={ postTypes.filter( type => ! excludeTypes.includes( type ) ) }
											onChange={ types => onUpdateQuery( 'post_type', types ) }
											__experimentalExpandOnFocus={ true }
											__experimentalValidateInput={ newValue => postTypes.includes( newValue ) }
										/>

										<Notice
											notice={ __( 'Leave empty to search in all post types. Categories work only when searched exclusively in Posts.', 'otter-pro' ) }
											variant="help"
										/>

										{ props.attributes.otterSearchQuery && 1 === props.attributes.otterSearchQuery['post_type']?.length && props.attributes.otterSearchQuery['post_type'].includes( 'post' ) && (
											<CategoriesFieldToken
												label={ __( 'Post Category', 'otter-pro' ) }
												value={ props.attributes.otterSearchQuery?.cat ? props.attributes.otterSearchQuery?.cat?.split( ',' ) : [] }
												onChange={ cat => onUpdateQuery( 'cat', cat.join( ',' ) ) }
											/>
										) }
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
