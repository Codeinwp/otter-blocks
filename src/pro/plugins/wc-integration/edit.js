/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import { PanelBody } from '@wordpress/components';

import { InspectorControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import { extractProductData } from './utility.js';

const {
	Notice,
	SelectProducts
} = window.otterComponents;

const Edit = ({
	BlockEdit,
	props
}) => {
	const { results, status } = useSelect( select => {
		let status = 'isLoading';
		let results = {};

		if ( props.attributes.product && Boolean( window.otterPro.isActive ) ) {
			const { COLLECTIONS_STORE_KEY } = window.wc.wcBlocksData;

			const error = select( COLLECTIONS_STORE_KEY ).getCollectionError( '/wc/store', 'products', {}, [ props.attributes.product ]);

			if ( error ) {
				return {
					results: {},
					status: {
						isError: true,
						message: error.message || __( 'Unknown error', 'otter-blocks' )
					}
				};
			}
			results = select( COLLECTIONS_STORE_KEY ).getCollection( '/wc/store', 'products', {}, [ props.attributes.product ]);

			if ( ! isEmpty( results ) ) {
				results = extractProductData( results );
				status = 'isLoaded';
			}
		} else {
			status = 'isInactive';
		}

		return {
			results,
			status
		};
	}, [ props.attributes.product ]);

	return (
		<Fragment>
			<BlockEdit
				productAttributes={ results }
				status={ status }
				{ ...props }
			/>

			<InspectorControls>
				<PanelBody
					title={ __( 'Sync with WooCommerce', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<p>{ __( 'By selecting a product, the current review information will sync with the selected WooCommerce product.', 'otter-blocks' ) }</p>

					<SelectProducts
						label={ __( 'Select Product', 'otter-blocks' ) }
						value={ props.attributes.product }
						disabled={ ! Boolean( window.otterPro.isActive ) || Boolean( window.otterPro.isExpired ) }
						onChange={ product => props.setAttributes({ product: 0 === product ? undefined : product }) }
					/>

					{ Boolean( window.otterPro.isExpired ) && (
						<Notice
							notice={ __( 'Otter Pro license has expired.', 'otter-blocks' ) }
							instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Review Block.', 'otter-blocks' ) }
						/>
					) }

					{ ! Boolean( window.otterPro.isActive ) && (
						<Notice
							notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
							instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Review Block.', 'otter-blocks' ) }
						/>
					) }
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
};

export default Edit;
