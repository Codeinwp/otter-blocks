/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	ToggleControl
} from '@wordpress/components';

import {
	select,
	dispatch
} from '@wordpress/data';

const Inspector = ({
	clientId,
	attributes,
	setAttributes
}) => {

	const onInitialOpenToggle = initialOpen => {
		setAttributes({ initialOpen });

		if ( ! initialOpen ) {
			return;
		}

		const parentClientId = select( 'core/block-editor' ).getBlockParents( clientId ).at( -1 );
		const parentBlock = select( 'core/block-editor' ).getBlock( parentClientId );

		if ( parentBlock.attributes.alwaysOpen ) {
			return;
		}

		parentBlock.innerBlocks.forEach( sibling => {
			if ( sibling.clientId !== clientId ) {
				dispatch( 'core/editor' ).updateBlockAttributes( sibling.clientId, { initialOpen: false });
			}
		});
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<ToggleControl
					label={ __( 'Initially Open', 'otter-blocks' ) }
					checked={ attributes.initialOpen }
					onChange={ onInitialOpenToggle }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
