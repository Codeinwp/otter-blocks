/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { FormContext } from '../edit';


/**
 *
 * @param {import('./types').FormHiddenFieldInspectorPros} props
 * @returns {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const {
		selectForm
	} = useContext( FormContext );

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Field Settings', 'otter-blocks' ) }
			>
				<Button
					isSecondary
					variant="secondary"
					onClick={ () => selectForm?.() }
				>
					{ __( 'Back to the Form', 'otter-blocks' ) }
				</Button>

				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					value={ attributes.label }
					onChange={ undefined }
					help={ __( 'The label will be used as the field name.', 'otter-blocks' ) }
					disabled={true}
				/>

				<TextControl
					label={ __( 'Query Param', 'otter-blocks' ) }
					value={ attributes.paramName }
					onChange={ undefined }
					help={ __( 'The query parameter name that is used in URL. If the param is present, its value will be extracted and send with the Form.', 'otter-blocks' ) }
					placeholder={ __( 'e.g. utm_source', 'otter-blocks' ) }
					disabled={true}
				/>
			</PanelBody>

		</InspectorControls>
	);
};

export default Inspector;
