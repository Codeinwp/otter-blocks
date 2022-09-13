/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { createHigherOrderComponent } from '@wordpress/compose';

import { select, dispatch } from '@wordpress/data';

import { PluginBlockSettingsMenuItem } from '@wordpress/edit-post';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';
import { implementedAdaptors } from './adaptors';
import CopyPaste from './copy-paste';

/**
  * Internal dependencies.
  */

const copyPaste = new CopyPaste();

function copy() {
	const { getMultiSelectedBlocks, getSelectedBlock, getSelectedBlockCount } = select( 'core/block-editor' );

	let blocks = [];

	if ( 1 < getSelectedBlockCount() ) {
		blocks = getMultiSelectedBlocks();
	} else {
		blocks = [ getSelectedBlock() ];
	}

	console.log( getMultiSelectedBlocks(), getSelectedBlockCount(), getSelectedBlock(), blocks );

	if ( 0 === blocks.length ) {
		return;
	}

	const blockName = blocks[0].name;

	// All the blocks in multi-select must be the same type.
	if ( blocks.some( block => block.name !== blockName ) ) {
		return;
	}

	blocks.forEach( block => {
		copyPaste.copy( block );
	});

	const { createNotice } = dispatch( 'core/notices' );

	createNotice(
		'info',
		__( 'Copied the styles.' ),
		{
			isDismissible: true,
			type: 'snackbar'
		}
	);


}

function paste() {
	const { getMultiSelectedBlocks, getSelectedBlock, getSelectedBlockCount } = select( 'core/block-editor' );

	let blocks = [];

	if ( 1 < getSelectedBlockCount() ) {
		blocks = getMultiSelectedBlocks();
	} else {
		blocks = [ getSelectedBlock() ];
	}

	if ( 0 === blocks.length ) {
		return;
	}

	const { updateBlockAttributes } = dispatch( 'core/block-editor' );

	blocks.forEach( block => {
		const attrs = copyPaste.paste( block );
		console.log( attrs );
		updateBlockAttributes( block.clientId, attrs );
	});
}


const withCopyPasteExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {
		const adaptor = implementedAdaptors.find( a => a === props.name );

		console.log( adaptor );

		if ( adaptor && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />

					<PluginBlockSettingsMenuItem
						label={  __( 'Copy style', 'otter-blocks' ) }
						onClick={ copy }
					/>

					<PluginBlockSettingsMenuItem
						label={  __( 'Paste style', 'otter-blocks' ) }
						onClick={ paste }
					/>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withCopyPasteExtension' );

if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/copy-paste-extension', withCopyPasteExtension );
}

