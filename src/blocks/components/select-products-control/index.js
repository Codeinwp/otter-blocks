/* eslint-disable camelcase */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import {
	Placeholder,
	SelectControl,
	Spinner
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { decodeEntities } from '@wordpress/html-entities';

const SelectProducts = ({
	label,
	value,
	onChange,
	...props
}) => {
	const { results, status } = useSelect( select => {
		let results = [];
		let status = 'loading';

		const { COLLECTIONS_STORE_KEY } = window.wc.wcBlocksData;

		const error = select( COLLECTIONS_STORE_KEY ).getCollectionError( '/wc/store', 'products', { per_page: 100 });

		if ( error ) {
			status = 'error';
		} else {
			results = select( COLLECTIONS_STORE_KEY ).getCollection( '/wc/store', 'products', { per_page: 100 });

			if ( ! isEmpty( results ) ) {
				status = 'loaded';

				results = [
					{
						value: 0,
						label: __( 'None', 'otter-blocks' )
					},
					...results.map( result => ({
						value: result.id,
						label: decodeEntities( result.name )
					}) )
				];
			}
		}

		return {
			results,
			status
		};
	}, []);

	if ( 'loading' === status ) {
		return (
			<Placeholder><Spinner/></Placeholder>
		);
	}

	if ( 'error' === status ) {
		return <p>{ __( 'There seems to have been an error', 'otter-blocks' ) }</p>;
	}

	return (
		<SelectControl
			label={ label }
			value={ Number( value ) }
			options={ results }
			onChange={ e => onChange( Number( e ) ) }
			{ ...props }
		/>
	);
};

export default SelectProducts;
