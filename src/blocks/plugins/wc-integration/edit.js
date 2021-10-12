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

import SelectProducts from '../../components/select-products-control/index.js';

const Edit = ({
	BlockEdit,
	props
}) => {
	const { results, status } = useSelect( select => {
		let status = 'isLoading';
		let results = {};

		if ( props.attributes.product ) {
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
			} else {
				results = select( COLLECTIONS_STORE_KEY ).getCollection( '/wc/store', 'products', {}, [ props.attributes.product ]);

				if ( ! isEmpty( results ) ) {
					results = extractProductData( results );
					status = 'isLoaded';
				}
			}
		} else {
			status = 'isInactive';
		}

		return {
			results,
			status
		};
	});

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
						onChange={ product => props.setAttributes({ product: 0 === product ? undefined : product }) }
					/>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
};

export default Edit;
