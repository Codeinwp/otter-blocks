/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { PanelBody } from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { InspectorControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

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

const withInspectorControls = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {
		const hasCustomClassName = hasBlockSupport(
			props.name,
			'customClassName',
			true
		);

		if ( hasCustomClassName && props.isSelected && ! excludedBlocks.includes( props.name ) ) {
			let Inspector = InspectorControls;

			if ( window?.otterComponents?.useInspectorSlot ) {
				Inspector = window.otterComponents.useInspectorSlot( props.name );
			}

			return (
				<Fragment>
					<BlockEdit { ...props } />
					<Inspector>
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
					</Inspector>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

addFilter( 'editor.BlockEdit', 'themeisle-custom-css/with-inspector-controls', withInspectorControls );
