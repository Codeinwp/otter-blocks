/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Placeholder,
	SelectControl,
	Spinner
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { useSelect } from '@wordpress/data';

type Product = {
	id: string,
	name: string
};

const StripeControls = ({
	product,
	onChange
}: {
	product: string,
	onChange: Function
}) => {
	const { productsList, hasProductsRequestFailed, productsError, isLoadingProducts } = useSelect( select => {
		const {
			getStripeProducts,
			getResolutionError,
			isResolving
		} : {
			getStripeProducts: Function,
			getResolutionError: Function,
			isResolving: Function
		} = select( 'themeisle-gutenberg/data' );

		const products = getStripeProducts();

		return {
			productsList: products ? products?.map( ( product: Product ) => {
				return {
					label: `${ product?.name } (id:${ product?.id })`,
					value: product?.id
				};
			}) : [],
			hasProductsRequestFailed: Boolean( getResolutionError( 'getStripeProducts' ) ),
			productsError: getResolutionError( 'getStripeProducts' ),
			isLoadingProducts: isResolving( 'getStripeProducts' )
		};
	}, []);

	return (
		<Fragment>
			{ ! isLoadingProducts && (
				<SelectControl
					label={ __( 'Product.', 'otter-blocks' ) }
					value={ product }
					options={ [
						{
							label: __( 'Select a product', 'otter-blocks' ),
							value: 'none'
						},
						...productsList
					] }
					onChange={ product => onChange( 'none' !== product ? product : undefined ) }
				/>
			) }

			{ hasProductsRequestFailed && <p>{ productsError?.message }</p> }

			{ ( isLoadingProducts  ) && <Placeholder><Spinner /></Placeholder> }
		</Fragment>
	);
};

export default StripeControls;
