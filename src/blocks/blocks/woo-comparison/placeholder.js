/* eslint-disable camelcase */
/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import {
	Button,
	CheckboxControl,
	MenuGroup,
	Placeholder,
	Spinner,
	TextControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { useState } from '@wordpress/element';

import { decodeEntities } from '@wordpress/html-entities';

import { blockTable } from '@wordpress/icons';

const BlockPlaceholder = ({
	attributes,
	setAttributes,
	onComplete
}) => {
	const { data, status } = useSelect( select => {
		let data = [];
		let status = 'loading';

		const { COLLECTIONS_STORE_KEY } = window.wc.wcBlocksData;

		const args =  [
			'/wc/store', 'products',
			{
				per_page: 100
			}
		];

		const error = select( COLLECTIONS_STORE_KEY ).getCollectionError( ...args );

		if ( error ) {
			status = 'error';
		} else {
			data = select( COLLECTIONS_STORE_KEY ).getCollection( ...args );

			const hasLoaded = select( COLLECTIONS_STORE_KEY ).hasFinishedResolution( 'getCollection', args );

			if ( hasLoaded ) {
				status = 'loaded';
			}

			if ( ! isEmpty( data ) ) {
				data = data.map( result => ({
					value: result.id,
					label: decodeEntities( result.name )
				}) );
			}
		}

		return {
			data,
			status
		};
	}, []);

	const isLoading  = 'loading' === status;
	const isComplete = 'loaded' === status;
	const isError = 'error' === status;

	const [ query, setQuery ] = useState( '' );

	const toggleProduct = id => {
		const products = [ ...attributes.products ];
		if ( products.includes( id ) ) {
			const index = products.indexOf( id );

			if ( -1 !== index ) {
				products.splice( index, 1 );
			}
		} else {
			products.push( id );
		}

		setAttributes({ products });
	};

	const LabelTag = ({
		label,
		value
	}) => (
		<span className="otter-review-comparison__tag">
			<span className="otter-review-comparison__tag_title">{ label }</span>

			<Button
				label={ sprintf( __( 'Remove %s', 'otter-blocks' ), label ) }
				icon="dismiss"
				onClick={ () => toggleProduct( value ) }
			/>
		</span>
	);

	const getNiceValues = () => attributes.products.map( value => data.find( product => product.value === value ) );

	return (
		<Placeholder
			label={ __( 'WooCommerce Product Comparison', 'otter-blocks' ) }
			instructions={ __( 'Display a selection of WooCommerce products in a comparison table.', 'otter-blocks' ) }
			icon={ blockTable }
			isColumnLayout={ true }
			className="otter-review-comparison__placeholder"
		>
			{ isLoading && <Spinner /> }

			{ isError && __( 'There seems to have been an error.', 'otter-blocks' ) }

			{ ( isComplete && ! Boolean( data.length ) ) && __( 'No products found.', 'otter-blocks' ) }

			{ ( isComplete && Boolean( data.length ) ) && (
				<div className="otter-review-comparison__placeholder__container">
					<div className="otter-review-comparison__placeholder__selected">
						<div className="otter-review-comparison__placeholder__selected_label">
							{

								/**
								 * translators: %s Number of selected products.
								 */
								sprintf( __( '%s products selected', 'otter-blocks' ), attributes.products.length )
							}
						</div>

						{ getNiceValues().map( niceValue => (
							<LabelTag
								key={ niceValue.value }
								label={ niceValue.label }
								value={ niceValue.value }
							/>
						) ) }
					</div>

					<TextControl
						label={ __( 'Search for review to display', 'otter-blocks' ) }
						value={ query }
						onChange={ setQuery }
					/>

					<MenuGroup>
						{ data.filter( product => product.label.toLowerCase().includes( query.toLowerCase() ) ).map( product => {
							return (
								<CheckboxControl
									label={ product.label || __( 'Untitled product', 'otter-blocks' ) }
									checked={ attributes.products.includes( product.value ) }
									onChange={ () => toggleProduct( product.value ) }
								/>
							);
						}) }
					</MenuGroup>

					<Button
						isPrimary
						onClick={ onComplete }
					>
						{ __( 'Done', 'otter-blocks' ) }
					</Button>
				</div>
			) }
		</Placeholder>
	);
};

export default BlockPlaceholder;
