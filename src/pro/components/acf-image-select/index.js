/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Placeholder,
	SelectControl,
	Spinner
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

const ACFImageSelect = ({
	label,
	value,
	onChange
}) => {
	const { fields, isLoaded } = useSelect( select => {
		const { groups } = select( 'otter-pro' ).getACFData();
		const isLoaded = select( 'otter-pro' ).isACFLoaded();

		const fields = [];

		groups.forEach( group => {
			group.fields.forEach( field => {
				if ( 'image' === field.type || 'url' === field.type ) {
					fields.push({
						label: field.label,
						value: field.key
					});
				}
			});
		});

		return {
			fields,
			isLoaded
		};
	}, []);

	if ( ! isLoaded ) {
		return <Placeholder><Spinner /></Placeholder>;
	}

	return (
		<SelectControl
			label={ label }
			value={ value }
			options={ [
				{
					label: __( 'Select a field', 'otter-blocks' ),
					value: 'none'
				},
				...fields
			] }
			onChange={ onChange }
		/>
	);
};

export default ACFImageSelect;
