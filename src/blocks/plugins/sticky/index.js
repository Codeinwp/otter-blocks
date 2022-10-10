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
import { MenuGroup, MenuItem } from '@wordpress/components';
import { OtterControlTools } from '../../components/otter-tools';

const EXCEPTED_BLOCK_CONDITIONS = [ '-item', 'form-' ]; // Exclude sub-blocks

const withStickyExtension = createHigherOrderComponent( BlockEdit => {
	return props => {
		const hasCustomClassName = hasBlockSupport(
			props.name,
			'customClassName',
			true
		);


		if ( hasCustomClassName && props.isSelected ) {
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

			return (
				<Fragment>
					<BlockEdit { ...props } />

					{ ! EXCEPTED_BLOCK_CONDITIONS.some( cond => props.name?.includes( cond ) ) && (
						<Fragment>
							<PluginBlockSettingsMenuItem
								icon="sticky"
								label={ ! isSticky ? __( 'Transform to Sticky', 'otter-blocks' ) : __( 'Remove Sticky Element', 'otter-blocks' ) }
								onClick={ toggleSticky }
							/>

							<OtterControlTools order={1}>
								<MenuGroup>
									<MenuItem
										icon="sticky"
										onClick={ toggleSticky }
									>
										{ ! isSticky ? __( 'Transform to Sticky', 'otter-blocks' ) : __( 'Remove Sticky Element', 'otter-blocks' ) }
									</MenuItem>
								</MenuGroup>
							</OtterControlTools>
						</Fragment>
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

if ( select( 'core/editor' ) !== undefined ) {
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/sticky-extension', withStickyExtension );
}
