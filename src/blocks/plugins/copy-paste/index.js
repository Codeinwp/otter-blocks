/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { createHigherOrderComponent } from '@wordpress/compose';

import { select } from '@wordpress/data';

import { PluginBlockSettingsMenuItem } from '@wordpress/edit-post';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';
import { implementedAdaptors } from './adaptors';
import CopyPaste from './copy-paste';

/**
  * Internal dependencies.
  */

const copyPaste = new CopyPaste();

const withCopyPasteExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {
		const adaptor = implementedAdaptors.find( a => a === props.name );

		const paste = () => {
			const c = copyPaste.paste( props );
			if ( c ) {
				props.setAttributes( c );
			}
		};

		if ( adaptor ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />

					<PluginBlockSettingsMenuItem
						icon="sticky"
						label={  __( 'Copy style', 'otter-blocks' ) }
						onClick={ () => copyPaste.copy( props ) }
					/>

					<PluginBlockSettingsMenuItem
						icon="sticky"
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

