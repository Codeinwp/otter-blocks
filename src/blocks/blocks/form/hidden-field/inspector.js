/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls
} from '@wordpress/block-editor';

import {
	Button,
	ExternalLink,
	PanelBody,
	SelectControl,
	TextControl
} from '@wordpress/components';

import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */

import { FormContext } from '../edit';
import { Notice } from '../../../components';
import { setUtm } from '../../../helpers/helper-functions';
import { fieldTypesOptions, switchFormFieldTo } from '../common';


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

				<SelectControl
					label={ __( 'Field Type', 'otter-blocks' ) }
					value={ attributes.type ?? 'hidden' }
					options={ fieldTypesOptions() }
					onChange={ type => {
						if ( 'hidden' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

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

				<Notice
					notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'formfileblock' )}>{ __( 'Get more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
					variant="upsell"
				/> )
			</PanelBody>

		</InspectorControls>
	);
};

export default Inspector;
