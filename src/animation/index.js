/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { PanelBody } from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { InspectorControls } from '@wordpress/block-editor';

import {
	Fragment
} from '@wordpress/element';

import {
	addFilter,
	applyFilters
} from '@wordpress/hooks';

/**
  * Internal dependencies.
  */
import './editor.scss';

import AnimationControls from './editor.js';
import './count/index.js';
import './typing/index.js';

const excludedBlocks = [ 'themeisle-blocks/popup' ];

const removeTimeouts = {};

const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {

	return ( props ) => {
		const hasCustomClassName = hasBlockSupport(
			props.name,
			'customClassName',
			true
		);

		if ( hasCustomClassName && props.isSelected && ! excludedBlocks.includes( props.name ) ) {

			let block = document.querySelector( `.customize-control-sidebar_block_editor #block-${ props.clientId } .animated` ) || document.querySelector( `#block-${ props.clientId }.animated` );

			if ( block ) {
				clearTimeout( removeTimeouts[ props.clientId ]);
				removeTimeouts[ props.clientId ] = setTimeout( () => {
					block.classList.remove( 'animated' );
				}, 5_000 );
			}

			return (
				<Fragment>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PanelBody
							title={ __( 'Animations', 'otter-blocks' ) }
							initialOpen={ false }
							className="o-is-new"
						>
							<AnimationControls
								clientId={ props.clientId }
								setAttributes={ props.setAttributes }
								attributes={ props.attributes }
							/>

							{ applyFilters( 'otter.poweredBy', '' ) }
						</PanelBody>
					</InspectorControls>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

addFilter( 'editor.BlockEdit', 'themeisle-custom-css/with-inspector-controls', withInspectorControls );
