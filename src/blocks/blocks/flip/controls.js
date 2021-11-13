/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalBlockAlignmentMatrixControl,
	__experimentalBlockAlignmentMatrixToolbar,
	BlockControls
} from '@wordpress/block-editor';

import { Toolbar } from '@wordpress/components';

const Controls = ({
	attributes,
	setAttributes,
	isFliped
}) => {
	const BlockAlignmentMatrixControl = __experimentalBlockAlignmentMatrixControl || __experimentalBlockAlignmentMatrixToolbar;

	return (
		<BlockControls>
			{ ( ( ! attributes.isInverted && false === isFliped ) || ( attributes.isInverted && isFliped ) ) && (
				<Toolbar>
					<BlockAlignmentMatrixControl
						label={ __( 'Change front side content position', 'otter-blocks' ) }
						value={ attributes.frontAlign }
						onChange={ frontAlign => setAttributes({ frontAlign }) }
					/>
				</Toolbar>
			) }
		</BlockControls>
	);
};

export default Controls;
