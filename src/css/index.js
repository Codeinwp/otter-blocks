/**
 * WordPress dependencies.
 */
import { assign } from 'lodash';

import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { InspectorControls } from '@wordpress/block-editor';

import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	PanelBody
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment } from '@wordpress/element';

import {
	addFilter,
	applyFilters
} from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';

import CSSEditor from './editor.js';

import './inject-css.js';

import { onDeselect } from './inject-css.js';

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

const Edit = ({
	clientId,
	setAttributes,
	attributes
}) => {
	return (
		<PanelBody
			title={ __( 'Custom CSS', 'otter-blocks' ) }
			initialOpen={ false }
		>
			<CSSEditor
				clientId={ clientId }
				setAttributes={ setAttributes }
				attributes={ attributes }
			/>

			<div className="o-fp-wrap">
				{ applyFilters( 'otter.feedback', '', 'custom-css' ) }
				{ applyFilters( 'otter.poweredBy', '' ) }
			</div>
		</PanelBody>
	);
};

const BlockCSSWrapper = ( el, props ) => {
	if ( hasBlockSupport( props.name, 'customClassName', true ) ) {
		return (
			<Fragment>
				{ el }

				<ToolsPanelItem
					hasValue={ () => Boolean( props.attributes?.hasCustomCSS ) }
					label={ __( 'Custom CSS', 'otter-blocks' ) }
					onDeselect={ () => {
						props.setAttributes({
							hasCustomCSS: false,
							customCSS: null
						});

						onDeselect();
					} }
					isShownByDefault={ false }
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
		const hasCustomClassName = hasBlockSupport( props.name, 'customClassName', true );
		if ( hasCustomClassName && props.isSelected ) {
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

addFilter( 'blocks.registerBlockType', 'themeisle-custom-css/attribute', addAttribute );

if ( Boolean( window?.blocksCSS?.hasOtter ) ) {
	addFilter( 'otter.blockTools', 'themeisle-custom-css/with-inspector-controls', BlockCSSWrapper );
} else {
	addFilter( 'editor.BlockEdit', 'themeisle-custom-css/with-inspector-controls', withInspectorControls );
}
