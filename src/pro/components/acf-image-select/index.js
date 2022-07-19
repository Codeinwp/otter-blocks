/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { SelectControl } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

const ACFImageSelect = ({
	label,
	value,
	onChange
}) => {
	const { fields } = useSelect( select => {
		const { groups } = select( 'otter-pro' ).getACFData();

		const fields = [];

		groups.forEach( group => {
			group.fields.forEach( field => {
				if ( 'image' === field.type ) {
					fields.push({
						label: field.label,
						value: field.key
					});
				}
			});
		});

		return {
			fields
		};
	}, []);

	return (
		<SelectControl
			label={ label }
			value={ value }
			options={ fields }
			onChange={ onChange }
		/>
	);
};

export default ACFImageSelect;
