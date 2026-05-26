/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Placeholder,
	Spinner
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { flattenACFFieldOptions } from '../../helpers/acf-field-options';

const ALLOWED_ACF_IMAGE_TYPES = [ 'image', 'url' ];

const ACFImageSelect = ({
	label,
	value,
	onChange
}) => {
	const { groups, isLoaded } = useSelect( select => {
		const { groups } = select( 'otter-pro' ).getACFData();
		const isLoaded = select( 'otter-pro' ).isACFLoaded();

		return {
			groups,
			isLoaded
		};
	}, []);

	if ( ! isLoaded ) {
		return <Placeholder><Spinner /></Placeholder>;
	}

	return (
		<BaseControl label={ label }>
			<select
				value={ value || 'none' }
				onChange={ event => onChange( event.target.value ) }
				className="components-select-control__input"
			>
				<option value="none">{ __( 'Select a field', 'otter-pro' ) }</option>

				{ groups.map( group => (
					<optgroup
						key={ group?.data?.key }
						label={ group?.data?.title }
					>
						{ flattenACFFieldOptions( group?.fields || [], ALLOWED_ACF_IMAGE_TYPES ) }
					</optgroup>
				) ) }
			</select>
		</BaseControl>
	);
};

export default ACFImageSelect;
