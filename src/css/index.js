/**
 * WordPress dependencies.
 */
import { assign } from 'lodash';

import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { PanelBody } from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { InspectorControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';

import CSSEditor from './editor.js';

import './inject-css.js';

const addAttribute = ( settings ) => {
	if ( hasBlockSupport( settings, 'customClassName', true ) ) {
		settings.attributes = assign( settings.attributes, {
			hasCustomCSS: {
				type: 'boolean',
				default: false
			},
			customCSS: {
				type: 'string',
				default: null
			}
		});
	}

	return settings;
};

const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const hasCustomClassName = hasBlockSupport( props.name, 'customClassName', true );
		if ( hasCustomClassName && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PanelBody
							title={ __( 'Custom CSS', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<CSSEditor
								clientId={ props.clientId }
								setAttributes={ props.setAttributes }
								attributes={ props.attributes }
							/>
						</PanelBody>
					</InspectorControls>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

addFilter( 'blocks.registerBlockType', 'themeisle-custom-css/attribute', addAttribute );
addFilter( 'editor.BlockEdit', 'themeisle-custom-css/with-inspector-controls', withInspectorControls );
