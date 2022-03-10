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
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { useState } from '@wordpress/element';

const Inspector = ({
	clientId,
	setAttributes,
	selectParent,
	parentClientId
}) => {
	const getBlock = wp.data.select( 'core/block-editor' ).getBlock;
	const parentBlock = getBlock( parentClientId );

	const [ isDefault, setIsDefault ] = useState( parentBlock.attributes.defaultOpened === clientId );

	const onTitleChange = ( value ) => {
		setAttributes({
			title: value
		});
	};

	const makeDefault = ( value ) => {
		setIsDefault( value );
		wp.data.dispatch( 'core/editor' ).updateBlockAttributes( parentClientId, { defaultOpened: clientId });
	};

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
					onChange={ onTitleChange } />

				<ToggleControl
					label={ __( 'Default opened tab', 'otter-blocks' ) }
					checked={ isDefault }
					onChange={ makeDefault } />
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
