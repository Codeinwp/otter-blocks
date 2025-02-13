/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	SelectControl,
	TextControl
} from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */

import { Notice as OtterNotice } from '../../../blocks/components';
import { fieldTypesOptions, mappedNameInfo, switchFormFieldTo } from '../../../blocks/blocks/form/common';


/**
 *
 * @param {import('./types').FormHiddenFieldInspectorPros} props
 * @return {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId
}) => {

	// FormContext is not available here. This is a workaround.
	const selectForm = () => {
		const formParentId = Array.from( document.querySelectorAll( `.wp-block-themeisle-blocks-form:has(#block-${clientId})` ) )?.pop()?.dataset?.block;
		dispatch( 'core/block-editor' ).selectBlock( formParentId );
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Field Settings', 'otter-pro' ) }
			>
				<Button
					isSecondary
					variant="secondary"
					onClick={ () => selectForm?.() }
				>
					{ __( 'Back to the Form', 'otter-pro' ) }
				</Button>

				<SelectControl
					label={ __( 'Field Type', 'otter-pro' ) }
					value={ attributes.type ?? 'hidden' }
					options={ fieldTypesOptions() }
					onChange={ type => {
						if ( 'hidden' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

				<TextControl
					label={ __( 'Label', 'otter-pro' ) }
					value={ attributes.label }
					onChange={ label => setAttributes({ label }) }
					help={ __( 'The label will be used as the field name.', 'otter-pro' ) }
					disabled={! Boolean( window?.otterPro?.isActive )}
				/>

				<TextControl
					label={ __( 'Query Param', 'otter-pro' ) }
					value={ attributes.paramName }
					onChange={ paramName => setAttributes({ paramName }) }
					help={ __( 'The query parameter name that is used in URL. If the param is present, its value will be extracted and send with the Form.', 'otter-pro' ) }
					placeholder={ __( 'e.g. utm_source', 'otter-pro' ) }
					disabled={! Boolean( window?.otterPro?.isActive )}
				/>

				<TextControl
					label={ __( 'Default Value', 'otter-pro' ) }
					value={ attributes.defaultValue }
					onChange={ defaultValue => setAttributes({ defaultValue }) }
					placeholder={ __( 'e.g. medium', 'otter-pro' ) }
					disabled={! Boolean( window?.otterPro?.isActive )}
				/>

				<TextControl
					label={ __( 'Mapped Name', 'otter-pro' ) }
					help={ mappedNameInfo }
					value={ attributes.mappedName }
					onChange={ mappedName => setAttributes({ mappedName }) }
					placeholder={ __( 'car_type', 'otter-pro' ) }
					disabled={! Boolean( window?.otterPro?.isActive )}
				/>

				{ ! Boolean( window?.otterPro?.isActive ) && (
					<Fragment>
						<OtterNotice
							notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
							instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-pro' ) }
						/>
					</Fragment>
				)

				}

				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'sticky' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>

		</InspectorControls>
	);
};

export default Inspector;
