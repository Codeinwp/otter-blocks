/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { pick } from 'lodash';

import { BlockSettingsMenuControls } from '@wordpress/block-editor';

import {
	MenuItem,
	KeyboardShortcuts
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import {
	select,
	dispatch
} from '@wordpress/data';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

import { displayShortcut } from '@wordpress/keycodes';

/**
 * Internal dependencies.
 */
import { adaptors } from './adaptors';
import CopyPaste from './copy-paste';
import { extractThemeCSSVar } from './utils';
import { isAppleOS } from '../../helpers/helper-functions';

const copyPaste = new CopyPaste();

function copy() {
	if ( 'undefined' !== typeof window && window.oThemeStyles === undefined ) {
		const settings = pick( select( 'core/block-editor' )?.getSettings?.() ?? {}, [ 'colors', 'gradients', 'styles' ]);
		extractThemeCSSVar( settings );
	}

	const { getMultiSelectedBlocks, getSelectedBlock, getSelectedBlockCount } = select( 'core/block-editor' );

	if ( getMultiSelectedBlocks === undefined || getSelectedBlock === undefined || getSelectedBlockCount === undefined ) {
		return;
	}

	let blocks = [];

	if ( 1 < getSelectedBlockCount() ) {
		blocks = getMultiSelectedBlocks();
	} else {
		blocks = [ getSelectedBlock() ];
	}

	if ( 0 === blocks.length ) {
		return;
	}

	const blockName = blocks[0].name;

	// All the blocks in multi-select must be the same type.
	if ( blocks.some( block => block.name !== blockName ) ) {
		return;
	}

	const copied = blocks.map( block => copyPaste.copy( block ) );

	const { createNotice } = dispatch( 'core/notices' );

	if ( 0 < copied?.filter( x => 'SUCCESS' === x )?.length ) {
		createNotice(
			'info',
			__( 'Copied the styles.', 'otter-blocks' ),
			{
				isDismissible: true,
				type: 'snackbar',
				id: 'o-copied-success'
			}
		);
	} else if ( 0 < copied?.filter( x => 'ERROR' === x )?.length ) {
		createNotice(
			'error',
			__( 'An error occurred when trying to copy the style.', 'otter-blocks' ),
			{
				isDismissible: true,
				type: 'snackbar',
				id: 'o-copied-error'
			}
		);
	}
}

function paste() {
	const { getMultiSelectedBlocks, getSelectedBlock, getSelectedBlockCount } = select( 'core/block-editor' );

	if ( getMultiSelectedBlocks === undefined || getSelectedBlock === undefined || getSelectedBlockCount === undefined ) {
		return;
	}

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

	if ( updateBlockAttributes === undefined ) {
		return;
	}

	blocks.forEach( block => {
		const attrs = copyPaste.paste( block );
		if ( attrs !== undefined ) {
			updateBlockAttributes( block.clientId, attrs );
		}
	});
}

const iconTextWrapper = ( text ) => (
	<span style={{ marginLeft: '', marginRight: '2px' }}>{text}</span>
);

/**
 * Separate component to prevent multiple calls from filter.
 *
 * @return
 */
const CopyPasteComponent = ( ) => {
	return (
		<Fragment>
			<KeyboardShortcuts
				shortcuts={
					isAppleOS() ? {
						'ctrl+c': copy,
						'ctrl+v': paste
					} : {
						'alt+c': copy,
						'alt+x': paste
					}
				}
				bindGlobal={ true }
			/>

			<BlockSettingsMenuControls>
				{ () => (
					<Fragment>
						<MenuItem
							icon={ iconTextWrapper( isAppleOS() ? displayShortcut.ctrl( 'c' ) : displayShortcut.alt( 'c' ) ) }
							onClick={ copy }
						>
							{ __( 'Copy Style', 'otter-blocks' ) }
						</MenuItem>

						{ ! copyPaste.isExpired && (
							<MenuItem
								icon={ iconTextWrapper( isAppleOS() ? displayShortcut.ctrl( 'v' ) : displayShortcut.alt( 'x' ) ) }
								onClick={ paste }
							>
								{ __( 'Paste Style', 'otter-blocks' ) }
							</MenuItem>
						) }
					</Fragment>
				) }
			</BlockSettingsMenuControls>
		</Fragment>
	);
};

const withCopyPasteExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {

		if ( adaptors?.[props.name] && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />

					<CopyPasteComponent { ...props } />
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withCopyPasteExtension' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/copy-paste-extension', withCopyPasteExtension );
