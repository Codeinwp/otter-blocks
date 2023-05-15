/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	Button,
	TextControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes,
	selectParent
}) => {

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<Button
					isSecondary
					onClick={ () => selectParent() }
				>
					{ __( 'Back to the Tabs', 'otter-blocks' ) }
				</Button>

				<TextControl
					type="text"
					label={ __( 'Title', 'otter-blocks' ) }
					placeholder={ __( 'Insert a title', 'otter-blocks' ) }
					onChange={ ( value ) => setAttributes({ title: '' === value ? undefined : value })}
					value={ attributes.title }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
