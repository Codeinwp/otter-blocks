/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import {
	createSlotFill,
	DropdownMenu,
	ToolbarGroup
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { select } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';
import './value/index.js';
import './link/index.js';
import './media/index.js';

export const { Slot: OtterDynamicContentSlot, Fill: OtterDynamicContentFill } = createSlotFill( 'OtterDynamicContent' );

export const withDynamicContentSlot = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		return (
			<Fragment>
				<BlockControls group="other">
					<ToolbarGroup>
						<DropdownMenu
							icon="database"
							label={ __( 'Dynamic Content', 'otter-blocks' ) }
							className="o-dynamic-button">
							{ ( { onClose } ) => (
								<>
									<OtterDynamicContentSlot fillProps={ { onClose } } />
								</>
							) }
						</DropdownMenu>
					</ToolbarGroup>
				</BlockControls>

				<BlockEdit { ...props } />
			</Fragment>
		);
	};
}, 'withDynamicContentSlot' );

if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
	addFilter(
		'editor.BlockEdit',
		'themeisle-blocks/dynamic-content/with-dynamic-content-slot',
		withDynamicContentSlot
	);
}
