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

/**
 * Internal dependencies.
 */
import './editor.scss';
import Edit from './edit';

const EXCEPTED_BLOCK_CONDITIONS = [ '-item', 'form-' ]; // Exclude sub-blocks

const withStickyExtension = createHigherOrderComponent( BlockEdit => {
	return props => {
		const hasCustomClassName = hasBlockSupport(
			props.name,
			'customClassName',
			true
		);

		const classes =  props.attributes?.className?.split( ' ' );
		const isSticky = classes?.includes( 'o-sticky' ) || false;

		const toggleSticky = () => {
			let className = classes?.filter( c => ! c.includes( 'o-sticky' ) ) || [];

			if ( ! isSticky ) {
				className.push( 'o-sticky', 'o-sticky-scope-main-area', 'o-sticky-pos-top', 'o-sticky-bhvr-keep' );
			}

			className = className.join( ' ' );
			props.setAttributes({ className });
		};

		if ( hasCustomClassName && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />

					{ ! EXCEPTED_BLOCK_CONDITIONS.some( cond => props.name?.includes( cond ) ) && (
						<PluginBlockSettingsMenuItem
							icon="sticky"
							label={ ! isSticky ? __( 'Transform to Sticky', 'otter-blocks' ) : __( 'Remove Sticky Element', 'otter-blocks' ) }
							onClick={ toggleSticky }
						/>
					) }

					{ props.attributes?.className?.includes( 'o-sticky' ) && (
						<Edit { ...props } />
					) }
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;

	};
}, 'withStickyExtension' );

if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/sticky-extension', withStickyExtension );
}
