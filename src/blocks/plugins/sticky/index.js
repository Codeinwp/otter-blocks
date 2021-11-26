/**
 * WordPress dependencies.
 */

import { __ } from '@wordpress/i18n';

import { PluginBlockSettingsMenuItem } from '@wordpress/edit-post';

import { Fragment } from '@wordpress/element';

import {
	dispatch,
	useDispatch,
	useSelect
} from '@wordpress/data';

import { hasBlockSupport } from '@wordpress/blocks';

const updateBlockAttributes = dispatch( 'core/block-editor' ).updateBlockAttributes;

const StickyMenu = () => {

	const { block, isSticky } = useSelect( ( select ) => {
		const {
			getSelectedBlock
		} = select( 'core/block-editor' );

		const block = getSelectedBlock();
		const isSticky = block?.attributes?.className?.split( ' ' )?.includes( 'o-is-sticky' ) || false;

		return {
			block,
			isSticky
		};
	});

	const makeBlockSticky = () => {
		if ( hasBlockSupport( block, 'customClassName', true ) ) {
			const attr = block.attributes;
			const classes = attr?.className?.split( ' ' )?.filter( c => 'o-is-sticky' !== c ) || [];

			if ( ! isSticky ) {
				classes.push( 'o-is-sticky' );
			}
			attr.className = classes.join( ' ' );
			attr.hasCustomCSS = true;
			updateBlockAttributes( block.clientId, attr );
		}

	};

	const makeBlockContainer = () => {

	};

	return (
		<Fragment>
			<PluginBlockSettingsMenuItem
				icon="share-alt2"
				label={ ! isSticky ? __( 'Transform to sticky element', 'otter-blocks' ) : __( 'Remove sticky element', 'otter-blocks' ) }
				onClick={() => {
					makeBlockSticky();
				}}
			/>
			<PluginBlockSettingsMenuItem
				icon="share-alt2"
				label={ ! isSticky ? __( 'Transform to sticky container', 'otter-blocks' ) : __( 'Remove sticky container', 'otter-blocks' ) }
				onClick={() => {
					console.log( 'Make container' );
				}}
			/>
		</Fragment>
	);
};

export default StickyMenu;
