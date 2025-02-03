/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { InspectorControls } from '@wordpress/block-editor';

import { __experimentalToolsPanelItem as ToolsPanelItem } from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

import { select } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import './editor.scss';

import Edit from './editor.js';
import './count/index.js';
import './typing/index.js';

const excludedBlocks = [ 'themeisle-blocks/popup' ];

const BlockAnimation = ( el, props ) => {
	if ( hasBlockSupport( props.name, 'customClassName', true ) && ! excludedBlocks.includes( props.name ) ) {

		const showAsDefault = Boolean( select( 'core/preferences' )?.get( 'themeisle/otter-blocks', 'show-animations' ) ?? true );

		return (
			<Fragment>
				{ el }

				<ToolsPanelItem
					hasValue={ () => Boolean( props?.attributes?.className?.includes( 'animated' ) ) }
					label={ __( 'Animations', 'blocks-animation' ) }
					onDeselect={ () => window?.blocksAnimation?.removeAnimation() }
					isShownByDefault={ showAsDefault }
				>
					<Edit { ...props } />
				</ToolsPanelItem>
			</Fragment>
		);
	}

	return el;
};

const withInspectorControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		const hasCustomClassName = hasBlockSupport(
			props.name,
			'customClassName',
			true
		);

		if ( hasCustomClassName && props.isSelected && ! excludedBlocks.includes( props.name ) ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />

					<InspectorControls>
						<Edit { ...props } />
					</InspectorControls>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

if ( Boolean( window?.blocksAnimation?.hasOtter ) ) {
	addFilter( 'otter.blockTools', 'themeisle-animations/with-inspector-controls', BlockAnimation, 1 );
} else {
	addFilter( 'editor.BlockEdit', 'themeisle-animations/with-inspector-controls', withInspectorControls );
}
