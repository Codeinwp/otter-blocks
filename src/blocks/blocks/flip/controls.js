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

const mapping = {
	'top': 'flex-start',
	'left': 'flex-start',
	'bottom': 'flex-end',
	'right': 'flex-end',
	'center': 'center'
};

const verticalMapping = {
	'flex-start': 'top',
	'center': 'center',
	'flex-end': 'bottom'
};

const horizontalMapping = {
	'flex-start': 'left',
	'center': 'center',
	'flex-end': 'right'
};

const align = ( vertical, horizontal ) => {
	if ( vertical && horizontal ) {
		return `${verticalMapping[vertical]} ${horizontalMapping[horizontal]}`;
	}
	return undefined;
};

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
						value={ align( attributes.frontVerticalAlign, attributes.frontHorizontalAlign ) }
						onChange={ alignment => {
							const values = alignment?.split( ' ' );
							setAttributes({
								frontVerticalAlign: mapping?.[values?.[0]],
								frontHorizontalAlign: mapping?.[values?.[1]]
							});
						} }
					/>
				</Toolbar>
			) }
		</BlockControls>
	);
};

export default Controls;
