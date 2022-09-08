/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Placeholder,
	Spinner,
	TextControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

const ALLOWED_ACF_TYPES = [
	'url'
];

const Edit = ({
	attributes,
	changeAttributes
}) => {
	const {
		isLoaded,
		groups
	} = useSelect( select => {
		const { groups } = select( 'otter-pro' ).getACFData();
		const isLoaded = select( 'otter-pro' ).isACFLoaded();

		return {
			isLoaded,
			groups
		};
	}, []);

	return (
		<Fragment>
			{ ( 'acfURL' === attributes.type && Boolean( window.otterPro.hasACF ) ) && (
				<BaseControl
					label={ __( 'Meta Key', 'otter-blocks' ) }
				>
					{ isLoaded ? (
						<select
							value={ attributes.metaKey || 'none' }
							onChange={ event => changeAttributes({ metaKey: event.target.value  }) }
							className="components-select-control__input"
						>
							<option value="none">{ __( 'Select a field', 'otter-blocks' ) }</option>

							{ groups.map( group => {
								return (
									<optgroup
										key={ group?.data?.key }
										label={ group?.data?.title }
									>
										{ group?.fields
											?.filter( ({ key, label, type }) => key && label &&  ALLOWED_ACF_TYPES.includes( type ) )
											.map( ({ key, label }) => (
												<option
													key={ key }
													value={ key }
												>
													{ label }
												</option>
											) ) }
									</optgroup>
								);
							}) }
						</select>
					) : <Placeholder><Spinner /></Placeholder> }
				</BaseControl>
			) }

			{ ( 'acfURL' === attributes.type && ! Boolean( window.otterPro.hasACF ) ) && (
				<p>{ __( 'You need to have Advanced Custom Fields plugin installed to use this feature.', 'otter-blocks' ) }</p>
			) }

			{ 'postMetaURL' === attributes.type && (
				<TextControl
					label={ __( 'Custom Meta Key', 'otter-blocks' ) }
					value={ attributes.metaKey }
					onChange={ metaKey => changeAttributes({ metaKey }) }
				/>
			) }
		</Fragment>
	);
};

export default Edit;
