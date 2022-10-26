/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Placeholder,
	SelectControl,
	Spinner
} from '@wordpress/components';

import {
	useEffect,
	useState
} from '@wordpress/element';

import { store } from '@wordpress/icons';

/**
  * Internal dependencies.
  */
import { StripeCheckoutProps } from './types';

/**
  * Stripe Checkout component
  * @param props
  * @returns
  */
const Edit = ({
	attributes,
	setAttributes
}: StripeCheckoutProps ) => {
	const [ status, setStatus ] = useState( 'loading' );
	const [ products, setProducts ] = useState([]);

	useEffect( () => {
		let isMounted = true;

		( async() => {
			if ( isMounted ) {
				try {
					setStatus( 'loading' );
					const response: any = await apiFetch({ path: 'otter/v1/stripe/products' });
					let data = [];

					if ( Boolean( response?.data?.length ) ) {
						data = response.data.map( ( product: any ) => {
							return {
								label: `${ product?.name } (id:${ product?.id })`,
								value: product?.id
							};
						});
					}

					setProducts( data );
					setStatus( 'loaded' );
				} catch ( error ) {
					setStatus( 'error' );
				}
			}
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<Placeholder
				icon={ store }
				label={ __( 'Stripe Checkout', 'otter-blocks' ) }
				instructions={ __( 'Select a product for the Stripe Checkout.', 'otter-blocks' ) }
			>
				{ 'loading' === status && (
					<Placeholder><Spinner /></Placeholder>
				) }

				{ 'loaded' === status && (
					<SelectControl
						value={ attributes.product }
						options={ products }
						onChange={ ( value: string ) => setAttributes({ product: value }) }
					/>
				) }
			</Placeholder>
		</div>
	);
};

export default Edit;
