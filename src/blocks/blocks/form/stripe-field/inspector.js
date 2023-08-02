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
 * @param {FormStripeFieldInspectorPros} props
 * @returns {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId
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
					value={ attributes.type ?? 'stripe' }
					options={ fieldTypesOptions() }
					onChange={ type => {
						if ( 'stripe' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

				<Notice
					notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'formfileblock' )}>{ __( 'Get more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
					variant="upsell"
				/>
			</PanelBody>

		</InspectorControls>
	);
};

export default Inspector;
