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

import { createHigherOrderComponent } from '@wordpress/compose';

import { addFilter } from '@wordpress/hooks';

import Edit from './edit';

const updateBlockAttributes = dispatch( 'core/block-editor' ).updateBlockAttributes;

const EXCEPTED_BLOCK_CONDITIONS = [ '-item', 'form-' ]; // Exclude sub-blocks

const StickyMenu = () => {

	const { block, isSticky, classes, isContainer } = useSelect( ( select ) => {
		const {
			getSelectedBlock
		} = select( 'core/block-editor' );

		const block = getSelectedBlock();
		const classes = block?.attributes?.className?.split( ' ' );
		const isSticky = classes?.includes( 'o-sticky' ) || false;
		const isContainer = classes?.includes( 'o-sticky-container' ) || false;

		return {
			block,
			isSticky,
			isContainer,
			classes
		};
	});

	const makeBlockSticky = () => {
		if ( hasBlockSupport( block, 'customClassName', true ) ) {
			const attr = block.attributes;
			const className = classes?.filter( c => ! c.includes( 'o-sticky' ) ) || [];

			if ( ! isSticky ) {
				className.push( 'o-sticky' );
			}
			attr.className = className.join( ' ' );
			attr.hasCustomCSS = true;
			updateBlockAttributes( block.clientId, attr );
		}
	};

	if ( EXCEPTED_BLOCK_CONDITIONS.some( cond => block?.name?.includes( cond ) ) ) { // Exclude sub-blocks
		return (
			<Fragment></Fragment>
		);
	}

	return (
		<Fragment>
			<PluginBlockSettingsMenuItem
				icon="sticky"
				label={ ! isSticky ? __( 'Transform to sticky element', 'otter-blocks' ) : __( 'Remove sticky element', 'otter-blocks' ) }
				onClick={() => {
					makeBlockSticky();
				}}
			/>
		</Fragment>
	);
};

const withStickyExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {
		return (
			<Fragment>
				{
					props.attributes?.className?.includes( 'o-sticky' ) && (
						<Edit { ...props }/>
					)
				}
				<BlockEdit { ...props } />
			</Fragment>
		);

	};
}, 'withStickyExtension' );


addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/sticky-extension', withStickyExtension );

export default StickyMenu;
