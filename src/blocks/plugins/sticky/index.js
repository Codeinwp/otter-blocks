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
const CONTAINER_BLOCKS = [
	'themeisle-blocks/advanced-colum',
	'group',
	'columns'
];

const StickyMenu = () => {

	const { block, isSticky, classes, isContainer } = useSelect( ( select ) => {
		const {
			getSelectedBlock
		} = select( 'core/block-editor' );

		const block = getSelectedBlock();
		const classes = block?.attributes?.className?.split( ' ' );
		const isSticky = classes?.includes( 'o-is-sticky' ) || false;
		const isContainer = classes?.includes( 'o-is-sticky-container' ) || false;

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
			const className = classes?.filter( c => 'o-is-sticky' !== c ) || [];

			if ( ! isSticky ) {
				className.push( 'o-is-sticky' );
			}
			attr.className = className.join( ' ' );
			attr.hasCustomCSS = true;
			updateBlockAttributes( block.clientId, attr );
		}
	};

	const makeBlockContainer = () => {
		if ( hasBlockSupport( block, 'customClassName', true ) ) {
			const attr = block.attributes;
			const className = classes?.filter( c => 'o-is-sticky-container' !== c ) || [];

			if ( ! isContainer ) {
				className.push( 'o-is-sticky-container' );
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
			{
				( CONTAINER_BLOCKS.some( cond => block?.name?.includes( cond ) ) ) && (
					<PluginBlockSettingsMenuItem
						icon="sticky"
						label={ ! isContainer ? __( 'Transform to sticky container', 'otter-blocks' ) : __( 'Remove sticky container', 'otter-blocks' ) }
						onClick={() => {
							makeBlockContainer();
						}}
					/>
				)
			}
		</Fragment>
	);
};

const withStickyExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {

		if (  props.attributes?.className?.includes( 'o-is-sticky', 'o-is-sticky-container' ) ) {
			return (
				<Edit
					attributes={props.attributes}
				>
					<BlockEdit { ...props } />
				</Edit>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withStickyExtension' );


addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/sticky-extension', withStickyExtension );

export default StickyMenu;
